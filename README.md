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

## **3\. Wireframe Flow 1: The Patient Journey**

* **Screen 1.2: The "Safety Gate" (Scope Cut)**  
  * *Original:* "Flashlight toggle" and "Call Ambulance".  
  * *Critique:* Accessing the flashlight requires camera permission handling and hardware testing.  
  * *Improvement:* **Remove Flashlight.** Keep only the "Call Ambulance" button.  
  * *Action:* Tapping "Call Ambulance" immediately invokes the native system dialer with 1990 (or local equivalent) pre-filled.  
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
- **Responsive Design:** Mobile-first approach with viewport-fit=cover for notch support
- **Browser Compatibility:** Modern browsers supporting CSS Grid, Flexbox, and advanced selectors

### **File Structure**
```
clinic-flow/
├── index.html              # Complete prototype with all screens and modals
├── styles.css              # Design system, components, and responsive styles
├── README.md               # This specification and implementation guide
└── .git/                   # Version control
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
- **Screen 1.1:** Patient Dashboard (home with queue status)
- **Screen 1.2:** Emergency Hotline (🏥 Call 999)
- **Screen 1.6:** Queue Display (Load-balanced by count)
- **Screen 2.1:** Running Late Modal (Swap with next)
- **Screen 2.2:** Arrival Check-In (Honor system unlock)
- **Screen 2.3:** Static Map (Clinic location)

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

✅ Responsive mobile design (works on all screen sizes)
✅ Touch-friendly button sizes (min 44px)
✅ Icon-based navigation (accessible SVG icons)
✅ Modal dialogs for confirmations
✅ Bottom tab navigation
✅ Emergency call button
✅ Queue status display (count-based, not time-based)
✅ Static map placeholder
✅ Triage queue management interface

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