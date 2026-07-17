# 05 — Database Design

**Depends on:** `01_PRD.md`, `02_TRD.md`
**Target:** Supabase (Postgres), free tier. The Supabase JS client (`@supabase/supabase-js`) is used directly for all DB and Storage operations — no Prisma or separate ORM. Types are Postgres-flavored. Do not change entities or relationships without updating this document first.

---

## 1. Entity Relationship Overview

```
users (farmers) ──< diagnoses >── disease_library
                        │
                        └──< recommendations >── products ──> dealers
dealers ──< products
diagnoses ──< chats >── dealers
admins (separate table — see §2.3)
languages (reference table)
analytics_events
```

## 2. Tables

### 2.1 `users` (Farmers — demo auth)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default gen_random_uuid() |
| name | varchar | required at demo login |
| phone_number | varchar, unique | required at demo login, **not verified** in this phase |
| preferred_language | varchar(5) | e.g. "en", "hi", "mr" |
| location_lat | float, nullable | captured on first scan, updatable |
| location_lng | float, nullable | captured on first scan, updatable |
| district | varchar, nullable | |
| state | varchar, nullable | |
| created_at | timestamptz | default now() |

*Demo-auth note:* no `password_hash` or `otp_verified` column exists yet by design. When Firebase Auth is introduced later, add a `firebase_uid` column as additive, not a schema rewrite.

### 2.2 `dealers`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| shop_name | varchar | |
| owner_name | varchar | |
| email | varchar, unique | login identifier |
| password_hash | varchar | bcrypt hash |
| phone_number | varchar | |
| whatsapp_number | varchar, nullable | |
| location_lat | float | |
| location_lng | float | |
| address | text | |
| status | varchar | 'pending' \| 'approved' \| 'suspended', default 'pending' |
| created_at | timestamptz | |

### 2.3 `admins`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | varchar | |
| email | varchar, unique | |
| password_hash | varchar | |
| created_at | timestamptz | |

*Keeping `admins` separate from `dealers` avoids nullable-heavy shared tables and keeps RBAC checks trivial — which table issued the JWT tells you the role.*

### 2.4 `disease_library` (Admin-curated ground truth)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| disease_code | varchar, unique | stable key the AI prompt maps to, e.g. "cotton_leaf_curl" |
| crop_type | varchar | e.g. "cotton", "tomato" |
| name_translations | jsonb | `{ "en": "...", "hi": "...", "mr": "..." }` |
| symptoms | jsonb | localized array of strings |
| causes | text | |
| treatment_protocol | jsonb | `{ "organic": [...], "chemical": [...] }`, localized |
| reference_images | text[] | Supabase Storage URLs |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 2.5 `diagnoses`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → users.id | |
| image_url | text | Supabase Storage URL |
| gemini_raw_response | jsonb | stored for audit/debugging — never shown raw to farmer |
| matched_disease_code | varchar, nullable | FK-like → disease_library.disease_code; null if no confident match |
| confidence_score | float | 0.0–1.0 |
| confidence_label | varchar | 'high' \| 'medium' \| 'low' |
| status | varchar | 'auto_confirmed' \| 'needs_review' |
| location_lat | float | snapshot at diagnosis time |
| location_lng | float | snapshot at diagnosis time |
| created_at | timestamptz | |

### 2.6 `products`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| dealer_id | uuid, FK → dealers.id | |
| name | varchar | |
| category | varchar | e.g. "fungicide","fertilizer" |
| applicable_disease_codes | text[] | references disease_library.disease_code values |
| stock_status | varchar | 'in_stock' \| 'low' \| 'out_of_stock' |
| image_url | text, nullable | Supabase Storage URL |
| created_at | timestamptz | |

### 2.7 `recommendations`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| diagnosis_id | uuid, FK → diagnoses.id | |
| product_id | uuid, FK → products.id | |
| rank | int | position shown to farmer, 1 = top |
| shown_at | timestamptz | |

### 2.8 `chats` (contact events)
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| diagnosis_id | uuid, FK → diagnoses.id | |
| user_id | uuid, FK → users.id | |
| dealer_id | uuid, FK → dealers.id | |
| channel | varchar | 'call' \| 'whatsapp' |
| created_at | timestamptz | |

### 2.9 `languages` (reference table)
| Column | Type | Notes |
|---|---|---|
| code | varchar(5), PK | "en","hi","mr" |
| label | varchar | native-script display name |
| is_active | boolean | default true |

### 2.10 `analytics_events`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, nullable | |
| event_type | varchar | e.g. "scan_started","dealer_contacted" |
| metadata | jsonb | |
| created_at | timestamptz | |

## 3. Key Design Decisions

- **`gemini_raw_response` is always stored** — AI output is non-deterministic; this is your audit trail for disputed diagnoses and prompt improvement.
- **`applicable_disease_codes` as a simple array** on `products` (rather than a join table) keeps the Recommendation Engine a fast, simple lookup appropriate for this phase.
- **Location is snapshotted on `diagnoses`**, not just read live from `users`, because dealer matching must reflect where the farmer was *at scan time*.
- **`admins` and `dealers` are separate tables** — simpler RBAC, no nullable-column sprawl.
- **No Prisma** — all DB operations use `@supabase/supabase-js` directly, which is sufficient for this phase's query complexity.

## 4. Supabase SQL Setup

Run these in the Supabase SQL Editor to create all tables. Execute in order (FK dependencies respected).

```sql
-- languages (no deps)
create table languages (
  code varchar(5) primary key,
  label varchar not null,
  is_active boolean default true
);

-- users
create table users (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  phone_number varchar unique not null,
  preferred_language varchar(5) references languages(code),
  location_lat float,
  location_lng float,
  district varchar,
  state varchar,
  created_at timestamptz default now()
);

-- admins
create table admins (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  email varchar unique not null,
  password_hash varchar not null,
  created_at timestamptz default now()
);

-- dealers
create table dealers (
  id uuid primary key default gen_random_uuid(),
  shop_name varchar not null,
  owner_name varchar not null,
  email varchar unique not null,
  password_hash varchar not null,
  phone_number varchar not null,
  whatsapp_number varchar,
  location_lat float not null,
  location_lng float not null,
  address text not null,
  status varchar not null default 'pending',
  created_at timestamptz default now()
);

-- disease_library
create table disease_library (
  id uuid primary key default gen_random_uuid(),
  disease_code varchar unique not null,
  crop_type varchar not null,
  name_translations jsonb not null,
  symptoms jsonb,
  causes text,
  treatment_protocol jsonb,
  reference_images text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- diagnoses
create table diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  image_url text not null,
  gemini_raw_response jsonb,
  matched_disease_code varchar references disease_library(disease_code),
  confidence_score float,
  confidence_label varchar,
  status varchar default 'auto_confirmed',
  location_lat float,
  location_lng float,
  created_at timestamptz default now()
);

-- products
create table products (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid references dealers(id) not null,
  name varchar not null,
  category varchar not null,
  applicable_disease_codes text[],
  stock_status varchar not null default 'in_stock',
  image_url text,
  created_at timestamptz default now()
);

-- recommendations
create table recommendations (
  id uuid primary key default gen_random_uuid(),
  diagnosis_id uuid references diagnoses(id) not null,
  product_id uuid references products(id) not null,
  rank int not null,
  shown_at timestamptz default now()
);

-- chats
create table chats (
  id uuid primary key default gen_random_uuid(),
  diagnosis_id uuid references diagnoses(id) not null,
  user_id uuid references users(id) not null,
  dealer_id uuid references dealers(id) not null,
  channel varchar not null,
  created_at timestamptz default now()
);

-- analytics_events
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_type varchar not null,
  metadata jsonb,
  created_at timestamptz default now()
);
```

## 5. Related Documents
Consumed by: `06_API_Design.md` · Referenced by: `07_Architecture.md` §5 (Recommendation Engine)
