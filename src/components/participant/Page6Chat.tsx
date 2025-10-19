import { useState, useEffect, useRef } from 'react';
import { Send, Clock, AlertCircle } from 'lucide-react';
import { Participant, ChatMessage, ChatRoom } from '../../types';
import { StorageManager } from '../../lib/storage';

interface Page6ChatProps {
  participant: Participant;
  onComplete: () => void;
}

export function Page6Chat({ participant, onComplete }: Page6ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [showWarning, setShowWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const experiment = StorageManager.getExperiment('current');
  const isAnonymous = experiment?.experimentType === 1;

  useEffect(() => {
    if (!participant.pairId) return;

    const chatRoom = StorageManager.getChatRoom(participant.pairId);
    setRoom(chatRoom || null);

    const loadedMessages = StorageManager.getMessagesByRoom(participant.pairId);
    setMessages(loadedMessages);

    const messageHandler = (e: Event) => {
      const customEvent = e as CustomEvent<ChatMessage>;
      if (customEvent.detail.roomId === participant.pairId) {
        setMessages(prev => [...prev, customEvent.detail]);
      }
    };

    window.addEventListener('chatMessage', messageHandler);

    const interval = setInterval(() => {
      const updatedRoom = StorageManager.getChatRoom(participant.pairId!);
      if (updatedRoom) {
        setRoom(updatedRoom);

        const endTime = new Date(updatedRoom.timerEndsAt).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

        setTimeRemaining(remaining);

        if (remaining <= 120 && remaining > 0 && !showWarning) {
          setShowWarning(true);
        }

        if (remaining === 0 && updatedRoom.status === 'active') {
          updatedRoom.status = 'no_transaction';
          StorageManager.saveChatRoom(updatedRoom);

          const updatedParticipant = { ...participant, finalPrice: undefined, reward: 0 };
          StorageManager.saveParticipant(updatedParticipant);

          setTimeout(onComplete, 2000);
        }

        if (updatedRoom.status === 'completed') {
          const updatedParticipant = StorageManager.getParticipant(participant.id);
          if (updatedParticipant?.finalPrice) {
            setTimeout(onComplete, 1000);
          }
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('chatMessage', messageHandler);
      clearInterval(interval);
    };
  }, [participant.pairId, participant.id, onComplete, showWarning]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !participant.pairId) return;

    const message: ChatMessage = {
      id: StorageManager.generateId(),
      roomId: participant.pairId,
      participantId: participant.id,
      messageText: messageText.trim(),
      messageType: 'chat',
      createdAt: new Date().toISOString()
    };

    StorageManager.saveChatMessage(message);
    setMessageText('');
  };

  const handleSendOffer = () => {
    if (!participant.pairId) return;

    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) return;

    const decimals = (offerPrice.split('.')[1] || '').length;
    if (decimals > 2) return;

    const message: ChatMessage = {
      id: StorageManager.generateId(),
      roomId: participant.pairId,
      participantId: participant.id,
      messageText: `Propozycja: ${price.toFixed(2)} zł`,
      messageType: 'offer',
      offerPrice: price,
      offerStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    StorageManager.saveChatMessage(message);
    setOfferPrice('');
    setShowOfferInput(false);
  };

  const handleOfferResponse = (message: ChatMessage, accept: boolean) => {
    if (!participant.pairId || !room) return;

    message.offerStatus = accept ? 'accepted' : 'rejected';
    StorageManager.saveChatMessage({ ...message });

    if (accept && message.offerPrice) {
      const seller = StorageManager.getParticipant(room.sellerId)!;
      const buyer = StorageManager.getParticipant(room.buyerId)!;

      const sellerReward = message.offerPrice - 700;
      const buyerReward = 1100 - message.offerPrice;

      seller.finalPrice = message.offerPrice;
      seller.reward = sellerReward;
      seller.transactionTime = new Date().toISOString();
      seller.currentPage = 8;
      StorageManager.saveParticipant(seller);

      buyer.finalPrice = message.offerPrice;
      buyer.reward = buyerReward;
      buyer.transactionTime = new Date().toISOString();
      buyer.currentPage = 8;
      StorageManager.saveParticipant(buyer);

      room.status = 'completed';
      StorageManager.saveChatRoom(room);

      setTimeout(onComplete, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPartnerName = (senderId: string) => {
    if (senderId === participant.id) return 'Ty';

    if (isAnonymous) {
      const sender = StorageManager.getParticipant(senderId);
      return sender?.role === 'seller' ? 'Sprzedający' : 'Kupujący';
    } else {
      const sender = StorageManager.getParticipant(senderId);
      return sender ? sender.firstName : 'Partner';
    }
  };

  if (!room) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: '90vh' }}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Negocjacje</h2>
              <p className="text-blue-100 text-sm mt-1">
                {isAnonymous ? 'Rozmowa anonimowa' : `Rozmawiasz z ${getPartnerName(room.sellerId === participant.id ? room.buyerId : room.sellerId)}`}
              </p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-2 ${timeRemaining <= 120 ? 'text-yellow-300' : 'text-white'}`}>
                <Clock className="w-6 h-6" />
                <span className="text-3xl font-bold">{formatTime(timeRemaining)}</span>
              </div>
              {showWarning && (
                <div className="flex items-center gap-1 text-yellow-300 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Pozostały 2 minuty!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.participantId === participant.id;
            const senderName = getPartnerName(msg.participantId);

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'} rounded-lg p-4 shadow`}>
                  <p className="text-xs opacity-70 mb-1">{senderName}</p>
                  <p className="break-words">{msg.messageText}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(msg.createdAt).toLocaleTimeString('pl-PL')}
                  </p>

                  {msg.messageType === 'offer' && msg.offerStatus === 'pending' && !isOwn && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleOfferResponse(msg, true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold"
                      >
                        Potwierdź
                      </button>
                      <button
                        onClick={() => handleOfferResponse(msg, false)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold"
                      >
                        Odrzuć
                      </button>
                    </div>
                  )}

                  {msg.offerStatus === 'accepted' && (
                    <p className="text-xs mt-2 font-semibold">Oferta zaakceptowana</p>
                  )}
                  {msg.offerStatus === 'rejected' && (
                    <p className="text-xs mt-2 font-semibold">Oferta odrzucona</p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200 p-4 bg-white">
          {showOfferInput ? (
            <div className="space-y-3">
              <input
                type="text"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Wpisz cenę, np. 850.00"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSendOffer}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                >
                  Wyślij Ofertę
                </button>
                <button
                  onClick={() => setShowOfferInput(false)}
                  className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg"
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Wpisz wiadomość..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button
                onClick={() => setShowOfferInput(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
              >
                Wyślij Ofertę Transakcji
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
