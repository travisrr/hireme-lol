import { describe, expect, it } from "vitest";
import {
  BELOW_ENTRY,
  EMAIL_NOT_CONFIGURED,
  LINKEDIN_PULL_EMPTY,
  PAYMENTS_NOT_READY,
  publicErrorMessage,
} from "../src/lib/public-error";

describe("public errors", () => {
  it("never surfaces secret or code names", () => {
    expect(publicErrorMessage("webhook_secret_required")).toBe(PAYMENTS_NOT_READY);
    expect(publicErrorMessage("payments_not_ready")).toBe(PAYMENTS_NOT_READY);
    expect(publicErrorMessage("below_entry")).toBe(BELOW_ENTRY);
    expect(publicErrorMessage("webhook_secret_required")).not.toMatch(/webhook/i);
    expect(publicErrorMessage("webhook_secret_required")).not.toMatch(/secret/i);
    expect(publicErrorMessage("email_not_configured")).toBe(EMAIL_NOT_CONFIGURED);
    expect(publicErrorMessage("email_not_configured")).not.toMatch(/resend/i);
    expect(publicErrorMessage("email_not_configured")).not.toMatch(/api key/i);
    expect(publicErrorMessage("title_required")).toBe(
      "Add a title so you show on the board.",
    );
    expect(publicErrorMessage("invalid_profile")).toBe(
      "Check your name and title.",
    );
    expect(publicErrorMessage("invalid_website")).toBe(
      "Enter a website like yourcompany.com.",
    );
  });

  it("locks the LinkedIn fallback line", () => {
    expect(LINKEDIN_PULL_EMPTY).toBe(
      "We couldn’t read that profile. Check the URL or fill the fields.",
    );
  });
});
