# PRD: iOS Mobile App (Swift / iOS 26)

## Problem Statement

As a property manager, I currently manage rental contracts, tenants, houses, and owners exclusively through a web browser. This forces me to be at a computer to perform critical operations like creating contracts, checking expiration dates, or contacting tenants. I have no way to receive proactive alerts when a contract is about to expire, and I cannot quickly act on property management tasks while on the go or in the field.

## Solution

Build a native iOS 26 app in SwiftUI with the Liquid Glass design language that connects to the existing Next.js + PostgreSQL backend via a new set of dedicated mobile REST API endpoints. The app covers full CRUD for all four modules (Contracts, Tenants, Houses, Owners), with Contracts as the primary focus. It adds mobile-first features that are impossible in the web version: push notifications for expiring contracts, camera-based tenant ID scanning, biometric lock, and direct WhatsApp/SMS contact and PDF sharing.

## User Stories

### Authentication & Security
1. As a property manager, I want to log in with my email and password on my iPhone, so that I can securely access my rental data from anywhere.
2. As a property manager, I want my session token stored securely in the iOS Keychain, so that I don't have to log in every time I open the app.
3. As a property manager, I want to unlock the app with Face ID, so that no one else can access my contract data if they pick up my phone.
4. As a property manager, I want the app to automatically prompt for biometric authentication when I return to the app from the background, so that my data stays protected at all times.
5. As a property manager, I want a clear error message when my credentials are wrong, so that I know to correct them without confusion.

### Dashboard
6. As a property manager, I want to see a count of my active contracts on the home screen, so that I have an instant overview of my portfolio.
7. As a property manager, I want a list of contracts expiring within the next 60 days on the home screen, so that I can proactively act on renewals or replacements.
8. As a property manager, I want a quick-action button to create a new contract from the dashboard, so that I can start the most common workflow in one tap.
9. As a property manager, I want a quick-action button to add a new tenant from the dashboard, so that I can register a new person without navigating deep into the app.

### Contracts — List
10. As a property manager, I want to see my contracts as large, full-width cards styled like the App Store Today section, so that each contract feels distinct and important.
11. As a property manager, I want each contract card to show the tenant's full name prominently as the headline, so that I can identify contracts at a glance.
12. As a property manager, I want each card to show the property address as a subtitle, the monthly rent, and the expiration date, so that I have the most relevant details without opening the contract.
13. As a property manager, I want contract cards to have a color accent tied to status — green for ACTIVE, orange for expiring soon (within 60 days), red for EXPIRED — so that I can assess my portfolio health visually.
14. As a property manager, I want to filter contracts by status (All, Active, Expiring Soon, Expired, Cancelled), so that I can focus on the subset that needs attention.

### Contracts — Detail
15. As a property manager, I want to tap a contract card and see all contract fields (tenant, house, owner, rent, deposit, start date, expiration date, deadline, witnesses, signing date, status), so that I have the complete picture in one screen.
16. As a property manager, I want a prominent button on the contract detail screen to download and view the PDF, so that I can review the legal document immediately.
17. As a property manager, I want to share the contract PDF directly to WhatsApp from the detail screen, so that I can send it to the tenant or owner without leaving the app.
18. As a property manager, I want to share the contract PDF via iOS ShareSheet (AirDrop, email, Files, etc.), so that I have flexible sharing options.
19. As a property manager, I want to edit any field of a contract from the detail screen, so that I can correct mistakes or update terms.
20. As a property manager, I want to change a contract's status to Cancelled from the detail screen, so that I can mark terminated agreements without deleting them.
21. As a property manager, I want to delete a contract from the detail screen with a confirmation alert, so that I can remove erroneous records without accidental data loss.
22. As a property manager, I want to configure custom push notification reminder dates for a specific contract from its detail screen, so that I can set alerts tailored to each tenant situation.

### Contracts — Create
23. As a property manager, I want to create a new contract through a 3-step flow, so that the process feels manageable and not overwhelming on a small screen.
24. As a property manager, I want Step 1 to let me search and select a house and a tenant from my existing records, so that I link the contract to existing data.
25. As a property manager, I want Step 2 to capture the rent price, deposit, start date, and contract deadline in months, so that the financial and time terms are clearly separated.
26. As a property manager, I want Step 3 to capture the two witness names and the signing date, so that I can complete the legal requirements of the contract.
27. As a property manager, I want to navigate back and forth between steps without losing my entered data, so that I can review and correct information before submitting.
28. As a property manager, I want the house to be automatically marked as RENTED when I create a contract for it, so that my availability data stays accurate.

### Push Notifications
29. As a property manager, I want to receive a push notification 60 days before any active contract expires, so that I have ample time to plan a renewal or find a new tenant.
30. As a property manager, I want to receive a push notification 30 days before any active contract expires, so that I get a final reminder before the deadline.
31. As a property manager, I want push notifications to deep-link directly to the relevant contract in the app, so that I can take action immediately from the notification.
32. As a property manager, I want to add custom reminder dates to a specific contract (e.g., 45 days, 15 days, or any specific date), so that I can tailor alerts to each unique situation.
33. As a property manager, I want to remove or edit custom reminders per contract, so that I can manage notification fatigue.

### Tenants
34. As a property manager, I want to see all my tenants in a list with their full name and phone number, so that I can find someone quickly.
35. As a property manager, I want to filter tenants by whether they currently have an active contract, so that I can distinguish active tenants from past ones.
36. As a property manager, I want to tap a tenant and see all their details (name, DOB, CURP/RFC, phone, email, address, emergency contact, employer, income, references), so that I have the complete profile.
37. As a property manager, I want a WhatsApp quick-contact button on the tenant detail screen, so that I can message them directly without copying their number.
38. As a property manager, I want an SMS quick-contact button on the tenant detail screen, so that I can text them directly from the app.
39. As a property manager, I want to add a new tenant by filling out a form with all tenant fields, so that I can register them before creating a contract.
40. As a property manager, I want to use my camera to scan a tenant's ID card and have the CURP/RFC fields auto-populated, so that I can avoid manual transcription errors.
41. As a property manager, I want to edit any tenant field, so that I can correct or update their information over time.
42. As a property manager, I want to delete a tenant with a confirmation alert, so that I can remove records cleanly.

### Houses
43. As a property manager, I want to see all houses in a list showing street address and current status (Available, Rented, Maintenance), so that I can assess availability quickly.
44. As a property manager, I want to filter houses by status and property type (Residential, Commercial), so that I can find the right property for a new contract.
45. As a property manager, I want to see full house details (owner, full address, property type, status, notes), so that I have all the relevant information.
46. As a property manager, I want to add a new house with all address fields and link it to an owner, so that I can onboard new properties.
47. As a property manager, I want to edit any house field, so that I can update address or status changes.
48. As a property manager, I want to delete a house with a confirmation alert, so that I can remove sold or irrelevant properties.

### Owners
49. As a property manager, I want to see all owners in a list with their name and phone number, so that I can find them quickly.
50. As a property manager, I want to see full owner details (name, phone, email, address), so that I have complete contact information.
51. As a property manager, I want to add a new owner, so that I can register new landlords before adding their properties.
52. As a property manager, I want to edit any owner field, so that I can keep their contact information current.
53. As a property manager, I want to delete an owner with a confirmation alert, so that I can clean up my records.

## Implementation Decisions

### Backend — New Mobile API Layer (`/api/mobile/`)

- Add a dedicated mobile auth endpoint `POST /api/mobile/auth/login` that accepts email/password, verifies credentials against the existing User table using bcrypt, and returns a signed JWT (separate from NextAuth sessions).
- All `/api/mobile/*` routes validate the JWT from the `Authorization: Bearer <token>` header, scoping every query to the authenticated user's `userId`.
- New REST endpoints covering full CRUD for: Contracts, Tenants, Houses, Owners, plus a Dashboard summary endpoint.
- A dedicated `GET /api/mobile/contracts/[id]/pdf` endpoint that reuses the existing `ContractPDF` React-PDF component and returns the binary PDF stream.
- A `POST /api/mobile/notifications/device-token` endpoint to register the APNs device token for the authenticated user.
- A `PUT /api/mobile/contracts/[id]/notifications` endpoint to store per-contract custom reminder dates.
- A server-side cron job that runs daily, queries contracts with expiration dates within 30 and 60 days (plus any custom reminder dates), and sends APNs push notifications via the Apple Push Notification service HTTP/2 API.

### iOS App — Major Modules

**AuthModule**
- Login screen (email + password form).
- JWT stored in iOS Keychain via the Security framework.
- Biometric gate on app foreground using `LocalAuthentication` framework (Face ID).
- Token refresh logic and 401 handling (force logout).

**APIClient**
- A single, centralized async/await HTTP client that injects the JWT Bearer token on every request.
- Typed request/response models mirroring the backend JSON contracts for all four entities.
- Centralized error handling that surfaces user-facing messages.

**DashboardModule**
- Summary card with active contract count.
- List of contracts expiring within 60 days.
- Quick-action buttons wired to the contract and tenant create flows.

**ContractsModule**
- List view: `ScrollView` of full-width cards (App Store Today style) with Liquid Glass material accents and status color theming.
- Multi-step create flow: `NavigationStack` with three sequential views, shared `ContractDraft` state object passed through.
- Detail view: all fields displayed, PDF download via `QuickLookPreview`, ShareSheet integration, WhatsApp URL scheme deep link, edit/cancel/delete actions.
- Notification settings view: default reminders (30/60 days) shown as toggles; custom date picker to add additional reminders per contract.

**TenantsModule**
- Filterable list (`Picker` for active/all).
- Detail view with WhatsApp (`https://wa.me/52XXXXXXXXXX`) and SMS (`sms:XXXXXXXXXX`) quick-contact buttons using `openURL`.
- Camera scan using `AVFoundation` + `Vision` framework to detect text regions on an ID card and extract CURP/RFC patterns via regex.
- Create/edit form covering all `Tenant` schema fields.

**HousesModule**
- Filterable list by status and property type.
- Create/edit form with owner picker.

**OwnersModule**
- Simple list and create/edit form.

**NotificationsModule**
- APNs registration on first launch via `UNUserNotificationCenter`, device token sent to backend.
- Local notification scheduling as a fallback.

### Data & Schema Changes

- New column or table on `Contract` to store per-contract custom notification dates and whether default 30/60-day reminders are enabled.
- JWT secret stored in environment variables alongside existing NextAuth secret.

### API Contract Summary

All endpoints under `/api/mobile/` return JSON. Authentication via `Authorization: Bearer <jwt>`. Standard HTTP verbs: GET (list/detail), POST (create), PUT (update), DELETE (delete). PDF endpoint returns `application/pdf`. Dashboard endpoint returns counts and a short list of expiring contracts.

## Testing Decisions

**What makes a good test:** Tests should assert observable behavior at module boundaries — what the API returns given certain DB state, or what the iOS view renders given a mocked API response. Do not test internal implementation details like private methods or specific Prisma query structure.

**Backend tests (Jest / Supertest):**
- `POST /api/mobile/auth/login`: valid credentials return JWT; invalid credentials return 401.
- Authenticated CRUD endpoints: unauthenticated requests return 401; authenticated requests return correct data scoped to the user's `userId`.
- PDF endpoint: returns a non-empty binary response with `Content-Type: application/pdf`.
- Notification cron logic: given contracts with known expiration dates, the correct set of contracts is selected for notification dispatch.

**iOS tests (XCTest / Swift Testing):**
- `APIClient`: mock URLSession to assert correct headers (Bearer token), correct URL construction, and correct decoding of JSON responses into typed models.
- Contract multi-step flow: assert that `ContractDraft` state accumulates correctly across steps and that the final POST payload matches expectations.
- Vision camera scan: unit-test the CURP/RFC regex extractor in isolation given sample text strings.
- Biometric gate: assert that protected views redirect to the auth gate when `LAContext.evaluatePolicy` fails.

## Out of Scope

- **Offline support:** No local caching, no SwiftData persistence, no sync conflict resolution in v1. Planned for a future milestone.
- **Native PDF generation on device:** PDFs are server-generated. Rebuilding the contract template in Swift PDFKit is deferred to a future milestone.
- **Polish on Owners, Houses, and Tenants modules:** Functional for v1; visual refinement deferred.
- **Multi-user / team access:** Single-user app; all data scoped to one authenticated account.
- **Apple Sign-In or social authentication:** Email/password JWT only in v1.
- **iPad or macOS Catalyst:** iPhone only in v1.

## Further Notes

- The contract PDF template is already implemented in `src/lib/contractPdf.tsx` using `@react-pdf/renderer`. The mobile PDF endpoint should reuse this component directly — no new template logic.
- The existing auth system uses NextAuth with `strategy: 'jwt'` and bcrypt passwords. The new mobile JWT endpoint should use the same bcrypt comparison but issue its own signed token so mobile sessions are independent of web sessions.
- The app targets iOS 26 exclusively, enabling full Liquid Glass materials on tab bar, navigation bar, sheets, and cards throughout the UI.
- WhatsApp deep links use the `https://wa.me/52{phone}` URL scheme. Phone numbers in the DB may need normalization (strip spaces/dashes) before constructing the URL.
- The Vision framework CURP extractor should be built as a standalone, testable utility that accepts a `String` and returns optional `curp` and `rfc` matches — making it easy to test without a camera.
