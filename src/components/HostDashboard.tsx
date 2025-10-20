import { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, Lock, History, BarChart3, Trash2, PlayCircle, PauseCircle } from 'lucide-react';
import { SupabaseStorage } from '../lib/supabaseStorage';
import { SupabasePairing } from '../lib/supabasePairing';
import { Experiment, ExperimentType } from '../types';
import { ParticipantsList } from './host/ParticipantsList';
import { ActiveExperiment } from './host/ActiveExperiment';

interface HostDashboardProps {
  onBack: () => void;
}

type View = 'login' | 'waiting' | 'active' | 'history';

export function HostDashboard({ onBack }: HostDashboardProps) {
  const [view, setView] = useState<View>('login');
  const [password, setPassword] = useState('');
  const [experimentCode, setExperimentCode] = useState('');
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [allExperiments, setAllExperiments] = useState<Experiment[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (view === 'history') {
      loadAllExperiments();
    }
  }, [view]);

  const loadAllExperiments = async () => {
    try {
      const { data } = await SupabaseStorage.supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const experiments: Experiment[] = data.map(exp => ({
          id: exp.id,
          name: exp.name,
          experimentType: exp.experiment_type as ExperimentType,
          status: exp.status as 'waiting' | 'active' | 'completed',
          createdAt: exp.created_at
        }));
        setAllExperiments(experiments);
      }
    } catch (error) {
      console.error('Error loading experiments:', error);
    }
  };

  const handleLogin = async () => {
    if (password !== 'Pandka123') {
      alert('Nieprawidłowe hasło!');
      return;
    }

    if (!experimentCode.trim()) {
      alert('Wpisz kod eksperymentu!');
      return;
    }

    setIsLoading(true);
    try {
      const code = experimentCode.toLowerCase().trim();
      let experiment = await SupabaseStorage.getExperiment(code);

      if (!experiment) {
        experiment = {
          id: code,
          name: `Eksperyment: ${code}`,
          experimentType: 1,
          status: 'waiting',
          createdAt: new Date().toISOString()
        };
        await SupabaseStorage.saveExperiment(experiment);
      }

      setCurrentExperiment(experiment);
      setView(experiment.status === 'waiting' ? 'waiting' : 'active');
    } catch (error) {
      console.error('Error during login:', error);
      alert('Błąd podczas logowania. Sprawdź połączenie z bazą danych.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExperiment = async (type: ExperimentType) => {
    if (!currentExperiment) return;

    setIsLoading(true);
    try {
      const participants = await SupabaseStorage.getParticipantsByExperiment(currentExperiment.id);

      if (participants.length < 2) {
        alert('Potrzeba co najmniej 2 uczestników aby rozpocząć eksperyment');
        setIsLoading(false);
        return;
      }

      await SupabasePairing.assignRolesAndVariants(participants);

      const updatedParticipants = await SupabaseStorage.getParticipantsByExperiment(currentExperiment.id);

      for (const p of updatedParticipants) {
        if (p.role && p.variant) {
          p.currentPage = 4;
          await SupabaseStorage.saveParticipant(p);
        }
      }

      await SupabasePairing.createPairs(currentExperiment.id, type);

      const updatedExperiment = {
        ...currentExperiment,
        status: 'active' as const,
        experimentType: type
      };
      await SupabaseStorage.saveExperiment(updatedExperiment);
      setCurrentExperiment(updatedExperiment);
      setView('active');
    } catch (error) {
      console.error('Error starting experiment:', error);
      alert('Błąd podczas startowania eksperymentu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExportResults = async () => {
    if (!currentExperiment) return;

    try {
      const participants = await SupabaseStorage.getParticipantsByExperiment(currentExperiment.id);

      const csvHeader = 'Imię,Nazwisko,Rola,Wariant,Cena Zadeklarowana,Cena Finalna,Nagroda,Czas Transakcji\n';
      const csvRows = participants.map(p => {
        const role = p.role === 'seller' ? 'Sprzedający' : 'Kupujący';
        const finalPrice = p.finalPrice ? p.finalPrice.toFixed(2) : 'Brak transakcji';
        const reward = p.reward !== undefined ? p.reward.toFixed(2) : '0.00';
        const time = p.transactionTime ? new Date(p.transactionTime).toLocaleString('pl-PL') : '-';
        const declaredPrice = p.declaredPrice ? p.declaredPrice.toFixed(2) : '-';

        return `${p.firstName},${p.lastName},${role},${p.variant || '-'},${declaredPrice},${finalPrice},${reward},${time}`;
      }).join('\n');

      const csv = csvHeader + csvRows;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `wyniki_${currentExperiment.id}_${new Date().getTime()}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting results:', error);
      alert('Błąd podczas eksportu wyników.');
    }
  };

  const handleExportChatLogs = async () => {
    if (!currentExperiment) return;

    try {
      const rooms = await SupabaseStorage.getChatRoomsByExperiment(currentExperiment.id);
      const allMessages = await Promise.all(
        rooms.map(async room => {
          const messages = await SupabaseStorage.getMessagesByRoom(room.id);
          const seller = await SupabaseStorage.getParticipant(room.sellerId);
          const buyer = await SupabaseStorage.getParticipant(room.buyerId);

          return {
            roomId: room.id,
            variant: room.variant,
            seller: seller ? `${seller.firstName} ${seller.lastName}` : 'N/A',
            buyer: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'N/A',
            messages: messages.map(m => ({
              timestamp: m.createdAt,
              sender: m.participantId,
              text: m.messageText,
              type: m.messageType,
              offerPrice: m.offerPrice,
              offerStatus: m.offerStatus
            }))
          };
        })
      );

      const json = JSON.stringify(allMessages, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `czaty_${currentExperiment.id}_${new Date().getTime()}.json`;
      link.click();
    } catch (error) {
      console.error('Error exporting chat logs:', error);
      alert('Błąd podczas eksportu czatów.');
    }
  };

  const handleViewExperiment = async (expId: string) => {
    try {
      const experiment = await SupabaseStorage.getExperiment(expId);
      if (experiment) {
        setCurrentExperiment(experiment);
        setView(experiment.status === 'waiting' ? 'waiting' : 'active');
      }
    } catch (error) {
      console.error('Error loading experiment:', error);
    }
  };

  const handleDeleteExperiment = async (expId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten eksperyment? Wszystkie dane zostaną bezpowrotnie utracone.')) {
      return;
    }

    try {
      const { error } = await SupabaseStorage.supabase
        .from('experiments')
        .delete()
        .eq('id', expId);

      if (error) throw error;

      await loadAllExperiments();
      alert('Eksperyment został usunięty');
    } catch (error) {
      console.error('Error deleting experiment:', error);
      alert('Błąd podczas usuwania eksperymentu');
    }
  };

  const handleToggleExperimentStatus = async (expId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'completed' : 'active';
    const statusText = newStatus === 'active' ? 'aktywowany' : 'dezaktywowany';

    try {
      const { error } = await SupabaseStorage.supabase
        .from('experiments')
        .update({ status: newStatus })
        .eq('id', expId);

      if (error) throw error;

      await loadAllExperiments();
      alert(`Eksperyment został ${statusText}`);
    } catch (error) {
      console.error('Error toggling experiment status:', error);
      alert('Błąd podczas zmiany statusu eksperymentu');
    }
  };

  const handleBackToLogin = () => {
    setView('login');
    setPassword('');
    setExperimentCode('');
    setCurrentExperiment(null);
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Lock className="w-12 h-12 text-slate-700 mr-3" />
            <h1 className="text-3xl font-bold text-slate-800">Panel Gospodarza</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Hasło Dostępu *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate-600 focus:outline-none"
                placeholder="Wpisz hasło"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kod Eksperymentu *
              </label>
              <input
                type="text"
                value={experimentCode}
                onChange={(e) => setExperimentCode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate-600 focus:outline-none"
                placeholder="np. arbuz, test1"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-4 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj'}
            </button>

            <button
              onClick={() => setView('history')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              Historia Eksperymentów
            </button>

            <button
              onClick={onBack}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-lg transition-all"
            >
              Powrót
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-slate-800">Historia Eksperymentów</h1>
              </div>
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Powrót
              </button>
            </div>

            <div className="space-y-4">
              {allExperiments.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Brak zapisanych eksperymentów</p>
              ) : (
                allExperiments.map(exp => (
                  <div
                    key={exp.id}
                    className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{exp.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">Kod: {exp.id}</p>
                        <p className="text-sm text-slate-600">
                          Status: <span className="font-semibold">{exp.status}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                          Typ: Eksperyment {exp.experimentType}
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          Utworzony: {new Date(exp.createdAt).toLocaleString('pl-PL')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewExperiment(exp.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Zobacz
                        </button>
                        <button
                          onClick={() => handleToggleExperimentStatus(exp.id, exp.status)}
                          className={`${exp.status === 'active' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2`}
                          title={exp.status === 'active' ? 'Dezaktywuj' : 'Aktywuj'}
                        >
                          {exp.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteExperiment(exp.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                          title="Usuń eksperyment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'waiting' && currentExperiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{currentExperiment.name}</h1>
                <p className="text-slate-600 mt-1">Kod: <span className="font-mono font-semibold">{currentExperiment.id}</span></p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  Odśwież
                </button>
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Powrót
                </button>
              </div>
            </div>

            <ParticipantsList experimentId={currentExperiment.id} refreshKey={refreshKey} />

            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={() => handleStartExperiment(1)}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all disabled:opacity-50"
              >
                {isLoading ? 'Startowanie...' : 'Start Eksperymentu 1 (Anonimowy)'}
              </button>
              <button
                onClick={() => handleStartExperiment(2)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all disabled:opacity-50"
              >
                {isLoading ? 'Startowanie...' : 'Start Eksperymentu 2 (Z Imionami)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'active' && currentExperiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{currentExperiment.name}</h1>
                <p className="text-slate-600 mt-1">
                  Eksperyment {currentExperiment.experimentType} • Status: <span className="font-semibold">Aktywny</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportResults}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  <Download className="w-5 h-5" />
                  Eksport Wyników (CSV)
                </button>
                <button
                  onClick={handleExportChatLogs}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  <Download className="w-5 h-5" />
                  Eksport Czatów (JSON)
                </button>
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Powrót
                </button>
              </div>
            </div>
          </div>

          <ActiveExperiment
            experimentId={currentExperiment.id}
            experimentType={currentExperiment.experimentType}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    );
  }

  return null;
}
