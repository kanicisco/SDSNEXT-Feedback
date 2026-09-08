SDS NEXT – Training Evaluation Feedback System
Professional Training Evaluation & Feedback Management System
A standalone SDS NEXT Training Evaluation Feedback System designed for internal training sessions.
This version does NOT use:
GitHub
GitHub Pages
Google Sheets
Google Apps Script
Google Forms
Google Drive
External database services
All feedback responses are stored locally in an Excel workbook located inside the project folder.
---
1. System Overview
```text
Participant
     │
     ▼
SDS NEXT Feedback Website
     │
     ▼
Local Node.js Server
     │
     ▼
Excel Workbook
     │
     ├── Training Feedback
     ├── Summary
     └── Reference
```
The participant completes the online feedback form.
After clicking:
SAVE ANONYMOUS FEEDBACK
the response is sent to the local server.
The server automatically adds the response as a new row inside:
```text
data/SDS_NEXT_Training_Feedback.xlsx
```
No manual Excel entry is required.
---
2. Main Objective
Create a modern, professional and creative:
SDS NEXT
Training Evaluation Feedback Form
The interface should maintain the SDS NEXT visual identity while improving usability, responsiveness and data management.
The existing SDS NEXT visual concept should be retained rather than replaced with a generic form.
---
3. Existing Questions – Do Not Change
The form must contain the same questions and structure from the existing SDS NEXT Training Evaluation form.
SECTION 01 – Your Training Experience
01. Training date *
Input:
```text
Date
```
Field:
```text
trainingDate
```
02. Overall training experience *
Options:
```text
5 - Excellent
4 - Very Good
3 - Good
2 - Fair
1 - Needs Improvement
```
Field:
```text
overallRating
```
Use the existing visual rating-button layout.
03. Trainer's clarity and delivery *
Options:
```text
5 - Excellent
4 - Very Good
3 - Good
2 - Fair
1 - Needs Improvement
```
Field:
```text
trainerRating
```
---
4. SECTION 02 – SOP and Training Quality
04. How clear were the SOP workflows? *
Options:
```text
Very clear
Clear
Partly clear
Not clear
```
Field:
```text
sopClarity
```
05. How confident are you using SDS NEXT now? *
Options:
```text
Very confident
Confident
Need more practice
Need additional support
```
Field:
```text
systemConfidence
```
06. Most useful topic *
Options:
```text
Goods Receipt Note (GRN)
Purchase Return
Manual Billing
Order Booking
Order to Billing (O2B)
Stock Adjustment
Retailer Master
Product & Price (XDM)
```
Field:
```text
mostUsefulTopic
```
07. Would you like a follow-up session? *
Options:
```text
No, I am ready to proceed
Yes, a refresher session
Yes, one-to-one support
```
Field:
```text
followUp
```
08. Was enough time given for hands-on system practice? *
Options:
```text
5 - Definitely enough time
4 - Enough time
3 - Some more time needed
2 - Not enough time
1 - Much more time needed
```
Field:
```text
handsOnPractice
```
09. How relevant were the training examples to your work? *
Options:
```text
5 - Extremely relevant
4 - Relevant
3 - Somewhat relevant
2 - Slightly relevant
1 - Not relevant
```
Field:
```text
trainingRelevance
```
---
5. SECTION 03 – Your Comments
10. What should we keep, improve or explain more clearly?
Field:
```text
additionalComments
```
Input:
```text
Large textarea
```
This field remains optional.
---
6. Anonymous Feedback
Display a professional information panel:
```text
✓ Your feedback is anonymous.

We do not request your name, email address, distributor point,
or any identifying information.
```
Do not add name, email, telephone, employee number, distributor ID, username or password fields.
---
7. Project Folder
The completed application must have this structure:
```text
SDS-NEXT-Training-Feedback/
│
├── index.html
├── styles.css
├── app.js
├── server.js
├── package.json
├── README.md
│
├── assets/
│   └── SDS-NEXT-Logo.png
│
├── data/
│   └── SDS_NEXT_Training_Feedback.xlsx
│
└── backups/
```
The Excel workbook must physically exist inside:
```text
data/
```
If it does not exist when the server starts, the application must create it automatically.
---
8. Excel Workbook
Filename:
```text
data/SDS_NEXT_Training_Feedback.xlsx
```
The workbook must contain at least three worksheets:
```text
Training Feedback
Summary
Reference
```
---
9. Training Feedback Worksheet
Use these columns:
Column	Field
A	Submission ID
B	Submission Date
C	Training Date
D	Overall Training Experience
E	Trainer's Clarity and Delivery
F	SOP Workflow Clarity
G	SDS NEXT Confidence
H	Most Useful Topic
I	Follow-up Session
J	Hands-on System Practice
K	Training Relevance
L	Additional Comments
Example:
```text
SDS-000001
2026-09-08 12:15:32
2026-09-08
5 - Excellent
5 - Excellent
Very clear
Very confident
Order to Billing (O2B)
No, I am ready to proceed
5 - Definitely enough time
5 - Extremely relevant
Very useful training session.
```
Every new submission must be added as a new row.
Existing responses must never be overwritten.
---
10. Submission ID
The backend generates the Submission ID.
Format:
```text
SDS-000001
SDS-000002
SDS-000003
SDS-000004
```
The browser must not control the official Submission ID.
---
11. Submission Date
The backend automatically generates the submission timestamp.
Recommended format:
```text
YYYY-MM-DD HH:mm:ss
```
Example:
```text
2026-09-08 12:15:32
```
---
12. Excel Formatting
The workbook should include:
Professional header formatting
Frozen header row
Auto filter
Excel table formatting
Wrapped comments
Proper date formatting
Automatic column sizing
Readable column widths
Bold headings
Vertical alignment
Easy filtering and sorting
Recommended widths:
```text
Submission ID       18
Submission Date     22
Training Date       16
Overall Rating      25
Trainer Rating      25
SOP Clarity         22
System Confidence   24
Useful Topic        30
Follow-up           30
Hands-on Practice   30
Training Relevance  28
Comments            60
```
---
13. Summary Worksheet
Create a management-friendly summary dashboard.
Display:
Total Responses
```text
48
```
Average Overall Rating
```text
4.42 / 5
```
Average Trainer Rating
```text
4.56 / 5
```
SOP Clarity
```text
Very clear
Clear
Partly clear
Not clear
```
Show response counts for each.
SDS NEXT Confidence
```text
Very confident
Confident
Need more practice
Need additional support
```
Show response counts for each.
Follow-up Requirement
```text
No, I am ready to proceed
Yes, a refresher session
Yes, one-to-one support
```
Show response counts for each.
Most Useful Topics
Show response counts for:
```text
Goods Receipt Note (GRN)
Purchase Return
Manual Billing
Order Booking
Order to Billing (O2B)
Stock Adjustment
Retailer Master
Product & Price (XDM)
```
The Summary worksheet should be formula-driven where practical so that it updates as new responses are added.
---
14. Reference Worksheet
Create:
```text
Reference
```
Store the official dropdown/rating values used by the application.
This makes the workbook easier to maintain and audit.
---
15. Website Design
Maintain the existing SDS NEXT design language:
SDS NEXT branding
Supplied SDS NEXT logo
Dark navy hero
Blue accent
Light professional background
Circular visual element
Section numbering
Modern typography
Rating buttons
Anonymous feedback panel
Responsive layout
Subtle animations
Professional form card
The design should feel like a corporate training evaluation portal.
---
16. Header
Display:
```text
SDS NEXT
```
and:
```text
TRAINING EVALUATION · 01
```
Use the supplied logo:
```text
assets/SDS-NEXT-Logo.png
```
---
17. Hero Section
Display:
```text
YOUR VOICE HELPS US IMPROVE
```
Main heading:
```text
How was your
SDS NEXT training?
```
Supporting text:
```text
Your feedback helps us make each system rollout
clearer, more practical and more useful for
distributor teams.
```
Include the creative circular feedback indicator:
```text
YOUR

01

feedback
matters
```
---
18. Training Progress Panel
Display:
```text
A SHORT CHECK-IN

Help shape
the next session.
```
Steps:
```text
01  Your training experience
02  SOP and training quality
03  Your comments
```
Display:
```text
Estimated time: 3 minutes
```
---
19. Feedback Form Card
Header:
```text
ANONYMOUS TRAINING FEEDBACK
```
Supporting text:
```text
Fields marked * are required.
```
The form should be visually separated into three numbered sections.
---
20. Validation
Required fields:
```text
trainingDate
overallRating
trainerRating
sopClarity
systemConfidence
mostUsefulTopic
followUp
handsOnPractice
trainingRelevance
```
Optional:
```text
additionalComments
```
Do not allow submission until required questions are completed.
---
21. Submit Button
Button text:
```text
Save anonymous feedback →
```
During saving:
```text
Saving feedback…
```
During saving:
Disable the button
Prevent duplicate submission
Display a loading state
After successful submission:
```text
✓ Thank you.

Your anonymous feedback has been saved successfully.
```
---
22. Success Screen
Use a polished success confirmation:
```text
✓

FEEDBACK RECEIVED

Thank you for helping us improve
the SDS NEXT training experience.

Your anonymous response has been recorded.
```
Provide:
```text
Submit another response
```
The participant must not see the Excel path or database information.
---
23. Error Handling
If saving fails, display:
```text
Unable to save feedback.

Please check the connection and try again.
```
Do not expose technical stack traces, file paths, Node.js errors or database errors to the participant.
Technical errors should be logged on the server.
---
24. Backend Technology
Use:
```text
Node.js
Express
XLSX
```
Install dependencies:
```bash
npm install
```
Run:
```bash
npm start
```
Open:
```text
http://localhost:3000
```
---
25. package.json
Use:
```json
{
  "name": "sds-next-training-feedback",
  "version": "1.0.0",
  "description": "SDS NEXT Training Evaluation Feedback System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "xlsx": "^0.18.5"
  }
}
```
---
26. Backend API
Create:
```text
POST /api/feedback
```
The browser sends:
```json
{
  "trainingDate": "2026-09-08",
  "overallRating": "5 - Excellent",
  "trainerRating": "5 - Excellent",
  "sopClarity": "Very clear",
  "systemConfidence": "Very confident",
  "mostUsefulTopic": "Order to Billing (O2B)",
  "followUp": "No, I am ready to proceed",
  "handsOnPractice": "5 - Definitely enough time",
  "trainingRelevance": "5 - Extremely relevant",
  "additionalComments": "Very useful training session."
}
```
The server adds:
```text
Submission ID
Submission Date
```
before saving.
---
27. Server Processing
When:
```text
POST /api/feedback
```
is received:
Step 1
Validate required fields.
Step 2
Load:
```text
data/SDS_NEXT_Training_Feedback.xlsx
```
Step 3
Read:
```text
Training Feedback
```
worksheet.
Step 4
Generate the next Submission ID.
Step 5
Create a new row.
Step 6
Append the response.
Step 7
Update Summary formulas/data.
Step 8
Save the workbook.
Step 9
Return:
```json
{
  "success": true,
  "message": "Feedback saved successfully"
}
```
---
28. Excel Write Protection
The server must never clear or overwrite existing feedback.
Each submission must append a new record.
Example:
```text
SDS-000001
SDS-000002
SDS-000003
SDS-000004
```
All records remain available.
---
29. Concurrent User Protection
If multiple users submit at approximately the same time, the backend must serialize Excel writes.
Concept:
```text
User A ──┐
User B ──┼──> Write Queue / Lock ──> Excel
User C ──┘
```
This prevents concurrent requests from corrupting or overwriting the workbook.
---
30. Duplicate Submission Protection
The frontend should immediately disable the submit button after the user clicks it.
The backend should also protect against accidental duplicate writes caused by:
Double-clicking
Browser retry
Slow network
Refresh
Repeated POST requests
---
31. Backup
Before updating the workbook, optionally create a timestamped backup:
```text
backups/
    SDS_NEXT_Training_Feedback_20260908_120000.xlsx
```
Recommended approach:
```text
Main workbook:
data/SDS_NEXT_Training_Feedback.xlsx

Backups:
backups/
```
---
32. Security
The Excel workbook must never be publicly accessible through the website.
Do NOT expose:
```text
/data
```
as a static web folder.
Do not use:
```javascript
app.use(express.static("data"));
```
The workbook must only be accessed by the backend.
---
33. Static Files
Only serve:
```text
index.html
styles.css
app.js
assets/
```
The Node.js server should serve the website.
---
34. Mobile Responsive Design
Desktop:
```text
Information Panel | Feedback Form
```
Tablet:
```text
Stack naturally
```
Mobile:
```text
Single-column form
```
Rating buttons must remain easy to tap on phones.
---
35. Accessibility
Use:
Proper labels
Keyboard navigation
Visible focus states
Required validation
Accessible buttons
Readable font sizes
Proper contrast
Mobile-friendly controls
Rating buttons must be keyboard accessible.
---
36. Animations
Use subtle animations for:
Hero background
Circular indicator
Button hover
Input focus
Success message
Smooth transitions
Do not use excessive animation.
The application must remain professional.
---
37. Optional Access Database Architecture
Excel is the primary storage method.
If Microsoft Access is required later, it can replace Excel without changing the frontend architecture.
Future structure:
```text
Browser
   ↓
Node.js API
   ↓
Microsoft Access
```
Suggested database:
```text
SDS_NEXT_Training_Feedback.accdb
```
Suggested table:
```text
TrainingFeedback
```
Fields:
```text
ID
SubmissionID
SubmissionDate
TrainingDate
OverallRating
TrainerRating
SOPClarity
SystemConfidence
MostUsefulTopic
FollowUp
HandsOnPractice
TrainingRelevance
AdditionalComments
```
The browser must never connect directly to Access.
---
38. Deployment – Normal/Internal Server
This project is independent of GitHub.
It can run on:
Office Computer
```bash
npm install
npm start
```
Then:
```text
http://localhost:3000
```
Internal Server
Example:
```text
http://192.168.1.100:3000
```
Users on the same internal network can open the form.
The Excel file stays on the server.
Windows Server
The application can be run as a Windows service using an appropriate Node.js process manager.
---
39. No GitHub Requirement
Do not use:
```text
GitHub
GitHub Pages
GitHub Actions
GitHub API
```
This is a normal web application that runs from a computer or internal server.
---
40. No Google Requirement
Do not use:
```text
Google Sheets
Google Apps Script
Google Forms
Google Drive
Google APIs
```
The application must work independently.
---
41. Final User Flow
```text
OPEN SDS NEXT FEEDBACK WEBSITE
             │
             ▼
READ ANONYMOUS FEEDBACK MESSAGE
             │
             ▼
SELECT TRAINING DATE
             │
             ▼
RATE OVERALL TRAINING
             │
             ▼
RATE TRAINER
             │
             ▼
EVALUATE SOP CLARITY
             │
             ▼
SELECT SDS NEXT CONFIDENCE
             │
             ▼
SELECT MOST USEFUL TOPIC
             │
             ▼
SELECT FOLLOW-UP REQUIREMENT
             │
             ▼
RATE HANDS-ON PRACTICE
             │
             ▼
RATE TRAINING RELEVANCE
             │
             ▼
ADD COMMENTS
             │
             ▼
SAVE ANONYMOUS FEEDBACK
             │
             ▼
NODE.JS API
             │
             ▼
VALIDATE RESPONSE
             │
             ▼
GENERATE SUBMISSION ID
             │
             ▼
APPEND NEW EXCEL ROW
             │
             ▼
UPDATE SUMMARY
             │
             ▼
SUCCESS MESSAGE
```
---
42. Final Acceptance Criteria
The finished application must satisfy all of the following:
[ ] SDS NEXT branding displayed
[ ] Supplied SDS NEXT logo used
[ ] Existing visual layout retained
[ ] Existing questions retained
[ ] Training date works
[ ] Overall rating works
[ ] Trainer rating works
[ ] SOP clarity works
[ ] SDS NEXT confidence works
[ ] Most useful topic works
[ ] Follow-up selection works
[ ] Hands-on practice works
[ ] Training relevance works
[ ] Comments work
[ ] Required fields validated
[ ] Anonymous feedback message displayed
[ ] Submit button works
[ ] Duplicate submission protection works
[ ] Excel file automatically created
[ ] Excel file stored inside `/data`
[ ] Each response creates a new row
[ ] Submission ID generated automatically
[ ] Submission date generated automatically
[ ] Existing responses never overwritten
[ ] Summary worksheet created
[ ] Reference worksheet created
[ ] Excel filters enabled
[ ] Excel formatting applied
[ ] Comments wrapped
[ ] Mobile responsive
[ ] Desktop responsive
[ ] No Google Apps Script
[ ] No Google Sheets
[ ] No GitHub
[ ] No public Excel access
[ ] Server-side Excel writing implemented
[ ] Professional success message
[ ] Professional error handling
---
43. Implementation Instruction
Use the existing uploaded SDS NEXT frontend as the visual foundation.
Preserve:
Dark navy hero
Blue accent
Circular visual element
Section numbering
Two-column form layout
Rating button design
Anonymous feedback panel
Professional typography
Responsive mobile layout
The major technical change is:
```text
OLD

Browser
  ↓
Google Apps Script
  ↓
Google Sheets


NEW

Browser
  ↓
Node.js / Express
  ↓
Excel Workbook
```
The existing frontend's Google Apps Script submission mechanism must be completely removed.
---
44. Final Architecture
```text
                  SDS NEXT
                     │
                     ▼
          ┌─────────────────────┐
          │   Feedback Website  │
          │                     │
          │     index.html      │
          │     styles.css      │
          │       app.js        │
          └──────────┬──────────┘
                     │
                     │ POST /api/feedback
                     ▼
          ┌─────────────────────┐
          │    Node.js API      │
          │                     │
          │     server.js       │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │   Excel Workbook    │
          │                     │
          │ Training Feedback   │
          │ Summary             │
          │ Reference           │
          └─────────────────────┘

               NO GITHUB
               NO GOOGLE
               NO CLOUD DB
```
---
END OF SDS NEXT TRAINING EVALUATION FEEDBACK SYSTEM SPECIFICATION