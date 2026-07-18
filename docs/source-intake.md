# Source intake contract

All automated checks run in `shadow_discovery` mode. A successful check can
create only a `needs_review` source item. A failed safety or content check is
quarantined. Neither path creates evidence claims, trend versions, or published
content.

## Owner-triggered adapter check

Send an authenticated request to `POST /api/ingestion/run`:

```json
{
  "adapterId": "sg_csa"
}
```

Omit `adapterId` to check every fixed adapter. Supported IDs are `sg_csa`,
`my_mycert`, `my_csm_mirror`, `my_nacsa`, `id_idsirtii`, and
`id_bssn_publications`.

## Manual URL or PDF inbox

Send an authenticated request to the same endpoint:

```json
{
  "manualUrl": "https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang-nomor-27-tahun-2022",
  "label": "Indonesia Personal Data Protection Law"
}
```

The server infers country and publisher from the exact hostname. It accepts
only HTTPS URLs on the fixed registry allowlist, including the planned Komdigi,
JDIH Komdigi, and OJK manual sources. It rechecks DNS and every redirect,
downloads only a bounded probe, validates declared size, MIME type, and document
signature, and stores metadata only when Supabase admin credentials are present.

The response shape is:

```json
{
  "kind": "manual_inbox",
  "persistence": "recorded",
  "result": {
    "inboxId": "inbox_...",
    "sourceKey": "id_manual_official",
    "country": "ID",
    "publisher": "Indonesian government and financial regulators",
    "submittedUrl": "https://...",
    "label": "Indonesia Personal Data Protection Law",
    "status": "needs_review",
    "check": {
      "ok": true,
      "targetId": "manual-inbox",
      "canonicalUrl": "https://...",
      "checkedAt": "2026-07-18T00:00:00.000Z",
      "httpStatus": 200,
      "contentType": "application/pdf",
      "contentLength": 12000,
      "probeBytes": 65536,
      "contentHash": "sha256-of-probe",
      "etag": null,
      "lastModified": null,
      "notModified": false
    },
    "autoPublish": false
  }
}
```

`status` is `quarantined` when a gate fails. Failure checks contain a stable
error code and no response body. `persistence` is `not_configured` during local
development without Supabase admin credentials and `failed` when an operational
write fails.

Successful probes retain bounded ETag and Last-Modified validators in the warm
runtime and issue conditional requests on later checks. A `304` response reuses
only the prior validated metadata and sets `notModified` to `true`.

## Scheduled check

Vercel Cron calls `GET /api/cron/ingest` with
`Authorization: Bearer <CRON_SECRET>`. An optional `adapter` query parameter can
limit a run to one fixed adapter. The route fails closed when the secret is
missing or incorrect.
