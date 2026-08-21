const PADDLE_SCRIPT = "https://cdn.paddle.com/paddle/v2/paddle.js";

type PaddleBridge = {
  Initialize: (options: { token: string }) => void;
  Environment: { set: (value: "sandbox" | "production") => void };
  Checkout: { open: (options: { transactionId: string }) => void };
};

declare global {
  interface Window {
    Paddle?: PaddleBridge;
  }
}

let scriptPromise: Promise<void> | null = null;
let initializedToken: string | null = null;

function loadPaddleScript(): Promise<void> {
  if (window.Paddle) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PADDLE_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("paddle_js_failed"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export async function openPaddleCheckout(input: {
  clientToken: string;
  transactionId: string;
  environment: "sandbox" | "production";
}): Promise<void> {
  await loadPaddleScript();
  const paddle = window.Paddle;
  if (!paddle) throw new Error("paddle_js_missing");
  if (input.environment === "sandbox") {
    paddle.Environment.set("sandbox");
  }
  if (initializedToken !== input.clientToken) {
    paddle.Initialize({ token: input.clientToken });
    initializedToken = input.clientToken;
  }
  paddle.Checkout.open({ transactionId: input.transactionId });
}
