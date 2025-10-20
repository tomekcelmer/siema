import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { SupabaseStorage } from '../lib/supabaseStorage';
import { Participant } from '../types';

interface RecoveryProps {
  sessionId: string;
  onBack: () => void;
}

export function Recovery({ sessionId, onBack }: RecoveryProps) {
  const [inputSessionId, setInputSessionId] = useState(sessionId);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState('');
  const [recovered, setRecovered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId) {
      handleRecover(sessionId);
    }
  }, [sessionId]);

  const handleRecover = async (id: string) => {
    setError('');
    setLoading(true);

    try {
      const found = await SupabaseStorage.getParticipantBySessionId(id);

      if (found) {
        setParticipant(found);
        SupabaseStorage.setCurrentParticipant(found);
        setRecovered(true);

        setTimeout(() => {
          window.location.href = '/participant';
        }, 2000);
      } else {
        setError('Nie znaleziono sesji o podanym ID. Sprawdź poprawność ID i spróbuj ponownie.');
      }
    } catch (error) {
      console.error('Error recovering session:', error);
      setError('Błąd podczas odzyskiwania sesji. Sprawdź połączenie z internetem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSessionId.trim()) {
      handleRecover(inputSessionId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Powrót
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-4 text-center">
          Odzyskiwanie Sesji
        </h1>

        {recovered ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Sesja Odnaleziona!
            </h2>
            <p className="text-slate-600 mb-4">
              Witaj ponownie, {participant?.firstName}!
            </p>
            <p className="text-slate-500 text-sm">
              Za chwilę zostaniesz przekierowany...
            </p>
          </div>
        ) : (
          <>
            <p className="text-slate-600 mb-8 text-center">
              Jeśli utraciłeś połączenie z eksperymentem, wpisz swoje ID sesji poniżej,
              aby wrócić do miejsca, w którym zakończyłeś.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="sessionId" className="block text-sm font-semibold text-slate-700 mb-2">
                  ID Sesji
                </label>
                <input
                  type="text"
                  id="sessionId"
                  value={inputSessionId}
                  onChange={(e) => setInputSessionId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-mono text-sm"
                  placeholder="np. 123e4567-e89b-12d3-a456-426614174000"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Odzyskiwanie...' : 'Odzyskaj Sesję'}
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Wskazówka:</span> ID sesji zostało
                wyświetlone na ekranie oczekiwania po rejestracji. Jeśli nie masz
                dostępu do swojego ID, skontaktuj się z gospodarzem eksperymentu.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
