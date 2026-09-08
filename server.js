const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const BACKUP_DIR = path.join(__dirname, 'backups');
const EXCEL_FILE_PATH = path.join(DATA_DIR, 'SDS_NEXT_Training_Feedback.xlsx');
const ADMIN_CONFIG_PATH = path.join(DATA_DIR, 'admin_config.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS Middleware to support requests from XAMPP Apache (port 80), file://, or LAN clients
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// SECURITY: Explicitly forbid static serving of /data directory
app.use('/data', (req, res) => {
  return res.status(403).json({ error: 'Access Denied. Access to raw data files is restricted.' });
});

// Serve static frontend files
app.use(express.static(__dirname));

// Synchronized Write Lock Queue
let writeQueue = Promise.resolve();

function enqueueWrite(taskFn) {
  writeQueue = writeQueue.then(taskFn, taskFn);
  return writeQueue;
}

// Admin Auth Helper Functions
function getAdminConfig() {
  if (fs.existsSync(ADMIN_CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(ADMIN_CONFIG_PATH, 'utf8'));
    } catch (e) {
      console.error('Error reading admin config:', e);
    }
  }
  return null;
}

function saveAdminConfig(config) {
  fs.writeFileSync(ADMIN_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, storedHash, storedSalt) {
  const { hash } = hashPassword(password, storedSalt);
  return hash === storedHash;
}

// Active sessions map (token -> expiry timestamp)
const activeSessions = new Map();

function generateAuthToken() {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
}

function isSessionValid(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;
  
  const expiry = activeSessions.get(token);
  if (expiry && expiry > Date.now()) {
    return true;
  }
  if (expiry) activeSessions.delete(token);
  return false;
}

// Initial Reference & Dropdown Values
const REFERENCE_DATA = [
  { Category: "Overall Rating", Value: "5 - Excellent" },
  { Category: "Overall Rating", Value: "4 - Very Good" },
  { Category: "Overall Rating", Value: "3 - Good" },
  { Category: "Overall Rating", Value: "2 - Fair" },
  { Category: "Overall Rating", Value: "1 - Needs Improvement" },
  { Category: "Trainer Rating", Value: "5 - Excellent" },
  { Category: "Trainer Rating", Value: "4 - Very Good" },
  { Category: "Trainer Rating", Value: "3 - Good" },
  { Category: "Trainer Rating", Value: "2 - Fair" },
  { Category: "Trainer Rating", Value: "1 - Needs Improvement" },
  { Category: "SOP Clarity", Value: "Very clear" },
  { Category: "SOP Clarity", Value: "Clear" },
  { Category: "SOP Clarity", Value: "Partly clear" },
  { Category: "SOP Clarity", Value: "Not clear" },
  { Category: "System Confidence", Value: "Very confident" },
  { Category: "System Confidence", Value: "Confident" },
  { Category: "System Confidence", Value: "Need more practice" },
  { Category: "System Confidence", Value: "Need additional support" },
  { Category: "Most Useful Topic", Value: "Goods Receipt Note (GRN)" },
  { Category: "Most Useful Topic", Value: "Purchase Return" },
  { Category: "Most Useful Topic", Value: "Manual Billing" },
  { Category: "Most Useful Topic", Value: "Order Booking" },
  { Category: "Most Useful Topic", Value: "Order to Billing (O2B)" },
  { Category: "Most Useful Topic", Value: "Stock Adjustment" },
  { Category: "Most Useful Topic", Value: "Retailer Master" },
  { Category: "Most Useful Topic", Value: "Product & Price (XDM)" },
  { Category: "Follow-up", Value: "No, I am ready to proceed" },
  { Category: "Follow-up", Value: "Yes, a refresher session" },
  { Category: "Follow-up", Value: "Yes, one-to-one support" },
  { Category: "Hands-on Practice", Value: "5 - Definitely enough time" },
  { Category: "Hands-on Practice", Value: "4 - Enough time" },
  { Category: "Hands-on Practice", Value: "3 - Some more time needed" },
  { Category: "Hands-on Practice", Value: "2 - Not enough time" },
  { Category: "Hands-on Practice", Value: "1 - Much more time needed" },
  { Category: "Training Relevance", Value: "5 - Extremely relevant" },
  { Category: "Training Relevance", Value: "4 - Relevant" },
  { Category: "Training Relevance", Value: "3 - Somewhat relevant" },
  { Category: "Training Relevance", Value: "2 - Slightly relevant" },
  { Category: "Training Relevance", Value: "1 - Not relevant" }
];

const COLUMN_WIDTHS = [
  { wch: 18 }, // Submission ID
  { wch: 22 }, // Submission Date
  { wch: 16 }, // Training Date
  { wch: 25 }, // Overall Rating
  { wch: 25 }, // Trainer Rating
  { wch: 22 }, // SOP Clarity
  { wch: 24 }, // System Confidence
  { wch: 30 }, // Useful Topic
  { wch: 30 }, // Follow-up
  { wch: 30 }, // Hands-on Practice
  { wch: 28 }, // Training Relevance
  { wch: 60 }  // Comments
];

const HEADERS = [
  'Submission ID',
  'Submission Date',
  'Training Date',
  'Overall Training Experience',
  "Trainer's Clarity and Delivery",
  'SOP Workflow Clarity',
  'SDS NEXT Confidence',
  'Most Useful Topic',
  'Follow-up Session',
  'Hands-on System Practice',
  'Training Relevance',
  'Additional Comments'
];

// Helper to create or rebuild Summary sheet data
function generateSummarySheetData(rows) {
  const total = rows.length;
  
  let sumOverall = 0, countOverall = 0;
  let sumTrainer = 0, countTrainer = 0;
  
  const sopCounts = { 'Very clear': 0, 'Clear': 0, 'Partly clear': 0, 'Not clear': 0 };
  const confCounts = { 'Very confident': 0, 'Confident': 0, 'Need more practice': 0, 'Need additional support': 0 };
  const topicCounts = {
    'Goods Receipt Note (GRN)': 0,
    'Purchase Return': 0,
    'Manual Billing': 0,
    'Order Booking': 0,
    'Order to Billing (O2B)': 0,
    'Stock Adjustment': 0,
    'Retailer Master': 0,
    'Product & Price (XDM)': 0
  };
  const followUpCounts = {
    'No, I am ready to proceed': 0,
    'Yes, a refresher session': 0,
    'Yes, one-to-one support': 0
  };

  rows.forEach(r => {
    // Rating 1..5 extraction
    if (r['Overall Training Experience']) {
      const match = r['Overall Training Experience'].match(/^(\d)/);
      if (match) { sumOverall += parseInt(match[1]); countOverall++; }
    }
    if (r["Trainer's Clarity and Delivery"]) {
      const match = r["Trainer's Clarity and Delivery"].match(/^(\d)/);
      if (match) { sumTrainer += parseInt(match[1]); countTrainer++; }
    }
    if (r['SOP Workflow Clarity'] && sopCounts.hasOwnProperty(r['SOP Workflow Clarity'])) {
      sopCounts[r['SOP Workflow Clarity']]++;
    }
    if (r['SDS NEXT Confidence'] && confCounts.hasOwnProperty(r['SDS NEXT Confidence'])) {
      confCounts[r['SDS NEXT Confidence']]++;
    }
    if (r['Most Useful Topic'] && topicCounts.hasOwnProperty(r['Most Useful Topic'])) {
      topicCounts[r['Most Useful Topic']]++;
    }
    if (r['Follow-up Session'] && followUpCounts.hasOwnProperty(r['Follow-up Session'])) {
      followUpCounts[r['Follow-up Session']]++;
    }
  });

  const avgOverall = countOverall > 0 ? (sumOverall / countOverall).toFixed(2) + ' / 5' : 'N/A';
  const avgTrainer = countTrainer > 0 ? (sumTrainer / countTrainer).toFixed(2) + ' / 5' : 'N/A';

  const summaryRows = [
    { Metric: 'SDS NEXT TRAINING EVALUATION SUMMARY DASHBOARD', Value: '' },
    { Metric: '----------------------------------------', Value: '----------' },
    { Metric: 'Total Feedback Responses Recorded', Value: total },
    { Metric: 'Average Overall Training Rating', Value: avgOverall },
    { Metric: "Average Trainer's Delivery Rating", Value: avgTrainer },
    { Metric: '', Value: '' },
    { Metric: '--- SOP WORKFLOW CLARITY BREAKDOWN ---', Value: '' },
    ...Object.keys(sopCounts).map(k => ({ Metric: k, Value: sopCounts[k] })),
    { Metric: '', Value: '' },
    { Metric: '--- SYSTEM CONFIDENCE BREAKDOWN ---', Value: '' },
    ...Object.keys(confCounts).map(k => ({ Metric: k, Value: confCounts[k] })),
    { Metric: '', Value: '' },
    { Metric: '--- MOST USEFUL TOPICS BREAKDOWN ---', Value: '' },
    ...Object.keys(topicCounts).map(k => ({ Metric: k, Value: topicCounts[k] })),
    { Metric: '', Value: '' },
    { Metric: '--- FOLLOW-UP REQUIREMENTS ---', Value: '' },
    ...Object.keys(followUpCounts).map(k => ({ Metric: k, Value: followUpCounts[k] }))
  ];

  return { summaryRows, stats: { total, avgOverall, avgTrainer, sopCounts, confCounts, topicCounts, followUpCounts } };
}

// Initialize Excel File if missing
function initExcelWorkbook() {
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    console.log('Excel file not found. Initializing data/SDS_NEXT_Training_Feedback.xlsx...');
    const wb = XLSX.utils.book_new();

    // 1. Training Feedback Sheet
    const wsFeedback = XLSX.utils.json_to_sheet([], { header: HEADERS });
    wsFeedback['!cols'] = COLUMN_WIDTHS;
    wsFeedback['!autofilter'] = { ref: 'A1:L1' };
    XLSX.utils.book_append_sheet(wb, wsFeedback, 'Training Feedback');

    // 2. Summary Sheet
    const { summaryRows } = generateSummarySheetData([]);
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 45 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // 3. Reference Sheet
    const wsRef = XLSX.utils.json_to_sheet(REFERENCE_DATA);
    wsRef['!cols'] = [{ wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsRef, 'Reference');

    XLSX.writeFile(wb, EXCEL_FILE_PATH);
    console.log('Excel workbook initialized successfully.');
  }
}

// Auto-run init
initExcelWorkbook();

// Timestamp formatter: YYYY-MM-DD HH:mm:ss
function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// Generate Next Submission ID: SDS-000001
function getNextSubmissionId(existingRows) {
  let maxId = 0;
  existingRows.forEach(row => {
    const idStr = row['Submission ID'] || '';
    const match = idStr.match(/SDS-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxId) maxId = num;
    }
  });
  const nextNum = maxId + 1;
  return `SDS-${String(nextNum).padStart(6, '0')}`;
}

// Backup Workbook Function
function createBackup() {
  try {
    if (!fs.existsSync(EXCEL_FILE_PATH)) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const backupPath = path.join(BACKUP_DIR, `SDS_NEXT_Training_Feedback_${timeStr}.xlsx`);
    fs.copyFileSync(EXCEL_FILE_PATH, backupPath);

    // Keep max 50 backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.xlsx'))
      .sort();
    if (files.length > 50) {
      const toDelete = files.slice(0, files.length - 50);
      toDelete.forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
    }
  } catch (err) {
    console.error('Backup creation warning:', err.message);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Submit Anonymous Feedback
app.post('/api/feedback', (req, res) => {
  const {
    trainingDate,
    overallRating,
    trainerRating,
    sopClarity,
    systemConfidence,
    mostUsefulTopic,
    followUp,
    handsOnPractice,
    trainingRelevance,
    additionalComments
  } = req.body;

  // Validation of required fields
  if (
    !trainingDate ||
    !overallRating ||
    !trainerRating ||
    !sopClarity ||
    !systemConfidence ||
    !mostUsefulTopic ||
    !followUp ||
    !handsOnPractice ||
    !trainingRelevance
  ) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. All required fields must be completed.'
    });
  }

  enqueueWrite(() => {
    return new Promise((resolve) => {
      try {
        // Step 1: Backup
        createBackup();

        // Step 2: Read Existing Workbook
        initExcelWorkbook();
        const wb = XLSX.readFile(EXCEL_FILE_PATH);
        const wsFeedback = wb.Sheets['Training Feedback'];
        const existingRows = XLSX.utils.sheet_to_json(wsFeedback, { defval: '' });

        // Step 3: Generate Metadata
        const submissionId = getNextSubmissionId(existingRows);
        const submissionDate = formatTimestamp();

        // Step 4: Construct New Row
        const newRow = {
          'Submission ID': submissionId,
          'Submission Date': submissionDate,
          'Training Date': String(trainingDate).trim(),
          'Overall Training Experience': String(overallRating).trim(),
          "Trainer's Clarity and Delivery": String(trainerRating).trim(),
          'SOP Workflow Clarity': String(sopClarity).trim(),
          'SDS NEXT Confidence': String(systemConfidence).trim(),
          'Most Useful Topic': String(mostUsefulTopic).trim(),
          'Follow-up Session': String(followUp).trim(),
          'Hands-on System Practice': String(handsOnPractice).trim(),
          'Training Relevance': String(trainingRelevance).trim(),
          'Additional Comments': additionalComments ? String(additionalComments).trim() : ''
        };

        const updatedRows = [...existingRows, newRow];

        // Step 5: Update Training Feedback Sheet
        const newWsFeedback = XLSX.utils.json_to_sheet(updatedRows, { header: HEADERS });
        newWsFeedback['!cols'] = COLUMN_WIDTHS;
        newWsFeedback['!autofilter'] = { ref: `A1:L${updatedRows.length + 1}` };
        wb.Sheets['Training Feedback'] = newWsFeedback;

        // Step 6: Update Summary Sheet
        const { summaryRows } = generateSummarySheetData(updatedRows);
        const newWsSummary = XLSX.utils.json_to_sheet(summaryRows);
        newWsSummary['!cols'] = [{ wch: 45 }, { wch: 20 }];
        wb.Sheets['Summary'] = newWsSummary;

        // Step 7: Save Workbook
        XLSX.writeFile(wb, EXCEL_FILE_PATH);

        console.log(`[${submissionDate}] Saved submission ${submissionId}`);

        res.status(200).json({
          success: true,
          message: 'Feedback saved successfully',
          submissionId
        });
      } catch (err) {
        console.error('Error writing to Excel workbook:', err);
        res.status(500).json({
          success: false,
          message: 'Unable to save feedback. Please check the connection and try again.'
        });
      }
      resolve();
    });
  });
});

// 2. Admin Auth Status
app.get('/api/admin/status', (req, res) => {
  const config = getAdminConfig();
  return res.json({
    isConfigured: !!(config && config.hash),
    isLoggedIn: isSessionValid(req)
  });
});

// 3. Admin Password Setup (Create/Change Password)
app.post('/api/admin/setup-password', (req, res) => {
  const { newPassword, currentPassword } = req.body;

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 4 characters long.'
    });
  }

  const existingConfig = getAdminConfig();

  // If password already set, verify current password unless logged in
  if (existingConfig && existingConfig.hash) {
    const authorized = isSessionValid(req) || (currentPassword && verifyPassword(currentPassword, existingConfig.hash, existingConfig.salt));
    if (!authorized) {
      return res.status(401).json({
        success: false,
        message: 'Current admin password is invalid.'
      });
    }
  }

  const { hash, salt } = hashPassword(newPassword.trim());
  saveAdminConfig({ hash, salt, updatedAt: new Date().toISOString() });

  const token = generateAuthToken();
  return res.json({
    success: true,
    message: 'Admin password successfully set/updated.',
    token
  });
});

// 4. Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const config = getAdminConfig();

  if (!config || !config.hash) {
    return res.status(400).json({
      success: false,
      message: 'Admin password has not been configured yet. Please set a password first.'
    });
  }

  if (!password || !verifyPassword(password, config.hash, config.salt)) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect admin password.'
    });
  }

  const token = generateAuthToken();
  return res.json({
    success: true,
    message: 'Login successful.',
    token
  });
});

// 5. Protected Admin Download Consolidated Excel
app.get('/api/admin/download', (req, res) => {
  // Allow authentication via Authorization header OR query parameter token / pass
  let authorized = isSessionValid(req);

  if (!authorized && req.query.token) {
    const expiry = activeSessions.get(req.query.token);
    if (expiry && expiry > Date.now()) {
      authorized = true;
    }
  }

  if (!authorized && req.query.password) {
    const config = getAdminConfig();
    if (config && config.hash && verifyPassword(req.query.password, config.hash, config.salt)) {
      authorized = true;
    }
  }

  if (!authorized) {
    return res.status(401).send('Unauthorized. Admin authentication required to download consolidated file.');
  }

  initExcelWorkbook();
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    return res.status(444).send('Excel file does not exist.');
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="SDS_NEXT_Training_Feedback.xlsx"');
  return res.sendFile(EXCEL_FILE_PATH);
});

// 6. Admin Live Dashboard Stats API
app.get('/api/admin/stats', (req, res) => {
  if (!isSessionValid(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  try {
    initExcelWorkbook();
    const wb = XLSX.readFile(EXCEL_FILE_PATH);
    const wsFeedback = wb.Sheets['Training Feedback'];
    const rows = XLSX.utils.sheet_to_json(wsFeedback, { defval: '' });
    const { stats } = generateSummarySheetData(rows);

    return res.json({
      success: true,
      stats,
      recentSubmissions: rows.slice(-10).reverse()
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to read statistics.' });
  }
});

// 7. Protected Admin Clear All Responses
app.post('/api/admin/clear-responses', (req, res) => {
  if (!isSessionValid(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin authentication required.' });
  }

  enqueueWrite(() => {
    return new Promise((resolve) => {
      try {
        // Step 1: Backup existing workbook first
        createBackup();

        // Step 2: Re-create clean Excel Workbook
        const wb = XLSX.utils.book_new();

        // 1. Training Feedback Sheet (Empty headers)
        const wsFeedback = XLSX.utils.json_to_sheet([], { header: HEADERS });
        wsFeedback['!cols'] = COLUMN_WIDTHS;
        wsFeedback['!autofilter'] = { ref: 'A1:L1' };
        XLSX.utils.book_append_sheet(wb, wsFeedback, 'Training Feedback');

        // 2. Summary Sheet (Reset stats)
        const { summaryRows } = generateSummarySheetData([]);
        const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
        wsSummary['!cols'] = [{ wch: 45 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // 3. Reference Sheet
        const wsRef = XLSX.utils.json_to_sheet(REFERENCE_DATA);
        wsRef['!cols'] = [{ wch: 25 }, { wch: 35 }];
        XLSX.utils.book_append_sheet(wb, wsRef, 'Reference');

        XLSX.writeFile(wb, EXCEL_FILE_PATH);
        console.log(`[${formatTimestamp()}] Admin cleared all responses. Backup created.`);

        res.json({
          success: true,
          message: 'All feedback responses have been cleared successfully. A timestamped backup was saved in backups/.'
        });
      } catch (err) {
        console.error('Error clearing Excel responses:', err);
        res.status(500).json({ success: false, message: 'Failed to clear feedback responses.' });
      }
      resolve();
    });
  });
});

// Fallback to index.html for root / unknown GET routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`SDS NEXT Training Evaluation Feedback System Started`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Data Directory: ${DATA_DIR}`);
  console.log(`Excel Workbook: ${EXCEL_FILE_PATH}`);
  console.log(`====================================================`);
});
