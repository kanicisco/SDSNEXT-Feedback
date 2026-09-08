# SDS NEXT – Training Evaluation Feedback System

A standalone, corporate-grade **Training Evaluation & Feedback Management System** built for SDS NEXT internal training sessions.

This application is completely self-contained and operates entirely on local hardware / internal networks. It does **NOT** rely on cloud databases, Google Sheets/Forms, or GitHub.

---

## Key Features

- **SDS NEXT Corporate Identity**: Designed using official SDS NEXT branding, dark navy hero gradient, vibrant blue accents, circular feedback visual indicator (`YOUR 01 feedback matters`), and step-by-step progress tracking.
- **Interactive Form UI**: Custom 5-point rating tiles, single-select choice grids, datepicker, optional comments area, and mobile-friendly tap targets.
- **Guaranteed Anonymous Feedback**: Displays clear anonymity panel reassuring participants that no names, email addresses, or distributor credentials are requested or logged.
- **Local Excel Persistence**: User submissions are appended directly into `data/SDS_NEXT_Training_Feedback.xlsx` without manual Excel entry.
- **Multi-Worksheet Excel Architecture**:
  - `Training Feedback`: Detailed master response records with unique Submission IDs (`SDS-000001`, `SDS-000002`...), timestamps, auto-filters, and auto-adjusted column widths.
  - `Summary`: Live executive dashboard showing total response counts, average ratings, and category breakdowns.
  - `Reference`: Official question dropdown/rating values reference lookup.
- **Admin Password & Consolidated Download**:
  - Secure Admin Console allowing administrators to configure a security password.
  - Restricted download endpoint (`/api/admin/download`) so only authorized admins can download `SDS_NEXT_Training_Feedback.xlsx`.
  - Protection against direct web exposure (`/data` static serving is strictly forbidden).
- **Concurrency & Backup System**:
  - Synchronized write lock queue prevents Excel file corruption during simultaneous submissions.
  - Timestamped backup copies stored automatically inside `backups/`.

---

## Project Structure

```text
SDS-NEXT-Training-Feedback/
│
├── index.html          # Main HTML structure with form & admin modal
├── styles.css          # Modern corporate CSS design system
├── app.js              # Interactive client logic & AJAX handler
├── server.js           # Express API, Excel SheetJS engine & admin auth
├── package.json        # Dependencies (Express, SheetJS XLSX)
├── README.md           # Documentation
│
├── assets/
│   └── SDS-NEXT-Logo.svg   # Official SDS NEXT vector logo
│
├── data/
│   └── SDS_NEXT_Training_Feedback.xlsx  # Local Excel Workbook (auto-generated)
│
└── backups/            # Timestamped Excel backups
```

---

## Getting Started

### Prerequisites

- Node.js (v16+) installed on host machine or server.

### Installation & Launch

1. Open your terminal in the project directory (`c:\xampp\htdocs\SDS Next Feedback`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

### Internal Network Deployment

To allow other devices on your office Wi-Fi or LAN to complete the form:
1. Find your machine's local IP address (e.g. `ipconfig` -> `192.168.1.100`).
2. Participants can access the form from any phone, tablet, or PC at:
   ```text
   http://192.168.1.100:3000
   ```

---

## GitHub Pages Deployment (Serverless Mode)

If you want to host this site on **GitHub Pages** without running a local Node.js or XAMPP server, follow these 3 quick steps:

### Step 1: Set up Google Sheets Cloud Backend
1. Open Google Sheets ([sheets.new](https://sheets.new)) and create a new blank spreadsheet.
2. Click **Extensions** → **Apps Script**.
3. Copy the contents of [`google-apps-script.js`](file:///c:/xampp/htdocs/SDS%20Next%20Feedback/google-apps-script.js) from this repository and paste it into `Code.gs`.
4. Click **Deploy** → **New deployment**.
   - **Select type**: Web app
   - **Execute as**: Me
   - **Who has access**: **Anyone** *(Critical so GitHub Pages can post submissions)*
5. Click **Deploy**, authorize permissions, and **copy the Web App URL**.

### Step 2: Update `app.js`
Open [`app.js`](file:///c:/xampp/htdocs/SDS%20Next%20Feedback/app.js) and paste your Google Apps Script Web App URL into `GOOGLE_SCRIPT_URL`:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### Step 3: Push to GitHub Pages
Push your project to GitHub and enable GitHub Pages under **Repository Settings → Pages**. Your form will now submit feedback directly into your Google Sheet without needing any server!
