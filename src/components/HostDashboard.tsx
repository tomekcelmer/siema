import { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { StorageManager } from '../lib/storage';
import { PairingManager } from '../lib/pairing';
import { Experiment, ExperimentType } from '../types';
import { ParticipantsList } from './host/ParticipantsList';
import { ActiveExperiment } from './host/ActiveExperiment';

interface HostDashboardProps {
  onBack: () => void;
}

export function HostDashboard({ onBack }: HostDashboardProps) {
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const experiment = StorageManager.getExperiment('current');
    if (!experiment) {
      const newExperiment: Experiment = {
        id: 'current',
        name: `Eksperyment ${new Date().toLocaleDateString('pl-PL')}`,
        experimentType: 1,
        status: 'waiting',
        createdAt: new Date().toISOString()
      };
      StorageManager.saveExperiment(newExperiment);
      setCurrentExperiment(newExperiment);
    } else {
      setCurrentExperiment(experiment);
    }
  }, [refreshKey]);

  const handleStartExperiment = (type: ExperimentType) => {
    if (!currentExperiment) return;

    const participants = StorageManager.getParticipantsByExperiment('current');

    if (participants.length < 2) {
      alert('Potrzeba co najmniej 2 uczestników aby rozpocząć eksperyment');
      return;
    }

    PairingManager.assignRolesAndVariants(participants);

    setTimeout(() => {
      PairingManager.createPairs('current', type);

      const updatedExperiment = { ...currentExperiment, status: 'active' as const, experimentType: type };
      StorageManager.saveExperiment(updatedExperiment);
      setCurrentExperiment(updatedExperiment);

      participants.forEach(p => {
        const updated = StorageManager.getParticipant(p.id);
        if (updated && updated.role && updated.variant) {
          updated.currentPage = 4;
          StorageManager.saveParticipant(updated);
        }
      });
    }, 500);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExportResults = () => {
    const participants = StorageManager.getParticipantsByExperiment('current');

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
    link.download = `wyniki_eksperymentu_${new Date().getTime()}.csv`;
    link.click();
  };

  const handleExportChatLogs = () => {
    const rooms = StorageManager.getChatRoomsByExperiment('current');
    const allMessages = rooms.map(room => {
      const messages = StorageManager.getMessagesByRoom(room.id);
      const seller = StorageManager.getParticipant(room.sellerId);
      const buyer = StorageManager.getParticipant(room.buyerId);

      return {
        roomId: room.id,
        variant: room.variant,
        seller: `${seller?.firstName} ${seller?.lastName}`,
        buyer: `${buyer?.firstName} ${buyer?.lastName}`,
        messages: messages.map(m => {
          const sender = StorageManager.getParticipant(m.participantId);
          return {
            sender: `${sender?.firstName} ${sender?.lastName}`,
            role: sender?.role,
            text: m.messageText,
            type: m.messageType,
            offerPrice: m.offerPrice,
            offerStatus: m.offerStatus,
            timestamp: m.createdAt
          };
        })
      };
    });

    const json = JSON.stringify(allMessages, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logi_czatu_${new Date().getTime()}.json`;
    link.click();
  };

  if (!currentExperiment) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Panel Gospodarza</h1>
                <p className="text-slate-600">{currentExperiment.name}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Odśwież
              </button>
              <button
                onClick={handleExportResults}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Eksport Wyników
              </button>
              <button
                onClick={handleExportChatLogs}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Eksport Czatów
              </button>
            </div>
          </div>
        </div>

        {currentExperiment.status === 'waiting' ? (
          <ParticipantsList
            experimentId="current"
            onStartExperiment={handleStartExperiment}
            refreshKey={refreshKey}
          />
        ) : (
          <ActiveExperiment
            experimentId="current"
            experimentType={currentExperiment.experimentType}
            refreshKey={refreshKey}
          />
        )}
      </div>
    </div>
  );
}
