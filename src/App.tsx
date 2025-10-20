import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ParticipantFlow } from './components/ParticipantFlow';
import { HostDashboard } from './components/HostDashboard';
import { Recovery } from './components/Recovery';
import { SupabaseStorage } from './lib/supabaseStorage';

type View = 'home' | 'participant' | 'host' | 'recovery';

function App() {
  const [view, setView] = useState<View>('home');
  const [recoverySessionId, setRecoverySessionId] = useState<string>('');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(window.location.search);

    if (hash === '/host') {
      setView('host');
    } else if (hash === '/recovery') {
      const sessionId = params.get('id');
      if (sessionId) {
        setRecoverySessionId(sessionId);
        setView('recovery');
      }
    } else if (hash === '/participant') {
      const current = SupabaseStorage.getCurrentParticipant();
      if (current) {
        setView('participant');
      }
    }
  }, []);

  const handleStartParticipant = () => {
    setView('participant');
    window.location.hash = '#/participant';
  };

  const handleStartHost = () => {
    setView('host');
    window.location.hash = '#/host';
  };

  const handleBackToHome = () => {
    setView('home');
    window.location.hash = '#/';
    SupabaseStorage.clearCurrentParticipant();
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
