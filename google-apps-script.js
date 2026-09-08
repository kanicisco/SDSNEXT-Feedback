/**
 * SDS NEXT Training Evaluation Feedback System - Google Apps Script Backend
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click "Extensions" -> "Apps Script"
 * 3. Delete any default code in Code.gs and paste this entire file content.
 * 4. Click "Deploy" -> "New deployment"
 * 5. Select type: "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone" (CRITICAL for GitHub Pages!)
 * 8. Click "Deploy", authorize permissions, and copy the Web App URL.
 * 9. Paste the Web App URL into GOOGLE_SCRIPT_URL in app.js.
 */

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return createJsonResponse({ success: false, message: "No active spreadsheet found." });
    }

    // Ensure required sheets exist
    var feedbackSheet = getOrCreateSheet(ss, "Training Feedback", [
      "Submission ID",
      "Submission Date",
      "Training Date",
      "Overall Training Experience",
      "Trainer's Clarity and Delivery",
      "SOP Workflow Clarity",
      "SDS NEXT Confidence",
      "Most Useful Topic",
      "Follow-up Session",
      "Hands-on System Practice",
      "Training Relevance",
      "Additional Comments"
    ]);

    // Generate Submission ID and Timestamp
    var lastRow = feedbackSheet.getLastRow();
    var nextNum = lastRow > 1 ? lastRow - 1 + 1 : 1;
    
    // Check existing IDs to ensure max + 1
    if (lastRow > 1) {
      var idValues = feedbackSheet.getRange(2, 1, lastRow - 1, 1).getValues();
      var maxId = 0;
      for (var i = 0; i < idValues.length; i++) {
        var val = String(idValues[i][0] || "");
        var match = val.match(/SDS-(\d+)/i);
        if (match) {
          var num = parseInt(match[1], 10);
          if (num > maxId) maxId = num;
        }
      }
      nextNum = maxId + 1;
    }

    var submissionId = "SDS-" + padZero(nextNum, 6);
    var timestamp = formatDate(new Date());

    // Prepare row
    var newRow = [
      submissionId,
      timestamp,
      data.trainingDate || "",
      data.overallRating || "",
      data.trainerRating || "",
      data.sopClarity || "",
      data.systemConfidence || "",
      data.mostUsefulTopic || "",
      data.followUp || "",
      data.handsOnPractice || "",
      data.trainingRelevance || "",
      data.additionalComments || ""
    ];

    feedbackSheet.appendRow(newRow);

    // Update Summary Sheet
    updateSummarySheet(ss, feedbackSheet);

    return createJsonResponse({
      success: true,
      message: "Feedback saved successfully",
      submissionId: submissionId
    });

  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Error saving feedback: " + err.toString()
    });
  }
}

function doGet(e) {
  return createJsonResponse({
    status: "online",
    system: "SDS NEXT Training Feedback API",
    timestamp: new Date().toISOString()
  });
}

// Helpers
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function padZero(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function formatDate(date) {
  var pad = function(n) { return (n < 10 ? '0' : '') + n; };
  return date.getFullYear() + '-' +
    pad(date.getMonth() + 1) + '-' +
    pad(date.getDate()) + ' ' +
    pad(date.getHours()) + ':' +
    pad(date.getMinutes()) + ':' +
    pad(date.getSeconds());
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function updateSummarySheet(ss, feedbackSheet) {
  var summarySheet = ss.getSheetByName("Summary");
  if (!summarySheet) {
    summarySheet = ss.insertSheet("Summary");
  }
  summarySheet.clear();

  var rows = feedbackSheet.getDataRange().getValues();
  var total = Math.max(0, rows.length - 1);

  var sumOverall = 0, countOverall = 0;
  var sumTrainer = 0, countTrainer = 0;

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var overallStr = String(r[3] || "");
    var trainerStr = String(r[4] || "");
    
    var m1 = overallStr.match(/^(\d)/);
    if (m1) { sumOverall += parseInt(m1[1], 10); countOverall++; }
    
    var m2 = trainerStr.match(/^(\d)/);
    if (m2) { sumTrainer += parseInt(m2[1], 10); countTrainer++; }
  }

  var avgOverall = countOverall > 0 ? (sumOverall / countOverall).toFixed(2) + " / 5" : "N/A";
  var avgTrainer = countTrainer > 0 ? (sumTrainer / countTrainer).toFixed(2) + " / 5" : "N/A";

  var summaryData = [
    ["SDS NEXT TRAINING EVALUATION SUMMARY DASHBOARD", ""],
    ["----------------------------------------", "----------"],
    ["Total Feedback Responses Recorded", total],
    ["Average Overall Training Rating", avgOverall],
    ["Average Trainer's Delivery Rating", avgTrainer]
  ];

  for (var k = 0; k < summaryData.length; k++) {
    summarySheet.appendRow(summaryData[k]);
  }
  summarySheet.getRange("A1:B1").setFontWeight("bold");
}
