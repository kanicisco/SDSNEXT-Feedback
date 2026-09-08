document.addEventListener('DOMContentLoaded', () => {
  
  // ----------------------------------------------------
  // DOM Elements
  // ----------------------------------------------------
  const feedbackForm = document.getElementById('feedbackForm');
  const trainingDateInput = document.getElementById('trainingDate');
  const submitBtn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const errorBox = document.getElementById('errorBox');
  const successOverlay = document.getElementById('successOverlay');
  const submitAnotherBtn = document.getElementById('submitAnotherBtn');

  // Step Indicators
  const step1 = document.getElementById('stepIndicator1');
  const step2 = document.getElementById('stepIndicator2');
  const step3 = document.getElementById('stepIndicator3');

  // Admin Modal Elements
  const adminPortalBtn = document.getElementById('adminPortalBtn');
  const adminModal = document.getElementById('adminModal');
  const closeAdminModalBtn = document.getElementById('closeAdminModalBtn');
  const adminPasswordSetupView = document.getElementById('adminPasswordSetupView');
  const adminLoginView = document.getElementById('adminLoginView');
  const adminDashboardView = document.getElementById('adminDashboardView');
  const adminSetupForm = document.getElementById('adminSetupForm');
  const newAdminPassword = document.getElementById('newAdminPassword');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const adminLoginError = document.getElementById('adminLoginError');
  const downloadExcelBtn = document.getElementById('downloadExcelBtn');
  const changeAdminPassBtn = document.getElementById('changeAdminPassBtn');

  const statTotalResponses = document.getElementById('statTotalResponses');
  const statAvgOverall = document.getElementById('statAvgOverall');
  const statAvgTrainer = document.getElementById('statAvgTrainer');

  // ----------------------------------------------------
  // Dynamic API Base URL Resolver
  // ----------------------------------------------------
  // Resolves backend URL whether opened via http://localhost:3000, XAMPP http://localhost, file://, or LAN IP
  function getApiBaseUrl() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname || 'localhost';
    const port = window.location.port;

    if (protocol === 'file:' || (port !== '3000' && port !== '')) {
      return `${protocol === 'https:' ? 'https:' : 'http:'}//${hostname}:3000`;
    }
    return '';
  }

  const API_BASE = getApiBaseUrl();

  // ----------------------------------------------------
  // Initialization
  // ----------------------------------------------------
  // Set default training date to today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  trainingDateInput.value = todayStr;

  let adminToken = sessionStorage.getItem('sds_admin_token') || '';

  // ----------------------------------------------------
  // Interactive Rating & Choice Cards Binding
  // ----------------------------------------------------

  // 1. Rating Buttons (1 to 5)
  function bindRatingButtons(groupId, hiddenInputId) {
    const group = document.getElementById(groupId);
    const hiddenInput = document.getElementById(hiddenInputId);
    if (!group || !hiddenInput) return;

    const buttons = group.querySelectorAll('.rating-btn');
    buttons.forEach(btn => {
      const selectAction = () => {
        buttons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        hiddenInput.value = btn.dataset.value;
        group.style.outline = 'none';
      };

      btn.addEventListener('click', selectAction);
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectAction();
        }
      });
    });
  }

  // 2. Choice Cards (Multi-option grids)
  function bindChoiceCards(groupId, hiddenInputId) {
    const group = document.getElementById(groupId);
    const hiddenInput = document.getElementById(hiddenInputId);
    if (!group || !hiddenInput) return;

    const cards = group.querySelectorAll('.choice-card');
    cards.forEach(card => {
      const selectAction = () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        hiddenInput.value = card.dataset.value;
        group.style.outline = 'none';
      };

      card.addEventListener('click', selectAction);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectAction();
        }
      });
    });
  }

  // Bind all interactive input groups
  bindRatingButtons('overallRatingGroup', 'overallRating');
  bindRatingButtons('trainerRatingGroup', 'trainerRating');
  bindChoiceCards('sopClarityGroup', 'sopClarity');
  bindChoiceCards('systemConfidenceGroup', 'systemConfidence');
  bindChoiceCards('mostUsefulTopicGroup', 'mostUsefulTopic');
  bindChoiceCards('followUpGroup', 'followUp');
  bindChoiceCards('handsOnPracticeGroup', 'handsOnPractice');
  bindChoiceCards('trainingRelevanceGroup', 'trainingRelevance');

  // ----------------------------------------------------
  // Scroll Position & Active Step Tracker
  // ----------------------------------------------------
  window.addEventListener('scroll', () => {
    const s1 = document.getElementById('section1');
    const s2 = document.getElementById('section2');
    const s3 = document.getElementById('section3');

    if (!s1 || !s2 || !s3) return;

    const scrollPos = window.scrollY + 300;

    if (scrollPos < s2.offsetTop) {
      step1.className = 'step-item active';
      step2.className = 'step-item';
      step3.className = 'step-item';
    } else if (scrollPos >= s2.offsetTop && scrollPos < s3.offsetTop) {
      step1.className = 'step-item completed';
      step2.className = 'step-item active';
      step3.className = 'step-item';
    } else {
      step1.className = 'step-item completed';
      step2.className = 'step-item completed';
      step3.className = 'step-item active';
    }
  });

  // ----------------------------------------------------
  // Form Submission Handler
  // ----------------------------------------------------
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    // Required Field Validations
    const requiredFields = [
      { id: 'trainingDate', el: trainingDateInput },
      { id: 'overallRating', group: 'overallRatingGroup' },
      { id: 'trainerRating', group: 'trainerRatingGroup' },
      { id: 'sopClarity', group: 'sopClarityGroup' },
      { id: 'systemConfidence', group: 'systemConfidenceGroup' },
      { id: 'mostUsefulTopic', group: 'mostUsefulTopicGroup' },
      { id: 'followUp', group: 'followUpGroup' },
      { id: 'handsOnPractice', group: 'handsOnPracticeGroup' },
      { id: 'trainingRelevance', group: 'trainingRelevanceGroup' }
    ];

    let firstInvalid = null;

    requiredFields.forEach(field => {
      const input = document.getElementById(field.id);
      if (!input || !input.value.trim()) {
        if (field.group) {
          const groupEl = document.getElementById(field.group);
          if (groupEl) groupEl.style.outline = '2px solid var(--error)';
          if (!firstInvalid) firstInvalid = groupEl;
        } else if (field.el) {
          field.el.style.borderColor = 'var(--error)';
          if (!firstInvalid) firstInvalid = field.el;
        }
      }
    });

    if (firstInvalid) {
      errorBox.textContent = 'Please complete all required fields marked with * before submitting.';
      errorBox.style.display = 'block';
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Prepare payload
    const formData = new FormData(feedbackForm);
    const payload = {
      trainingDate: formData.get('trainingDate'),
      overallRating: formData.get('overallRating'),
      trainerRating: formData.get('trainerRating'),
      sopClarity: formData.get('sopClarity'),
      systemConfidence: formData.get('systemConfidence'),
      mostUsefulTopic: formData.get('mostUsefulTopic'),
      followUp: formData.get('followUp'),
      handsOnPractice: formData.get('handsOnPractice'),
      trainingRelevance: formData.get('trainingRelevance'),
      additionalComments: formData.get('additionalComments') || ''
    };

    // UI Loading State (Duplicate Submission Protection)
    submitBtn.disabled = true;
    btnSpinner.style.display = 'inline-block';
    btnText.textContent = 'Saving feedback…';

    try {
      const targetUrl = API_BASE + '/api/feedback';
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        // Show Polished Success Screen
        feedbackForm.style.display = 'none';
        successOverlay.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        errorBox.textContent = result.message || 'Unable to save feedback. Please check required fields.';
        errorBox.style.display = 'block';
      }
    } catch (err) {
      console.error('Submission error:', err);
      const hostUrl = API_BASE || 'http://localhost:3000';
      errorBox.textContent = `Unable to connect to SDS NEXT server at ${hostUrl}. Please ensure "npm start" is running.`;
      errorBox.style.display = 'block';
    } finally {
      // Re-enable button state
      submitBtn.disabled = false;
      btnSpinner.style.display = 'none';
      btnText.textContent = 'Save anonymous feedback →';
    }
  });

  // Submit Another Response Handler
  submitAnotherBtn.addEventListener('click', () => {
    feedbackForm.reset();
    trainingDateInput.value = todayStr;

    // Reset visual selections
    document.querySelectorAll('.rating-btn.selected, .choice-card.selected').forEach(el => {
      el.classList.remove('selected');
    });
    document.querySelectorAll('[id$="Group"]').forEach(el => el.style.outline = 'none');

    successOverlay.style.display = 'none';
    feedbackForm.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ----------------------------------------------------
  // Admin Portal & Password Management
  // ----------------------------------------------------
  function openAdminModal() {
    adminModal.classList.add('open');
    checkAdminStatus();
  }

  function closeAdminModal() {
    adminModal.classList.remove('open');
  }

  adminPortalBtn.addEventListener('click', openAdminModal);
  closeAdminModalBtn.addEventListener('click', closeAdminModal);
  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) closeAdminModal();
  });

  async function checkAdminStatus() {
    adminPasswordSetupView.style.display = 'none';
    adminLoginView.style.display = 'none';
    adminDashboardView.style.display = 'none';

    try {
      const res = await fetch(API_BASE + '/api/admin/status', {
        headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
      });
      const data = await res.json();

      if (!data.isConfigured) {
        // Password not set yet -> show password creation form
        adminPasswordSetupView.style.display = 'block';
      } else if (data.isLoggedIn) {
        // Already authenticated -> load stats and show download dashboard
        await loadAdminDashboard();
      } else {
        // Password exists, but user needs to login
        adminLoginView.style.display = 'block';
      }
    } catch (e) {
      console.error('Status check error:', e);
      adminPasswordSetupView.style.display = 'block';
    }
  }

  // Create / Set Admin Password
  adminSetupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = newAdminPassword.value.trim();
    if (pass.length < 4) return;

    try {
      const res = await fetch(API_BASE + '/api/admin/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: pass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        adminToken = data.token;
        sessionStorage.setItem('sds_admin_token', adminToken);
        await loadAdminDashboard();
      } else {
        alert(data.message || 'Failed to set admin password.');
      }
    } catch (e) {
      alert('Network error while setting password.');
    }
  });

  // Admin Login
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    adminLoginError.style.display = 'none';
    const pass = adminPasswordInput.value;

    try {
      const res = await fetch(API_BASE + '/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        adminToken = data.token;
        sessionStorage.setItem('sds_admin_token', adminToken);
        adminPasswordInput.value = '';
        await loadAdminDashboard();
      } else {
        adminLoginError.textContent = data.message || 'Incorrect admin password.';
        adminLoginError.style.display = 'block';
      }
    } catch (e) {
      adminLoginError.textContent = 'Connection error.';
      adminLoginError.style.display = 'block';
    }
  });

  // Load Admin Dashboard & Stats
  async function loadAdminDashboard() {
    adminPasswordSetupView.style.display = 'none';
    adminLoginView.style.display = 'none';
    adminDashboardView.style.display = 'block';

    try {
      const res = await fetch(API_BASE + '/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();

      if (res.ok && data.success && data.stats) {
        statTotalResponses.textContent = data.stats.total || 0;
        statAvgOverall.textContent = data.stats.avgOverall || 'N/A';
        statAvgTrainer.textContent = data.stats.avgTrainer || 'N/A';
      }
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    }
  }

  const clearResponsesBtn = document.getElementById('clearResponsesBtn');
  const adminNoticeMsg = document.getElementById('adminNoticeMsg');

  // Trigger Excel File Download
  downloadExcelBtn.addEventListener('click', () => {
    if (!adminToken) return;
    // Download via token query parameter
    window.location.href = API_BASE + `/api/admin/download?token=${encodeURIComponent(adminToken)}`;
  });

  // Clear All Responses Handler
  if (clearResponsesBtn) {
    clearResponsesBtn.addEventListener('click', async () => {
      if (!adminToken) return;
      const confirmed = confirm('Are you sure you want to clear all feedback responses? A timestamped backup of the current dataset will be created automatically in backups/.');
      if (!confirmed) return;

      if (adminNoticeMsg) {
        adminNoticeMsg.className = 'admin-notice-msg';
        adminNoticeMsg.style.display = 'none';
      }

      try {
        const res = await fetch(API_BASE + '/api/admin/clear-responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (adminNoticeMsg) {
            adminNoticeMsg.textContent = '✓ All feedback responses cleared successfully. Backup created.';
            adminNoticeMsg.className = 'admin-notice-msg success';
          }
          await loadAdminDashboard();
        } else {
          alert(data.message || 'Failed to clear responses.');
        }
      } catch (err) {
        console.error('Clear responses error:', err);
        alert('Network error while clearing responses.');
      }
    });
  }

  // Change Admin Password Button
  changeAdminPassBtn.addEventListener('click', () => {
    adminDashboardView.style.display = 'none';
    newAdminPassword.value = '';
    adminPasswordSetupView.style.display = 'block';
  });

});
