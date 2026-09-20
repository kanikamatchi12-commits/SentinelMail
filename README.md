<div align="center">

# 🛡️ SentinelMail

### AI-Powered Email Threat Detection, GeoLocation and Forensic Intelligence Platform

**Detect the threat. Trace the route. Preserve the evidence.**

Smart India Hackathon 2026 Prototype

</div>

---

## Overview

SentinelMail is an AI-assisted email-security and forensic intelligence platform designed to help analysts examine suspicious emails quickly and systematically.

The platform accepts raw email content, complete email headers or `.eml` files and converts the submitted evidence into an explainable investigation report. It combines deterministic security checks, AI-assisted threat interpretation, approximate mail-routing geolocation and forensic evidence preservation.

SentinelMail is designed for:

* Security Operations Centre analysts
* Incident-response teams
* Email administrators
* Cybercrime investigators
* Small organizations without dedicated forensic tools
* Cybersecurity training and awareness

---

## Problem Statement

**AI-Powered Email Threat Detection, GeoLocation and Forensic Intelligence Platform**

Phishing, email spoofing and Business Email Compromise attacks often conceal malicious signals inside raw email headers, authentication records, sender relationships, message content, URLs and routing metadata.

Manual inspection is time-consuming and requires technical expertise. SentinelMail organizes these scattered indicators into one structured, explainable investigation workflow.

---

## Proposed Solution

SentinelMail processes submitted email evidence through the following pipeline:

```text
Email Evidence
      ↓
Header and Content Extraction
      ↓
Sender and Authentication Analysis
      ↓
AI-Assisted Threat Detection
      ↓
Routing-Hop GeoLocation
      ↓
Forensic Evidence Correlation
      ↓
Threat Alert and Final Report
```

The platform helps answer:

* Is the email potentially malicious?
* What evidence contributed to the verdict?
* Are the sender addresses and domains consistent?
* What do the reported SPF, DKIM and DMARC results indicate?
* Which public mail-routing locations were observed?
* Are there suspicious routing or geographic inconsistencies?
* What action should the analyst take next?

---

## Core Features

### Email Evidence Intake

* Paste raw email content and headers
* Upload `.eml` and supported text evidence
* Validate uploaded evidence
* Load clearly labelled demonstration samples
* Preserve stable case references

### AI-Assisted Threat Detection

* Phishing detection
* Email spoofing detection
* Business Email Compromise identification
* Social-engineering and urgency analysis
* Credential-request detection
* Financial-pressure detection
* Suspicious link and domain analysis
* Explainable risk assessment

### Sender Identity Analysis

SentinelMail compares:

* From address
* Reply-To address
* Return-Path
* Message-ID domain
* Routing or originating domain

Address and domain mismatches are highlighted for analyst review.

### Authentication Assessment

The platform extracts and interprets:

* Reported SPF result
* Reported DKIM result
* Reported DMARC result
* From and Reply-To alignment
* From and Return-Path alignment
* Message-ID consistency

Missing authentication evidence is reported as unavailable rather than automatically treated as a failure.

### GeoTrace

* Extracts public IP addresses from Received headers
* Reconstructs observable email-routing hops
* Provides approximate city and country information
* Displays ISP or network organization when available
* Visualizes the route on an interactive map
* Detects possible geographic inconsistencies
* Assigns a location-confidence indicator
* Excludes private, loopback, reserved and invalid addresses

> **Important:** GeoTrace displays approximate locations associated with observable public email-routing infrastructure. Relays, cloud providers, forwarding services, VPNs, proxies and forged headers may obscure the true source. Results do not prove the sender’s identity or physical location.

### Forensic Intelligence

* Stable case ID
* Evidence filename and metadata
* SHA-256 evidence fingerprint
* Extracted email headers
* Message-ID preservation
* Routing-hop timeline
* Link and attachment metadata
* Analyst review status
* Audit-trail records
* PDF and JSON report export

### Threat Alerts

Analysts can generate structured threat alerts containing:

* Case reference
* Severity
* Threat category
* Risk score
* Primary indicators
* Authentication failures
* GeoLocation observations
* Recommended action
* Analyst notes

External alert delivery is presented as a prototype simulation unless a real notification service is configured.

### Case Management

* Triage Inbox
* Case Files
* Saved analysis results
* Search and filtering
* Review-status management
* Case reopening without reanalysis
* Threat comparison
* Threat Insights dashboard

---

## Supported Threat Categories

* Phishing
* Spoofing
* Business Email Compromise
* Malware-delivery indicator
* Spam
* Suspicious
* Likely Safe
* Inconclusive

SentinelMail does not classify insufficient evidence as automatically safe.

---

## Risk Classification

|  Score | Classification |
| -----: | -------------- |
|   0–29 | Low Risk       |
|  30–49 | Needs Review   |
|  50–69 | Suspicious     |
|  70–84 | High Risk      |
| 85–100 | Critical       |

The risk score is accompanied by the detected evidence and its contribution to the assessment.

---

## Investigation Workflow

The application provides a guided page-by-page investigation:

1. Welcome
2. Submit Email Evidence
3. Processing
4. Threat Analysis
5. GeoLocation Analysis
6. Forensic Evidence Review
7. Threat Alert
8. Final Intelligence Report

Previously saved cases open directly without rerunning the analysis or changing their original evidence fingerprint.

---

## Demonstration Scenarios

The repository includes synthetic sample emails for demonstration:

* Credential-phishing attempt
* CEO/BEC wire-transfer fraud
* Suspicious invoice
* Legitimate marketing newsletter
* Legitimate security notification

All sample results must remain visibly labelled as demonstration data.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Recharts
* Leaflet / React-Leaflet
* Framer Motion
* Lucide icons

### Backend

* Node.js
* Express
* TypeScript
* Mail parsing and forensic extraction services
* JSON-based prototype storage

### Intelligence Components

* Gemini-powered AI-assisted interpretation
* Deterministic email-security checks
* IP geolocation service
* Heuristic fallback assessment

---

## Project Structure

```text
SentinelMail/
├── server/
│   ├── data/
│   ├── sample-emails/
│   ├── services/
│   │   ├── aiAnalyze.ts
│   │   ├── geolocate.ts
│   │   └── parseEmail.ts
│   ├── store.ts
│   └── types.ts
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Local Installation

### Prerequisites

Install:

* Node.js 20 or later
* npm or Bun
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/kanikamatchi12-commits/SentinelMail.git
cd SentinelMail
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Alternatively, using Bun:

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Copy the variables from `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

Never commit the `.env` file or expose a real API key in the repository.

### 4. Start the Application

Using npm:

```bash
npm run dev
```

Alternatively, if the project is configured for Bun:

```bash
bun run dev
```

Open the local URL displayed in the terminal.

---

## Responsible Use and Limitations

SentinelMail is a hackathon prototype and analyst-assistance platform.

Important limitations:

* AI assessments require human validation.
* IP geolocation is approximate.
* Email headers can be incomplete, forwarded or forged.
* Reported authentication results may not represent independent cryptographic verification.
* File metadata alone does not prove that an attachment contains malware.
* The platform does not replace a secure email gateway.
* The audit trail is not presented as a legally certified chain-of-custody system.
* Confidential email evidence should only be processed with proper authorization.

---

## Privacy and Security

* API credentials are stored outside the source code.
* `.env` is excluded through `.gitignore`.
* Suspicious URLs should remain defanged and non-clickable.
* Raw email HTML must be sanitized before display.
* Private and reserved IP addresses are excluded from public geolocation.
* Failed external lookups should display an unavailable state instead of fabricated data.

---

## Future Enhancements

* Live domain-reputation integrations
* Cryptographic DKIM verification
* DNS-based SPF and DMARC validation
* Malware sandbox integration
* Real SOC alert-delivery integrations
* Role-based production authentication
* Encrypted evidence storage
* Campaign-correlation models
* Multilingual threat explanations
* Enterprise email-gateway integration

---

## SIH Project Information

| Field                   | Details                                                                           |
| ----------------------- | --------------------------------------------------------------------------------- |
| Event                   | Smart India Hackathon 2026                                                        |
| Problem Statement       | AI-Powered Email Threat Detection, GeoLocation and Forensic Intelligence Platform |
| Problem Statement ID    | SIH26106                                                                   |

| Theme                   | Blockchain and cyber security                                              |
| Team Name               | Cosmic Coders                                                                     |
| College                 | Jaya Sakthi Engineering College                                                                  |
| Team Leader             | Kanimozhi leader                                                                   |
| Team Members            | Abhinaya, Madhumitha, Gunavalli, Bhuvaneshwari, Aruna                                                                  |


---

## Contributors

Developed by the SentinelMail team for Smart India Hackathon 2026.

---

## Disclaimer

SentinelMail provides AI-assisted and heuristic security indicators for investigation and educational use. Its results should be reviewed by a qualified analyst before taking operational, legal or disciplinary action.
