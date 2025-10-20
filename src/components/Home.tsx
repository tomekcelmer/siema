import { MessageSquare, Users, Lock, RotateCcw } from 'lucide-react';

interface HomeProps {
  onStartParticipant: () => void;
  onStartHost: () => void;
  onRestoreSession: () => void;
}

export function Home({ onStartParticipant, onStartHost, onRestoreSession }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/20">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-blue-500/20 p-4 rounded-2xl">
              <MessageSquare className="w-16 h-16 text-blue-300" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white text-center mb-4">
            Platforma Eksperymentu Negocjacyjnego
          </h1>

          <div className="text-center mb-12">
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Aplikacja do przeprowadzania eksperymentów negocjacyjnych z obsługą wielu uczestników,
              komunikacją w czasie rzeczywistym oraz monitoringiem gospodarza
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={onStartParticipant}
              className="group bg-gradient-to-br from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 backdrop-blur-sm border-2 border-blue-400/30 hover:border-blue-400/60 text-white font-semibold py-10 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-blue-500/30 p-4 rounded-xl group-hover:bg-blue-500/40 transition-all">
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </div>
              <div className="text-2xl mb-3">Uczestnik</div>
              <div className="text-sm text-blue-100">
                Dołącz do eksperymentu jako uczestnik
              </div>
            </button>

            <button
              onClick={onRestoreSession}
              className="group bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 backdrop-blur-sm border-2 border-green-400/30 hover:border-green-400/60 text-white font-semibold py-10 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500/30 p-4 rounded-xl group-hover:bg-green-500/40 transition-all">
                  <RotateCcw className="w-12 h-12 text-green-200" />
                </div>
              </div>
              <div className="text-2xl mb-3">Przywróć Sesję</div>
              <div className="text-sm text-green-100">
                Wróć do eksperymentu używając ID sesji
              </div>
            </button>

            <button
              onClick={onStartHost}
              className="group bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 backdrop-blur-sm border-2 border-purple-400/30 hover:border-purple-400/60 text-white font-semibold py-10 px-8 rounded-2xl transition-all transform hover:scale-105 shadow-xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-purple-500/30 p-4 rounded-xl group-hover:bg-purple-500/40 transition-all">
                  <Lock className="w-12 h-12 text-purple-200" />
                </div>
              </div>
              <div className="text-2xl mb-3">Gospodarz</div>
              <div className="text-sm text-purple-100">
                Panel zarządzania i monitoringu
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
