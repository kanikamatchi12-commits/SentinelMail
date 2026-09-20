import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Info,
  AlertCircle,
  Fingerprint,
  Globe2,
  Trash2,
  RotateCcw,
  FlaskConical,
  LogOut,
} from 'lucide-react';
import { ScanningAnimation } from '../components/ScanningAnimation.tsx';
import { SampleEmailFixture, EmailAnalysis } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useDemo } from '../context/DemoContext.tsx';

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoInvestigation, setIsDemoInvestigation, setDemoModalOpen, exitDemoInvestigation } = useDemo();

  // Tab 1: Paste Email, Tab 2: Upload Email, Tab 3: Demonstration Samples
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'samples'>('paste');
  const [caseTitle, setCaseTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Scanning & error state
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Demo samples
  const [samples, setSamples] = useState<SampleEmailFixture[]>([]);
  const [selectedSample, setSelectedSample] = useState<SampleEmailFixture | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data: SampleEmailFixture[]) => {
        if (Array.isArray(data)) {
          setSamples(data);
          if (data.length > 0) {
            setSelectedSample(data[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const sanitizeFilename = (name: string): string => {
    const clean = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '.');
    return clean.slice(0, 100) || 'evidence.eml';
  };

  const processSelectedFile = (file: File) => {
    setErrorMsg(null);
    setScanError(null);

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Selected file exceeds maximum allowable threshold of 10MB.');
      return;
    }

    const validExtensions = ['.eml', '.txt', '.msg', '.rfc822'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt && file.type && !file.type.includes('text') && !file.type.includes('message')) {
      setErrorMsg('Invalid file format. Please upload standard .eml or RFC-5322 header dump text files.');
      return;
    }

    setSelectedFile(file);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || content.trim().length === 0) {
        setErrorMsg('The selected file is empty. Please provide non-empty email evidence.');
        setSelectedFile(null);
        setUploadedFileContent('');
        return;
      }
      setUploadedFileContent(content);
      if (!caseTitle) {
        setCaseTitle(`Evidence Intake: ${file.name}`);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file from local disk.');
      setSelectedFile(null);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveUploadedFile = () => {
    setSelectedFile(null);
    setUploadedFileContent('');
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine current active evidence content
  let activeContent = '';
  let activeFilename = 'evidence.eml';
  let isDemoSubmission = false;

  if (activeTab === 'paste') {
    activeContent = pastedText;
    activeFilename = 'pasted-headers.txt';
    isDemoSubmission = false;
  } else if (activeTab === 'upload') {
    activeContent = uploadedFileContent;
    activeFilename = uploadedFileName || 'uploaded-evidence.eml';
    isDemoSubmission = false;
  } else if (activeTab === 'samples' && selectedSample) {
    activeContent = selectedSample.rawContent;
    activeFilename = selectedSample.filename;
    isDemoSubmission = true;
  }

  const isValidInput = Boolean(activeContent && activeContent.trim().length >= 25);
  const contentBytes = activeContent ? new Blob([activeContent]).size : 0;
  const formattedSize =
    contentBytes > 1024
      ? `${(contentBytes / 1024).toFixed(1)} KB`
      : `${contentBytes} Bytes`;

  const handleAnalyzeEmailEvidence = async () => {
    setErrorMsg(null);
    setScanError(null);

    if (!activeContent || !activeContent.trim()) {
      setErrorMsg(
        activeTab === 'upload'
          ? 'Please select or drag-and-drop a valid .eml or .txt email evidence file.'
          : activeTab === 'paste'
          ? 'Please enter RFC-5322 raw headers or full email source text.'
          : 'Please select a demonstration scenario from the sample list.'
      );
      return;
    }

    if (activeContent.trim().length < 25) {
      setErrorMsg('Malformed email evidence: Content is too short to contain valid RFC-5322 header tokens.');
      return;
    }

    setIsScanning(true);

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawEmail: activeContent,
          filename: sanitizeFilename(activeFilename),
          title: caseTitle || (selectedSample && activeTab === 'samples' ? selectedSample.title : `Investigation: ${activeFilename}`),
          analystName: user?.name || 'SOC Analyst',
          evidenceSource: activeTab === 'upload' ? 'Upload' : activeTab === 'samples' ? 'Sample' : 'Pasted',
          is_demo: isDemoSubmission,
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.details || errJson.error || 'Forensic engine failed to parse email.');
      }

      const analysis: EmailAnalysis = await resp.json();

      // Synchronize demo investigation status
      if (isDemoSubmission) {
        setIsDemoInvestigation(true);
      } else {
        setIsDemoInvestigation(false);
      }

      // Proceed immediately to Page 3: Processing Page
      setIsScanning(false);
      navigate(`/processing/${analysis.id}`);
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'Error executing email scan.');
    }
  };

  return (
    <div id="analyze-email-intake" className="min-h-[calc(100vh-4rem)] bg-[#F7F9FC] text-[#172033] py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* 10-Stage Scanning Modal with Error Handling and Retry */}
      {isScanning && (
        <ScanningAnimation
          error={scanError}
          onRetry={() => {
            setScanError(null);
            handleAnalyzeEmailEvidence();
          }}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-heading font-semibold text-[#165DFF] hover:text-[#123B70] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Welcome</span>
            </Link>

            {isDemoInvestigation && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F4B400]/15 text-[#B45309] border border-[#F4B400]/40 text-xs font-heading font-bold shadow-xs">
                <FlaskConical className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Demonstration Data</span>
                <button
                  type="button"
                  onClick={() => {
                    exitDemoInvestigation();
                    navigate('/');
                  }}
                  className="ml-1 text-[10px] uppercase font-bold text-[#D92D20] bg-white px-2 py-0.5 rounded border border-[#D92D20]/30 hover:bg-[#D92D20]/10 transition cursor-pointer"
                  title="Exit Demonstration Investigation and return to Welcome"
                >
                  Exit Demo
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-analyze-try-demo"
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold text-[#B45309] bg-[#F4B400]/10 hover:bg-[#F4B400]/20 border border-[#F4B400]/40 transition cursor-pointer shadow-xs"
              title="Open demonstration email threat scenarios"
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Try Demo Investigation</span>
            </button>

            <span className="text-xs font-mono text-[#165DFF] bg-[#EAF2FF] px-2.5 py-1 rounded border border-[#165DFF]/20">
              Page 2 — Submit Email
            </span>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-heading font-extrabold text-[#123B70] tracking-tight">
                Submit Email for Investigation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/30">
                Forensic Ingest
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Inspect suspicious email content, headers and routing information for phishing, spoofing, authentication failures and geographic anomalies.
            </p>
            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs text-[#667085] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#165DFF] shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Paste the complete raw email source, including headers when available. For the most accurate analysis, upload the original <code className="text-[#165DFF] bg-[#EAF2FF] px-1 py-0.5 rounded font-mono">.eml</code> file or include all Received, From, Reply-To, Return-Path and Authentication-Results headers.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 text-xs font-mono shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-[#123B70] flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#165DFF]" />
              <span>Cryptographic SHA-256 Audit</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-[#123B70] flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#6C5CE7]" />
              <span>MTA Relay GeoTrace</span>
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-[#D92D20]/10 border border-[#D92D20]/30 text-[#D92D20] text-xs flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <strong className="font-heading font-bold">Evidence Intake Alert:</strong> {errorMsg}
            </div>
          </div>
        )}

        {/* Main Evidence Input Card */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-6">
          {/* Optional Title Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-heading font-semibold text-[#123B70] mb-1.5">
                Case or Investigation Title <span className="text-[#667085] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Triage: Suspicious Payroll Direct Deposit Change Alert"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs text-[#172033] placeholder-[#667085]/60 focus:outline-none focus:border-[#165DFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-heading font-semibold text-[#123B70] mb-1.5">
                Assigned SOC Analyst
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs text-[#667085] flex items-center justify-between">
                <span className="font-medium text-[#123B70]">{user?.name || 'SOC Analyst'}</span>
                <span className="font-mono text-[10px] text-[#16A36A] font-semibold bg-[#16A36A]/10 px-2 py-0.5 rounded">Active</span>
              </div>
            </div>
          </div>

          {/* Three Tabs: Paste Email, Upload Email, Demonstration Samples */}
          <div>
            <div className="flex border-b border-[#DDE3EC] gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('paste');
                  setErrorMsg(null);
                }}
                className={`pb-3 px-4 text-xs sm:text-sm font-heading font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'paste'
                    ? 'border-[#165DFF] text-[#165DFF]'
                    : 'border-transparent text-[#667085] hover:text-[#172033]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('upload');
                  setErrorMsg(null);
                }}
                className={`pb-3 px-4 text-xs sm:text-sm font-heading font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'upload'
                    ? 'border-[#165DFF] text-[#165DFF]'
                    : 'border-transparent text-[#667085] hover:text-[#172033]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('samples');
                  setErrorMsg(null);
                }}
                className={`pb-3 px-4 text-xs sm:text-sm font-heading font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 ${
                  activeTab === 'samples'
                    ? 'border-[#6C5CE7] text-[#6C5CE7]'
                    : 'border-transparent text-[#667085] hover:text-[#172033]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Demonstration Samples</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#6C5CE7]/15 text-[#6C5CE7] font-mono">
                  {samples.length}
                </span>
              </button>
            </div>

            {/* Tab Content 1: Paste Email */}
            {activeTab === 'paste' && (
              <div className="pt-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#667085]">
                  <span>Input RFC-5322 message headers and body source:</span>
                  <span className="font-mono text-[11px] text-[#165DFF] font-semibold">{formattedSize}</span>
                </div>
                <textarea
                  rows={12}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste the complete email source or headers here…&#10;&#10;Example:&#10;Delivered-To: victim@enterprise.com&#10;Received: from mail.attacker-domain.xyz (unknown [194.26.29.112])&#10;    by mx.enterprise.com with ESMTP id 98124...&#10;Authentication-Results: mx.enterprise.com; spf=fail...&#10;From: &quot;IT Service Desk&quot; <support@service-update-portal.top>&#10;Reply-To: phish-collector@mail-drop.ru&#10;Subject: Urgent: Password expires in 2 hours&#10;..."
                  className="w-full p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs font-mono text-[#172033] placeholder-[#667085]/60 focus:outline-none focus:border-[#165DFF] leading-relaxed resize-y"
                />
                <div className="flex items-center justify-between text-[11px] text-[#667085]">
                  <span>Includes header validation tokens for SPF, DKIM, DMARC, and Received MTA hops.</span>
                  {pastedText && (
                    <button
                      type="button"
                      onClick={() => setPastedText('')}
                      className="text-[#D92D20] hover:underline transition cursor-pointer font-medium"
                    >
                      Clear Text
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tab Content 2: Upload Email */}
            {activeTab === 'upload' && (
              <div className="pt-5 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".eml,.txt,.msg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragging
                        ? 'border-[#165DFF] bg-[#EAF2FF]/50'
                        : 'border-[#DDE3EC] hover:border-[#165DFF]/60 bg-[#F7F9FC]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-heading font-semibold text-[#123B70]">
                        Drag & Drop raw email evidence here, or <span className="text-[#165DFF]">browse files</span>
                      </p>
                      <p className="text-xs text-[#667085] mt-1">
                        Supports standard <code className="text-[#123B70] font-mono">.eml</code> and <code className="text-[#123B70] font-mono">.txt</code> RFC-5322 header dumps up to 5MB
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[11px] font-mono text-[#667085] border border-[#DDE3EC]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
                      Safe Local Sandbox Parsing
                    </span>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#16A36A]/10 text-[#16A36A] flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-heading font-semibold text-sm text-[#123B70]">
                            {uploadedFileName}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#667085] mt-0.5">
                            <span>File size: <strong className="text-[#123B70]">{(selectedFile.size / 1024).toFixed(1)} KB</strong></span>
                            <span>•</span>
                            <span>Format: <strong className="text-[#123B70]">.{selectedFile.name.split('.').pop()?.toUpperCase()}</strong></span>
                            <span>•</span>
                            <span className="text-[#16A36A] flex items-center gap-1 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Validated RFC-5322
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveUploadedFile}
                        className="p-2 rounded-lg text-[#667085] hover:text-[#D92D20] hover:bg-[#D92D20]/10 transition cursor-pointer border border-transparent hover:border-[#D92D20]/30"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {uploadedFileContent && (
                      <div className="p-3 rounded-lg bg-white border border-[#DDE3EC] font-mono text-[11px] text-[#667085] max-h-36 overflow-y-auto">
                        <div className="text-[10px] text-[#165DFF] uppercase font-bold mb-1">Header Stream Preview:</div>
                        <pre className="whitespace-pre-wrap">{uploadedFileContent.slice(0, 500)}...</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab Content 3: Demonstration Samples */}
            {activeTab === 'samples' && (
              <div className="pt-5 space-y-4">
                <div className="p-3 rounded-xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 flex items-center justify-between text-xs text-[#667085]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6C5CE7] shrink-0" />
                    <span>
                      <strong className="text-[#123B70]">Demonstration Samples:</strong> Select a pre-loaded threat scenario to test forensic correlation.
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#6C5CE7]/20 text-[#6C5CE7] text-[10px] font-mono font-semibold">
                    Demo Data Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {samples.map((s) => {
                    const isSelected = selectedSample?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedSample(s);
                          setCaseTitle(`Triage: ${s.title}`);
                        }}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#EAF2FF] border-[#165DFF] text-[#172033] shadow-xs'
                            : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#667085] hover:border-[#165DFF]/50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-heading font-semibold text-[#123B70] text-xs line-clamp-2">
                            {s.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              s.risk_score >= 85
                                ? 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                                : s.risk_score >= 50
                                ? 'bg-[#F4B400]/10 text-[#F4B400] border border-[#F4B400]/30'
                                : 'bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30'
                            }`}
                          >
                            {s.badge || `${s.risk_score}/100`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#667085] line-clamp-2">
                          {s.summary}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#667085] pt-1 border-t border-[#DDE3EC]">
                          <span>{s.filename}</span>
                          <span className="text-[#165DFF] font-semibold">
                            {isSelected ? '✓ Selected' : 'Click to Load'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Button Section */}
          <div className="pt-4 border-t border-[#DDE3EC] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#667085] flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isValidInput ? 'bg-[#16A36A]' : 'bg-[#DDE3EC]'}`} />
              <span>
                {isValidInput
                  ? `Evidence ready for processing (${formattedSize})`
                  : 'Awaiting evidence input to activate pipeline'}
              </span>
            </div>

            <button
              type="button"
              id="btn-analyze-email-evidence"
              disabled={!isValidInput || isScanning}
              onClick={handleAnalyzeEmailEvidence}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer ${
                isValidInput && !isScanning
                  ? 'bg-[#165DFF] hover:bg-[#123B70] text-white'
                  : 'bg-[#F7F9FC] text-[#667085]/60 border border-[#DDE3EC] cursor-not-allowed shadow-none'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Investigation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
