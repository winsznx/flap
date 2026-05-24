export const SHARE_HOST = "https://flap.timjosh507.workers.dev";

export function shareText(score?: number): string {
  if (typeof score === "number") return `Flap · score ${score}. Beat it →`;
  return "Just flapped on Celo. Daily bounty up for grabs →";
}

export const whatsAppLink = (text: string, url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
export const tweetLink = (text: string, url: string) =>
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
export const telegramLink = (text: string, url: string) =>
  `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
