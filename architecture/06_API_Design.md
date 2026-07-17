# 06 — API Design (REST Contract)

**Depends on:** `05_Database.md`
**Base path:** `/api/v1`
**Auth header:** `Authorization: Bearer <jwt>` on all routes except those marked Public.
**Response envelope (apply to every endpoint):**
```json
{ "success": true, "data": { ... }, "error": null }
{ "success": false, "data": null, "error": { "code": "STRING_CODE", "message": "human readable" } }
```

---

## 1. Auth (Demo Phase)

### `POST /auth/farmer/demo-login` — Public
Request:
```json
{ "name": "Ramesh Patil", "phone_number": "+919876543210" }
```
Response:
```json
{ "token": "<jwt>", "user": { "id": "uuid", "name": "Ramesh Patil", "is_new_user": true } }
```
Behavior: finds user by `phone_number`, creates if not exists, issues JWT immediately. **No OTP is sent or verified in this phase** (per `01_PRD.md` §6).

### `POST /auth/dealer/register` — Public
Request: `{ "shop_name", "owner_name", "email", "password", "phone_number", "location_lat", "location_lng", "address" }`
Response: `{ "dealer": { "id", "status": "pending" } }` — no JWT issued until admin approval.

### `POST /auth/dealer/login` — Public
Request: `{ "email", "password" }`
Response: `{ "token": "<jwt>", "dealer": { "id", "status" } }` — if `status != 'approved'`, backend still returns a token but frontend must route to a "Pending Approval" screen (per `03_App_Flow.md` §2); protected dealer-dashboard endpoints reject non-approved dealers server-side regardless of what the frontend does.

### `POST /auth/admin/login` — Public
Request: `{ "email", "password" }` → Response: `{ "token": "<jwt>" }`

---

## 2. Farmer — Users

### `GET /users/me`
Response: full `users` row for the authenticated farmer.

### `PATCH /users/me`
Request: any subset of `{ "name", "preferred_language", "location_lat", "location_lng" }`
Response: updated user object.

---

## 3. Diagnosis (Core Flow)

### `POST /diagnoses` — multipart/form-data
Request fields: `image` (file, jpeg/png, max 5MB), `location_lat`, `location_lng`
Response:
```json
{
  "diagnosis_id": "uuid",
  "disease": { "code": "cotton_leaf_curl", "name": "Cotton Leaf Curl Virus", "confidence_label": "medium" },
  "explanation": "localized plain-language text",
  "treatment": { "organic": ["..."], "chemical": ["..."] },
  "status": "auto_confirmed"
}
```
Internally orchestrates: image validation → Gemini Vision call → Disease Library lookup by `disease_code` → save `diagnoses` row → trigger Recommendation Engine (`07_Architecture.md` §5) → return combined result.

### `GET /diagnoses` (paginated)
Query params: `?page=1&limit=20`
Response: `{ "items": [ { "id","disease_name","confidence_label","created_at","thumbnail_url" } ], "page", "total" }`

### `GET /diagnoses/:id`
Response: full diagnosis detail (same shape as POST response) + `recommendations` array.

---

## 4. Recommendations

### `GET /diagnoses/:id/recommendations`
Response:
```json
{ "products": [ { "product_id","name","dealer": { "id","shop_name","phone_number","whatsapp_number" }, "distance_km": 2.3, "stock_status": "in_stock", "rank": 1 } ] }
```

---

## 5. Dealers (Public Read)

### `GET /dealers/:id` — Public
Response: public dealer profile (shop name, address, active products).

---

## 6. Dealer Dashboard (role: dealer, must be `status = approved`)

### `POST /dealer/products`
Request: `{ "name","category","applicable_disease_codes": ["cotton_leaf_curl"],"stock_status" }`
Response: created product object.

### `PATCH /dealer/products/:id`
Request: any subset of the above fields.
Response: updated product object.

### `GET /dealer/products` (own catalog, paginated)

### `GET /dealer/leads` (paginated)
Response: `{ "items": [ { "diagnosis_id","disease_name","matched_product_name","created_at","contacted": true } ] }`

### `GET /dealer/analytics`
Response: `{ "diagnoses_matched": 42, "contacts_received": 11, "top_diseases": [ { "disease_name","count" } ] }`

---

## 7. Contact

### `POST /chats`
Request: `{ "diagnosis_id","dealer_id","channel": "whatsapp" }`
Response: `{ "chat_id", "deep_link": "https://wa.me/91XXXXXXXXXX" }` (channel "call" returns a `tel:` deep link instead). The mobile client opens this via the OS — the backend never proxies the actual call/message content.

---

## 8. Admin

### `GET /admin/dealers?status=pending`
### `PATCH /admin/dealers/:id/approve`
### `PATCH /admin/dealers/:id/reject`
### `POST /admin/disease-library`
Request: `{ "disease_code","crop_type","name_translations","symptoms","causes","treatment_protocol","reference_images" }`
### `PATCH /admin/disease-library/:id`
### `GET /admin/analytics/overview`
Response: `{ "total_diagnoses","top_diseases_by_region","dealer_activity","language_usage_split" }`

---

## 9. Error Codes

| Code | Meaning |
|---|---|
| `IMAGE_TOO_LARGE` | uploaded image exceeds size limit |
| `IMAGE_INVALID_TYPE` | not jpeg/png |
| `LOW_CONFIDENCE_NO_MATCH` | Gemini result didn't map to any known `disease_code` |
| `DEALER_NOT_APPROVED` | dealer endpoints accessed before admin approval |
| `RATE_LIMITED` | per-user daily diagnosis limit hit |
| `UNAUTHORIZED` | missing/invalid JWT |
| `FORBIDDEN` | valid JWT, wrong role for this endpoint |

## 10. Related Documents
Data shapes: `05_Database.md` · Screens consuming these: `04_UI_UX_Spec.md` · Security rules enforced server-side: `07_Architecture.md` §7
