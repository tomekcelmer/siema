import { useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Participant } from '../../types';
import { SupabaseStorage } from '../../lib/supabaseStorage';

interface Page3WaitingProps {
  participant: Participant;
  onStartOver?: () => void;
}

export function Page3Waiting({ participant, onStartOver }: Page3WaitingProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStartOver = async () => {
    if (!confirm('Czy na pewno chcesz rozpocząć od nowa? Twoje dane zostaną usunięte i będziesz musiał zarejestrować się ponownie.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await SupabaseStorage.supabase
        .from('participants')
        .delete()
        .eq('id', participant.id);

      SupabaseStorage.clearCurrentParticipant();

      if (onStartOver) {
        onStartOver();
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
      alert('Wystąpił błąd podczas usuwania sesji. Spróbuj ponownie.');
      setIsDeleting(false);
    }
  };

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

        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-100 mb-6">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Twoje ID sesji:</span>
            <br />
            <span className="font-mono text-xs break-all">{participant.sessionId}</span>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Zachowaj to ID na wypadek problemów technicznych
          </p>
        </div>

        <button
          onClick={handleStartOver}
          disabled={isDeleting}
          className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          {isDeleting ? 'Usuwanie...' : 'Zacznij od Nowa'}
        </button>
      </div>
    </div>
  );
}
