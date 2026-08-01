# Traffic Fine Web Payment SPA

Public, no-login React + Vite portal for motorists to look up and pay a traffic fine using the reference number and category ID printed on their fine sheet.

## Setup

```bash
npm install
cp .env.example .env   # already done; edit VITE_API_BASE_URL if the backend runs elsewhere
npm run dev            # http://localhost:5173
```

Requires the `traffic-fine-backend` API running (default `http://localhost:4000/api`).

## Flow

`/` (Lookup) → `/details` (Fine Summary) → `/payment` (Checkout) → `/receipt`

Fine and payment data are held in `src/context/FineContext.jsx` for the duration of the session — there's no login, so navigating directly to `/details`, `/payment`, or `/receipt` without having looked up a fine first redirects back to `/`.

## Tests

```bash
npm test
```

Vitest + React Testing Library covering: card number/expiry formatting, checkout validation errors, lookup form validation, and successful/failed lookup navigation.

## Structure

```
src/
  pages/       Lookup, Details, Payment, Receipt
  components/  FineSummaryCard, CheckoutForm, ErrorBanner
  services/    apiClient (axios), fineService, paymentService
  context/     FineContext — in-memory fine/payment state across pages
  utils/       card number/expiry/CVV/phone formatting helpers
```
