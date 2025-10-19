import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { StorageManager } from '../../lib/storage';
import { Participant, ExperimentType } from '../../types';

interface ParticipantsListProps {
  experimentId: string;
  onStartExperiment: (type: ExperimentType) => void;
  refreshKey: number;
}

export function ParticipantsList({ experimentId, onStartExperiment, refreshKey }: ParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const loadParticipants = () => {
      const loaded = StorageManager.getParticipantsByExperiment(experimentId);
      setParticipants(loaded);
    };

    loadParticipants();
    const interval = setInterval(loadParticipants, 1000);

    return () => clearInterval(interval);
  }, [experimentId, refreshKey]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">
          Uczestnicy Oczekujący ({participants.length})
        </h2>
      </div>

      {participants.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">Brak uczestników</p>
          <p className="text-sm mt-2">Uczestnicy pojawią się tutaj po zarejestrowaniu</p>
        </div>
      ) : (
        <>
          <div className="mb-6 max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-slate-700 font-semibold">#</th>
                  <th className="text-left p-3 text-slate-700 font-semibold">Imię</th>
                  <th className="text-left p-3 text-slate-700 font-semibold">Nazwisko</th>
                  <th className="text-left p-3 text-slate-700 font-semibold">ID Sesji</th>
                  <th className="text-left p-3 text-slate-700 font-semibold">Czas Rejestracji</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, index) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3 text-slate-600">{index + 1}</td>
                    <td className="p-3 text-slate-800 font-medium">{p.firstName}</td>
                    <td className="p-3 text-slate-800 font-medium">{p.lastName}</td>
                    <td className="p-3 text-slate-600 font-mono text-xs">{p.sessionId.slice(0, 8)}...</td>
                    <td className="p-3 text-slate-600 text-sm">
                      {new Date(p.createdAt).toLocaleTimeString('pl-PL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Rozpocznij Eksperyment
            </h3>
            <p className="text-slate-600 mb-4">
              Wybierz typ eksperymentu. Eksperyment 1 to rozmowy anonimowe, Eksperyment 2 pokazuje imiona uczestników.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => onStartExperiment(1)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-xl mb-1">Start Eksperymentu 1</div>
                <div className="text-sm opacity-90">Uczestnicy anonimowi</div>
              </button>

              <button
                onClick={() => onStartExperiment(2)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-xl mb-1">Start Eksperymentu 2</div>
                <div className="text-sm opacity-90">Z widocznymi imionami</div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
