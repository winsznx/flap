export function SkipToMain() {
  return (
    <a
      href="#main"
      className="absolute left-2 top-2 z-[100] -translate-y-20 rounded-md px-3 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0 focus:outline-none"
      style={{ background: "var(--color-ink-blue)" }}
    >
      Skip to main content
    </a>
  );
}
