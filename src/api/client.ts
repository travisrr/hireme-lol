import type { ClickTarget } from "../lib/clicks";
import type { BidEconomics } from "../lib/types";
import type { ActivityRow, RankedBoardRow, SessionRow } from "../server/store";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `request_failed_${response.status}`);
  }
  return data;
}

export function fetchBoard(query = "") {
  const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
  return request<{ listings: RankedBoardRow[]; activity: ActivityRow[] }>(
    `/api/board${qs}`,
  );
}

export function fetchProfile(handle: string) {
  return request<{
    profile: SessionRow["profile"];
    ranked: RankedBoardRow | null;
  }>(`/api/profiles/${encodeURIComponent(handle)}`);
}

export function fetchMe() {
  return request<SessionRow>("/api/me");
}

export function fetchConfig() {
  return request<
    BidEconomics & {
      stripeEnabled: boolean;
      stripePublishableKey: string | null;
      oauth: { github: boolean; google: boolean };
    }
  >("/api/config");
}

export function previewLinkedin(url: string) {
  return request<{
    displayName: string;
    headline: string;
    photoUrl: string;
    linkedinUrl: string;
  }>("/api/linkedin/preview", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function requestMagicLink(email: string) {
  return request<{ ok: true; previewUrl?: string }>("/api/auth/magic", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function logout() {
  return request<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export function saveProfile(input: {
  handle: string;
  displayName: string;
  headline: string;
  company: string;
  pitch: string;
  photoUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
}) {
  return request<{ profile: NonNullable<SessionRow["profile"]> }>(
    "/api/me/profile",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function recordClick(listingId: string, target: ClickTarget) {
  return request<{
    profileClicks: number;
    linkedinClicks: number;
    websiteClicks: number;
    clicks: number;
  }>(`/api/listings/${encodeURIComponent(listingId)}/clicks`, {
    method: "POST",
    body: JSON.stringify({ target }),
  });
}

export function createBid(amountCents: number) {
  return request<{
    bidId: string;
    checkoutUrl: string | null;
    checkoutSessionId: string | null;
    devConfirm: boolean;
  }>("/api/bids", {
    method: "POST",
    body: JSON.stringify({ amountCents }),
  });
}

export function confirmDevBid(bidId: string, amountCents: number) {
  return request<{ ok: true }>("/api/stripe/webhook", {
    method: "POST",
    body: JSON.stringify({
      id: `evt_local_${bidId}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: `cs_local_${bidId}`,
          amount_total: amountCents,
          payment_intent: `pi_local_${bidId}`,
          metadata: { bid_id: bidId },
        },
      },
    }),
  });
}

export function fetchAdminOverview() {
  return request<{
    users: number;
    profiles: number;
    liveListings: number;
    pendingBids: number;
  }>("/api/admin/overview");
}

export function hideListing(id: string, hidden: boolean) {
  return request<{ ok: true }>(`/api/admin/listings/${id}/hidden`, {
    method: "POST",
    body: JSON.stringify({ hidden }),
  });
}

export function setFounding(id: string, value: boolean) {
  return request<{ ok: true }>(`/api/admin/profiles/${id}/founding`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}
