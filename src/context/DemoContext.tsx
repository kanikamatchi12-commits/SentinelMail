import React, { createContext, useContext, useState, useEffect } from 'react';
import { SampleEmailFixture, EmailAnalysis } from '../types.ts';

interface DemoContextType {
  isDemoInvestigation: boolean;
  setIsDemoInvestigation: (val: boolean) => void;
  activeDemoCaseId: string | null;
  setActiveDemoCaseId: (id: string | null) => void;
  demoModalOpen: boolean;
  setDemoModalOpen: (open: boolean) => void;
  startDemoInvestigation: (sample: SampleEmailFixture) => Promise<string>;
  exitDemoInvestigation: () => void;
  // Backwards compatibility
  isGuidedDemo: boolean;
  setIsGuidedDemo: (val: boolean) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoInvestigation: false,
  setIsDemoInvestigation: () => {},
  activeDemoCaseId: null,
  setActiveDemoCaseId: () => {},
  demoModalOpen: false,
  setDemoModalOpen: () => {},
  startDemoInvestigation: async () => '',
  exitDemoInvestigation: () => {},
  isGuidedDemo: false,
  setIsGuidedDemo: () => {},
});

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoInvestigation, setIsDemoInvestigation] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sentinelmail_demo_investigation') === 'true';
    } catch {
      return false;
    }
  });

  const [activeDemoCaseId, setActiveDemoCaseId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('sentinelmail_demo_case_id');
    } catch {
      return null;
    }
  });

  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (isDemoInvestigation) {
        sessionStorage.setItem('sentinelmail_demo_investigation', 'true');
        if (activeDemoCaseId) {
          sessionStorage.setItem('sentinelmail_demo_case_id', activeDemoCaseId);
        }
      } else {
        sessionStorage.removeItem('sentinelmail_demo_investigation');
        sessionStorage.removeItem('sentinelmail_demo_case_id');
      }
    } catch {}
  }, [isDemoInvestigation, activeDemoCaseId]);

  const startDemoInvestigation = async (sample: SampleEmailFixture): Promise<string> => {
    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawEmail: sample.rawContent,
          filename: sample.filename,
          title: `Demo Investigation: ${sample.title}`,
          analystName: 'SOC Analyst (Demonstration Mode)',
          evidenceSource: 'Sample',
          is_demo: true,
        }),
      });

      if (!resp.ok) {
        throw new Error('Failed to initialize demonstration investigation.');
      }

      const analysis: EmailAnalysis = await resp.json();
      setIsDemoInvestigation(true);
      setActiveDemoCaseId(analysis.id);
      setDemoModalOpen(false);
      return analysis.id;
    } catch (err) {
      console.error('Error starting demo investigation:', err);
      throw err;
    }
  };

  const exitDemoInvestigation = () => {
    setIsDemoInvestigation(false);
    setActiveDemoCaseId(null);
    try {
      sessionStorage.removeItem('sentinelmail_demo_investigation');
      sessionStorage.removeItem('sentinelmail_demo_case_id');
    } catch {}
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoInvestigation,
        setIsDemoInvestigation,
        activeDemoCaseId,
        setActiveDemoCaseId,
        demoModalOpen,
        setDemoModalOpen,
        startDemoInvestigation,
        exitDemoInvestigation,
        isGuidedDemo: isDemoInvestigation,
        setIsGuidedDemo: setIsDemoInvestigation,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
