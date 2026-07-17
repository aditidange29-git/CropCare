# 04 — UI/UX Specification

**Depends on:** `01_PRD.md`, `03_App_Flow.md`
**Purpose:** Screen-by-screen UI spec, design tokens, and states. This is the source of truth for any component or screen Kiro generates.

---

## 1. Design Principles

1. **Mobile-first, Android-native feel.** Not a responsive website — a native-feeling app (large tap targets, bottom tab bar, native call/WhatsApp intents, hardware back-button awareness).
2. **Literacy-sensitive.** Icon + short text labels, minimal typing, camera-first interaction.
3. **Advisory tone, not sales tone.** Diagnosis and treatment always visually precede product recommendations.
4. **Every screen has 4 defined states:** loading, empty, error, offline — not just the "happy path."

## 2. Design Tokens

| Token | Value | Notes |
|---|---|---|
| Primary color | `#1a936f` (green) | Growth/agriculture association |
| Secondary color | `#114b5f` (deep teal) | Headers, dealer/admin surfaces |
| Warning/Alert | `#f0a202` | Low-confidence diagnosis, stock warnings |
| Error | `#c1121f` | Failed scans, form errors |
| Background | `#f8f9fa` | |
| Font | System default (Roboto on Android) | Avoid custom web fonts — adds load time for no benefit in a native shell |
| Min tap target | 44×44dp | Android accessibility baseline |
| Corner radius | 12px cards, 8px buttons | Consistent, friendly, not sharp |

## 3. Screen Specs

### 3.1 Splash
- Full-bleed logo, brand color background.
- No interactive elements. Auto-navigates after session check (<2s target).

### 3.2 Language Select
- Large tappable cards, one per language, native script label (e.g., "मराठी", "English").
- Single-select, immediate navigation on tap (no separate "Continue" button — reduces friction).
- Back button: disabled on true first launch; on later access from Settings, returns to Settings.

### 3.3 Demo Login
- Two fields: Name (text), Phone Number (numeric input, formatted).
- One primary button: "Continue" — no password, no OTP field (demo-auth per `01_PRD.md` §6).
- Back button: returns to Language Select.

### 3.4 Home
- Bottom tab bar: Home | History | Settings.
- Primary CTA: large "Scan Crop" button/card, icon-forward, occupies significant screen real estate (this is the single most important action in the app).
- Secondary: horizontal scroll of last 2–3 diagnoses (tap to reopen).
- Empty state (new user, no diagnoses yet): friendly illustration + "Scan your first crop" prompt.
- Back button: exits app (with a confirmation toast on first back-press, standard Android double-back-to-exit pattern).

### 3.5 Camera Screen
- Full-screen camera viewfinder (via Capacitor Camera plugin).
- On-screen guidance text: "Keep the leaf in frame, in good light."
- Two entry points: shutter button (capture) and gallery icon (upload existing photo).
- Permission-denied state: explanatory screen before the OS permission prompt (pre-permission primer), and a clear fallback message + Settings deep link if denied.
- Back button: returns to Home.

### 3.6 Diagnosis Loading
- Not a blank spinner — show a short progress narrative cycling through 2–3 messages ("Analyzing image…", "Checking symptoms…", "Almost done…").
- Timeout state (>15s): show "This is taking longer than usual" with a cancel option.

### 3.7 Diagnosis Result
- Header: disease name (localized), confidence badge (High/Medium/Low — never a raw decimal to the farmer).
- Low-confidence variant: visually distinct banner ("We're not fully sure — here's our best guess") per `03_App_Flow.md` §4.
- Body: plain-language explanation, then Treatment section split into two clearly labeled sub-sections: **Organic/Home Remedies** and **Chemical Treatment**.
- Primary CTA at bottom: "See Recommended Products" (secondary in visual weight to the treatment content itself).
- Back button: returns to Camera/Home depending on entry point.

### 3.8 Recommendations Screen
- Product cards: product name, dealer name, distance (e.g., "2.3 km away"), stock status badge.
- Cards sorted by rank (per `07_Architecture.md` §5 ranking logic) — no visual "sponsored" styling.
- Each card has a "Contact Dealer" button (call icon + WhatsApp icon side by side).
- Empty state (no matching dealer product): friendly message — "No dealers near you stock a specific product yet — here's a general suggestion" + generic product category names only.

### 3.9 History
- Reverse-chronological list, each row: thumbnail, disease name, date, confidence badge.
- Filter chips: by crop (if farmer has scanned multiple crop types).
- Fully functional offline (reads from local cache — see `07_Architecture.md` §6.1 offline strategy).

### 3.10 Dealer Dashboard (role-gated)
- Separate navigation stack from farmer flow, entered only after dealer login.
- Tabs: Catalog | Leads | Analytics (per `03_App_Flow.md` §2).
- Catalog: standard list + floating "Add Product" button + form (name, category, applicable disease dropdown sourced from Disease Library, stock toggle, image upload).
- Leads: list with diagnosis context chips (disease, date, general area).
- Analytics: 3–4 simple stat cards (numbers, not complex charts).

### 3.11 Admin Console (can be web, not mobile)
- Standard admin table layouts: Dealers (with Approve/Reject actions), Disease Library (with Add/Edit forms), Analytics overview.

### 3.12 Settings
- Language change (reopens Language Select in "change mode").
- Logout.
- App version display.
- (Future, not built now) Notification toggle.

## 4. Accessibility & Literacy Notes
- Every icon-only button also has a text label — never icon-only for primary actions.
- Color is never the sole indicator of state (e.g., confidence badges use both color and text: "High/Medium/Low").
- Minimum font size 14sp for body text, 18sp+ for primary CTAs.

## 5. Related Documents
Flow logic: `03_App_Flow.md` · Data shown on each screen: `05_Database.md` and `06_API_Design.md`
