import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Participant } from '../../types';
import { StorageManager } from '../../lib/storage';

interface Page5WaitingPairProps {
  participant: Participant;
}

export function Page5WaitingPair({ participant }: Page5WaitingPairProps) {
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = StorageManager.getParticipant(participant.id);
      if (updated && updated.pairId && updated.currentPage === 6) {
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
          Oczekiwanie na Parę
        </h1>

        <p className="text-lg text-slate-600 mb-4">
          Trwa parowanie uczestników. Za chwilę zostaniesz połączony z partnerem do negocjacji.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg inline-block">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Twoja rola:</span>{' '}
            <span className="text-blue-600 font-semibold">
              {participant.role === 'seller' ? 'Sprzedający' : 'Kupujący'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
