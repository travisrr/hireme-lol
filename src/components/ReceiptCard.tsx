export type ReceiptItem = {
  id: string;
  href?: string;
  line: string;
  at: number;
  photoUrl?: string | null;
  name?: string;
  amount?: string;
  rank?: number;
  time?: string;
  industry?: string;
};
