import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ParticipantFlow } from './components/ParticipantFlow';
import { HostDashboard } from './components/HostDashboard';
import { Recovery } from './components/Recovery';
import { StorageManager } from './lib/storage';

type View = 'home' | 'participant' | 'host' | 'recovery';

function App() {
  const [view, setView] = useState<View>('home');
  const [recoverySessionId, setRecoverySessionId] = useState<string>('');

  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path === '/host') {
      setView('host');
    } else if (path === '/recovery') {
      const sessionId = params.get('id');
      if (sessionId) {
        setRecoverySessionId(sessionId);
        setView('recovery');
      }
    } else if (path === '/participant') {
      const current = StorageManager.getCurrentParticipant();
      if (current) {
        setView('participant');
      }
    }
  }, []);

  const handleStartParticipant = () => {
    setView('participant');
    window.history.pushState({}, '', '/participant');
  };

  const handleStartHost = () => {
    setView('host');
    window.history.pushState({}, '', '/host');
  };

  const handleBackToHome = () => {
    setView('home');
    window.history.pushState({}, '', '/');
    StorageManager.setCurrentParticipant(null);
  };

  if (view === 'recovery') {
    return <Recovery sessionId={recoverySessionId} onBack={handleBackToHome} />;
  }

  if (view === 'host') {
    return <HostDashboard onBack={handleBackToHome} />;
  }

  if (view === 'participant') {
    return <ParticipantFlow onBack={handleBackToHome} />;
  }

  return (
    <Home
      onStartParticipant={handleStartParticipant}
      onStartHost={handleStartHost}
    />
  );
}

export default App;
