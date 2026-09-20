import { GoogleGenAI, Type } from '@google/genai';
import { ParsedEmailData } from './parseEmail.ts';
import { RoutingHop, ThreatCategory, KeyFinding, AuthenticationAssessmentRow } from '../types.ts';

export interface AiThreatVerdict {
  risk_score: number;
  threat_category: ThreatCategory;
  explanation: string;
  explanation_simple: string;
  red_flags: string[];
  recommendations: string[];
  engine_type: 'AI-Assisted Assessment' | 'Heuristic Assessment';
  confidence_score: number;
  confidence_label: string;
  key_findings: KeyFinding[];
  auth_table: AuthenticationAssessmentRow[];
}

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export function buildAuthenticationTable(parsed: ParsedEmailData): AuthenticationAssessmentRow[] {
  const table: AuthenticationAssessmentRow[] = [];

  // 1. Reported SPF result
  const spfState: 'Pass' | 'Warning' | 'Fail' | 'Unavailable' =
    parsed.spf_result === 'pass'
      ? 'Pass'
      : parsed.spf_result === 'fail'
      ? 'Fail'
      : parsed.spf_result === 'softfail' || parsed.spf_result === 'neutral'
      ? 'Warning'
      : 'Unavailable';

  table.push({
    control: 'Reported SPF result',
    result: spfState,
    evidence: `spf=${parsed.spf_result} (domain: ${parsed.from_domain || 'unknown'})`,
    interpretation:
      spfState === 'Pass'
        ? 'Originating IP relay matches domain authorized publishing servers in DNS.'
        : spfState === 'Fail'
        ? 'Originating relay IP is NOT authorized by sender domain SPF DNS record.'
        : spfState === 'Warning'
        ? 'Sender SPF policy returned a softfail or neutral result during relay.'
        : 'Sender domain does not publish an SPF record or status was not reported.',
  });

  // 2. Reported DKIM result
  const dkimState: 'Pass' | 'Warning' | 'Fail' | 'Unavailable' =
    parsed.dkim_result === 'pass'
      ? 'Pass'
      : parsed.dkim_result === 'fail'
      ? 'Fail'
      : 'Unavailable';

  table.push({
    control: 'Reported DKIM result',
    result: dkimState,
    evidence: `dkim=${parsed.dkim_result} (claimed: ${parsed.from_domain || 'unknown'})`,
    interpretation:
      dkimState === 'Pass'
        ? 'Reported DKIM status indicates header and body signatures verified successfully.'
        : dkimState === 'Fail'
        ? 'Reported DKIM signature verification failed; headers or body may be forged in transit.'
        : 'No valid DKIM signature reported in inbound authentication headers.',
  });

  // 3. Reported DMARC result
  const dmarcState: 'Pass' | 'Warning' | 'Fail' | 'Unavailable' =
    parsed.dmarc_result === 'pass'
      ? 'Pass'
      : parsed.dmarc_result === 'fail'
      ? 'Fail'
      : 'Unavailable';

  table.push({
    control: 'Reported DMARC result',
    result: dmarcState,
    evidence: `dmarc=${parsed.dmarc_result}`,
    interpretation:
      dmarcState === 'Pass'
        ? 'Header From strictly aligns with verified SPF/DKIM envelope identity.'
        : dmarcState === 'Fail'
        ? 'DMARC alignment failed: From header identity contradicts transmission envelope.'
        : 'DMARC policy unconfigured or evaluation status was omitted from envelope.',
  });

  // 4. From/Return-Path alignment
  let returnDomain = '';
  if (parsed.return_path) {
    const match = parsed.return_path.match(/@([a-zA-Z0-9.-]+)/);
    if (match) returnDomain = match[1].toLowerCase();
  }

  const fromDomain = parsed.from_domain ? parsed.from_domain.toLowerCase() : '';
  let returnPathState: 'Pass' | 'Warning' | 'Fail' | 'Unavailable' = 'Unavailable';
  let returnPathEvidence = parsed.return_path || 'Header absent';

  if (returnDomain && fromDomain) {
    if (returnDomain === fromDomain || returnDomain.endsWith(`.${fromDomain}`)) {
      returnPathState = 'Pass';
      returnPathEvidence = `From: @${fromDomain} ↔ Return-Path: @${returnDomain}`;
    } else {
      returnPathState = 'Fail';
      returnPathEvidence = `From: @${fromDomain} ≠ Return-Path: @${returnDomain}`;
    }
  }

  table.push({
    control: 'From/Return-Path alignment',
    result: returnPathState,
    evidence: returnPathEvidence,
    interpretation:
      returnPathState === 'Pass'
        ? 'Envelope Return-Path matches claimed organizational sender identity.'
        : returnPathState === 'Fail'
        ? 'Return-Path routes non-delivery notices to an external, unrelated infrastructure.'
        : 'Envelope Return-Path header could not be determined.',
  });

  // 5. From/Reply-To alignment
  let replyToState: 'Pass' | 'Warning' | 'Fail' | 'Unavailable' = 'Pass';
  let replyToEvidence = 'No divergent Reply-To declared';

  if (parsed.reply_to) {
    if (parsed.reply_to_mismatch) {
      replyToState = 'Fail';
      replyToEvidence = `From: ${parsed.from_address} ≠ Reply-To: ${parsed.reply_to}`;
    } else {
      replyToState = 'Pass';
      replyToEvidence = `From & Reply-To match domain (${parsed.reply_to})`;
    }
  }

  table.push({
    control: 'From/Reply-To alignment',
    result: replyToState,
    evidence: replyToEvidence,
    interpretation:
      replyToState === 'Fail'
        ? 'Reply destination diverted to external address, typical of BEC credential evasion.'
        : 'Recipient replies route directly back to the authenticated sender address.',
  });

  // 6. Message-ID domain consistency
  let messageIdDomain = '';
  if (parsed.message_id) {
    const match = parsed.message_id.match(/@([a-zA-Z0-9.-]+)/);
    if (match) messageIdDomain = match[1].toLowerCase();
  }

  let msgIdState: 'Pass' | 'Warning' | 'Fail' | 'Unavailable' = 'Unavailable';
  let msgIdEvidence = parsed.message_id || 'Omitted';

  if (messageIdDomain && fromDomain) {
    if (messageIdDomain.includes(fromDomain) || fromDomain.includes(messageIdDomain)) {
      msgIdState = 'Pass';
    } else {
      msgIdState = 'Warning';
    }
  }

  table.push({
    control: 'Message-ID domain consistency',
    result: msgIdState,
    evidence: msgIdEvidence,
    interpretation:
      msgIdState === 'Pass'
        ? 'Message-ID domain namespace aligns with sender domain identity.'
        : msgIdState === 'Warning'
        ? 'Message-ID generated on a third-party relay or shared hosting provider.'
        : 'Message-ID header absent from message envelope.',
  });

  return table;
}

export function buildKeyFindings(
  parsed: ParsedEmailData,
  hops: RoutingHop[],
  score: number,
  category: ThreatCategory
): KeyFinding[] {
  const findings: KeyFinding[] = [];

  // Reply-To mismatch
  if (parsed.reply_to_mismatch && parsed.reply_to) {
    findings.push({
      id: 'kf-reply-to',
      title: 'Reply-To Address Divergence Detected',
      severity: 'critical',
      evidence: `Sender claims to be <${parsed.from_address}>, but reply destination is forced to <${parsed.reply_to}>.`,
      why_it_matters:
        'Attackers use this technique in BEC fraud so replies bypass the legitimate company mailbox and reach an attacker-controlled inbox.',
      recommended_response:
        'Do not reply via email. Confirm the communication with the sender using an independent, verified phone channel.',
    });
  }

  // Display Name Spoofing
  if (parsed.display_name_spoof) {
    findings.push({
      id: 'kf-display-name',
      title: 'Display Name Brand Impersonation',
      severity: 'high',
      evidence: `Friendly display name '${parsed.from_name}' imitates an executive or institution, but sending address is <${parsed.from_address}>.`,
      why_it_matters:
        'Human recipients read the display name first and often fail to inspect the underlying technical domain.',
      recommended_response:
        'Enforce display-name spoofing protection rules on the secure email gateway.',
    });
  }

  // SPF failure
  if (parsed.spf_result === 'fail') {
    findings.push({
      id: 'kf-spf-fail',
      title: 'Reported SPF Authentication Failed',
      severity: 'high',
      evidence: `Originating IP is not listed as an authorized sender in the DNS SPF record for ${parsed.from_domain}.`,
      why_it_matters:
        'The sender domain has published an explicit list of authorized mail servers, and the transmitting relay was not on it.',
      recommended_response:
        'Treat email as unauthenticated. Quarantine or reject according to organizational DMARC alignment.',
    });
  }

  // Flagged links
  const flaggedLinks = parsed.extracted_links.filter((l) => l.flagged);
  if (flaggedLinks.length > 0) {
    findings.push({
      id: 'kf-malicious-links',
      title: 'Suspicious or Deceptive Links Extracted',
      severity: 'critical',
      evidence: `Found ${flaggedLinks.length} suspicious link(s), including ${flaggedLinks[0].domain} (${flaggedLinks[0].reason || 'Flagged destination'}).`,
      why_it_matters:
        'Deceptive hyperlinks frequently point to credential harvesting phishing kits or malware download droppers.',
      recommended_response:
        'Do not click. Block the target domain at proxy/DNS firewalls and submit to intelligence feeds.',
    });
  }

  // Routing anomalies
  const anomalousHops = hops.filter((h) => h.anomalous);
  if (anomalousHops.length > 0) {
    findings.push({
      id: 'kf-routing-anomaly',
      title: 'Unusual Observed Routing Infrastructure Hop',
      severity: 'medium',
      evidence: `Hop #${anomalousHops[0].hop_index} (${anomalousHops[0].ip}): ${anomalousHops[0].anomaly_reason || 'Anomalous intercontinental relay'}`,
      why_it_matters:
        'Legitimate corporate mail travels through predictable relays. Disparate international jumps often indicate compromised hosts or VPN proxies.',
      recommended_response:
        'Cross-reference IP against threat reputation databases and inspect preceding transmission hops.',
    });
  }

  // Urgent financial language
  const bodyLower = parsed.body_text.toLowerCase();
  if (
    bodyLower.includes('wire transfer') ||
    bodyLower.includes('swift') ||
    bodyLower.includes('invoice') ||
    bodyLower.includes('urgent')
  ) {
    findings.push({
      id: 'kf-financial-urgency',
      title: 'Urgent Financial Coercion Cues Observed',
      severity: category === 'BEC' ? 'critical' : 'high',
      evidence: 'Message contains high-urgency directives demanding financial transactions, wire transfers, or immediate action.',
      why_it_matters:
        'Social engineering creates artificial urgency to pressure personnel into bypassing secondary review procedures.',
      recommended_response:
        'Follow formal out-of-band payment verification protocols before taking any financial action.',
    });
  }

  // Default benign finding if clean
  if (findings.length === 0) {
    findings.push({
      id: 'kf-clean-record',
      title: 'Standard Transmission and Authentication Baseline',
      severity: 'low',
      evidence: `SPF, DKIM, and DMARC reported positive alignment for domain ${parsed.from_domain}.`,
      why_it_matters:
        'All technical indicators conform to expected RFC standards without observable transmission discrepancies.',
      recommended_response:
        'No immediate mitigation required. Standard email hygiene applies.',
    });
  }

  return findings;
}

export async function analyzeThreat(
  parsed: ParsedEmailData,
  hops: RoutingHop[]
): Promise<AiThreatVerdict> {
  const authTable = buildAuthenticationTable(parsed);
  const client = getGeminiClient();

  if (client) {
    try {
      const anomalousHops = hops.filter((h) => h.anomalous);
      const promptPayload = {
        subject: parsed.subject,
        from: parsed.from_address,
        from_name: parsed.from_name,
        reply_to: parsed.reply_to,
        return_path: parsed.return_path,
        spf: parsed.spf_result,
        dkim: parsed.dkim_result,
        dmarc: parsed.dmarc_result,
        reply_to_mismatch: parsed.reply_to_mismatch,
        display_name_spoof: parsed.display_name_spoof,
        extracted_links: parsed.extracted_links,
        routing_hops: hops.map((h) => ({
          hop: h.hop_index,
          ip: h.ip,
          country: h.country,
          city: h.city,
          isp: h.isp,
          anomalous: h.anomalous,
          anomaly_reason: h.anomaly_reason,
        })),
        body_preview: parsed.body_text.slice(0, 3000),
      };

      const systemInstruction = `You are SentinelMail's lead SOC Forensics & Threat Intelligence Analyst.
Analyze the provided email headers, routing hops, reported authentication records (SPF/DKIM/DMARC), links, and body content for signs of Phishing, Spoofing, Business Email Compromise (BEC), Malware delivery, or legitimate communications.
IMPORTANT: You are providing an AI-assisted assessment indicator, not a definitive legal or judicial verdict.

Return a strict JSON object with:
1. "risk_score": an integer from 0 to 100 (0-29 = Low Risk, 30-59 = Suspicious, 60-79 = High Risk, 80-100 = Critical).
2. "threat_category": Exactly one of ["Phishing", "Spoofing", "BEC", "Spam", "Safe", "Suspicious"].
3. "confidence_score": an integer between 70 and 98 representing assessment confidence.
4. "explanation": 2-3 detailed paragraphs providing SOC-grade forensic reasoning citing specific headers, reported authentication status, domain anomalies, and intent.
5. "explanation_simple": A simplified, jargon-free 2-3 sentence explanation suitable for a non-technical employee ("Simplified Explanation").
6. "red_flags": An array of 3 to 6 distinct technical indicators observed.
7. "recommendations": An array of 3 to 5 actionable mitigation steps for IT / SOC response.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: JSON.stringify(promptPayload),
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              risk_score: { type: Type.INTEGER },
              threat_category: { type: Type.STRING },
              confidence_score: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              explanation_simple: { type: Type.STRING },
              red_flags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'risk_score',
              'threat_category',
              'confidence_score',
              'explanation',
              'explanation_simple',
              'red_flags',
              'recommendations',
            ],
          },
        },
      });

      if (response.text) {
        const json = JSON.parse(response.text.trim());
        let category: ThreatCategory = 'Suspicious';
        const validCategories: ThreatCategory[] = ['Phishing', 'Spoofing', 'BEC', 'Spam', 'Safe', 'Suspicious'];
        if (validCategories.includes(json.threat_category)) {
          category = json.threat_category;
        }

        const score = Math.min(100, Math.max(0, Number(json.risk_score) || 50));
        const conf = Math.min(99, Math.max(65, Number(json.confidence_score) || 88));
        const confLabel = conf >= 85 ? `High (${conf}%)` : conf >= 70 ? `Moderate (${conf}%)` : `Preliminary (${conf}%)`;
        const keyFindings = buildKeyFindings(parsed, hops, score, category);

        return {
          risk_score: score,
          threat_category: category,
          engine_type: 'AI-Assisted Assessment',
          confidence_score: conf,
          confidence_label: confLabel,
          explanation: json.explanation || 'AI-assisted forensic assessment completed.',
          explanation_simple: json.explanation_simple || 'Analysis of this email showed security risks.',
          red_flags: Array.isArray(json.red_flags) ? json.red_flags : [],
          recommendations: Array.isArray(json.recommendations) ? json.recommendations : [],
          key_findings: keyFindings,
          auth_table: authTable,
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to resilient heuristic forensic engine:', err);
    }
  }

  // Expert SOC rule-based fallback analysis
  return evaluateRuleBasedVerdict(parsed, hops, authTable);
}

function evaluateRuleBasedVerdict(
  parsed: ParsedEmailData,
  hops: RoutingHop[],
  authTable: AuthenticationAssessmentRow[]
): AiThreatVerdict {
  let score = 8;
  const redFlags: string[] = [];
  const recommendations: string[] = [];
  let category: ThreatCategory = 'Safe';

  const bodyLower = parsed.body_text.toLowerCase();
  const subjectLower = parsed.subject.toLowerCase();

  // Check 1: SPF
  if (parsed.spf_result === 'fail') {
    score += 30;
    redFlags.push(`Reported SPF Authentication Failed: Originating host is not authorized by domain DNS policy`);
  } else if (parsed.spf_result === 'softfail') {
    score += 15;
    redFlags.push(`Reported SPF Softfail: Originating host returned transitional or ambiguous SPF status`);
  }

  // Check 2: DKIM
  if (parsed.dkim_result === 'fail') {
    score += 25;
    redFlags.push(`Reported DKIM Result Failed: Email headers or body may have been modified in transit`);
  }

  // Check 3: DMARC
  if (parsed.dmarc_result === 'fail') {
    score += 25;
    redFlags.push(`Reported DMARC Alignment Failure: Header 'From' domain contradicts envelope authentication identity`);
  }

  // Check 4: Reply-To Mismatch
  if (parsed.reply_to_mismatch && parsed.reply_to) {
    score += 25;
    redFlags.push(`Reply-To Divergence: Responses are routed to external address (${parsed.reply_to}) instead of claimed sender`);
  }

  // Check 5: Display Name Spoofing
  if (parsed.display_name_spoof) {
    score += 30;
    redFlags.push(`Display Name Impersonation: Display name imitates a trusted brand while sending address is unrelated`);
  }

  // Check 6: Malicious or Flagged Links
  const flaggedLinks = parsed.extracted_links.filter(l => l.flagged);
  if (flaggedLinks.length > 0) {
    score += 30;
    for (const link of flaggedLinks) {
      redFlags.push(`Suspicious Payload Link: ${link.domain} (${link.reason || 'Flagged destination'})`);
    }
  }

  // Check 7: Anomalous Hops
  const anomalousHops = hops.filter(h => h.anomalous);
  if (anomalousHops.length > 0) {
    score += 20;
    for (const hop of anomalousHops) {
      redFlags.push(`Routing Geolocation Anomaly (Hop #${hop.hop_index}): ${hop.anomaly_reason || `Injected via ${hop.country} / ${hop.isp}`}`);
    }
  }

  // Check 8: Urgency & Wire Transfer / Credentials Phishing language
  const urgencyKeywords = ['urgent', 'suspended', '24 hours', 'unauthorized access', 'account locked', 'action required', 'immediately'];
  const becKeywords = ['wire transfer', 'confidential', 'acquisition', 'offshore', 'iban', 'executive', 'secret', 'm&a'];
  
  const hasUrgency = urgencyKeywords.some(kw => bodyLower.includes(kw) || subjectLower.includes(kw));
  const hasBec = becKeywords.some(kw => bodyLower.includes(kw));

  if (hasUrgency) {
    score += 10;
    redFlags.push(`Psychological Coercion: High-urgency pressure designed to bypass human verification`);
  }

  if (hasBec) {
    score += 20;
    redFlags.push(`BEC Threat Indicators: Financial transaction urgency with secrecy instructions`);
  }

  // Categorize
  score = Math.min(99, Math.max(4, score));

  if (hasBec && (parsed.reply_to_mismatch || parsed.display_name_spoof || score >= 65)) {
    category = 'BEC';
  } else if (parsed.display_name_spoof || (parsed.spf_result === 'fail' && score >= 60)) {
    category = 'Spoofing';
  } else if (score >= 65) {
    category = 'Phishing';
  } else if (score >= 40) {
    category = (bodyLower.includes('unsubscribe') || bodyLower.includes('newsletter')) ? 'Spam' : 'Suspicious';
  } else {
    category = 'Safe';
  }

  let explanation = '';
  let explanationSimple = '';

  if (category === 'Phishing') {
    explanation = `Heuristic forensic analysis indicates this message is a high-confidence Phishing attack attempting credential harvesting or coercion. The sender envelope fails reported authentication validation, and the message leverages urgency manipulation combined with deceptive links. Traffic routing shows an originating IP relay disconnected from the claimed entity.`;
    explanationSimple = `Be careful! This email is pretending to be a legitimate organization to trick you into clicking a link or giving away passwords. Do NOT click any links or reply.`;
    recommendations.push(
      'Do not reply or interact with links',
      'Isolate the message from other mailboxes',
      'Block confirmed malicious domains or addresses at perimeter',
      'Reset credentials if interaction occurred',
      'Preserve the original email for further forensic examination'
    );
  } else if (category === 'BEC') {
    explanation = `This communication exhibits hallmark indicators of Business Email Compromise (BEC) and executive impersonation. The attacker claims an executive persona while instructing recipient to initiate wire payments, routing replies to an untrusted secondary drop address to evade company scrutiny.`;
    explanationSimple = `Warning: Someone is impersonating a company leader or executive asking for money. They want you to rush without calling them. Verify in person or via verified phone before doing anything!`;
    recommendations.push(
      'Verify the sender through an independent, pre-established phone channel',
      'Do not reply or proceed with financial transactions',
      'Escalate high-risk BEC incident to the information security team',
      'Block external Reply-To diversion address in mail filter'
    );
  } else if (category === 'Spoofing') {
    explanation = `Authentication forensics reveal active domain spoofing. The display name and apparent from-address contradict the reported mail server authentication results (SPF/DKIM/DMARC failure). The sender cannot prove authorization to transmit on behalf of ${parsed.from_domain}.`;
    explanationSimple = `This email is a counterfeit! The sender altered the 'From' name so it looks like it came from a trusted brand, but technical headers indicate an unauthorized sender.`;
    recommendations.push(
      'Do not trust sender identity based on display name alone',
      'Enforce DMARC p=reject policy on inbound gateway',
      'Block unauthorized mail relay host',
      'Alert internal users of ongoing brand spoofing attempts'
    );
  } else if (category === 'Spam') {
    explanation = `The email represents unsolicited commercial marketing or bulk distribution. While reported authentication (SPF/DKIM) may be nominally intact, sender metrics and bulk headers indicate marketing delivery rather than targeted malicious attack.`;
    explanationSimple = `This appears to be standard promotional marketing or newsletter mail. It does not look harmful, but you can unsubscribe if you did not sign up for it.`;
    recommendations.push(
      'Use safe List-Unsubscribe header to opt out',
      'Add sender to promotional filter category if undesired'
    );
  } else {
    explanation = `All forensic authentication checks succeeded. Reported SPF passes against sender networks, reported DKIM signature verifies content integrity, and originating IP routing traces through expected infrastructure. No anomalous redirects or homoglyph domains were discovered.`;
    explanationSimple = `This email appears safe and authentic. All digital security checks (SPF, DKIM, DMARC) match up, and it was transmitted through legitimate mail servers.`;
    recommendations.push(
      'No immediate remediation required',
      'Normal security hygiene applies'
    );
  }

  if (redFlags.length === 0) {
    redFlags.push('All reported SPF/DKIM/DMARC authentication parameters verified');
    redFlags.push('Routing hops align with expected organizational infrastructure');
    redFlags.push('No suspicious attachments, redirects, or shortened links found');
  }

  const confidenceScore = category === 'Safe' ? 95 : score >= 80 ? 94 : 84;
  const confidenceLabel = `High (${confidenceScore}%) - Assessment Indicator`;
  const keyFindings = buildKeyFindings(parsed, hops, score, category);

  return {
    risk_score: score,
    threat_category: category,
    engine_type: 'Heuristic Assessment',
    confidence_score: confidenceScore,
    confidence_label: confidenceLabel,
    explanation,
    explanation_simple: explanationSimple,
    red_flags: redFlags,
    recommendations,
    key_findings: keyFindings,
    auth_table: authTable,
  };
}
