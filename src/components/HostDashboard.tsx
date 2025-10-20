import { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, Lock, History, BarChart3, Trash2, PlayCircle, PauseCircle, Plus } from 'lucide-react';
import { SupabaseStorage } from '../lib/supabaseStorage';
import { SupabasePairing } from '../lib/supabasePairing';
import { Experiment, ExperimentType } from '../types';
import { ParticipantsList } from './host/ParticipantsList';
import { ActiveExperiment } from './host/ActiveExperiment';

interface HostDashboardProps {
  onBack: () => void;
}

type View = 'login' | 'dashboard' | 'waiting' | 'active' | 'history';

export function HostDashboard({ onBack }: HostDashboardProps) {
  const [view, setView] = useState<View>('login');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [experimentCode, setExperimentCode] = useState('');
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [allExperiments, setAllExperiments] = useState<Experiment[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (view === 'history' || view === 'dashboard') {
      loadAllExperiments();
    }
  }, [view, refreshKey]);

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

  const handleLogin = () => {
    if (password !== 'Pandka123') {
      alert('Nieprawidłowe hasło!');
      return;
    }

    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleCreateExperiment = async () => {
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
      setExperimentCode('');
      setView(experiment.status === 'waiting' ? 'waiting' : 'active');
    } catch (error) {
      console.error('Error creating experiment:', error);
      alert('Błąd podczas tworzenia eksperymentu.');
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

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentExperiment(null);
  };

  const handleLogout = () => {
    setView('login');
    setPassword('');
    setIsAuthenticated(false);
    setCurrentExperiment(null);
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-500/20 p-4 rounded-2xl">
                <Lock className="w-12 h-12 text-blue-300" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-8">
              Panel Gospodarza
            </h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-2">
                  Hasło Dostępu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:border-blue-400 focus:outline-none text-white placeholder-white/50"
                  placeholder="Wpisz hasło"
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50"
              >
                Zaloguj
              </button>

              <button
                onClick={onBack}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all border border-white/20"
              >
                Powrót
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">Dashboard Gospodarza</h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-xl transition-all border border-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
                Wyloguj
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-500/30 p-3 rounded-xl">
                    <Plus className="w-8 h-8 text-blue-200" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Nowy Eksperyment</h2>
                </div>
                <p className="text-blue-100 mb-6">Utwórz nową sesję eksperymentu z unikalnym kodem</p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={experimentCode}
                    onChange={(e) => setExperimentCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateExperiment()}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:border-blue-400 focus:outline-none text-white placeholder-white/50"
                    placeholder="np. arbuz, test1"
                  />
                  <button
                    onClick={handleCreateExperiment}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg"
                  >
                    {isLoading ? 'Tworzenie...' : 'Utwórz Eksperyment'}
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-500/30 p-3 rounded-xl">
                    <History className="w-8 h-8 text-purple-200" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Historia</h2>
                </div>
                <p className="text-purple-100 mb-6">Przeglądaj i zarządzaj wszystkimi eksperymentami</p>
                <button
                  onClick={() => setView('history')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
                >
                  Zobacz Historię
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Ostatnie Eksperymenty</h3>
              <div className="space-y-3">
                {allExperiments.slice(0, 5).map(exp => (
                  <div
                    key={exp.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-400/50 transition-all cursor-pointer"
                    onClick={() => handleViewExperiment(exp.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold">{exp.name}</h4>
                        <p className="text-sm text-blue-200">
                          Status: <span className="font-semibold">{exp.status}</span> •
                          Typ: Eksperyment {exp.experimentType}
                        </p>
                      </div>
                      <div className="text-sm text-white/60">
                        {new Date(exp.createdAt).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                  </div>
                ))}
                {allExperiments.length === 0 && (
                  <p className="text-center text-white/60 py-4">Brak eksperymentów</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/30 p-3 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-purple-200" />
                </div>
                <h1 className="text-3xl font-bold text-white">Historia Eksperymentów</h1>
              </div>
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-xl border border-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
                Powrót
              </button>
            </div>

            <div className="space-y-4">
              {allExperiments.length === 0 ? (
                <p className="text-center text-white/60 py-8">Brak zapisanych eksperymentów</p>
              ) : (
                allExperiments.map(exp => (
                  <div
                    key={exp.id}
                    className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">{exp.name}</h3>
                        <p className="text-sm text-blue-200 mt-1">Kod: {exp.id}</p>
                        <p className="text-sm text-blue-200">
                          Status: <span className="font-semibold">{exp.status}</span>
                        </p>
                        <p className="text-sm text-blue-200">
                          Typ: Eksperyment {exp.experimentType}
                        </p>
                        <p className="text-sm text-white/60 mt-2">
                          Utworzony: {new Date(exp.createdAt).toLocaleString('pl-PL')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewExperiment(exp.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                        >
                          Zobacz
                        </button>
                        <button
                          onClick={() => handleToggleExperimentStatus(exp.id, exp.status)}
                          className={`${exp.status === 'active' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all`}
                          title={exp.status === 'active' ? 'Dezaktywuj' : 'Aktywuj'}
                        >
                          {exp.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteExperiment(exp.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">{currentExperiment.name}</h1>
                <p className="text-blue-200 mt-1">Kod: <span className="font-mono font-semibold">{currentExperiment.id}</span></p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-xl border border-white/20"
                >
                  <RefreshCw className="w-5 h-5" />
                  Odśwież
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-xl border border-white/20"
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
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all disabled:opacity-50 shadow-lg"
              >
                {isLoading ? 'Startowanie...' : 'Start Eksperymentu 1 (Anonimowy)'}
              </button>
              <button
                onClick={() => handleStartExperiment(2)}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all disabled:opacity-50 shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{currentExperiment.name}</h1>
                <p className="text-blue-200 mt-1">
                  Eksperyment {currentExperiment.experimentType} • Status: <span className="font-semibold">Aktywny</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportResults}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-all"
                >
                  <Download className="w-5 h-5" />
                  CSV
                </button>
                <button
                  onClick={handleExportChatLogs}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all"
                >
                  <Download className="w-5 h-5" />
                  JSON
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-xl border border-white/20"
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
