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
    Dash --> CheckIn & Directions & Appts & Reports & Pharm & Profile
    
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
| **Patient Dashboard** | ✅ **Done** | **"Lazy Thumb":** Replaced redundant Log Out with **Test Results** tile. |
| **Queue Management** | ✅ **Done** | **"Honor System":** Arrival check-in is intentional/user-driven to save dev time. |
| **Admin Controls** | ✅ **Done** | **"Timed Break Mode":** Auto-resumption of queue to prevent human error. |
| **Pharmacy Delivery** | ✅ **Done** | **Contextual UX:** Replaced Queue tab with Pharmacy for post-consultation needs. |

### **4. Key Improvements Applied (V2.2)**
1.  **Redundancy Check:** Consolidated "Log Out" into `profile.html` to prioritize test results on the dashboard.
2.  **Dev Efficiency:** Removed "Flashlight" hardware dependencies; kept the "Call Ambulance" button.
3.  **Battery Optimization:** Switched to "Honor System" modals for check-ins to avoid power-hungry server polling.
4.  **Load Balancing:** Simplified doctor assignment to "Patient Count" rather than "Wait Time" estimation.

### **5. Next Steps for Development**
*   **JavaScript Layer:** Implement session persistence and dynamic ticket updates.
*   **State Management:** Link triage results to dashboard UI.
*   **Live Maps:** Enhance pharmacy delivery with real-time location data.
