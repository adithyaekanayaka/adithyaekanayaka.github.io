# Clinic Flow: System Architecture & Progress Map

This document serves as the master reference for the Clinic Flow architecture, tracking both implemented UI states and pending logic integrations.

### **1. System Master Map**
The following diagram traces the end-to-end user journey across all roles.

```mermaid
graph TD
    %% Styling
    classDef completed fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#155724;
    classDef logic fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b;
    classDef pending fill:#fff3cd,stroke:#856404,stroke-width:2px,stroke-dasharray: 5 5,color:#856404;

    %% NAVIGATION FLOW
    subgraph "Phase 1: Entry & Auth"
        Splash[index.html<br/>Splash Screen]:::completed
        Role[role.html<br/>Role Selection]:::completed
        PPhone[phone-patient.html]:::completed
        SPhone[phone-staff.html]:::completed
        POTP[otp-patient.html]:::completed
        SOTP[otp-staff.html]:::completed
        
        Session[Session Token Logic]:::pending
        Bio[Biometric Shortcut]:::pending
    end

    subgraph "Phase 2: Patient Journey"
        Diag[diagnosis.html<br/>Quick Triage]:::completed
        TriageLogic[Specialist Matching Logic]:::logic
        Dash[dashboard.html<br/>Patient Dashboard]:::completed
        
        CheckIn[checkin.html]:::completed
        Directions[directions.html]:::completed
        Appts[appointment.html]:::completed
        ApptDirections["Directions CTA<br/>(post-booking)"]:::completed
        ClinTests[clinical-tests.html<br/>Clinical Tests]:::completed
        Reports[reports.html<br/>Test Results]:::completed
        Pharm[pharmacy.html]:::completed
        Profile[profile.html]:::completed

        Late[modal-late.html<br/>Running Late]:::completed
        SwapLogic[Queue Swapping Logic]:::pending
        Honor[modal-arrival.html<br/>Honor System]:::logic
    end

    subgraph "Phase 3: Order & Delivery"
        Confirm[order-confirmation.html]:::completed
        Delivery[order-delivery.html]:::completed
        MapExp[Expanded Interactive Map]:::pending
    end

    subgraph "Phase 4: Admin & Staff"
        AdminD[admin.html<br/>Admin Dashboard]:::completed
        Queue[queue.html<br/>Live Queue Status]:::completed
        Break[modal-break.html<br/>Timed Break]:::logic
        
        Overflow[Overflow Protocol]:::logic
        AutoResume[Auto-Resume Timer]:::pending
        LiveUpdate[WebSocket Live Updates]:::pending
    end

    %% Connections
    Splash --> Role
    Role -->|Patient| PPhone --> POTP --> Diag
    Role -->|Staff/Admin| SPhone --> SOTP --> AdminD
    
    Diag --> Dash
    Dash --> CheckIn & Appts & ClinTests & Reports & Pharm & Profile
    CheckIn -.-> Directions
    Appts -.-> ApptDirections
    ApptDirections --> Directions
    
    ClinTests -->|View Result| Reports
    
    CheckIn -.-> Honor
    Dash -.-> Late
    Late -.-> SwapLogic
    
    Pharm --> Confirm --> Delivery
    
    AdminD --> Queue & Break & StaffReports[reports.html]
    Break -.-> AutoResume

    %% Legend / Status
    subgraph "Progress Legend"
        L1[Static UI Completed]:::completed
        L2[UX-Driven Logic Defined]:::logic
        L3[Backend/JS Integration Needed]:::pending
    end
```

---

### **2. Detailed Progress Audit**

#### **Phase 1: Authentication & Entry**
*   ✅ **Completed:** Full Splash-to-Dashboard flow for Patients, Staff, and Admins. Responsive OTP entry screens.
*   🚧 **Pending:** `localStorage` session handling to skip splash for returning users.

#### **Phase 2: Patient Journey (The "Lazy Thumb" Core)**
*   ✅ **Completed:** Triage questionnaire (`diagnosis.html`), specialist matching logic, and "Test Results" dashboard tile.
*   ✅ **Completed:** "Honor System" arrival check-in and "Running Late" modals.
*   ✅ **Completed (V2.3):** `clinical-tests.html` — doctor-ordered test pipeline tracker (Ordered → Sample → Processing → Ready). Covers lab, imaging, and cardiac test categories. Includes preparation instructions, clinic location chips, and a "View Result" CTA that links to `reports.html`.
*   ✅ **Completed (V2.3):** Dashboard tile restructured — Directions replaced by Clinical Tests. Dashboard now maps to the full patient lifecycle: Check In → Appointments → Clinical Tests → Test Results.
*   ✅ **Completed (V2.3):** `reports.html` updated with a "Pending Clinical Tests" shortcut banner linking to `clinical-tests.html`.
*   🚧 **Pending:** Dynamic data binding for live queue counts and actual queue swap algorithm.

#### **Phase 3: Pharmacy, Order & Delivery**
*   ✅ **Completed:** Browsing, confirmation, and delivery tracking UI states.
*   🚧 **Pending:** Integration with live mapping APIs for real-time courier movement.

#### **Phase 4: Admin / Operational Control**
*   ✅ **Completed:** Active doctor monitors, triage assignment UI, and overflow standby mode.
*   🚧 **Pending:** WebSockets for live dashboard updates and auto-resume timers for doctor breaks.

---

### **3. Progress Checklist & Logic Status**

| Module | Status | Logic Implemented (Stakeholder Alignment) |
| :--- | :--- | :--- |
| **Splash & Role** | ✅ **Done** | Token check logic (simulated) + Role separation. |
| **Auth (OTP/PIN)** | ✅ **Done** | 2-step phone binding for Patients; Credential binding for Staff. |
| **Triage (Diagnosis)** | ✅ **Done** | **"The System Decisions":** Specialist matching based on symptom selection. |
| **Patient Dashboard** | ✅ **Done** | **"Lazy Thumb":** Directions tile replaced by Clinical Tests — maps full patient lifecycle. |
| **Contextual Directions** | ✅ **Done (V2.4)** | **"Right Place":** Directions CTA added to `appointment.html` footer so wayfinding appears at the moment of booking, not on the dashboard. |
| **Clinical Tests** | ✅ **Done** | **"Zero Input":** All test data (doctor, location, prep) pre-filled. 4-step visual pipeline. Cross-links to Test Results. |
| **Queue Management** | ✅ **Done** | **"Honor System":** Arrival check-in is intentional/user-driven to save dev time. |
| **Admin Controls** | ✅ **Done** | **"Timed Break Mode":** Auto-resumption of queue to prevent human error. |
| **Pharmacy Delivery** | ✅ **Done** | **Contextual UX:** Replaced Queue tab with Pharmacy for post-consultation needs. |

### **4. Key Improvements Applied (V2.2)**
1.  **Redundancy Check:** Consolidated "Log Out" into `profile.html` to prioritize test results on the dashboard.
2.  **Dev Efficiency:** Removed "Flashlight" hardware dependencies; kept the "Call Ambulance" button.
3.  **Battery Optimization:** Switched to "Honor System" modals for check-ins to avoid power-hungry server polling.
4.  **Load Balancing:** Simplified doctor assignment to "Patient Count" rather than "Wait Time" estimation.

### **Key Improvements Applied (V2.3)**
5.  **Post-Consultation Gap Closed:** Added `clinical-tests.html` to track the full test lifecycle (ordered → sample → processing → ready). Previously, patients had no visibility into tests ordered but not yet resulted.
6.  **Dashboard Lifecycle Alignment:** Replaced the low-frequency "Directions" dashboard tile with "Clinical Tests". The four tiles now directly map to the four main post-triage actions: **Check In → Appointments → Clinical Tests → Test Results**.
7.  **Cross-Screen Linking:** `reports.html` now surfaces a "Pending Clinical Tests" banner, and `clinical-tests.html` surfaces a "View Result" CTA — patients can navigate between ordered tests and completed results without returning to the dashboard.
8.  **Zero-Input Compliance:** The Clinical Tests page shows all data (doctor, date, location, prep requirement) pre-populated, requiring no typing from the patient consistent with the "Lazy Thumb" rule.

### **Key Improvements Applied (V2.4)**
9.  **Contextual Directions Access (V2.4):** Directions removed from dashboard (wrong frequency) but re-surfaced contextually in `appointment.html` footer. The user sees a "Get Directions to Clinic" CTA immediately after confirming or saving a booking — the only moment they genuinely need wayfinding. Check-In retains its own directions link for day-of use. Right feature, right place.

### **5. Next Steps for Development**
*   **JavaScript Layer:** Implement session persistence and dynamic ticket updates.
*   **State Management:** Link triage results to dashboard UI; bind clinical test orders from doctor's consultation to patient view.
*   **Live Maps:** Enhance pharmacy delivery with real-time location data.
*   **Push Notifications:** Notify patient when a test result changes status to "Ready".
