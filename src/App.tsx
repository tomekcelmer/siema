import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { ParticipantFlow } from './components/ParticipantFlow';
import { HostDashboard } from './components/HostDashboard';
import { Recovery } from './components/Recovery';
import { SupabaseStorage } from './lib/supabaseStorage';

type View = 'home' | 'participant' | 'host' | 'recovery';

function App() {
  const [view, setView] = useState<View>('home');

  useEffect(() => {
    const hash = window.location.hash.slice(1);

    if (hash === '/host') {
      setView('host');
    } else if (hash === '/recovery') {
      setView('recovery');
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

  const handleStartRecovery = () => {
    setView('recovery');
    window.location.hash = '#/recovery';
  };

  const handleBackToHome = () => {
    setView('home');
    window.location.hash = '#/';
    SupabaseStorage.clearCurrentParticipant();
  };

  const handleRestoreSession = () => {
    setView('participant');
    window.location.hash = '#/participant';
  };

  if (view === 'recovery') {
    return <Recovery onBack={handleBackToHome} onRestore={handleRestoreSession} />;
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
      onRestoreSession={handleStartRecovery}
    />
  );
}

export default App;
