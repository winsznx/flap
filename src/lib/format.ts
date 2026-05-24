export function shortAddr(address: string, head = 6, tail = 4): string {
  if (!address || address.length < head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function shortHash(hash: string, head = 8, tail = 6): string {
  if (!hash || hash.length < head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
