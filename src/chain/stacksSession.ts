"use client";

type ConnectModule = typeof import("@stacks/connect");

let _connect: Promise<ConnectModule> | null = null;
let _userSession: import("@stacks/connect").UserSession | null = null;

async function connectModule(): Promise<ConnectModule> {
  if (!_connect) _connect = import("@stacks/connect");
  return _connect;
}

async function userSession(): Promise<import("@stacks/connect").UserSession> {
  if (_userSession) return _userSession;
  const { AppConfig, UserSession } = await connectModule();
  const appConfig = new AppConfig(["store_write", "publish_data"]);
  _userSession = new UserSession({ appConfig });
  return _userSession;
}

export type StacksSessionState = {
  isConnected: boolean;
  address: string | null;
};

export function readStacksSession(): StacksSessionState {
  if (typeof window === "undefined" || !_userSession) return { isConnected: false, address: null };
  if (!_userSession.isUserSignedIn()) return { isConnected: false, address: null };
  const data = _userSession.loadUserData();
  const addr =
    data.profile?.stxAddress?.mainnet ??
    data.profile?.stxAddress?.testnet ??
    null;
  return { isConnected: true, address: addr };
}

export async function connectStacks(): Promise<void> {
  const session = await userSession();
  if (session.isUserSignedIn()) return;
  const { showConnect } = await connectModule();
  await new Promise<void>((resolve, reject) => {
    showConnect({
      userSession: session,
      appDetails: {
        name: "Flap",
        icon: `${window.location.origin}/icon.png`,
      },
      onFinish: () => resolve(),
      onCancel: () => reject(new Error("connect cancelled")),
    });
  });
}

export function disconnectStacks(): void {
  try {
    _userSession?.signUserOut(window.location.origin);
  } catch {
    // ignore
  }
}

