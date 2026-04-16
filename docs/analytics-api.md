# Analytics API Guide

Both analytics endpoints are **ADMIN-only** and require a valid JWT token belonging to a user with the `ADMIN` role.

---

## Authentication

All requests must include:

```
Authorization: Bearer <jwt_token>
```

If the token is missing, expired, or the user is not an ADMIN, the server returns `401 Unauthorized` or `403 Forbidden`.

---

## Common Query Parameters

Both endpoints share the same query parameters:

| Parameter  | Type   | Required | Description |
|------------|--------|----------|-------------|
| `start`    | string | Yes      | Start date in `YYYY-MM-DD` format (inclusive) |
| `end`      | string | Yes      | End date in `YYYY-MM-DD` format (inclusive) |
| `interval` | string | Yes      | Grouping interval: `day`, `week`, or `month` |

**Validation rules:**
- All three parameters are required. Missing any returns `400 Bad Request`.
- `interval` must be exactly `day`, `week`, or `month`. Any other value returns `400 Bad Request`.
- `start` and `end` must be parseable as valid dates. Invalid dates return `400 Bad Request`.

---

## Common Response Shape

Both endpoints return the same structure:

```ts
{
  labels: string[];   // array of time bucket labels
  data: number[];     // count per bucket, aligned with labels
  total: number;      // sum of all counts across the range
}
```

**Label format by interval:**
- `day` → `"YYYY-MM-DD"` (e.g. `"2026-03-15"`)
- `week` → `"YYYY-MM-DD"` (Monday of that week, e.g. `"2026-03-09"`)
- `month` → `"YYYY-MM"` (e.g. `"2026-03"`)

The `labels` and `data` arrays are always the same length. Every bucket in the range is represented — buckets with no activity get `0`.

---

## GET /messages/analytics

Returns the number of messages created per time bucket within the date range.

### Example request

```
GET /messages/analytics?start=2026-03-01&end=2026-03-31&interval=week
Authorization: Bearer <jwt_token>
```

### Example response

```json
{
  "labels": ["2026-03-02", "2026-03-09", "2026-03-16", "2026-03-23", "2026-03-30"],
  "data": [12, 45, 30, 60, 8],
  "total": 155
}
```

### What it counts

Total messages created (both user and assistant messages) within the `[start, end]` range.

---

## GET /users/analytics

Returns the number of **distinct active users** per time bucket within the date range.

### Example request

```
GET /users/analytics?start=2026-01-01&end=2026-03-31&interval=month
Authorization: Bearer <jwt_token>
```

### Example response

```json
{
  "labels": ["2026-01", "2026-02", "2026-03"],
  "data": [18, 24, 31],
  "total": 73
}
```

### What it counts

A user is counted as "active" in a bucket if they sent at least one message (i.e. a message with `is_belonging_to_user = true`) during that period. The same user is counted at most once per bucket, but can appear in multiple buckets.

Note: `total` here is the sum of per-bucket distinct counts, **not** the total number of unique users across the whole range. A user active in three different months contributes 1 to each month's count and 3 to `total`.

---

## Error Responses

| Status | Cause |
|--------|-------|
| `400 Bad Request` | Missing parameter, invalid interval, or unparseable date |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Authenticated user does not have the `ADMIN` role |

```json
{
  "statusCode": 400,
  "message": "interval must be one of: day, week, month",
  "error": "Bad Request"
}
```

---

## Usage Tips

- Use `interval=day` for short ranges (up to ~90 days) and `interval=month` for longer dashboards.
- The `week` interval aligns buckets to **Monday**. A week label like `"2026-03-09"` covers Mon 9 Mar through Sun 15 Mar.
- `start` and `end` are both **inclusive**. Pass the same date for both to get a single-day view with `interval=day`.
- The `total` field is a convenience sum — you can always compute it yourself from `data` if you need to combine ranges.
