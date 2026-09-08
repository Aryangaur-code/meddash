# 🏥 MedDash: AI Medical Copilot

An advanced, full-stack unified healthcare platform connecting patients, doctors, and pharmacies. MedDash integrates cutting-edge AI features, including **3D Volumetric Tumor Segmentation**, Real-Time Consultations, and an intelligent E-Commerce Pharmacy system with compliant GST taxation logic.

![MedDash Dashboard](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Three.js](https://img.shields.io/badge/Three.js-3D-white?logo=three.js)

---

## ✨ Key Features

### 👨‍⚕️ Doctor Portal
- **Diagnostic Hub:** Advanced analysis tools including Grad-CAM X-Ray visualizations and an integrated **Three.js V-Net 3D Tumor Viewer**.
- **Live Consultation Copilot:** Real-time chat polling with patients, enhanced by an AI listener that automatically extracts clinical symptoms, medications, and constructs structured SOAP summaries.
- **Dynamic Patient Records:** Pulls live Electronic Health Records (EHR) straight from MongoDB.
- **Glassmorphic UI:** A beautiful, dark-themed, glass-morphic interface optimized for medical professionals to reduce eye strain.

### 🧑‍🦱 Patient Portal
- **Live Telemedicine Chat:** Seamless real-time chat bridging the gap between patient reporting and doctor analysis.
- **Pharmacy E-Commerce:** An integrated cart system that calculates exact regional Indian taxation (e.g., categorizing 0% tax for Blood Plasma, 5% for standard medicinal formulations) splitting into CGST and SGST.
- **Bill Generation:** Automated invoice structuring and PDF bill downloads for COD orders.

### 🧠 AI & Machine Learning Integrations
- **V-Net 3D Tumor Segmentation:** Built-in hooks for a Python FastAPI microservice that ingests NIfTI (`.nii.gz`) CT scans, runs a volumetric segmentation model, and returns a 3D surface mesh with shape metrics (volume, sphericity, convexity) rendered natively in the browser via Three.js.
- **Pharmacovigilance:** Intelligent RAG alerts monitoring drug-to-drug interactions (e.g., Metformin clearance alerts).

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, CSS Modules
- **Backend:** Next.js Serverless API Routes
- **Database:** MongoDB Atlas (Mongoose ORM)
- **3D Rendering:** Three.js
- **Icons:** Tabler Icons

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- A free MongoDB Atlas Cluster

### 1. Clone the Repository
```bash
git clone https://github.com/Aryangaur-code/meddash.git
cd meddash
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/meddash?appName=Cluster0
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Vercel Deployment

This project is configured for **zero-config Serverless deployment** on Vercel.

1. Push your code to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Import Project**.
3. Select this repository.
4. Expand **Environment Variables** and add your `MONGODB_URI`.
5. Click **Deploy**. 

*(Note: The `sqlite3` dependency was explicitly removed to ensure the Next.js API routes fit within Vercel's strict 250MB serverless function limits).*

---

## 📁 Project Structure

```text
├── src/
│   ├── app/
│   │   ├── api/          # Serverless endpoints (Chat, Patients, AI)
│   │   ├── doctor/       # Doctor Dashboard & Diagnostic routes
│   │   ├── patient/      # Patient Portal & Pharmacy
│   │   └── page.tsx      # Main Landing Page
│   ├── components/       # Reusable UI (AppShell, Topbar, 3D Viewer)
│   ├── context/          # Global State Management (AppContext)
│   ├── data/             # Database Schemas & Mock Fallbacks
│   └── lib/              # MongoDB Connection Utility
├── vnet_feature/         # Python ML Service for CT Analysis
├── public/               # Static assets
└── next.config.mjs       # Next.js configuration
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is licensed under the MIT License.
