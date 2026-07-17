# 03 — App Flow Document

**Depends on:** `01_PRD.md`, `02_TRD.md`
**Purpose:** Exact, screen-by-screen flow for every role, including the demo-auth simplification. This is what a Kiro spec for navigation/routing should be built from.

---

## 1. Farmer Flow

```
Splash
  → (no valid session) → Language Select (first launch only) → Demo Login (phone + name)
  → (valid session) → Home
Home
  → tap "Scan Crop" → Camera Screen
Camera Screen
  → capture / upload → Diagnosis Loading
Diagnosis Loading
  → success → Diagnosis Result
  → failure (network/API error) → Error State (retry / save-and-queue offline)
Diagnosis Result
  → shows: disease name, confidence, explanation, treatment (organic + chemical)
  → tap "See Recommended Products" → Recommendations Screen
Recommendations Screen
  → shows ranked product cards (dealer name, distance, stock status)
  → tap product → Product Detail (dealer info)
  → tap "Contact Dealer" → opens Call intent or WhatsApp deep link (external, native)
History (bottom tab)
  → list of past diagnoses (cached locally, works offline)
  → tap entry → Diagnosis Result (read-only, historical)
Settings (bottom tab)
  → change language, logout, app version, (future: notification toggle)
```

**Demo Auth detail:** On first launch (or after logout), farmer sees Language Select, then a single screen asking for **name + phone number** (no OTP). Submitting immediately creates/finds the user and logs them in. This is clearly labeled internally as "Demo Login" so it's obvious where Firebase Phone Auth would later be swapped in (see `07_Architecture.md` §6.6).

## 2. Dealer Flow

```
Dealer Login (email + password)
  → (no account) → Dealer Signup (shop name, owner name, phone, location, email, password)
  → submit → "Pending Approval" screen (until admin approves — no further access)
  → (approved) → Dealer Dashboard
Dealer Dashboard
  → Tabs: Catalog | Leads | Analytics
Catalog Tab
  → list of own products → Add Product / Edit Product (name, category, applicable diseases, stock status, image)
Leads Tab
  → list of diagnoses matched to this dealer's products, with basic diagnosis context (disease name, date, farmer's general area — not full personal data)
  → tap lead → shows which product(s) were recommended and whether the farmer initiated contact
Analytics Tab
  → simple counters: diagnoses matched, contact requests received, top matched diseases this month
```

## 3. Admin Flow

*(Admin console can be a simple web app, not part of the mobile APK — see `02_TRD.md` and `07_Architecture.md`.)*

```
Admin Login (email + password)
  → Admin Console
Console
  → Dealers Tab → list pending dealers → Approve / Reject
  → Disease Library Tab → list diseases → Add/Edit (name translations, symptoms, causes, treatment protocol, reference images)
  → Products Tab (optional oversight) → view all products across dealers, flag inappropriate listings
  → Analytics Tab → platform-wide: total diagnoses, top diseases by region, dealer activity, language usage split
```

## 4. Cross-Cutting Flow Rules

- **Offline-first for History:** if network is unavailable, Home and History still render from local cache; only the live scan flow requires connectivity.
- **Diagnosis always completes before commerce:** the app must never show product recommendations without first showing the full diagnosis + treatment content on the same or preceding screen.
- **Low-confidence path:** if AI confidence is below the documented threshold (see `07_Architecture.md` §5), the Diagnosis Result screen shows an explicit "we're not fully sure" state alongside the best-guess result, and still offers the Contact Dealer option as a fallback.
- **Back-button behavior:** every screen must define what Android's hardware/gesture back button does (documented per-screen in `04_UI_UX_Spec.md`) — this is not left to default browser behavior.

## 5. Related Documents
UI details per screen: `04_UI_UX_Spec.md` · Data behind each screen: `05_Database.md` · Endpoints powering each step: `06_API_Design.md`
