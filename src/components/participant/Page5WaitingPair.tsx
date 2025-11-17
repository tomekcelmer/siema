import { useEffect, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { Participant } from '../../types';
import { SupabaseStorage } from '../../lib/supabaseStorage';
import { SupabasePairing } from '../../lib/supabasePairing';

interface Page5WaitingPairProps {
  participant: Participant;
}

export function Page5WaitingPair({ participant }: Page5WaitingPairProps) {
  const [message, setMessage] = useState('Oczekiwanie na partnera...');
  const [hasPair, setHasPair] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);

  useEffect(() => {
    const checkPairAndPartner = async () => {
      if (!participant.pairId) return;

      setHasPair(true);
      setMessage('Para utworzona! Oczekiwanie aż partner przeczyta instrukcje i wpisze zadeklarowaną cenę...');

      const { data: room } = await SupabaseStorage.supabase
        .from('chat_rooms')
        .select('seller_id, buyer_id')
        .eq('id', participant.pairId)
        .single();

      if (!room) return;

      const partnerId = room.seller_id === participant.id ? room.buyer_id : room.seller_id;

      const { data: partner } = await SupabaseStorage.supabase
        .from('participants')
        .select('declared_price')
        .eq('id', partnerId)
        .single();

      if (partner && partner.declared_price !== null) {
        setPartnerReady(true);
        setMessage('Partner gotowy! Przechodzenie do czatu...');

        await SupabasePairing.checkAndStartTimer(participant.pairId);

        setTimeout(async () => {
          participant.currentPage = 6;
          await SupabaseStorage.saveParticipant(participant);
        }, 2000);
      }
    };

    checkPairAndPartner();

    const interval = setInterval(async () => {
      const updated = await SupabaseStorage.getParticipant(participant.id);
      if (updated) {
        if (updated.pairId && !participant.pairId) {
          participant.pairId = updated.pairId;
        }

        if (updated.currentPage === 6) {
          return;
        }
      }

      if (participant.pairId && !partnerReady) {
        checkPairAndPartner();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [participant, hasPair, partnerReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        {partnerReady ? (
          <>
            <Users className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Partner Gotowy!
            </h1>
            <p className="text-lg text-green-600 mb-4 font-semibold">
              {message}
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              {hasPair ? 'Oczekiwanie na Partnera' : 'Oczekiwanie na Parę'}
            </h1>
            <p className="text-lg text-slate-600 mb-4">
              {message}
            </p>
          </>
        )}

        <div className="bg-slate-50 p-6 rounded-lg inline-block mt-4">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Twoja rola:</span>{' '}
            <span className="text-blue-600 font-semibold">
              {participant.role === 'seller' ? 'Sprzedający' : 'Kupujący'}
            </span>
          </p>
          {participant.pairId && (
            <p className="text-xs text-slate-500 mt-2">
              Pokój gotowy! Przechodzenie...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
