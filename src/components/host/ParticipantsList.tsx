import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { SupabaseStorage } from '../../lib/supabaseStorage';
import { Participant } from '../../types';

interface ParticipantsListProps {
  experimentId: string;
  refreshKey: number;
}

export function ParticipantsList({ experimentId, refreshKey }: ParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const loaded = await SupabaseStorage.getParticipantsByExperiment(experimentId);
        setParticipants(loaded);
        setLoading(false);
      } catch (error) {
        console.error('Error loading participants:', error);
        setLoading(false);
      }
    };

    loadParticipants();
    const interval = setInterval(loadParticipants, 2000);

    return () => clearInterval(interval);
  }, [experimentId, refreshKey]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center py-12 text-slate-500">
          Ładowanie...
        </div>
      </div>
    );
  }

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
          <p className="text-sm mt-4 font-mono bg-slate-100 p-3 rounded">
            Kod eksperymentu: <span className="font-bold">{experimentId}</span>
          </p>
        </div>
      ) : (
        <div className="mb-6 max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left p-3 text-slate-700 font-semibold">#</th>
                <th className="text-left p-3 text-slate-700 font-semibold">Imię</th>
                <th className="text-left p-3 text-slate-700 font-semibold">Nazwisko</th>
                <th className="text-left p-3 text-slate-700 font-semibold">ID Sesji</th>
                <th className="text-left p-3 text-slate-700 font-semibold">Czas</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, index) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-600">{index + 1}</td>
                  <td className="p-3 text-slate-800 font-medium">{p.firstName}</td>
                  <td className="p-3 text-slate-800 font-medium">{p.lastName}</td>
                  <td className="p-3 text-slate-600 font-mono text-xs">
                    <div className="max-w-xs break-all">{p.sessionId}</div>
                  </td>
                  <td className="p-3 text-slate-600 text-sm">
                    {new Date(p.createdAt).toLocaleTimeString('pl-PL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
