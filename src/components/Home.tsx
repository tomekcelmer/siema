import { MessageSquare } from 'lucide-react';

interface HomeProps {
  onStartParticipant: () => void;
  onStartHost: () => void;
}

export function Home({ onStartParticipant, onStartHost }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center mb-8">
          <MessageSquare className="w-12 h-12 text-blue-600 mr-4" />
          <h1 className="text-4xl font-bold text-slate-800">
            Platforma Eksperymentu Negocjacyjnego
          </h1>
        </div>

        <div className="text-center mb-12">
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Aplikacja do przeprowadzania eksperymentów negocjacyjnych z
            obsługą wielu uczestników, komunikacją w czasie rzeczywistym
            oraz monitoringiem gospodarza.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={onStartParticipant}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-2">Uczestnik</div>
            <div className="text-sm opacity-90">
              Dołącz do eksperymentu jako uczestnik
            </div>
          </button>

          <button
            onClick={onStartHost}
            className="bg-slate-700 hover:bg-slate-800 text-white font-semibold py-6 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-2">Gospodarz</div>
            <div className="text-sm opacity-90">
              Panel zarządzania i monitoringu eksperymentu
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
