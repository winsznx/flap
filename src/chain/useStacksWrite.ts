"use client";

import { useCallback, useState } from "react";

export type ClarityArg =
  | { type: "uint"; value: bigint | number | string }
  | { type: "principal"; value: string }
  | { type: "bool"; value: boolean }
  | { type: "buff"; value: Uint8Array | string };

export type StacksWriteOpts = {
  contractAddress: string;
  contractName: string;
  functionName: string;
  args: ClarityArg[];
};

export type StacksWriteState = {
  pending: boolean;
  txid: string | null;
  error: string | null;
};

/**
 * Wraps @stacks/connect's openContractCall + new v8 `request("stx_callContract")`
 * surface so action buttons can fire a Stacks contract write the same way they
 * fire a wagmi write. Imports the SDK dynamically so the bundle only ships
 * when a user actually triggers a Stacks call.
 */
export function useStacksWrite(): StacksWriteState & {
  call: (opts: StacksWriteOpts) => Promise<string | null>;
  reset: () => void;
} {
  const [pending, setPending] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPending(false);
    setTxid(null);
    setError(null);
  }, []);

  const call = useCallback(async (opts: StacksWriteOpts): Promise<string | null> => {
    setPending(true);
    setError(null);
    setTxid(null);
    try {
      const sdk = await import("@stacks/connect");
      const cv = await import("@stacks/transactions");

      const functionArgs = opts.args.map((a) => {
        if (a.type === "uint") return cv.uintCV(BigInt(a.value));
        if (a.type === "principal") {
          if (a.value.includes(".")) {
            const [addr, name] = a.value.split(".");
            return cv.contractPrincipalCV(addr, name);
          }
          return cv.standardPrincipalCV(a.value);
        }
        if (a.type === "bool") return cv.boolCV(a.value);
        if (a.type === "buff") {
          const bytes = typeof a.value === "string" ? hexToBytes(a.value) : a.value;
          return cv.bufferCV(bytes);
        }
        throw new Error(`unsupported clarity arg type`);
      });

      const requestFn = (sdk as unknown as { request?: (m: string, p: unknown) => Promise<unknown> })
        .request;

      if (typeof requestFn === "function") {
        const res = (await requestFn("stx_callContract", {
          contract: `${opts.contractAddress}.${opts.contractName}`,
          functionName: opts.functionName,
          functionArgs,
          network: "mainnet",
          postConditionMode: "allow",
        })) as { txid?: string } | undefined;
        const id = res?.txid ?? null;
        setTxid(id);
        setPending(false);
        return id;
      }

      const openFn = (
        sdk as unknown as {
          openContractCall?: (opts: unknown) => Promise<unknown>;
        }
      ).openContractCall;
      if (typeof openFn === "function") {
        return await new Promise<string | null>((resolve, reject) => {
          openFn({
            contractAddress: opts.contractAddress,
            contractName: opts.contractName,
            functionName: opts.functionName,
            functionArgs,
            postConditionMode: 1,
            onFinish: (data: { txId: string }) => {
              setTxid(data.txId);
              setPending(false);
              resolve(data.txId);
            },
            onCancel: () => {
              setPending(false);
              setError("user cancelled");
              resolve(null);
            },
          }).catch((e: unknown) => {
            setPending(false);
            setError(e instanceof Error ? e.message : String(e));
            reject(e);
          });
        });
      }

      throw new Error("@stacks/connect did not expose request() or openContractCall");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setPending(false);
      return null;
    }
  }, []);

  return { pending, txid, error, call, reset };
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}
