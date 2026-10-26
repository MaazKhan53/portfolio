/* ============================================================
   SITE CONTENT. Edit this file to change what the site shows.
   - analytics.clarityId: paste your free Microsoft Clarity ID
     (from clarity.microsoft.com) to see visitor networks,
     cities, scroll heatmaps & session replays with zero popups.
   - experience: drop a logo into /logos named <key>.svg, .png,
     .webp or .jpg and it appears automatically.
   - certs: 2 balanced rows of 7 certificates (14 total).
   ============================================================ */
window.SITE = {

  analytics: {
    clarityId: 'z3rbxtmulr' /* Optional: e.g. 'p9abc123xyz' from clarity.microsoft.com */
  },

  experience: [
    { key: 'flyrank', company: 'FlyRank AI', role: 'Machine Learning Engineering Intern', dates: 'Jul 2026 to Sep 2026', place: 'Remote, Chicago',
      impact: 'Engineered a content decay triage pipeline across 30,000 production URLs (32 clients), achieving 70.0% Precision@10 on unseen domains (3.5x lift over baseline) with a deliberate leakage harness.' },
    { key: 'pepsico', company: 'PepsiCo', role: 'GTM Analytics Intern, Roshan Kal', dates: 'Jul 2026 to Aug 2026', place: 'Islamabad',
      impact: 'Shipped 7 VBA automation tools for GTM and Tax, returning 59+ hours a month. Presented the architecture and ROI to the COO and CFO.' },
    { key: 'attock-refinery', company: 'Attock Refinery Limited', role: 'B2B Sales Intern', dates: 'Jun 2026 to Jul 2026', place: 'Islamabad',
      impact: 'Exposure to industrial B2B sales cycles in the refining sector.' },
    { key: 'iba', company: 'IBA Karachi', role: 'Teaching Assistant, Human Resource Management', dates: 'Jan 2026 to Jun 2026', place: 'Karachi',
      impact: 'Tracked grades and performance for 50+ students in Excel and coordinated between students and faculty.' },
    { key: 'askari-bank', company: 'Askari Bank', role: 'Risk Management Intern', dates: 'Jul 2025 to Aug 2025', place: 'Islamabad, Head Office',
      impact: 'Worked across operational, credit, liquidity and environmental risk, from Basel II frameworks to SME credit cases.' },
    { key: 'ffc', company: 'FFC', role: 'Marketing Intern, Distribution', dates: 'Jun 2025 to Jul 2025', place: 'Goth Machhi, Rahim Yar Khan',
      impact: 'Monitored dealer billing and shipment allocation across 13 regions and about 3,500 dealers in SAP, and audited freight costs and bag quality.' },
    { key: 'psx', company: 'Pakistan Stock Exchange', role: 'Equity Trader, self-employed', dates: 'Jan 2025 to Present', place: 'Remote', ongoing: true,
      impact: 'Technical and fundamental analysis for risk-managed trades: RSI, MACD, Bollinger Bands and corporate financial statements.' },
    { key: 'ogdcl', company: 'OGDCL', role: 'Supply Chain Management Intern', dates: 'Jul 2024 to Aug 2024', place: 'Islamabad',
      impact: 'SAP Ariba sourcing, international procurement and trade finance, plus audits at the Dakhni sour gas plant and a seismic field site.' }
  ],

  skills: {
    advanced: [
      { id: 'vba', name: 'VBA & Excel Automation', star: true,
        summary: 'Seven production tools built on memory arrays and Dictionary objects instead of heavy formulas, running on ordinary company laptops.',
        proof: [{ label: 'PepsiCo automation suite', href: '#pepsico' }] },
      { id: 'validation', name: 'Data Validation',
        summary: 'CNIC, mobile network, barcode and CPR checks that run on every row and isolate bad data visually.',
        proof: [{ label: 'PepsiCo automation suite', href: '#pepsico' }] },
      { id: 'recon', name: 'Reconciliation',
        summary: 'Tolerance-based SAP and FBR matching with green, red and amber output. Roughly 25 hours a month down to seconds.',
        proof: [{ label: 'PepsiCo automation suite', href: '#pepsico' }] },
      { id: 'deploy', name: 'Add-in Deployment',
        summary: 'Packaged as .xlam add-ins with custom XML ribbons, trusted-location installs and a 4-phase manual so executives can install in under a minute.',
        proof: [{ label: 'PepsiCo automation suite', href: '#pepsico' }] },
      { id: 'anomaly', name: 'Fraud & Anomaly Checks',
        summary: 'Pattern and duplicate checks that isolate fake barcode scans and stalled inventory transfers.',
        proof: [{ label: 'PepsiCo automation suite', href: '#pepsico' }] }
    ],
    practitioner: [
      { id: 'python', name: 'Python & pandas',
        summary: 'Data exploration, schema sanitization and modeling notebooks across 30,000 production URLs in the FlyRank internship.',
        proof: [{ label: 'FlyRank AI', href: '#flyrank' }] },
      { id: 'sklearn', name: 'scikit-learn',
        summary: 'Calibrated Logistic Regression and Regularized Random Forest pipelines achieving 70.0% Precision@10 on unseen clients.',
        proof: [{ label: 'FlyRank AI', href: '#flyrank' }] },
      { id: 'validation-ml', name: 'Model Validation',
        summary: 'Client-grouped splits and a deliberate leakage harness. Exposed a +14.4% optimism inflation gap between random splitting (0.7197 AP) and honest grouped splitting (0.5758 AP).',
        proof: [{ label: 'FlyRank AI', href: '#flyrank' }] },
      { id: 'pbi', name: 'Power BI & DAX',
        summary: 'A quick-commerce analytics model on a star schema at PepsiCo.',
        proof: [{ label: 'Experience', href: '#experience' }] },
      { id: 'react', name: 'React & Supabase',
        summary: 'A two-sided booking app, currently in development.',
        proof: [{ label: 'Outfield', href: '#outfield' }] },
      { id: 'web', name: 'HTML, Tailwind, Vercel',
        summary: 'This site: hand-built, tracked with analytics and deployed from GitHub.',
        proof: [{ label: 'This site', href: '#top' }] },
      { id: 'n8n', name: 'n8n & LLM Workflows',
        summary: 'A daily financial briefing built on n8n, Docker and the Groq API, delivered by email with no manual steps.',
        proof: [{ label: 'Also built', href: '#also-built' }] },
      { id: 'agents', name: 'Claude Code & Agents',
        summary: 'A local resume-tailoring agent on the MCP filesystem server, plus Anthropic certificates in Claude Code and agents.',
        proof: [{ label: 'Certificates', href: '#certificates' }] },
      { id: 'gov', name: 'AI Governance',
        summary: 'Claims framed under the NIST AI RMF, with automated human-in-the-loop safety guardrails and drift monitoring.',
        proof: [{ label: 'FlyRank AI', href: '#flyrank' }] },
      { id: 'sap', name: 'SAP Workflows',
        summary: 'SAP exports at PepsiCo, billing and allocation at FFC, Ariba sourcing at OGDCL.',
        proof: [{ label: 'Experience', href: '#experience' }] },
      { id: 'risk', name: 'Risk & Credit Analysis',
        summary: 'Basel II, RCSA, credit portfolio and liquidity frameworks at Askari Bank.',
        proof: [{ label: 'Experience', href: '#experience' }] },
      { id: 'scm', name: 'Supply Chain',
        summary: 'Procurement at OGDCL, freight and shipment allocation at FFC.',
        proof: [{ label: 'Experience', href: '#experience' }] },
      { id: 'ta', name: 'Technical Analysis',
        summary: 'RSI, MACD, Bollinger Bands and fundamentals in self-directed equity trading on the PSX since 2025.',
        proof: [{ label: 'Experience', href: '#experience' }] },
      { id: 'exec', name: 'Executive Presentation',
        summary: 'Presented architecture and ROI to the COO and CFO at PepsiCo.',
        proof: [{ label: 'PepsiCo automation suite', href: '#pepsico' }] },
      { id: 'writing', name: 'Technical Writing',
        summary: 'Installation manuals, specs and case studies written for non-technical readers.',
        proof: [{ label: 'PepsiCo automation suite', href: '#pepsico' }] }
    ]
  },

  /* 14 Certificates split evenly into 2 rows of 7 */
  certs: [
    {
      group: 'Row 01 · AI Fluency & Applied Foundations',
      direction: -1,
      items: [
        { title: 'AI Fluency: Frameworks & Foundations', file: 'AI-Fluency-Frameworks-and-Foundation.pdf', alt: 'ai-fluency-frameworks-and-foundations.pdf' },
        { title: 'AI Capabilities and Limitations', file: 'AI-Capabilities-and-Limitations.pdf', alt: 'ai-capabilities-and-limitations.pdf' },
        { title: 'AI Fluency for Builders', file: 'AI-Fluency-for-Builders.pdf', alt: 'ai-fluency-for-builders.pdf' },
        { title: 'AI Fluency for Small Businesses', file: 'AI-Fluency-for-Small-Businesses.pdf', alt: 'ai-fluency-for-small-businesses.pdf' },
        { title: 'AI Fluency for Students', file: 'AI-Fluency-for-students.pdf', alt: 'ai-fluency-for-students.pdf' },
        { title: 'AI Fluency for Educators', file: 'AI-Fluency-for-educators.pdf', alt: 'ai-fluency-for-educators.pdf' },
        { title: 'AI Fluency for Nonprofits', file: 'AI-Fluency-for-nonprofits.pdf', alt: 'ai-fluency-for-nonprofits.pdf' }
      ]
    },
    {
      group: 'Row 02 · Claude Code, Subagents & Workflows',
      direction: 1,
      items: [
        { title: 'Claude Code in Action', file: 'Claude-Code-in-Action.pdf', alt: 'claude-code-in-action.pdf' },
        { title: 'Claude Code 101', file: 'Claude-Code-101.pdf', alt: 'claude-code-101.pdf' },
        { title: 'Introduction to Agent Skills', file: 'Introduction-to-agent-skills.pdf', alt: 'introduction-to-agent-skills.pdf' },
        { title: 'Introduction to Subagents', file: 'Introduction-to-subagents.pdf', alt: 'introduction-to-subagents.pdf' },
        { title: 'Introduction to Claude Cowork', file: 'Introduction-to-Claude-Cowork.pdf', alt: 'introduction-to-claude-cowork.pdf' },
        { title: 'Claude 101', file: 'Claude-101.pdf', alt: 'claude-101.pdf' },
        { title: 'Teaching AI Fluency', file: 'Teaching-AI-Fluency.pdf', alt: 'teaching-ai-fluency.pdf' }
      ]
    }
  ],

  about: {
    facts: [
      'BBA candidate at IBA Karachi',
      'Six internships across oil and gas, banking, fertilizers, refining, FMCG and AI',
      'Self-directed equity trader on the PSX since 2025'
    ],
    belief: 'Busy people lose their evenings to repetitive work. I build systems that give those hours back, so there is time for the people they care about.',
    story: []
  }
};
