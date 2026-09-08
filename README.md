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

## Admin Password & Consolidated File Download

1. Click **Admin Console** in the top right header navigation bar.
2. **First Time Setup**: Create an Admin Password when prompted.
3. **Download**: Once authenticated, click **Download Consolidated Excel (.xlsx)** to download the complete master dataset (`SDS_NEXT_Training_Feedback.xlsx`).
