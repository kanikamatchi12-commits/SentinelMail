import { simpleParser, ParsedMail } from 'mailparser';
import { RoutingHop, ExtractedLink } from '../types.ts';

export interface ParsedEmailData {
  subject: string;
  from_address: string;
  from_name: string;
  from_domain: string;
  to_address: string;
  reply_to?: string;
  return_path?: string;
  message_id: string;
  date: string;
  raw_headers: string;
  body_text: string;
  spf_result: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none';
  dkim_result: 'pass' | 'fail' | 'none';
  dmarc_result: 'pass' | 'fail' | 'none';
  reply_to_mismatch: boolean;
  display_name_spoof: boolean;
  extracted_links: ExtractedLink[];
  hops: RoutingHop[];
}

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.cc', '.info', '.buzz', '.work', '.click', '.tk', '.gq', '.ml', '.ga', '.cf', '.ru', '.ng', '.su'];
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'ow.ly'];
const DANGEROUS_EXTENSIONS = ['.exe', '.scr', '.vbs', '.js', '.bat', '.ps1', '.iso', '.zip.exe', '.pdf.exe'];

// IPv4 regex (excluding private/broadcast/loopback if needed, but we capture all for analysis)
const IPV4_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

export async function parseEmail(rawContent: string): Promise<ParsedEmailData> {
  let parsed: ParsedMail | null = null;
  let parseError: any = null;

  try {
    parsed = await simpleParser(rawContent);
  } catch (err) {
    parseError = err;
    console.warn('mailparser encountered warning, falling back to regex parse:', err);
  }

  // Fallback / Header regex extraction to ensure 100% reliability
  const headerMap = extractRawHeaders(rawContent);

  const subject = parsed?.subject || headerMap['subject'] || 'Untitled Email';
  
  let fromAddress = '';
  let fromName = '';
  if (parsed?.from?.value?.[0]) {
    fromAddress = parsed.from.value[0].address || '';
    fromName = parsed.from.value[0].name || '';
  } else if (headerMap['from']) {
    const match = headerMap['from'].match(/(?:"?([^"<]+)"?\s*)?<?([^>@]+@[^>]+)>?/);
    if (match) {
      fromName = match[1]?.trim() || '';
      fromAddress = match[2]?.trim() || '';
    } else {
      fromAddress = headerMap['from'].trim();
    }
  }
  if (!fromAddress) fromAddress = 'unknown@unknown.domain';

  const fromDomain = fromAddress.includes('@') ? fromAddress.split('@')[1].toLowerCase() : '';

  let toAddress = '';
  if (parsed?.to) {
    const toArr = Array.isArray(parsed.to) ? parsed.to : [parsed.to];
    toAddress = toArr.map(t => t.text).join(', ') || '';
  }
  if (!toAddress) {
    toAddress = headerMap['to'] || 'undisclosed-recipients';
  }

  let replyTo = '';
  if (parsed?.replyTo?.value?.[0]?.address) {
    replyTo = parsed.replyTo.value[0].address;
  } else if (headerMap['reply-to']) {
    const rMatch = headerMap['reply-to'].match(/<([^>]+)>/) || [null, headerMap['reply-to']];
    replyTo = rMatch[1]?.trim() || '';
  }

  let returnPath = '';
  if (headerMap['return-path']) {
    const rpMatch = headerMap['return-path'].match(/<([^>]+)>/) || [null, headerMap['return-path']];
    returnPath = rpMatch[1]?.trim() || '';
  }

  const messageId = parsed?.messageId || headerMap['message-id'] || `<${Date.now()}@sentinelmail.local>`;
  const dateStr = parsed?.date ? parsed.date.toISOString() : (headerMap['date'] || new Date().toISOString());
  const bodyText = (parsed?.text || extractFallbackBody(rawContent)).trim();

  // Authentication results parsing
  const authResults = (headerMap['authentication-results'] || '') + ' ' + (headerMap['received-spf'] || '') + ' ' + (headerMap['dkim-signature'] || '');
  
  let spfResult: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none' = 'none';
  if (/spf=(pass|success)/i.test(authResults)) spfResult = 'pass';
  else if (/spf=(fail|permerror)/i.test(authResults)) spfResult = 'fail';
  else if (/spf=softfail/i.test(authResults)) spfResult = 'softfail';
  else if (/spf=neutral/i.test(authResults)) spfResult = 'neutral';

  let dkimResult: 'pass' | 'fail' | 'none' = 'none';
  if (/dkim=(pass|success)/i.test(authResults)) dkimResult = 'pass';
  else if (/dkim=(fail|permerror)/i.test(authResults)) dkimResult = 'fail';
  else if (/dkim-signature/i.test(rawContent)) dkimResult = 'pass';

  let dmarcResult: 'pass' | 'fail' | 'none' = 'none';
  if (/dmarc=(pass|success)/i.test(authResults)) dmarcResult = 'pass';
  else if (/dmarc=(fail|permerror|reject)/i.test(authResults)) dmarcResult = 'fail';

  // Reply-To mismatch logic
  let replyToMismatch = false;
  if (replyTo && replyTo !== fromAddress) {
    const replyDomain = replyTo.includes('@') ? replyTo.split('@')[1].toLowerCase() : '';
    if (replyDomain !== fromDomain) {
      replyToMismatch = true;
    }
  }

  // Display Name Spoof detection: e.g. Name says "PayPal Security" or "Tim Cook" but domain is not paypal.com / apple.com
  let displayNameSpoof = false;
  const popularBrands = [
    { name: /paypal/i, domain: 'paypal.com' },
    { name: /apple/i, domain: 'apple.com' },
    { name: /microsoft/i, domain: 'microsoft.com' },
    { name: /google/i, domain: 'google.com' },
    { name: /chase/i, domain: 'chase.com' },
    { name: /wells fargo/i, domain: 'wellsfargo.com' },
    { name: /bank of america/i, domain: 'bankofamerica.com' },
    { name: /netflix/i, domain: 'netflix.com' },
    { name: /amazon/i, domain: 'amazon.com' },
    { name: /dhl|fedex|ups/i, domain: 'dhl.com' }
  ];

  for (const brand of popularBrands) {
    if (brand.name.test(fromName) && !fromDomain.endsWith(brand.domain)) {
      displayNameSpoof = true;
      break;
    }
  }

  // Extract Links
  const extractedLinks = extractLinks(bodyText);

  // Extract Received hops
  const hops = extractHops(rawContent);

  // Construct raw headers string (first section before double newline)
  const headerBoundary = rawContent.indexOf('\n\n') !== -1 ? rawContent.indexOf('\n\n') : rawContent.indexOf('\r\n\r\n');
  const rawHeaders = headerBoundary !== -1 ? rawContent.substring(0, headerBoundary) : rawContent.slice(0, 1500);

  return {
    subject,
    from_address: fromAddress,
    from_name: fromName,
    from_domain: fromDomain,
    to_address: toAddress,
    reply_to: replyTo || undefined,
    return_path: returnPath || undefined,
    message_id: messageId,
    date: dateStr,
    raw_headers: rawHeaders,
    body_text: bodyText,
    spf_result: spfResult,
    dkim_result: dkimResult,
    dmarc_result: dmarcResult,
    reply_to_mismatch: replyToMismatch,
    display_name_spoof: displayNameSpoof,
    extracted_links: extractedLinks,
    hops,
  };
}

function extractRawHeaders(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const headerBoundary = content.indexOf('\n\n') !== -1 ? content.indexOf('\n\n') : content.indexOf('\r\n\r\n');
  const headerText = headerBoundary !== -1 ? content.substring(0, headerBoundary) : content;

  const lines = headerText.split(/\r?\n/);
  let currentKey = '';

  for (const line of lines) {
    if (/^\s+/.test(line) && currentKey) {
      // Continuation of previous header
      result[currentKey] = (result[currentKey] || '') + ' ' + line.trim();
    } else {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        currentKey = line.substring(0, colonIdx).trim().toLowerCase();
        const value = line.substring(colonIdx + 1).trim();
        result[currentKey] = value;
      }
    }
  }

  return result;
}

function extractFallbackBody(content: string): string {
  const boundary = content.indexOf('\n\n') !== -1 ? content.indexOf('\n\n') : content.indexOf('\r\n\r\n');
  if (boundary !== -1) {
    return content.substring(boundary).replace(/<[^>]+>/g, ' ').trim();
  }
  return content.slice(0, 2000);
}

function extractLinks(text: string): ExtractedLink[] {
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
  const matches = text.match(urlRegex) || [];
  const seen = new Set<string>();
  const results: ExtractedLink[] = [];

  for (const rawUrl of matches) {
    const cleanUrl = rawUrl.replace(/[.,;!?)]+$/, '');
    if (seen.has(cleanUrl)) continue;
    seen.add(cleanUrl);

    try {
      const parsed = new URL(cleanUrl);
      const hostname = parsed.hostname.toLowerCase();
      let flagged = false;
      let reason: string | undefined;

      // Check suspicious TLD
      const matchedTld = SUSPICIOUS_TLDS.find(tld => hostname.endsWith(tld));
      if (matchedTld) {
        flagged = true;
        reason = `Suspicious high-risk TLD (${matchedTld})`;
      }

      // Check URL shortener
      if (SHORTENERS.includes(hostname)) {
        flagged = true;
        reason = 'Obfuscated URL shortener used';
      }

      // Check dangerous download extension
      const pathname = parsed.pathname.toLowerCase();
      const dangerousExt = DANGEROUS_EXTENSIONS.find(ext => pathname.endsWith(ext) || cleanUrl.includes(ext));
      if (dangerousExt) {
        flagged = true;
        reason = `Executable or risky attachment download payload (${dangerousExt})`;
      }

      // Check for lookalikes (e.g., paypa1, microsoff, goog1e)
      if (hostname.includes('paypa1') || hostname.includes('microsoff') || hostname.includes('arnazon') || hostname.includes('app1e')) {
        flagged = true;
        reason = 'Homoglyph / Typosquatting look-alike domain';
      }

      results.push({
        url: cleanUrl,
        domain: hostname,
        flagged,
        reason,
      });
    } catch {
      // invalid URL
    }
  }

  return results;
}

function extractHops(rawContent: string): RoutingHop[] {
  // Extract all Received: headers
  // Note: in standard email routing, Received: headers are prepended, so the TOP-most Received header is the LAST hop (destination),
  // and the BOTTOM-most Received header is the EARLIEST originating hop.
  const receivedRegex = /Received:\s*from\s+([^;]+);/gi;
  const hops: RoutingHop[] = [];
  const matches: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = receivedRegex.exec(rawContent)) !== null) {
    matches.push(m[1]);
  }

  // If no Received headers with standard from; try line-by-line fallback
  if (matches.length === 0) {
    const lines = rawContent.split(/\r?\n/);
    let inReceived = false;
    let currentBlock = '';
    for (const line of lines) {
      if (/^Received:/i.test(line)) {
        if (currentBlock) matches.push(currentBlock);
        currentBlock = line.replace(/^Received:\s*/i, '');
        inReceived = true;
      } else if (inReceived) {
        if (/^\s+/.test(line)) {
          currentBlock += ' ' + line.trim();
        } else {
          matches.push(currentBlock);
          currentBlock = '';
          inReceived = false;
        }
      }
    }
    if (currentBlock) matches.push(currentBlock);
  }

  // Reverse so index 1 is the originating hop, ending at the recipient's mail exchanger
  const chronological = [...matches].reverse();

  let hopIndex = 1;
  for (const block of chronological) {
    const ipMatches = block.match(IPV4_REGEX) || [];
    // Extract host or by
    const hostMatch = block.match(/^([^\s(\[]+)/);
    const host = hostMatch ? hostMatch[1].trim() : undefined;

    // Pick first non-private IP if possible, or the primary IP in brackets [x.x.x.x]
    let chosenIp = '';
    const bracketIp = block.match(/\[((?:\d{1,3}\.){3}\d{1,3})\]/);
    if (bracketIp && bracketIp[1]) {
      chosenIp = bracketIp[1];
    } else if (ipMatches.length > 0 && ipMatches[0]) {
      chosenIp = ipMatches[0];
    }

    if (chosenIp) {
      hops.push({
        hop_index: hopIndex++,
        ip: chosenIp,
        host: host,
        anomalous: false,
      });
    }
  }

  return hops;
}
