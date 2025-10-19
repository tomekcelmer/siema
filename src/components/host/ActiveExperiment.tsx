import { useState, useEffect } from 'react';
import { Clock, MessageSquare } from 'lucide-react';
import { StorageManager } from '../../lib/storage';
import { ChatRoom, Participant, ChatMessage, ExperimentType } from '../../types';

interface ActiveExperimentProps {
  experimentId: string;
  experimentType: ExperimentType;
  refreshKey: number;
}

export function ActiveExperiment({ experimentId, experimentType, refreshKey }: ActiveExperimentProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = () => {
      const loaded = StorageManager.getChatRoomsByExperiment(experimentId);
      setRooms(loaded);
    };

    loadRooms();
    const interval = setInterval(loadRooms, 1000);

    return () => clearInterval(interval);
  }, [experimentId, refreshKey]);

  const getTimeRemaining = (room: ChatRoom) => {
    const endTime = new Date(room.timerEndsAt).getTime();
    const now = new Date().getTime();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_transaction':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktywny';
      case 'completed':
        return 'Zakończony';
      case 'no_transaction':
        return 'Brak transakcji';
      default:
        return status;
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Pokoje Czatowe ({rooms.length})
        </h2>

        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {rooms.map((room, index) => {
            const seller = StorageManager.getParticipant(room.sellerId);
            const buyer = StorageManager.getParticipant(room.buyerId);

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedRoom === room.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">Pokój {index + 1}</h3>
                    <p className="text-sm text-slate-600">Wariant {room.variant}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                      {getStatusText(room.status)}
                    </span>
                    {room.status === 'active' && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-mono">{getTimeRemaining(room)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Sprzedający</p>
                    <p className="font-semibold text-slate-800">
                      {seller ? `${seller.firstName} ${seller.lastName}` : 'N/A'}
                    </p>
                    {seller?.declaredPrice && (
                      <p className="text-xs text-slate-600">
                        Min: {seller.declaredPrice.toFixed(2)} zł
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Kupujący</p>
                    <p className="font-semibold text-slate-800">
                      {buyer ? `${buyer.firstName} ${buyer.lastName}` : 'N/A'}
                    </p>
                    {buyer?.declaredPrice && (
                      <p className="text-xs text-slate-600">
                        Max: {buyer.declaredPrice.toFixed(2)} zł
                      </p>
                    )}
                  </div>
                </div>

                {room.status === 'completed' && seller?.finalPrice && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm text-green-600 font-semibold">
                      Cena finalna: {seller.finalPrice.toFixed(2)} zł
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Wgląd do Czatu
        </h2>

        {selectedRoom ? (
          <ChatViewer
            roomId={selectedRoom}
            experimentType={experimentType}
            refreshKey={refreshKey}
          />
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p>Wybierz pokój aby zobaczyć czat</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatViewerProps {
  roomId: string;
  experimentType: ExperimentType;
  refreshKey: number;
}

function ChatViewer({ roomId, experimentType, refreshKey }: ChatViewerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const loadMessages = () => {
      const loaded = StorageManager.getMessagesByRoom(roomId);
      setMessages(loaded);
    };

    loadMessages();

    const messageHandler = (e: Event) => {
      const customEvent = e as CustomEvent<ChatMessage>;
      if (customEvent.detail.roomId === roomId) {
        loadMessages();
      }
    };

    window.addEventListener('chatMessage', messageHandler);
    const interval = setInterval(loadMessages, 2000);

    return () => {
      window.removeEventListener('chatMessage', messageHandler);
      clearInterval(interval);
    };
  }, [roomId, refreshKey]);

  const getSenderName = (participantId: string) => {
    const participant = StorageManager.getParticipant(participantId);
    if (!participant) return 'Unknown';

    if (experimentType === 1) {
      return participant.role === 'seller' ? 'Sprzedający' : 'Kupujący';
    } else {
      return `${participant.firstName} ${participant.lastName} (${participant.role === 'seller' ? 'S' : 'K'})`;
    }
  };

  return (
    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
      {messages.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Brak wiadomości</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg ${
              msg.messageType === 'offer'
                ? 'bg-yellow-50 border-2 border-yellow-200'
                : 'bg-slate-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-slate-800 text-sm">
                {getSenderName(msg.participantId)}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(msg.createdAt).toLocaleTimeString('pl-PL')}
              </p>
            </div>
            <p className="text-slate-700">{msg.messageText}</p>
            {msg.offerStatus && (
              <p className="text-xs mt-2 font-semibold">
                Status:{' '}
                {msg.offerStatus === 'accepted' && <span className="text-green-600">Zaakceptowana</span>}
                {msg.offerStatus === 'rejected' && <span className="text-red-600">Odrzucona</span>}
                {msg.offerStatus === 'pending' && <span className="text-yellow-600">Oczekuje</span>}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
