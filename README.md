# Clinic Flow App Specification V2.2

## **1\. Project Philosophy & Core Logic**

* **Core UX Philosophy:** "The System Decides, The User Confirms".  
* **Refined Constraint:** "The Lazy Thumb" Rule.  
  * *Original:* One thumb, no typing.  
  * *Improvement:* **No "Polling" Logic.** The app should not constantly ask the server "Is it time yet?" to unlock buttons. State changes must be user-driven or push-notification driven to save battery and dev complexity.

## **2\. Onboarding (Session Logic Refined)**

* **Screen 0.1: Splash Screen**  
  * *Logic:* Check for valid session token (auth\_token) in local storage.  
  * *Action:*  
    * **If Token Exists:** Skip Screen 0.2 & 0.3. Go immediately to **Screen 1.1 (Dashboard)**.  
    * **If No Token (First Run or Logged Out):** Go to **Screen 0.2**.  
* **Screen 0.2: Role Selection (The Gateway)**  
  * *Display Condition:* **Only appears if user is Logged Out.**  
  * *Action:* User selects "Patient", "Staff", or "Admin".  
  * *Benefit:* This balances speed with flexibility. Daily users get instant access. Shared devices can switch roles by explicitly logging out.  
* **Screen 0.3: Registration & Binding**  
  * *Dev reduction:* Use **Phone Number Binding** (OTP) as the primary credential.  
  * *Session Logic:*  
    * **Login:** Creates a persistent token.  
    * **Logout:** Deletes the token.  
  * *Biometrics:* If available (FaceID/Fingerprint), use it as a local shortcut to decrypt the token, but do not require OTP again unless the user explicitly logs out.

## **2.5: Quick Diagnostic Assessment**

* **Philosophy:** Safe, evidence-based symptom triage without medical diagnosis.
* **Purpose:** Collect structured health information to intelligently assign patients to appropriate doctors.
* **Flow:** Patient completes assessment → System assigns patient to best-matched doctor → Patient enters queue.

### **Assessment Components**

1. **Chief Complaint (Primary Symptom)**
   - **Options:** Cough/Cold, Nausea/Vomiting, Pain/Injury, Fever, Skin Issues, Headache, Other
   - **Benefit:** Determines doctor specialty assignment
   - **Safety:** Simple categorical selection—no free-text diagnosis

2. **Symptom Duration**
   - **Options:** <24hrs (Acute) | 1-3 days (Recent) | 4-7 days (Subacute) | >1 week (Chronic)
   - **Purpose:** Helps assess urgency and severity

3. **Severity Self-Assessment**
   - **Scale:** Mild, Moderate, Severe
   - **Impact:** Severe cases get priority queue positioning
   - **Localized:** Patient rates their own condition—no clinical judgment

4. **Associated Symptoms (Checklist)**
   - **Options:** Fever/Chills, Fatigue, Loss of appetite, Sleep disturbance
   - **Safety:** Non-diagnostic—just supportive information
   - **Data Usage:** Feeds doctor notes; helps identify patterns

5. **Patient Details (Self vs Someone Else)**
   - **Logic:** Defaults to "Myself". When "Myself" is selected, the Name, Age, and Gender fields are hidden because this data is already linked from the user's profile and initial registration.
   - **Action:** When "Someone else" is selected, these fields become visible so the user can provide the necessary details for the dependent.

6. **Medical History (Safe Questions)**
   - **Text Fields:** Known Allergies, Current Medications
   - **Checkboxes:** Diabetes, Hypertension, Previous similar episodes
   - **Safety Principle:** Only asks about conditions that affect immediate treatment decisions
   - **Privacy:** No genetic data, no detailed psychiatric history, no socioeconomic questions

7. **Legal Disclaimer**
   - "This assessment is for triage only and does not replace a medical diagnosis."
   - **Compliance:** Meets WHO & healthcare law requirements for non-diagnostic triage tools

### **Doctor Assignment Logic (Load Balanced)**

| Chief Complaint | Preferred Doctor | Fallback |
|---|---|---|
| Respiratory (cough, cold) | General Practitioner | Any |
| GI (nausea, vomiting) | GI Specialist / GP | Any |
| Pain / Musculoskeletal | Orthopedic / GP | Any |
| Fever | Infection Specialist / GP | Any |
| Skin Issues | Dermatologist / GP | Any |
| Headache | Neurologist / GP | Any |
| Other / Unspecified | General Practitioner | Any |

**Final Assignment:**
- Primary: Match to specialty (if available)
- Tiebreaker: Assign to doctor with **fewest patients in queue** (load balancing)
- Result: Patient sees " XX people ahead of you. Dr. [Name] is your assigned doctor."

### **Data Security & Privacy**

- **Stored Safely:** Encrypted in patient record (HIPAA/GDPR compliant backend required)
- **Never Sold:** Assessment data is never shared with third parties
- **Doctor-Visible:** Only the patient's assigned doctor sees the full assessment
- **Audit Trail:** All assessments logged with timestamp for accountability

## **3\. Wireframe Flow 1: The Patient Journey**

* **Screen 1.1: Dashboard (Refined)**
  * *Logic Simplification:* The "Log Out" tile on the dashboard was redundant since the "Profile" view already has a dedicated "Sign Out" button.
  * *Update:* The Log Out tile was replaced with a new **Test Results** tile to give users instant access to their lab reports directly from the home screen grid.
  * *V2.3 Update:* The **Directions** dashboard tile was replaced with **Clinical Tests**. Directions is a one-time-use feature already embedded in the Check In flow (static map). Clinical Tests is a recurring post-consultation need. The 4 tiles now map to the full patient lifecycle: **Check In → Appointments → Clinical Tests → Test Results**.
  * *V2.4 Note:* **Directions access is contextual, not global.** It surfaces in two places where it is actually needed: (1) the **Appointment** footer — after confirming/saving a booking, so the user can immediately navigate to the clinic; (2) the **Check In** flow — for day-of wayfinding. Removing it from the dashboard was correct; it is a low-frequency utility that belongs at the point of need, not prime real estate.
* **Screen 1.2: The "Safety Gate" (Scope Cut)**  
  * *Original:* "Flashlight toggle" and "Call Ambulance".  
  * *Critique:* Accessing the flashlight requires camera permission handling and hardware testing.  
  * *Improvement:* **Remove Flashlight.** Keep only the "Call Ambulance" button.  
  * *Action:* Tapping "Call Ambulance" immediately invokes the native system dialer with 1990 (or local equivalent) pre-filled.  
* **Screen 1.4: Medical Reports (New)**
  * *Logic:* Accessed via the Dashboard replacing the redundant Log Out button.
  * *Display:* Displays a chronological list of test results, lab reports, and prescriptions. Tags clearly demarcate statuses such as 'Available' vs 'Pending'.
  * *V2.3 Update:* Added a **Pending Clinical Tests** shortcut banner at the top that links to Screen 1.5 — closing the loop between ordered tests and received results without requiring navigation back to the dashboard.
* **Screen 1.5: Clinical Tests (New — V2.3)**
  * *Rationale:* After a consultation, patients have two distinct needs — tracking what tests were ordered (and where to go give a sample) vs. viewing completed results. These were previously conflated. Separating them reduces cognitive load and better serves each moment in the patient journey.
  * *Stakeholder Logic:* "Lazy Thumb" — all data (doctor name, date, location, prep note) is pre-populated from the system. Zero input required from the patient.
  * *Display:*
    * **Summary banner:** Active count, Processing count, Ready count.
    * **Active test cards:** test name, ordering doctor, status badge, visual 4-step pipeline stepper (Ordered → Sample → Processing → Ready), preparation instructions (fasting / no prep callout), clinic location chip, and a Get Directions CTA.
    * **Completed test cards:** same layout, all pipeline steps green, CTA changes to "View Result" → `reports.html`.
  * *Test Categories:*
    * **Lab (Blood):** CBC, HbA1c — blue icon, Lab Floor 1
    * **Cardiac:** 12-Lead ECG — red icon, Cardiology Floor 2
    * **Imaging:** Chest X-Ray — purple icon, Radiology Floor 3
  * *Pipeline States:* Ordered · Scheduled · Awaiting Sample · Processing · Ready
  * *Prep Logic:* Orange callout = fasting or restriction required. Green callout = no special prep.
* **Screen 1.6: Doctor Allocation (Logic Simplification)**  
  * *Original:* "Based on lowest wait time".  
  * *Critique:* Calculating "Time" is mathematically complex for an MVP.  
  * *Improvement:* **Load Balancing by Count.**  
  * *New Logic:* Assign the patient to the doctor with the **fewest tickets currently in queue**.  
  * *Display:* Change text from "Available in 5 mins" to "**2 people ahead of you.**"  
  * *Benefit:* Users trust "Counts" more than "Time estimates," and "Count" is a simple database integer query.

## **4\. Wireframe Flow 2: The Virtual Queue**

* **Screen 2.1: The "Running Late" Button (Logic Fix)**  
  * *Original:* Pushes patient back 3 spots.  
  * *Critique:* If the queue only has 2 people, the logic breaks.  
  * *Improved Logic:* **"Swap with Next."**  
  * *Action:* Tapping "Running Late" swaps the user's Queue Number with the person *immediately behind them* (Index i swaps with i+1).  
  * *Constraint:* Can only be pressed **once per 10 minutes**.  
* **Screen 2.2: Arrival Check-In (Dev Scope Reduction)**  
  * *Original:* Button is disabled and only turns Active when within 5 numbers.  
  * *Critique:* Requires constant server polling and background location services (battery drain).  
  * *Improved Logic:* **The "Honor System" Unlock.**  
  * *Visual:* The \[I HAVE ARRIVED\] button is **always Active**.  
  * *Action:* When tapped, a modal warning appears: *"Only tap this if you are physically in the waiting room. If you are not here when called, you will be moved to the end of the line."*  
  * *Benefit:* **Saves 40+ hours of dev time.** No polling, no conditional locking logic.  
* **Screen 2.3: Navigation**  
  * *Agreed:* Keep the "Static Map". Do not implement interactive maps.
* **Screen 2.4: Pharmacy Delivery (New)**
  * *Logic:* Added a dedicated Pharmacy Delivery page to the bottom navigation, replacing the Queue tab to reduce redundancy (as Queue and Directions were already easily accessible via the Dashboard).
  * *Display:* Shows a map of nearby pharmacies with delivery distance, duration, and price, enabling patients to easily request home medicine delivery.

## **5\. Wireframe Flow 3: The Admin Dashboard**

* **Screen 3.1: Capacity & Automation**  
  * *Original:* "Max Queue Length" stops recommendations.  
  * *Improvement:* **"The Overflow Protocol."**  
  * *Logic:* Instead of rejecting patients, trigger **"Standby Mode."**  
  * *Action:* If Dr. Silva hits 10 patients, new patients are added to a general "Triage Queue" (Waitlist) pending assignment.  
  * *Benefit:* You never reject a customer; you just defer the assignment.  
* **Screen 3.2: Queue Management**
  * *Original:* Break Mode.
  * *Critique:* Doctors will forget to turn off "Break Mode."
  * *Improved Logic:* **Timed Break Mode.**
  * *Action:* When Admin hits \[Pause/Break\], they must select a duration: **\[15 mins\]**, **\[30 mins\]**, or **\[Until Reactivated\]**.
  * *Default:* Defaults to **15 mins**.
  * *Benefit:* The system *automatically resumes* queue processing after the timer expires, preventing human error.

## **6. Implementation Details**

### **Technology Stack**
- **Frontend:** Pure HTML5 + CSS3 (Figma-style prototype)
- **Navigation:** CSS `:target` pseudo-selector for screen routing (no JavaScript)
- **Responsive Design:** Fully responsive across all devices (mobile → ultra-wide displays)
- **Browser Compatibility:** Modern browsers supporting CSS Grid, Flexbox, CSS variables, and advanced selectors

### **Responsive Breakpoints & Design**
- **Mobile (< 600px):** Full-screen mobile experience with safe-area awareness for notches
- **Tablets (600px+):** Centered card layout (480px width) with gradient backdrop
- **Large Tablets (900px+):** Slightly wider card (520px) for better content readability
- **Desktop (1400px+):** Optimized width (560px) maintaining perfect proportions

### **Desktop Enhancements**
- **Rich Background:** Layered radial gradients create visual depth instead of plain blue
- **Backdrop Patterns:** Multiple overlapping light gradients for sophisticated, engaging look
- **Enhanced Shadows:** Premium-quality dual-layer shadows for superior depth perception
- **Responsive Typography:** Fluid text scaling using CSS `clamp()` for smooth transitions
- **Adaptive Spacing:** Components intelligently scale their padding and gaps across breakpoints

### **File Structure**
```
clinic-flow/
├── index.html                  # Splash screen
├── role.html                   # Role selection
├── phone-patient.html          # Patient phone entry
├── phone-staff.html            # Staff phone entry
├── phone-admin.html            # Admin phone entry
├── otp-patient.html            # Patient OTP verification
├── otp-staff.html              # Staff OTP verification
├── diagnosis.html              # Quick triage assessment
├── dashboard.html              # Patient dashboard
├── checkin.html                # Arrival check-in
├── queue.html                  # Live queue status
├── appointment.html            # Book appointment
├── quick-assessment.html       # Post-booking quick assessment (NEW — V2.5)
├── clinical-tests.html         # Clinical test orders & pipeline tracker (NEW)
├── reports.html                # Completed test results & prescriptions
├── pharmacy.html               # Pharmacy delivery browser
├── order-confirmation.html     # Order confirmation
├── order-delivery.html         # Delivery tracking
├── directions.html             # Static clinic map
├── profile.html                # Patient profile & sign out
├── modal-late.html             # Running late modal
├── modal-arrival.html          # Arrival honor system modal
├── admin.html                  # Admin/Staff dashboard
├── modal-break.html            # Doctor break timer modal
├── styles.css                  # Design system, components, responsive styles
└── README.md                   # This specification and implementation guide
```

### **Screens Implemented**

#### **Onboarding (§2)**
- **Screen 0.1:** Splash Screen (token check logic)
- **Screen 0.2:** Role Selection (Patient, Staff, Admin)
- **Screen 0.3:** Phone Binding & OTP Verification
  - Patient path (2-step flow)
  - Staff path (credential binding)
  - Admin path (PIN entry)

#### **Patient Journey (§3)**
- **Screen 1.1:** Patient Dashboard — tiles: Check In · Appointments · Clinical Tests · Test Results
- **Screen 1.0:** Quick Diagnostic Assessment (triage questionnaire)
- **Screen 1.0b:** Post-Booking Quick Assessment (`quick-assessment.html` — **V2.5 NEW**) — captures symptom changes and prep notes immediately after appointment confirmation, before returning to dashboard. Flow: `appointment.html` → `quick-assessment.html` → `dashboard.html`.
- **Screen 1.2:** Emergency Hotline (📞 Call 999)
- **Screen 1.4:** Medical Reports (completed results, prescriptions) — includes shortcut banner to Screen 1.5
- **Screen 1.5:** Clinical Tests (ordered test pipeline tracker — Ordered → Sample → Processing → Ready) ✅ **NEW**
- **Screen 1.6:** Queue Display (load-balanced by count)
- **Screen 2.1:** Running Late Modal (swap with next)
- **Screen 2.2:** Arrival Check-In (honor system unlock)
- **Screen 2.3:** Static Map (clinic location, embedded in Check In)
- **Screen 2.4:** Pharmacy Delivery (home medicine delivery map)

#### **Admin Dashboard (§5)**
- **Screen 3.1:** Active Doctors & Triage Queue
- **Screen 3.2:** Pause/Break Duration Selection
- **Tabs:** Doctors, Queues, Reports, Settings

### **Navigation Method**
The prototype uses CSS `:target` for navigation—clicking links with `href="#screen-xxx"` instantly transitions to that screen without page reloads. This simulates instant app switching.

### **Design System**

#### **Color Palette**
- **Primary Blue:** `#1A6BFF` (buttons, interactive elements)
- **Orange:** `#FF9500` (warnings, secondary actions)
- **Green:** `#34C759` (live indicators)
- **Red:** `#FF3B30` (critical actions)
- **Purple:** `#AF52DE` (accents)

#### **Typography**
- **System Font Stack:** -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **UI Hierarchy:** Large headlines (32-40px) → Small subtext (14-16px)

#### **Components**
- **Buttons:** Primary (filled blue), Outline (stroke), Secondary (various colors)
- **Cards:** Elevated design with shadows and rounded corners
- **Modals:** Bottom-sheet style with modal overlay
- **Tab Bar:** Bottom navigation for primary flows

### **How to Use the Prototype**

1. **Open in Browser:** Simply open `index.html` in any modern browser
2. **Navigate:** Click buttons to move between screens
3. **Back Navigation:** Click the back arrow (← icon) to return to previous screens
4. **Simulate Flows:**
   - Patient: Start → Role Selection → Phone Entry → OTP → Dashboard
   - Staff: Start → Role Selection → Staff Phone → OTP → Admin
   - Admin: Start → Role Selection → Admin PIN → Dashboard

### **Key Features**

✅ **Fully responsive design** (mobile, tablet, desktop, ultra-wide displays)
✅ **Desktop-optimized experience** with engaging gradient backgrounds
✅ Touch-friendly button sizes (min 44px)
✅ Icon-based navigation (accessible SVG icons)
✅ Modal dialogs for confirmations
✅ Bottom tab navigation
✅ Fluid typography scaling with CSS `clamp()`
✅ Intelligent adaptive spacing across all breakpoints
✅ Premium shadow effects for depth perception
✅ Safe-area awareness for notch devices

### **Key Improvements Applied (V2.5)**

10. **Post-Booking Quick Assessment:** A dedicated lightweight screen (`quick-assessment.html`) is inserted immediately after appointment confirmation. It captures symptom changes, associated symptoms, and doctor prep notes while the context is fresh — all via checkboxes with one optional textarea ("Lazy Thumb" compliant). Patients can complete it in seconds or skip entirely. Flow: `appointment.html` → `quick-assessment.html` → `dashboard.html`. Only the **"Confirm appointment"** button routes through this step; **"Save draft"** goes directly to the dashboard to preserve the quick-draft escape hatch.

### **Future Enhancements (Post-MVP)**

- Add JavaScript for dynamic state management (queue updates)
- Implement backend API integration for session tokens
- Add WebSocket push notifications for queue changes
- Implement biometric authentication (Face ID/Fingerprint)
- Add real-time location services for check-in validation
- Expand map functionality with directions
- Add doctor/patient matching algorithm
- Implement analytics and reporting dashboard

### **Notes**

- The prototype is intentionally **JavaScript-free** to validate UX/design before backend work
- All screen transitions are **instant** (no loading states)—add skeleton screens in production
- The "Running Late" modal shows the logic; actual queue swapping requires backend
- The "Arrival Check-In" uses the "honor system" to avoid polling (cost-saving design)
- All phone numbers/credentials in the prototype are **mock data** for demonstration