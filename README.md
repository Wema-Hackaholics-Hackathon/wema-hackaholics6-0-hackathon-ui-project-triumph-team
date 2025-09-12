# 🛡️ TrustShield Sentinel

## Team Members
- Taiwo King Praise
- Fadare David
- Adewale Oreoluwa
- Taiwo Amoo

---

## 🚀 Live Demo

*   **Live Application:** [Link to your deployed Vercel/Netlify/Render URL]  
*   **Backend API:** [Link to your live backend API endpoint URL, if separate]  
*   **Recorded Demo:** [Link to your recorded demo explaining how your solution works using Loom]  

---

## 🎯 The Problem

**Challenge 5: The Enemy Within**  

> **How might we detect insider threats within banks while preserving employee trust and respecting privacy?**

Insider threats are dangerous because staff already have legitimate access. Current monitoring tools feel like “Big Brother,” creating mistrust, while doing nothing leaves banks exposed.  

---

## ✨ Our Solution

**TrustShield Sentinel** — a privacy-first insider threat detection assistant.  

- Detects unusual staff behavior using **simple, role-based baselines** (not surveillance).  
- Engages employees with **friendly nudges** instead of accusatory alerts.  
- Preserves trust with **privacy safeguards**: anonymized IDs, metadata-only tracking, and transparent alerts.  
- Provides a **dashboard for security teams** showing anonymized risk levels, with identities only revealed if a real threat persists.  

**In short:** Employees become *partners in security*, not suspects.  

---

## 🛠️ Tech Stack

- **Frontend:** React + Tailwind CSS (Dashboard + Employee Modals)  
- **Backend:** Node.js (Express) with mock MongoDB/JSON data  
- **Database:** Mock data only (employee activity logs)  
- **Deployment:** Vercel / Netlify (Frontend), Render / Railway (Backend) 

---

## ⚙️ How to Set Up and Run Locally

1. Clone the repository:
    ```bash
    git clone TrustShield-Sentinel
    ```

2. Navigate to the project directory:
    ```bash
    cd frontend
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. (Optional) Create a `.env.local` file if using environment variables:
    ```
    PORT=5000
    DATABASE_URL=mock_data.json
    ```

5. Run the backend server:
    ```bash
    npm run server
    ```

6. Run the frontend development server:
    ```bash
    npm run dev
    ```

7. Open the app in your browser:
    ```
    http://localhost:5173
    ```

---

## 🔮 Future Potential

- Extend from rule-based detection → AI anomaly detection.  
- Integrate with IAM systems (Okta, Azure AD).  
- Add gamified **trust scores** to strengthen security culture.  
- Deploy as SaaS for banks & enterprises.  
