export type ReceiptItem = {
  id: string;
  href?: string;
  line: string;
  at: number;
  photoUrl?: string | null;
  amount?: string;
  rank?: number;
};
