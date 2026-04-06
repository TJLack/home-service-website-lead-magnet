const scanForm = document.getElementById('scan-form');
const leadForm = document.getElementById('lead-form');
const landing = document.getElementById('landing');
const scanning = document.getElementById('scanning');
const locked = document.getElementById('locked');
const reportEl = document.getElementById('report');
const teaser = document.getElementById('teaser');
const scanState = document.getElementById('scan-state');

let reportId = null;

const states = [
  'Capturing website visuals...',
  'Crawling key pages...',
  'Analyzing design quality...',
  'Checking SEO structure...',
  'Detecting conversion issues...',
  'Evaluating AI search readiness...',
  'Estimating missed revenue...'
];

function renderReport(report) {
  const issues = report.topIssues.slice(0, 3).map(issue => `
    <div class="issue">
      <strong>${issue.title}</strong>
      <p>${issue.explanation}</p>
      <small><b>Impact:</b> ${issue.impact}</small>
    </div>
  `).join('');

  const recommendations = report.recommendations.map(r => `<li><b>${r.title}:</b> ${r.description}</li>`).join('');
  const mobileShot = report.screenshots.mobileHomepage ? `<img src="${report.screenshots.mobileHomepage}" alt="homepage screenshot" style="max-width:220px;border-radius:12px;border:1px solid #29405a;">` : '';

  reportEl.innerHTML = `
    <h2>Website Revenue Leak Report</h2>
    <div class="score-grid">
      <div class="score-card"><h4>Overall</h4><p>${report.scores.overall}/100</p></div>
      <div class="score-card"><h4>Design</h4><p>${report.scores.design}/100</p></div>
      <div class="score-card"><h4>SEO</h4><p>${report.scores.seo}/100</p></div>
      <div class="score-card"><h4>Conversion</h4><p>${report.scores.conversion}/100</p></div>
      <div class="score-card"><h4>AI Search Readiness</h4><p>${report.scores.aiReadiness}/100</p></div>
    </div>

    <h3>Estimated Revenue Opportunity</h3>
    <p class="money">You may be missing $${report.revenueOpportunity.lowMonthly.toLocaleString()}–$${report.revenueOpportunity.highMonthly.toLocaleString()} per month</p>
    <p>That could equal $${report.revenueOpportunity.lowAnnual.toLocaleString()}–$${report.revenueOpportunity.highAnnual.toLocaleString()} per year.</p>
    <p><b>Confidence:</b> ${report.revenueOpportunity.confidence}</p>
    <p>${report.revenueOpportunity.narrative}</p>

    <h3>Top 3 Issues</h3>
    ${issues}

    <h3>AI Search Readiness Breakdown</h3>
    <ul>
      <li>Content Clarity: ${report.subScores.aiReadiness.contentClarity}/25</li>
      <li>Service + Location Structure: ${report.subScores.aiReadiness.serviceLocationStructure}/25</li>
      <li>Trust + Authority Signals: ${report.subScores.aiReadiness.trustAuthority}/20</li>
      <li>AI-Friendly Answer Content: ${report.subScores.aiReadiness.aiFriendlyAnswers}/20</li>
      <li>Technical Structure Signals: ${report.subScores.aiReadiness.technicalStructure}/10</li>
    </ul>

    <h3>Recommended Fixes</h3>
    <ul>${recommendations}</ul>

    ${mobileShot}

    <div class="cta">
      <h3>Let Us Fix This For You</h3>
      <p>We build AI-powered, SEO-optimized websites for Texas home service businesses that want more leads, more trust, and more booked jobs.</p>
      <a href="https://api.leadconnectorhq.com/widget/bookings/digital-marketing-consultation-apykl" target="_blank" rel="noopener"><button>Book My Free Strategy Call</button></a>
      <p>No pressure. Just clear next steps.</p>
    </div>
  `;
}

scanForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = document.getElementById('website-url').value;

  landing.classList.add('hidden');
  scanning.classList.remove('hidden');

  let idx = 0;
  const interval = setInterval(() => {
    scanState.textContent = states[idx % states.length];
    idx += 1;
  }, 800);

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Scan failed');

    reportId = data.reportId;
    teaser.innerHTML = `
      <p><b>${data.lockedSummary.teaser[0]}</b></p>
      <p>${data.lockedSummary.teaser[1]}</p>
      <p>${data.lockedSummary.teaser[2]}</p>
      <p>${data.lockedSummary.teaser[3]}</p>
      <p><b>Current score preview:</b> ${data.scores.overall}/100</p>
    `;

    scanning.classList.add('hidden');
    locked.classList.remove('hidden');
  } catch (error) {
    alert(error.message);
    scanning.classList.add('hidden');
    landing.classList.remove('hidden');
  } finally {
    clearInterval(interval);
  }
});

leadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const payload = Object.fromEntries(formData.entries());
  payload.reportId = reportId;

  const response = await fetch('/api/unlock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) return alert(data.error || 'Could not unlock report');

  locked.classList.add('hidden');
  reportEl.classList.remove('hidden');
  renderReport(data.report);
});
