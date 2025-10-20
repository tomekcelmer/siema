import { useState, useEffect, useRef } from 'react';
import { Send, Clock, AlertCircle } from 'lucide-react';
import { Participant, ChatMessage, ChatRoom } from '../../types';
import { SupabaseStorage } from '../../lib/supabaseStorage';
import { SupabasePairing } from '../../lib/supabasePairing';

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
  const [experiment, setExperiment] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<any>(null);
  const roomChannelRef = useRef<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!participant.pairId || !participant.experimentId) return;

      const [chatRoom, loadedMessages, exp] = await Promise.all([
        SupabaseStorage.getChatRoom(participant.pairId),
        SupabaseStorage.getMessagesByRoom(participant.pairId),
        SupabaseStorage.getExperiment(participant.experimentId)
      ]);

      setRoom(chatRoom);
      setMessages(loadedMessages);
      setExperiment(exp);
    };

    loadData();
  }, [participant.pairId, participant.experimentId]);

  useEffect(() => {
    if (!participant.pairId) return;

    messageChannelRef.current = SupabaseStorage.subscribeToMessages(
      participant.pairId,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    roomChannelRef.current = SupabaseStorage.subscribeToChatRoom(
      participant.pairId,
      (updatedRoom) => {
        setRoom(updatedRoom);
      }
    );

    return () => {
      if (messageChannelRef.current) {
        SupabaseStorage.unsubscribe(messageChannelRef.current);
      }
      if (roomChannelRef.current) {
        SupabaseStorage.unsubscribe(roomChannelRef.current);
      }
    };
  }, [participant.pairId]);

  useEffect(() => {
    if (!room) return;

    const interval = setInterval(async () => {
      const endTime = new Date(room.timerEndsAt).getTime();
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining <= 120 && remaining > 0 && !showWarning) {
        setShowWarning(true);
      }

      if (room.status === 'no_transaction') {
        const updatedParticipant = await SupabaseStorage.getParticipant(participant.id);
        if (updatedParticipant && updatedParticipant.currentPage !== 8) {
          updatedParticipant.finalPrice = undefined;
          updatedParticipant.reward = 0;
          updatedParticipant.currentPage = 8;
          await SupabaseStorage.saveParticipant(updatedParticipant);
        }
        setTimeout(onComplete, 1000);
      }

      if (room.status === 'completed') {
        const updatedParticipant = await SupabaseStorage.getParticipant(participant.id);
        if (updatedParticipant?.finalPrice !== undefined) {
          setTimeout(onComplete, 1000);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room, participant.id, onComplete, showWarning]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !participant.pairId) return;

    const message: ChatMessage = {
      id: SupabaseStorage.generateId(),
      roomId: participant.pairId,
      participantId: participant.id,
      messageText: messageText.trim(),
      messageType: 'chat',
      createdAt: new Date().toISOString()
    };

    await SupabaseStorage.saveChatMessage(message);
    setMessageText('');
  };

  const handleSendOffer = async () => {
    if (!participant.pairId) return;

    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) return;

    const decimals = (offerPrice.split('.')[1] || '').length;
    if (decimals > 2) return;

    const message: ChatMessage = {
      id: SupabaseStorage.generateId(),
      roomId: participant.pairId,
      participantId: participant.id,
      messageText: `Propozycja: ${price.toFixed(2)} zł`,
      messageType: 'offer',
      offerPrice: price,
      offerStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    await SupabaseStorage.saveChatMessage(message);
    setOfferPrice('');
    setShowOfferInput(false);
  };

  const handleOfferResponse = async (message: ChatMessage, accept: boolean) => {
    if (!participant.pairId || !room) return;

    const updatedMessage = { ...message, offerStatus: accept ? 'accepted' as const : 'rejected' as const };
    await SupabaseStorage.saveChatMessage(updatedMessage);

    if (!accept) {
      const rejectionNotification: ChatMessage = {
        id: SupabaseStorage.generateId(),
        roomId: participant.pairId,
        participantId: participant.id,
        messageText: `Odrzucono ofertę: ${message.offerPrice?.toFixed(2)} zł`,
        messageType: 'chat',
        createdAt: new Date().toISOString()
      };
      await SupabaseStorage.saveChatMessage(rejectionNotification);
    }

    if (accept && message.offerPrice) {
      room.status = 'completed';
      await SupabaseStorage.saveChatRoom(room);

      const [seller, buyer] = await Promise.all([
        SupabaseStorage.getParticipant(room.sellerId),
        SupabaseStorage.getParticipant(room.buyerId)
      ]);

      if (!seller || !buyer) return;

      const sellerReward = SupabasePairing.calculateReward(message.offerPrice, 'seller');
      const buyerReward = SupabasePairing.calculateReward(message.offerPrice, 'buyer');

      seller.finalPrice = message.offerPrice;
      seller.reward = sellerReward;
      seller.transactionTime = new Date().toISOString();
      seller.currentPage = 8;

      buyer.finalPrice = message.offerPrice;
      buyer.reward = buyerReward;
      buyer.transactionTime = new Date().toISOString();
      buyer.currentPage = 8;

      await Promise.all([
        SupabaseStorage.saveParticipant(seller),
        SupabaseStorage.saveParticipant(buyer)
      ]);

      setTimeout(onComplete, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPartnerName = async (senderId: string) => {
    if (senderId === participant.id) return 'Ty';

    const sender = await SupabaseStorage.getParticipant(senderId);
    if (!sender) return 'Partner';

    if (experiment?.experimentType === 1) {
      return sender.role === 'seller' ? 'Sprzedający' : 'Kupujący';
    } else {
      return sender.firstName;
    }
  };

  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadNames = async () => {
      const names: Record<string, string> = {};
      for (const msg of messages) {
        if (!names[msg.participantId]) {
          names[msg.participantId] = await getPartnerName(msg.participantId);
        }
      }
      setPartnerNames(names);
    };

    loadNames();
  }, [messages, experiment]);

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Ładowanie pokoju...</div>
      </div>
    );
  }

  if (room.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <Clock className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Oczekiwanie na Partnera
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            Jesteś w pokoju negocjacyjnym. Timer wystartuje gdy druga osoba również będzie gotowa.
          </p>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-sm text-slate-700 mb-2">
              <span className="font-semibold">Status:</span> Oczekiwanie
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Twoja rola:</span>{' '}
              <span className="text-blue-600 font-semibold">
                {participant.role === 'seller' ? 'Sprzedający' : 'Kupujący'}
              </span>
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-6">
            Za chwilę rozpoczną się negocjacje...
          </p>
        </div>
      </div>
    );
  }

  const instructions = participant.role && participant.variant
    ? require('../../lib/instructions').getInstructions(participant.role, participant.variant)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: '90vh' }}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Negocjacje</h2>
              <p className="text-blue-100 text-sm mt-1">
                {experiment?.experimentType === 1 ? 'Rozmowa anonimowa' : `Rozmawiasz z partnerem`}
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
              <p className="text-sm text-blue-100 mt-2">Timer orientacyjny</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex gap-2 mb-2">
              <span className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">
                {participant.role === 'seller' ? 'SPRZEDAJĄCY' : 'KUPUJĄCY'}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">
                WARIANT {participant.variant}
              </span>
            </div>
            <div className="text-sm text-blue-50 space-y-1 max-h-32 overflow-y-auto">
              {instructions.slice(0, 3).map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.participantId === participant.id;
            const senderName = partnerNames[msg.participantId] || 'Ładowanie...';

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
