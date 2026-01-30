import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Report from './components/Report';
import AnnotationView from './components/AnnotationView';
import { ViewState } from './types';

interface ReportPayload {
  text?: string;
  image?: string;
  images?: string[];
  topic?: string;
  material?: string;
  materialImages?: string[];
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [previousView, setPreviousView] = useState<ViewState>('dashboard');
  const [reportPayload, setReportPayload] = useState<ReportPayload>({});

  const handleNavigate = (view: ViewState) => {
    if (view === 'annotation') {
      setPreviousView(currentView);
    }
    setCurrentView(view);
  };

  const handleStartReport = (payload: ReportPayload) => {
    setReportPayload(payload);
    setCurrentView('report');
  };

  const handleCloseAnnotation = () => {
    setCurrentView(previousView);
  };

  return (
    <div className="min-h-screen">
      {currentView === 'dashboard' && <Dashboard onStartReport={handleStartReport} />}
      {currentView === 'report' && (
          <Report
            onNavigate={handleNavigate}
            text={reportPayload.text}
            topic={reportPayload.topic}
            image={reportPayload.image}
            images={reportPayload.images}
            material={reportPayload.material}
            materialImages={reportPayload.materialImages}
          />
      )}
      {currentView === 'annotation' && (
        <>
          {/* We keep the report view in background if we came from there, but for simplicity we just render the modal independently here 
              or we could have rendered Report and put AnnotationView on top. 
              Let's re-render Report in the background to give that modal feeling if previous was report.
          */}
          {previousView === 'report' && (
            <Report
              onNavigate={() => {}}
              text={reportPayload.text}
              topic={reportPayload.topic}
              image={reportPayload.image}
              images={reportPayload.images}
              material={reportPayload.material}
              materialImages={reportPayload.materialImages}
            />
          )}
          <AnnotationView onClose={handleCloseAnnotation} />
        </>
      )}
    </div>
  );
};

export default App;
