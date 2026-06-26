import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:5176";
const SCREENSHOT_DIR = process.env.RESPONSIVE_SCREENSHOT_DIR ?? "test/screenshots";
const REPORT_PATH = process.env.RESPONSIVE_REPORT_PATH ?? "test/responsive-report.json";
const OVERFLOW_TOLERANCE = Number(process.env.RESPONSIVE_OVERFLOW_TOLERANCE ?? 2);
const LONG_WORD = "FLAP_RESPONSIVE_AUDIT_UNBREAKABLE_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const routes = [
  { name: "home", path: "/" },
  { name: "play", path: "/play" },
  { name: "leaderboard", path: "/leaderboard" },
  { name: "profile", path: "/profile" },
];

const chains = ["celo", "stacks"];

const viewports = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-14-pro", width: 393, height: 852 },
  { name: "iphone-14-pro-max", width: 430, height: 932 },
  { name: "ipad", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
  { name: "wide", width: 1440, height: 1000 },
];

function json(body, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

function mockHiroTransactions() {
  return {
    limit: 50,
    offset: 0,
    total: 18,
    results: Array.from({ length: 18 }, (_, i) => ({
      tx_id: `0x${String(i + 1).padStart(64, "a")}`,
      tx_status: "success",
      tx_type: "contract_call",
      sender_address: `SP${String(i).padStart(2, "0")}${LONG_WORD.slice(0, 28)}`,
      block_height: 180000 + i,
      fee_rate: String(2400 + i * 113),
      contract_call: {
        contract_id: "SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.flap",
        function_name: i % 3 === 0 ? `start-play-${LONG_WORD}` : "start-play",
      },
    })),
  };
}

function handleRpcPayload(payload) {
  const reply = (request) => {
    const id = request?.id ?? 1;
    switch (request?.method) {
      case "eth_chainId":
        return { jsonrpc: "2.0", id, result: "0xa4ec" };
      case "net_version":
        return { jsonrpc: "2.0", id, result: "42220" };
      case "eth_blockNumber":
        return { jsonrpc: "2.0", id, result: "0x17d7840" };
      case "eth_getLogs":
        return { jsonrpc: "2.0", id, result: [] };
      case "eth_call":
        return { jsonrpc: "2.0", id, result: `0x${"0".repeat(64)}` };
      case "eth_getBalance":
        return { jsonrpc: "2.0", id, result: "0x0" };
      case "eth_getTransactionReceipt":
        return { jsonrpc: "2.0", id, result: null };
      default:
        return { jsonrpc: "2.0", id, result: null };
    }
  };

  return Array.isArray(payload) ? payload.map(reply) : reply(payload);
}

async function installNetworkMocks(context) {
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname.includes("/rest/v1/")) {
      return route.fulfill(json([
        {
          id: "fixture-1",
          title: `Worst case title ${LONG_WORD}`,
          description: `Long fixture body ${LONG_WORD} ${LONG_WORD}`,
          address: `0x${"f".repeat(40)}`,
          tx_hash: `0x${"a".repeat(64)}`,
        },
      ]));
    }

    if (url.hostname === "api.hiro.so" && url.pathname.includes("/transactions")) {
      return route.fulfill(json(mockHiroTransactions()));
    }

    const isCeloRpc =
      url.hostname.includes("forno.celo") ||
      url.hostname.includes("celo.org") ||
      url.hostname.includes("ankr.com") ||
      url.hostname.includes("rpc.ankr.com");

    if (isCeloRpc && request.method() === "POST") {
      let payload = {};
      try {
        payload = request.postDataJSON();
      } catch {
        payload = {};
      }
      return route.fulfill(json(handleRpcPayload(payload)));
    }

    return route.continue();
  });
}

async function seedWorstCaseStorage(context, chain) {
  await context.addInitScript(
    ({ chainKind, longWord }) => {
      window.localStorage.setItem("flap_chain_kind", chainKind);
      window.localStorage.setItem("flap_highscore", "987654321987654321");
      window.localStorage.setItem(
        "flap_history",
        JSON.stringify(
          Array.from({ length: 20 }, (_, i) => ({
            score: 987654321 + i,
            coins: 123456789 + i,
            difficulty: i % 2 === 0 ? `beast-${longWord}` : `normal-${longWord}`,
            timestamp: new Date(Date.UTC(2026, 5, Math.max(1, 25 - i))).toISOString(),
          })),
        ),
      );
    },
    { chainKind: chain, longWord: LONG_WORD },
  );
}

function detectOverflowInPage() {
  const viewportWidth = window.innerWidth;
  const doc = document.documentElement;
  const body = document.body;

  function selectorFor(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const classes = Array.from(el.classList ?? [])
      .slice(0, 5)
      .map((c) => `.${CSS.escape(c)}`)
      .join("");
    return `${el.tagName.toLowerCase()}${classes}`;
  }

  const offenders = [];
  const nodes = Array.from(document.querySelectorAll("body *"));

  for (const el of nodes) {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    if (style.position === "fixed" || style.position === "sticky") continue;
    if (["SCRIPT", "STYLE", "META", "LINK"].includes(el.tagName)) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;

    const rightOverflow = Math.ceil(rect.right - viewportWidth);
    const leftOverflow = Math.ceil(0 - rect.left);
    const overflow = Math.max(rightOverflow, leftOverflow, 0);

    if (overflow > 0) {
      offenders.push({
        selector: selectorFor(el),
        tag: el.tagName.toLowerCase(),
        position: style.position,
        display: style.display,
        width: Math.round(rect.width),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        overflow,
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 180),
      });
    }
  }

  offenders.sort((a, b) => b.overflow - a.overflow);

  return {
    viewportWidth,
    documentScrollWidth: doc.scrollWidth,
    bodyScrollWidth: body.scrollWidth,
    maxScrollOverflow: Math.max(doc.scrollWidth, body.scrollWidth) - viewportWidth,
    offenders: offenders.slice(0, 25),
  };
}

async function auditPage(page, entry, suffix = "page") {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(900);

  const overflow = await page.evaluate(detectOverflowInPage);
  const screenshot = path.join(
    SCREENSHOT_DIR,
    `${entry.routeName}-${entry.chain}-${entry.viewport.name}-${suffix}.png`,
  );
  await page.screenshot({ path: screenshot, fullPage: true });

  return {
    ...entry,
    state: suffix,
    screenshot,
    ...overflow,
    worstOffender: overflow.offenders[0] ?? null,
  };
}

async function main() {
  await fs.rm(SCREENSHOT_DIR, { recursive: true, force: true });
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  for (const routeInfo of routes) {
    for (const chain of chains) {
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport });
        await installNetworkMocks(context);
        await seedWorstCaseStorage(context, chain);

        const page = await context.newPage();
        const url = new URL(routeInfo.path, BASE_URL).toString();
        const entry = {
          route: routeInfo.path,
          routeName: routeInfo.name,
          chain,
          viewport,
          url,
        };

        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
          results.push(await auditPage(page, entry));

          if (viewport.width < 768) {
            const menu = page.locator("[aria-controls='flap-mobile-menu']").first();
            if (await menu.isVisible().catch(() => false)) {
              await menu.click();
              await page.waitForTimeout(250);
              results.push(await auditPage(page, entry, "mobile-menu"));
            }
          }
        } catch (error) {
          results.push({
            ...entry,
            state: "error",
            error: error instanceof Error ? error.message : String(error),
          });
        } finally {
          await context.close();
        }
      }
    }
  }

  await browser.close();

  const failing = results.filter(
    (r) =>
      r.error ||
      Math.max(r.maxScrollOverflow ?? 0, r.worstOffender?.overflow ?? 0) > OVERFLOW_TOLERANCE,
  );

  const grouped = {};
  for (const result of results) {
    const key = `${result.route} [${result.chain}]`;
    grouped[key] ??= [];
    grouped[key].push(result);
  }

  const report = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    overflowTolerance: OVERFLOW_TOLERANCE,
    summary: {
      checked: results.length,
      failing: failing.length,
    },
    worstByRoute: Object.fromEntries(
      Object.entries(grouped).map(([key, entries]) => [
        key,
        entries
          .filter((entry) => !entry.error)
          .sort(
            (a, b) =>
              Math.max(b.maxScrollOverflow ?? 0, b.worstOffender?.overflow ?? 0) -
              Math.max(a.maxScrollOverflow ?? 0, a.worstOffender?.overflow ?? 0),
          )[0] ?? entries[0],
      ]),
    ),
    results,
  };

  await fs.writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  if (failing.length > 0) {
    console.error(`Responsive audit failed: ${failing.length}/${results.length} checks exceeded tolerance.`);
    for (const result of failing.slice(0, 20)) {
      if (result.error) {
        console.error(`- ${result.route} ${result.chain} ${result.viewport.name}: ${result.error}`);
        continue;
      }
      const worst = result.worstOffender;
      const overflow = Math.max(result.maxScrollOverflow ?? 0, worst?.overflow ?? 0);
      console.error(
        `- ${result.route} ${result.chain} ${result.viewport.name} ${result.state}: ${overflow}px overflow at ${
          worst?.selector ?? "document"
        }`,
      );
    }
    console.error(`Report: ${REPORT_PATH}`);
    console.error(`Screenshots: ${SCREENSHOT_DIR}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Responsive audit passed: ${results.length} checks.`);
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
