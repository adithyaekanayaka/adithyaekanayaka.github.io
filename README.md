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