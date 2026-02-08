# Transport Application Map & Features

## Overview

This application is a comprehensive Non-Emergency Medical Transportation (NEMT) management platform designed to streamline operations between House Managers (Admins/Dispatchers) and Drivers. It features a "Mission Control" dashboard for real-time fleet management and a mobile-optimized driver interface for trip execution and compliance.

---

## User Personas

### 1. House Manager / Admin

- **Role:** Dispatcher, Fleet Manager, Administrator.
- **Platform:** Desktop Web (Primary), Tablet.
- **Key Goals:** Monitor fleet real-time, schedule trips, manage resources (drivers/vehicles/members), and handle billing/reports.

### 2. Driver

- **Role:** Service Provider.
- **Platform:** Mobile Web / PWA.
- **Key Goals:** Receive trip assignments, execute trips with navigation, capture proof of service (signatures/locations), manage availability.

---

## App Map Structure

### 1. Public Layer

- **Authentication**: Secure login with role-based redirection.

### 2. Admin & House Manager Portal

- **Mission Control (Dashboard)**
  - **Live Map**: Full-screen real-time visualization of all active drivers.
  - **Command Panel**: Quick access to dispatch, trip creation, and unassigned trip alerts.
  - **Fleet Status**: Real-time counters for active/scheduled trips and driver availability (On/Off Duty).
  - **Activity Feed**: Unified stream of system events (Trip started, Driver clocked in, etc.).
- **Trip Management**
  - **Schedule Trip**: Form for booking single or round-trip rides with specific mobility requirements (Wheelchair, Stretcher, etc.).
  - **Dispatch Board**: Assign drivers and vehicles to pending requests.
  - **Trip History**: Archive of all past trips with downloadable PDF reports.
- **Resource Management**
  - **Members**: specialized database for passengers (AHCCCS ID, Mobility Needs, default addresses).
  - **Drivers**: Profile management, compliance status (licenses/certifications), and schedule history.
  - **Vehicles**: Fleet management (VIN, Make/Model, Maintenance status).
- **Administration**
  - **Reports**: Payroll and Billing generation.
  - **Settings**: System-wide configurations.

### 3. Driver App (Mobile Optimized)

- **Onboarding & Compliance**
  - **Registration Flow**: Step-by-step wizard for personal info, license validation, and document upload.
  - **Profile**: Manage personal details and view compliance status.
- **Workflows**
  - **Dashboard**: Toggle "On/Off Duty" status, view upcoming schedule.
  - **My Trips**: Chronological list of assigned trips.
  - **Trip Execution (Live Mode)**:
    - **Pre-Trip**: Vehicle safety checklist (Odometer start).
    - **Navigation**: Integration with Apple Maps/Google Maps for routing.
    - **Workflow Steps**: En Route → Arrived → Passenger Boarded → Dropped Off.
    - **Proof of Service**: Digital signature capture (Member & Driver), Geolocation verification at stops.
  - **Trip Logging (Backfill)**: Tool to manually log past trips with multi-leg support (up to 6 stops) for complex routes.
  - **Ad-Hoc Booking**: specific ability for drivers to create immediate trips in the field.

---

## Key Features

### Core Functionality

- **Real-Time Telemetry**: Drivers' locations are tracked and displayed on the Admin's Mission Control map.
- **Smart Dispatching**: Assign drivers and vehicles based on availability and capability.
- **Mobility Support**: Specialized handling for Ambulatory, Wheelchair, Stretcher, and Car Seat requirements.

### Compliance & Verification

- **Digital Signatures**: Touch-sensitive signature pads for passengers and drivers to sign off on trips.
- **Geo-Fencing/Verification**: Timestamps and GPS coordinates captured at every status change (Arrived, Pickup, Dropoff).
- **PDF Generation**: Automatic generation of compliant trip reports (e.g., for AHCCCS billing) upon trip completion. (Currently supports "Batch 500" format).

### UX/UI Design

- **"Mission Control" Aesthetic**: Dark-mode first, glassmorphism design for the admin dashboard to emphasize data visualization and modernity.
- **Mobile-First Driver UI**: Large touch targets, clear step-by-step wizards, and simplified navigation for use while in a vehicle.
- **Elastic Bottom Sheets**: Modern mobile interaction patterns for trip details and actions.

### Utilities

- **Address Autocomplete**: (Integrated but currently debatable stability) for quick address entry.
- **Offline Resilience**: Ability to handle intermittent connectivity during trip execution (State management).
- **Multi-Leg Routing**: Support for complex itineraries (e.g., Home -> Clinic -> Pharmacy -> Home).
