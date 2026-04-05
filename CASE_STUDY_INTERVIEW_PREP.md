# FieldOps: MERN Stack Interview Cheat Sheet (Junior Version) 👷🚀

Yeh document aapke interview ki tayaari ke liye hai. Is mein asaan Roman Urdu mein samjhaya gaya hai ke aapne **FieldOps** kaisay banayi aur kyun banayi. Interview mein bas yahi baatein confidence se bolni hain!

---

## 🎤 1. 30-Second Pitch (Introduction)
Interviewer jab pooche "Tell me about your project", toh yeh bole:
> "FieldOps ek MERN stack application hai jo field service management (FSM) ke liye hai. Is mein Clients jobs create karte hain, Admins technicians assign karte hain, aur Technicians apna kaam update karte hain. Maine isay **'Clarity over Complexity'** ke principle par banaya hai taake workflow simple aur secure rahe."

---

## 2. App Workflow (Mera Project Kaise Kaam Karta Hai?)

Mainly 3 qisam ke users hain:
1.  **Client:** Yeh customer hai jo repairs ya service ke liye request (Job) dalta hai.
2.  **Admin:** Yeh manager hai jo dekh sakta hai ke kitni jobs pending hain aur unhein technicians ko assign karta hai.
3.  **Technician:** Yeh field worker hai jo apni assigned jobs dekhta hai, kaam shuru karta hai, aur status update karta hai (jaise: `IN_PROGRESS`, `BLOCKED`, `COMPLETED`).

---

## 3. Technical Stack (MERN Kyun Choose Kiya?)

- **MongoDB:** Kyunke jobs ka data (notes, location, statuses) kabhi chota hota hai kabhi bada, MongoDB ki flexibility best hai.
- **Express & Node.js:** JavaScript backend ke liye fast hai aur asynchronous I/O handle karne mein excel karta hai.
- **React (Vite):** Frontend ko fast banaye rakhne ke liye aur jobs ki list ko component-wise manage karne ke liye best hai.
- **JWT (Stateless Auth):** Maine simple token-based authentication use ki hai taake user roles (Admin vs Tech) backend par safely verify ho saken.

---

## 4. ⭐ The "Bonus" Feature: Activity Log (Audit Trail)

Interviewer ko yeh zaroor batayein ke aapne aik **Audit Log** banaya hai:
> "Sir, enterprise apps mein sirf status change karna kafi nahi hota. Maine aik alag `ActivityLog` collection banayi hai jo har change ka record rakhti hai—ke kis ne, kab, aur kya update kiya. Yeh security aur tracking ke liye bohot zaroori hai."

---

## 5. 🎯 Engineering Judgment (PDF Requirements)

PDF mein likha tha ke brief "intentionally incomplete" hai. Aap ne wahan kya faislay kiye?
1.  **In-App Notifications:** Maine emails ya external services ke bajaye in-app notifications banayin taake system 100% locally aur bina kisi paid service ke chale (as per requirement).
2.  **Technician Approval:** Jab koi naya technician signup karta hai, woh tab tak login nahi kar sakta jab tak Admin usay manually approve na karde. Yeh security ka aik simple but effective layer hai.
3.  **Scheduled Date:** Jobs mein `scheduledAt` field daali hai taake pata chale ke kaam kab hona hai.

---

## 6. Interview "Tough" Questions & Answers

**Sawal: "Aapne WebSockets kyun use nahi kiye?"**
> **Jawab:** "Sir, field technicians akasr aise ilaako mein hote hain jahan internet slow hota hai. WebSockets battery aur internet zyada consume karte hain. Maine simple **Polling** use ki hai jo zyada stable aur simple hai Junior level ke liye."

**Sawal: "Soft Deletes kya hote hain?"**
> **Jawab:** "System mein hum data delete nahi karte history bachanay ke liye. Hum bas status `CANCELLED` kar dete hain ya user ko `inactive` kar dete hain taake record database mein rahe."

---

## 7. Simple Tips for Interview
- **Humble rahein:** "Maine basics par focus kiya hai taake system stable rahe."
- **Example dein:** "Jaise agar technician ko part nahi mil raha, toh woh job ko `BLOCKED` kar sakta hai."
- **Focus on Flow:** Interface se zyada project ke **logic** aur **data flow** par baat karein.

Best of Luck! 🚀 Aapka project solid hai, bas asaan alfaz mein explain karna hai!
