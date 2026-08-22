import { encode } from "uqr";
import { linkedinSignInUrl } from "./linkedin-oidc";
import { SITE } from "./site";

export { LINKEDIN_SIGNIN_PATH, linkedinSignInUrl } from "./linkedin-oidc";

export const JOIN_QR_ECC = "M" as const;
export const JOIN_QR_BORDER = 2;

export function joinQrUrl(origin: string = SITE.origin): string {
  return linkedinSignInUrl(origin);
}

export function joinQrMatrix(url: string): {
  size: number;
  data: boolean[][];
} {
  const { size, data } = encode(url, {
    ecc: JOIN_QR_ECC,
    border: JOIN_QR_BORDER,
  });
  return { size, data };
}

export function joinQrPath(data: boolean[][]): string {
  const parts: string[] = [];
  for (let y = 0; y < data.length; y += 1) {
    const row = data[y];
    for (let x = 0; x < row.length; x += 1) {
      if (row[x]) parts.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return parts.join("");
}
