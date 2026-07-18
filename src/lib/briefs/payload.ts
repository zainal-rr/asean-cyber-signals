import { BriefOutputSchema, type BriefOutput } from "@/lib/briefs/schema";

const MAX_PAYLOAD_CHARACTERS = 180_000;
const MAX_DECODED_BYTES = 128 * 1_024;

export function decodeBriefPayload(payload: string): BriefOutput | null {
  if (
    payload.length === 0 ||
    payload.length > MAX_PAYLOAD_CHARACTERS ||
    !/^[A-Za-z0-9_-]+$/.test(payload)
  ) {
    return null;
  }

  try {
    const decoded = Buffer.from(payload, "base64url");
    if (decoded.byteLength > MAX_DECODED_BYTES) return null;
    return BriefOutputSchema.parse(JSON.parse(decoded.toString("utf8")));
  } catch {
    return null;
  }
}
