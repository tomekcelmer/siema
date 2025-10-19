import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Participant } from '../../types';
import { StorageManager } from '../../lib/storage';

interface Page3WaitingProps {
  participant: Participant;
}

export function Page3Waiting({ participant }: Page3WaitingProps) {
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = StorageManager.getParticipant(participant.id);
      if (updated && updated.role && updated.variant) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [participant.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Oczekiwanie na Start Eksperymentu
        </h1>

        <p className="text-lg text-slate-600 mb-8">
          Gospodarz rozpocznie eksperyment w momencie, gdy wszyscy uczestnicy będą gotowi.
          Zostaniesz automatycznie przypisany do roli i wariantu.
        </p>

        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-100">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Twoje ID sesji:</span>
            <br />
            <span className="font-mono text-xs break-all">{participant.sessionId}</span>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Zachowaj to ID na wypadek problemów technicznych
          </p>
        </div>
      </div>
    </div>
  );
}
