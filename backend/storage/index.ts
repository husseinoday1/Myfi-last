import { Bucket } from "encore.dev/storage/objects";

export const receipts = new Bucket("receipts", {
  public: false,
  versioned: false,
});
