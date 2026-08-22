import { describe, expect, it } from "vitest";
import { jobHeadline, SEED_JOB_TITLES } from "../src/lib/headline";

describe("job headline", () => {
  it("uses stored LinkedIn titles and never treats Founding member as a job", () => {
    expect(jobHeadline("CEO at Tesla, SpaceX, and xAI")).toBe(
      "CEO at Tesla, SpaceX, and xAI",
    );
    expect(jobHeadline("Founding member")).toBe("");
    expect(jobHeadline("Founding bid.")).toBe("");
    expect(jobHeadline("")).toBe("");
    expect(jobHeadline(null)).toBe("");
  });

  it("locks public titles on existing seed names", () => {
    expect(SEED_JOB_TITLES).toEqual({
      elon: "CEO at Tesla, SpaceX, and xAI",
      palmer: "Founder at Anduril",
      jensen: "President and CEO at NVIDIA",
      maya: "Partner at Sequoia Capital",
      noah: "Staff Software Engineer at Stripe",
    });
  });
});
