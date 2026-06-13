# NTFMS Mobile Application - Architecture Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Flutter Mobile App (iOS/Android)          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Presentation Layer (UI)                             │  │
│  │  • FinePaymentScreen (StatefulWidget)               │  │
│  │  • Form Widgets (TextFormField, Cards)              │  │
│  │  • Loading/Error/Success States                      │  │
│  │  • Material Design 3 Components                       │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │  Business Logic Layer                                │  │
│  │  • Form validation                                   │  │
│  │  • State management (StatefulWidget)                 │  │
│  │  • User input handling                               │  │
│  │  • Error mapping                                     │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │  Service Layer (api_service.dart)                    │  │
│  │  • fetchFineDetails()                                │  │
│  │  • processPayment()                                  │  │
│  │  • Card validation (Luhn)                            │  │
│  │  • Error handling & retries                          │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
│  ┌────────────▼─────────────────────────────────────────┐  │
│  │  Data Layer                                          │  │
│  │  • Models (FineModel)                                │  │
│  │  • JSON serialization (fromJson/toJson)             │  │
│  │  • Constants & Utils                                 │  │
│  └────────────┬─────────────────────────────────────────┘  │
│               │                                             │
└───────────────┼─────────────────────────────────────────────┘
                │
                │ REST API (HTTP)
                │ 
┌───────────────▼─────────────────────────────────────────────┐
│              Backend REST API Server                         │
│  • GET /api/fines                                           │
│  • POST /api/payments                                       │
│  • SMS Notification Trigger                                 │
└─────────────────────────────────────────────────────────────┘
```

## User Workflow Diagram

```
START
  │
  ▼
┌──────────────────────────────────────┐
│  Enter Fine Reference Number         │
│  Enter Traffic Fine Category ID       │
└──────────────┬───────────────────────┘
               │
               ▼
         ┌──────────┐
         │ VALIDATE │──NO──► Show Error
         │  INPUT   │
         └────┬─────┘
              │ YES
              ▼
      ┌─────────────────────┐
      │ FETCH FINE DETAILS  │
      │ (API GET request)   │
      └────┬────────────────┘
           │
           ├─ 200 OK ──► Display Fine Info ─┐
           │                                 │
           ├─ 404 ──────► Show "Not Found"   │
           │                                 │
           └─ Error ────► Show Error Message─┤
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ USER REVIEWS FINE    │
                                  │ Shows: Amount, Name, │
                                  │ License, Status      │
                                  └────┬─────────────────┘
                                       │
                                       ▼
                                  ┌──────────────────┐
                                  │ PROCEED TO PAY?  │
                                  └────┬─────────────┘
                                       │
                    YES                │            NO
              ┌────────────────────────┼──────────────────┐
              │                        │                  │
              ▼                        ▼                  ▼
         ┌─────────────┐        ┌────────────┐      START OVER
         │ ENTER CARD  │        │ CANCEL &   │
         │ DETAILS     │        │ EXIT       │
         │ • Number    │        └────────────┘
         │ • Name      │
         │ • Expiry    │
         │ • CVV       │
         └────┬────────┘
              │
              ▼
         ┌──────────────┐
         │ VALIDATE ALL │──FAIL──► Show Errors
         │ CARD DETAILS │
         └────┬─────────┘
              │ PASS
              ▼
       ┌────────────────────────┐
       │ PROCESS PAYMENT        │
       │ (API POST request)      │
       └────┬───────────────────┘
            │
            ├─ 200/201 ──┐
            │            │
            ├─ 402 ──────┼──► Show "Payment Declined"
            │            │
            ├─ 409 ──────┼──► Show "Already Paid"
            │            │
            └─ Error ────┤
                         │
                         ▼
         ┌──────────────────────────────┐
         │ SHOW SUCCESS MESSAGE         │
         │ Confirmation # & Transaction │
         │ SMS sent to Officer          │
         └──────────┬───────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ CLEAR FORM & RESET   │
         │ Ready for next fine  │
         └──────────┬───────────┘
                    │
                    ▼
                  START OVER
```

## Component Hierarchy Diagram

```
NTFMSApp (MaterialApp)
  │
  └─► FinePaymentScreen (StatefulWidget)
      │
      ├─► _buildHeader()
      │   └─► Text widgets (title, subtitle)
      │
      ├─► _buildFineReferenceForm()
      │   ├─► TextFormField (Reference Number)
      │   ├─► TextFormField (Category ID)
      │   └─► ElevatedButton (Fetch Fine)
      │
      ├─► _buildFineDetailsCard()  [Visible after fetch]
      │   ├─► _buildStatusBadge()
      │   ├─► Container (Fine Amount)
      │   └─► _buildDetailRow() x 5
      │
      ├─► _buildPaymentForm()  [Visible after "Proceed to Pay"]
      │   ├─► TextFormField (Card Number)
      │   ├─► TextFormField (Cardholder)
      │   ├─► Row (Expiry Month/Year + CVV)
      │   └─► ElevatedButton (Confirm Payment)
      │
      ├─► _buildErrorMessage()  [Conditional]
      │   ├─► Icon
      │   └─► Text
      │
      └─► _buildSuccessMessage()  [Conditional]
          ├─► Icon
          └─► Text
```

## Data Flow Sequence Diagram

```
Driver        UI                API Service           Backend API
   │           │                    │                      │
   │ Enter     │                    │                      │
   │ Reference │                    │                      │
   ├──────────►│                    │                      │
   │           │ Validate           │                      │
   │           │ Click "Fetch"      │                      │
   │           │                    │                      │
   │           │ fetchFineDetails() │                      │
   │           ├───────────────────►│                      │
   │           │                    │ GET /api/fines       │
   │           │                    │ ?reference=X         │
   │           │                    │ ?categoryId=Y        │
   │           │                    ├─────────────────────►│
   │           │                    │                      │
   │           │                    │◄─────────────────────┤
   │           │                    │ {fineReferenceNumber,│
   │           │                    │  fineAmount, ...}    │
   │           │                    │                      │
   │           │◄───────────────────┤                      │
   │           │ FineModel object   │                      │
   │           │                    │                      │
   │ Sees Fine │                    │                      │
   │ Details   │                    │                      │
   │◄──────────┤                    │                      │
   │           │                    │                      │
   │ Enter     │                    │                      │
   │ Card      │                    │                      │
   │ Details   │                    │                      │
   ├──────────►│                    │                      │
   │           │ Validate Card      │                      │
   │           │ Click "Confirm"    │                      │
   │           │                    │                      │
   │           │ processPayment()   │                      │
   │           ├───────────────────►│                      │
   │           │                    │ POST /api/payments   │
   │           │                    │ {fineRef, card...}  │
   │           │                    ├─────────────────────►│
   │           │                    │                      │
   │           │                    │ Process Payment      │
   │           │                    │ Trigger SMS to       │
   │           │                    │ Traffic Officer      │
   │           │                    │                      │
   │           │                    │◄─────────────────────┤
   │           │                    │ {confirmationNumber, │
   │           │                    │  transactionId,      │
   │           │                    │  smsStatus: "sent"}  │
   │           │                    │                      │
   │           │◄───────────────────┤                      │
   │           │ Response Map       │                      │
   │           │                    │                      │
   │ Success   │                    │                      │
   │ Message   │                    │                      │
   │◄──────────┤                    │                      │
   │ Ready for │                    │                      │
   │ Next Fine │                    │                      │
   │           │                    │                      │
```

## State Machine Diagram

```
                    ┌─────────────┐
                    │  START      │
                    └──────┬──────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │  IDLE / INPUT    │◄─────┐
                 │  Waiting for     │      │
                 │  reference #     │      │
                 └────────┬─────────┘      │
                          │               │
                          ▼               │
                 ┌──────────────────┐     │
                 │  FETCHING        │     │
                 │  Getting fine    │     │
                 │  from API        │     │
                 └────┬────────┬────┘     │
                      │        │         │
                      │SUCCESS │         │
                      │        │         │
                      ▼        ▼         │
            ┌──────────────┐  │ERROR│    │
            │  FINE_FETCHED│  │ or │    │
            │  Display     │  │CANCEL   │
            │  fine info   │  │         │
            └──────┬───────┘  │         │
                   │          │         │
                   ▼          │         │
            ┌──────────────┐  │         │
            │  USER_ACTION │  │         │
            │  - Pay?      │  │         │
            │  - Cancel?   │  │         │
            └───┬──────┬──┘  │         │
                │      │     │         │
          PAY   │      │     │         │
                ▼      │     │         │
            ┌──────────┐│     │         │
            │PAYMENT   ││     │         │
            │FORM      ││     │         │
            └────┬─────┘│     │         │
                 │      │     │         │
                 ▼      │     │         │
            ┌──────────┐ │     │         │
            │PROCESSING││     │         │
            │PAYMENT   ││     │         │
            └───┬──┬───┘ │     │         │
                │  │     │     │         │
         SUCCESS│  │ERROR│     │         │
                ▼  ▼     │     │         │
            ┌──────────┐  │     │         │
            │ SUCCESS  │  │     │         │
            │ Payment  │  │    CANCEL   │
            │ Complete │  │    or ERROR  │
            └────┬─────┘  └──────┤       │
                 │               │       │
                 │               ▼       │
                 │           ┌────────┐  │
                 │           │ RESET  │  │
                 │           │ Clear  │  │
                 │           │ form   │  │
                 │           └────┬───┘  │
                 │                │      │
                 │                │      │
                 └────────────────┴──────┘
                        Returns to
                        INPUT state
```

## File Dependency Graph

```
main.dart
  │
  ├─► FinePaymentScreen (import: screens/fine_payment_screen.dart)
  │   │
  │   ├─► FineModel (import: models/fine_model.dart)
  │   │
  │   ├─► ApiService (import: services/api_service.dart)
  │   │   │
  │   │   └─► FineModel
  │   │
  │   └─► AppTheme (import: utils/app_theme.dart)
  │       └─► AppColors, AppTextStyles, AppSpacing, AppRadii
  │
  └─► AppTheme
      └─► Utils

Constants.dart can be imported by:
  • api_service.dart
  • fine_payment_screen.dart
  • Any service needing validation
```

---

**Document Version:** 1.0  
**Last Updated:** June 2026
