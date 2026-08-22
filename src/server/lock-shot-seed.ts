import type { MemoryStore } from "./memory-store";

const PEOPLE = [
  {
    email: "maya@example.com",
    handle: "maya",
    displayName: "Maya Chen",
    headline: "Founder",
    photoUrl: "/lock-shots/maya.jpg",
    industry: "technology",
    amountCents: 800,
    minutesAgo: 4,
  },
  {
    email: "jordan@example.com",
    handle: "jordan",
    displayName: "Jordan Hale",
    headline: "Operator",
    photoUrl: "/lock-shots/jordan.jpg",
    industry: "finance",
    amountCents: 600,
    minutesAgo: 12,
  },
  {
    email: "priya@example.com",
    handle: "priya",
    displayName: "Priya Shah",
    headline: "Designer",
    photoUrl: "/lock-shots/priya.jpg",
    industry: "healthcare",
    amountCents: 400,
    minutesAgo: 28,
  },
  {
    email: "noah@example.com",
    handle: "noah",
    displayName: "Noah Okonkwo",
    headline: "Engineer",
    photoUrl: "/lock-shots/noah.jpg",
    industry: "legal",
    amountCents: 200,
    minutesAgo: 41,
  },
] as const;

export async function seedLockShotBoard(
  store: MemoryStore,
  now = Date.now(),
): Promise<void> {
  for (const person of PEOPLE) {
    const createdAt = now - person.minutesAgo * 60_000;
    const user = await store.upsertUserByEmail(person.email, createdAt);
    const profile = await store.createProfile(
      user.id,
      {
        handle: person.handle,
        displayName: person.displayName,
        headline: person.headline,
        company: null,
        pitch: person.headline,
        bio: "",
        photoUrl: person.photoUrl,
        linkedinUrl: `https://www.linkedin.com/in/${person.handle}`,
        websiteUrl: null,
        industry: person.industry,
        categories: [person.industry],
      },
      createdAt,
    );
    const bid = await store.createPendingBid(
      {
        profileId: profile.id,
        amountCents: person.amountCents,
        checkoutSessionId: null,
      },
      createdAt,
    );
    await store.applyPayment({
      eventId: `evt_lock_${person.handle}`,
      eventType: "transaction.completed",
      action: "complete",
      bidId: bid.id,
      paymentIntentId: `txn_lock_${person.handle}`,
      amountCents: person.amountCents,
      paidAt: createdAt,
    });
  }
}
