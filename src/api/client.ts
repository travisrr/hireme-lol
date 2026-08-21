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
      paddleEnabled: boolean;
      paddleClientToken: string | null;
      paddleEnvironment: "sandbox" | "production";
      oauth: { github: boolean; google: boolean };
    }
  >("/api/config");
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

export function createBid(amountCents: number) {
  return request<{
    bidId: string;
    checkoutUrl: string | null;
    transactionId: string | null;
    devConfirm: boolean;
  }>("/api/bids", {
    method: "POST",
    body: JSON.stringify({ amountCents }),
  });
}

export function confirmDevBid(bidId: string, amountCents: number) {
  return request<{ ok: true }>("/api/paddle/webhook", {
    method: "POST",
    body: JSON.stringify({
      event_id: `evt_local_${bidId}`,
      event_type: "transaction.completed",
      data: {
        id: `txn_local_${bidId}`,
        custom_data: { bid_id: bidId },
        details: { totals: { grand_total: String(amountCents) } },
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
