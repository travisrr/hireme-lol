import {
  joinQrMatrix,
  joinQrPath,
  joinQrUrl,
  LINKEDIN_SIGNIN_PATH,
} from "../lib/join-qr";
import { SITE } from "../lib/site";

export function JoinQr() {
  const qr = joinQrMatrix(joinQrUrl());
  return (
    <a
      href={LINKEDIN_SIGNIN_PATH}
      className="hero-join-qr no-underline"
      aria-label={SITE.linkedinCta}
      title={SITE.linkedinCta}
    >
      <svg
        viewBox={`0 0 ${qr.size} ${qr.size}`}
        className="hero-join-qr-svg"
        role="img"
        aria-hidden="true"
      >
        <path fill="currentColor" d={joinQrPath(qr.data)} />
      </svg>
    </a>
  );
}
