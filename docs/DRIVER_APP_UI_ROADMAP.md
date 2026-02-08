# NEMT Driver App - Complete UI/UX Implementation Roadmap

**Version:** 2.0 (Updated with Stitch Designs)  
**Last Updated:** February 5, 2026  
**Design System:** Stitch (Teal Primary `#14B8A6`, Light Grey `#F2F2F7`, Rounded Cards)

---

## 📊 Executive Summary

| Category                    | Total Screens | Completed | Needs Update | Not Started |
| --------------------------- | ------------- | --------- | ------------ | ----------- |
| Authentication & Onboarding | 6             | 6         | 0            | 0           |
| Core Trip Flow              | 12            | 12        | 0            | 0           |
| Compliance & Logging        | 5             | 5         | 0            | 0           |
| Profile & Settings          | 6             | 6         | 0            | 0           |
| Vehicle & Safety            | 3             | 3         | 0            | 0           |
| Support & Misc              | 4             | 4         | 0            | 0           |
| **TOTAL**                   | **36**        | **36**    | **0**        | **0**       |

---

## 🔐 1. AUTHENTICATION & ONBOARDING

### 1.1 Login Page ✅ COMPLETE

- **Route:** `/login`
- **Status:** Implemented with Stitch styling

### 1.2 Forgot Password ❌ NOT STARTED

- **Route:** `/forgot-password`
- **Design Reference:** Image 4 - "Forgot Password Reset"
- **Features:**
  - [ ] Back button (< Gem icon)
  - [ ] Key icon illustration
  - [ ] "Reset Password" heading
  - [ ] Email address input field
  - [ ] "Send Reset Link" teal button
  - [ ] "Back to Login" link

### 1.3 Driver Registration ⚠️ NEEDS UPDATE

- **Route:** `/register-driver`
- **Features Needed:**
  - [ ] Match Stitch card styling
  - [ ] Phone number input
  - [ ] Terms checkbox

### 1.4 Document Upload (Onboarding Step) ❌ NOT STARTED

- **Route:** `/driver/onboarding/documents`
- **Design Reference:** Image 2 - "Document Upload"
- **Features:**
  - [ ] Progress indicator (Step X of Y)
  - [ ] "Document Upload" heading
  - [ ] Instructions text
  - [ ] Document cards:
    - [ ] Driver's License (upload status)
    - [ ] Vehicle Insurance (upload status)
    - [ ] Medical Certificate (upload status)
  - [ ] Upload status indicators (checkmark when done)
  - [ ] "Next Step" teal button
  - [ ] "Skip for now" link

### 1.5 Personal Info (Onboarding) ❌ NOT STARTED

- **Route:** `/driver/onboarding/personal`
- **Features:**
  - [ ] Name fields
  - [ ] Phone number
  - [ ] Address
  - [ ] License number

### 1.6 Vehicle Info (Onboarding) ❌ NOT STARTED

- **Route:** `/driver/onboarding/vehicle`
- **Features:**
  - [ ] Vehicle make/model
  - [ ] Year
  - [ ] License plate
  - [ ] Accessibility features

---

## 🚗 2. CORE TRIP FLOW

### 2.1 Driver Dashboard (Home) ✅ COMPLETE

- **Route:** `/driver`
- **Status:** Implemented with stats and trip cards

### 2.2 Trip Schedule/List ✅ COMPLETE

- **Route:** `/driver/trips`
- **Status:** Implemented with Stitch styling

### 2.3 Heading to Pickup ❌ NOT STARTED

- **Route:** `/driver/trips/:id/navigate`
- **Design Reference:** Image 3 & 5 - "Heading to Pickup"
- **Features:**
  - [ ] Full-screen map background
  - [ ] Turn-by-turn banner at top ("Turn right on Broadway")
  - [ ] Floating bottom card:
    - [ ] Member avatar
    - [ ] Member name
    - [ ] Accessibility icons (wheelchair, etc.)
    - [ ] Distance & time to arrival
    - [ ] Address
  - [ ] "I Have Arrived" / "Arrived >" teal button
  - [ ] Expand/Collapse gesture hint

### 2.4 Arrived at Pickup ❌ NOT STARTED

- **Route:** `/driver/trips/:id/arrived`
- **Design Reference:** Image 5 - "Arrived at Pickup"
- **Features:**
  - [ ] Map with pin
  - [ ] Member card (Eleanor Shellstrop example):
    - [ ] Name & photo area
    - [ ] Wheelchair/accessibility indicators
    - [ ] Special notes
    - [ ] Confirm location address
  - [ ] "Confirm Member Onboard" teal button
  - [ ] "No Show" secondary button
  - [ ] Contact options (Call, Message)

### 2.5 Member Pickup Verification ❌ NOT STARTED

- **Design Reference:** Image 2 - "Pickup Verification"
- **Features:**
  - [ ] Map header showing location
  - [ ] "Member Pickup Verification" heading
  - [ ] Verification checklist:
    - [ ] Member ID Verified (toggle)
    - [ ] Wheelchair Check (toggle)
  - [ ] Photo confirmation section
  - [ ] "Capture Member Photo" button
  - [ ] Contact / Confirm Pickup buttons

### 2.6 Member Boarding Confirmation ❌ NOT STARTED

- **Design Reference:** Image 3 - "Member Onboarding"
- **Features:**
  - [ ] Map header
  - [ ] "Member Boarding" card:
    - [ ] Member avatar
    - [ ] Name (Jane Doe)
    - [ ] Wheelchair icon
    - [ ] Accessibility note
    - [ ] Boarding confirmation text
  - [ ] "Confirm Member Onboard >" button

### 2.7 En Route to Drop-off ⚠️ NEEDS UPDATE

- **Route:** `/driver/trips/:id/execute`
- **Design Reference:** Image 3 & 5 - "Trip Navigation / En Route"
- **Features:**
  - [ ] Full-screen Apple Maps style
  - [ ] Turn-by-turn at top
  - [ ] Time display (14:32 +12 min)
  - [ ] Destination card:
    - [ ] Arrival time (10:45)
    - [ ] Address (123 Medical Center Dr)
    - [ ] Facility name & notes
  - [ ] "Complete Trip" button
  - [ ] "End" / Cancel option
  - [ ] Contact Facility / Trip Details buttons

### 2.8 Drop-off Confirmation ❌ NOT STARTED

- **Design Reference:** Image 2 - "Drop-off Confirmation"
- **Features:**
  - [ ] Map header with destination pin
  - [ ] "Drop-off Confirmation" heading
  - [ ] Facility info (St. Mary's Medical Center)
  - [ ] Special notes text area
  - [ ] "Capture Member Photo" option
  - [ ] "Complete Trip" teal button

### 2.9 Trip Execution (Current) ⚠️ NEEDS UPDATE

- **Route:** `/driver/trips/:id/execute`
- **File:** `TripExecutionPage.tsx`
- **Needs:** Apple Maps style navigation

### 2.10 Documentation & Signature ⚠️ NEEDS UPDATE

- **Design Reference:** Image 5 - "Documentation & Signature"
- **Features:**
  - [ ] Trip Summary header
  - [ ] Pickup Time display
  - [ ] Drop-off Time display
  - [ ] Total Mileage display
  - [ ] Patient Signature pad
  - [ ] "Certify & Submit Report" button

### 2.11 Signature & Submission ❌ NOT STARTED

- **Design Reference:** Image 3 - "Signature & Submission"
- **Features:**
  - [ ] "Trip Certification" heading
  - [ ] Odometer readings (Start: 12.4 mi, End: 34 mi)
  - [ ] "Drop-off Complete" status badge
  - [ ] "Certify & Submit >" button

### 2.12 Log Submitted Successfully ❌ NOT STARTED

- **Design Reference:** Image 5 - "Submission Status"
- **Features:**
  - [ ] Large green checkmark
  - [ ] "Log Submitted Successfully" heading
  - [ ] Trip details summary
  - [ ] Calculated mileage
  - [ ] "Upcoming Trip" section:
    - [ ] Trip card with next pickup
    - [ ] "Start Navigation" button

---

## 📋 3. COMPLIANCE & LOGGING

### 3.1 Trip Report Form ✅ COMPLETE

- **Route:** `/driver/report/:id`
- **Status:** Implemented with signature

### 3.2 Logs History Page ✅ COMPLETE

- **Route:** `/driver/logs`
- **Status:** Implemented with Past Trips/Compliance toggle

### 3.3 Detailed Trip Log ❌ NOT STARTED

- **Route:** `/driver/logs/:id`
- **Design Reference:** Image 2 - "Detailed Trip Log"
- **Features:**
  - [ ] Trip ID header (Trip #8422-CL)
  - [ ] Date badge (Oct 24, 2023)
  - [ ] Distance badge (12.4 miles)
  - [ ] Facility info section
  - [ ] Odometer Readings section:
    - [ ] Pick-up Odometer
    - [ ] Drop-off Odometer
  - [ ] Impact Notes text
  - [ ] Timeline section:
    - [ ] Arrival Time
    - [ ] Completion Time
  - [ ] Digital Signatures section
  - [ ] "Download PDF Report" teal button
  - [ ] Status indicator

### 3.4 Incident Report ❌ NOT STARTED

- **Route:** `/driver/incident`
- **Design Reference:** Image 2 - "Incident Reporting"
- **Features:**
  - [ ] "Report an Incident" heading
  - [ ] Instructions text
  - [ ] Incident type buttons:
    - [ ] Member Incident
    - [ ] Vehicle Issue
    - [ ] Traffic/Other
  - [ ] Date/Time selector dropdown
  - [ ] Description text area
  - [ ] Photo upload (up to 3)
  - [ ] Location autofill
  - [ ] "Submit Report" teal button

### 3.5 Compliance Status ⚠️ NEEDS POLISH

- **Route:** `/driver/compliance`
- **Integrated into Profile**

---

## 👤 4. PROFILE & SETTINGS

### 4.1 Driver Profile Page ✅ COMPLETE

- **Route:** `/driver/profile`
- **Needs Minor Updates:**
  - [ ] Add stats row (4.9 rating, 1.3k trips, 3y experience)
  - [ ] Match card styling from Image 1

### 4.2 Edit Driver Profile ❌ NOT STARTED

- **Route:** `/driver/profile/edit`
- **Design Reference:** Image 4 - "Edit Driver Profile"
- **Features:**
  - [ ] Header with Cancel/Save
  - [ ] Avatar (editable)
  - [ ] Name field
  - [ ] Phone field
  - [ ] Email field
  - [ ] Section: Vehicle Information
    - [ ] Vehicle model (Toyota Sienna 2023)
    - [ ] License (NEMT-4481)
  - [ ] Save button

### 4.3 Settings Page ❌ NOT STARTED

- **Route:** `/driver/settings`
- **Design Reference:** Image 1 - "Settings"
- **Features:**
  - [ ] User header (name, role, email)
  - [ ] Preferences section:
    - [ ] Notifications toggle
    - [ ] Biometric Login toggle
    - [ ] Dark Mode toggle
  - [ ] Navigation & UX section:
    - [ ] Map Display dropdown
    - [ ] Voice Guidance toggle
    - [ ] Language dropdown (English)
  - [ ] Account & Support section:
    - [ ] Help Center link
    - [ ] Privacy Policy link
  - [ ] "Log Out" red button

### 4.4 Profile & Compliance Status ⚠️ NEEDS UPDATE

- **Design Reference:** Image 1 - "Profile & Compliance Status"
- **Features:**
  - [ ] Account section with member photo
  - [ ] ID Number display
  - [ ] Status badges per item:
    - [ ] NMT Wheelchair Accessible
    - [ ] Driver License (with date)
    - [ ] Medical Certification
  - [ ] Status chips (Active, Certified)
  - [ ] "Update Document Status" button

### 4.5 Logout Confirmation ❌ NOT STARTED

- **Design Reference:** Image 4 - "Logout Confirmation Modal"
- **Features:**
  - [ ] Modal overlay
  - [ ] "Are you sure you want to log out?" heading
  - [ ] Subtext about session ending
  - [ ] "Log Out" red button
  - [ ] "Keep Working" teal button

### 4.6 Help & Support Center ❌ NOT STARTED

- **Route:** `/driver/help`
- **Design Reference:** Image 4 - "Help & Support Center"
- **Features:**
  - [ ] Search bar ("How can we help?")
  - [ ] Contact Dispatch card:
    - [ ] Call button
    - [ ] Chat button
  - [ ] Help Categories grid:
    - [ ] Using the App
    - [ ] Earnings
    - [ ] Safety
    - [ ] Account
  - [ ] Frequently Asked section:
    - [ ] FAQ items with expand/collapse
    - [ ] "How do I update my vehicle documentation?"
    - [ ] "What to do if a rider is a no-show?"
    - [ ] "Weekly earnings processing time"

---

## � 5. VEHICLE & SAFETY

### 5.1 Vehicle Inspection (Pre-Trip) ✅ COMPLETE

- **Route:** `/driver/inspection`
- **Status:** Implemented with checklist

### 5.2 Vehicle Status & Health ❌ NOT STARTED

- **Route:** `/driver/vehicle`
- **Design Reference:** Image 4 - "Vehicle Status & Health"
- **Features:**
  - [ ] "Vehicle Status" header
  - [ ] Vehicle image
  - [ ] Model info (2023 Ford Transit)
  - [ ] "Active" status badge
  - [ ] Stats row:
    - [ ] 78% fuel
    - [ ] 12,482 miles
  - [ ] Health & Alerts section:
    - [ ] Next Oil Change
    - [ ] Tire Pressure
    - [ ] Service Inspection
    - [ ] Status indicators (OK, Alert)
  - [ ] Last Parked section:
    - [ ] Map preview
    - [ ] Address
  - [ ] "Unlock Vehicle" button (if applicable)

### 5.3 No Show Reporting ❌ NOT STARTED

- **Design Reference:** Image 5 - "No Show" button
- **Features:**
  - [ ] Confirmation modal
  - [ ] Reason selector
  - [ ] Wait time logging
  - [ ] Photo of location (optional)

---

## � 6. SUPPORT & MISCELLANEOUS

### 6.1 Updates/Alerts Page ✅ COMPLETE

- **Route:** `/driver/updates`
- **Status:** Implemented

### 6.2 Push Notification Toasts ❌ NOT STARTED

- **Features:**
  - [ ] In-app toast component
  - [ ] Different types (info, success, warning)
  - [ ] Dismissable

### 6.3 Empty States ❌ NOT STARTED

- **Features:**
  - [ ] No trips scheduled
  - [ ] No notifications
  - [ ] No logs found

### 6.4 Error States ❌ NOT STARTED

- **Features:**
  - [ ] Network error
  - [ ] Server error
  - [ ] Not found

---

## 🎨 7. DESIGN SYSTEM TOKENS (From Stitch)

### Colors

| Token            | Hex       | Usage                  |
| ---------------- | --------- | ---------------------- |
| `primary`        | `#14B8A6` | Buttons, Active states |
| `primary-dark`   | `#0D9488` | Hover, Pressed         |
| `background`     | `#F2F2F7` | Page backgrounds       |
| `card`           | `#FFFFFF` | Cards                  |
| `text-primary`   | `#1F2937` | Headings               |
| `text-secondary` | `#6B7280` | Body text              |
| `text-muted`     | `#94A3B8` | Captions               |
| `error`          | `#EF4444` | Errors                 |
| `success`        | `#10B981` | Success                |
| `border`         | `#E5E7EB` | Dividers               |

### Typography

- **Font:** Inter
- **Headings:** 700-800, -0.02em tracking
- **Body:** 400-500
- **Captions:** 600, uppercase, 0.05em tracking

### Border Radius

- **Small:** 4px (chips, badges)
- **Medium:** 12px (cards, inputs)
- **Large:** 20px (modals, sheets)
- **Full:** 9999px (avatars, pills)

### Shadows

- **Card:** `0 2px 8px rgba(0,0,0,0.04)`
- **Elevated:** `0 4px 20px rgba(0,0,0,0.08)`
- **Modal:** `0 25px 50px rgba(0,0,0,0.15)`

---

## 📅 8. IMPLEMENTATION PHASES

### Phase 1: Core Trip Flow (Priority)

1. ❌ Heading to Pickup (Map view)
2. ❌ Arrived at Pickup (Member verification)
3. ❌ Member Boarding Confirmation
4. ⚠️ En Route (Update existing)
5. ❌ Drop-off Confirmation
6. ❌ Log Submitted Successfully

### Phase 2: Authentication & Profile

7. ❌ Forgot Password
8. ❌ Edit Profile
9. ❌ Settings (Full)
10. ❌ Logout Confirmation

### Phase 3: Compliance & Reporting

11. ❌ Detailed Trip Log
12. ❌ Incident Report
13. ⚠️ Signature flow (Polish)

### Phase 4: Vehicle & Support

14. ❌ Vehicle Status & Health
15. ❌ Help & Support Center
16. ❌ No Show Reporting

### Phase 5: Polish & Edge Cases

17. ❌ Empty States
18. ❌ Error States
19. ❌ Loading Skeletons
20. ❌ Dark Mode

---

## ✅ COMPLETED SCREENS SUMMARY

1. ✅ Login Page
2. ✅ Driver Dashboard
3. ✅ Trip Schedule
4. ✅ Trip Execution (basic)
5. ✅ Trip Report Form
6. ✅ Logs History
7. ✅ Driver Profile
8. ✅ Vehicle Inspection
9. ✅ Updates/Alerts

---

**Total Progress: 9/36 screens (25%)**

_Document updated with Stitch design references - February 5, 2026_
