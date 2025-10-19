import { CheckCircle, XCircle } from 'lucide-react';
import { Participant } from '../../types';

interface Page8CompleteProps {
  participant: Participant;
  onBack: () => void;
}

export function Page8Complete({ participant, onBack }: Page8CompleteProps) {
  const hasTransaction = participant.finalPrice !== undefined && participant.finalPrice > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        {hasTransaction ? (
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        ) : (
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        )}

        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          {hasTransaction ? 'Transakcja Zawarta!' : 'Brak Transakcji'}
        </h1>

        <p className="text-lg text-slate-600 mb-8">
          Dziękujemy za udział w eksperymencie negocjacyjnym.
        </p>

        {hasTransaction ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl border-2 border-green-200 mb-8">
            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-2">Wynegocjowana Cena</p>
              <p className="text-4xl font-bold text-slate-800">
                {participant.finalPrice?.toFixed(2)} zł
              </p>
            </div>

            <div className="border-t border-green-200 pt-6">
              <p className="text-sm text-slate-600 mb-2">Twoja Nagroda</p>
              <p className="text-5xl font-bold text-green-600">
                {participant.reward?.toFixed(2)} zł
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-xl border-2 border-slate-200 mb-8">
            <p className="text-lg text-slate-700 mb-4">
              Niestety, nie udało się zawrzeć transakcji w wyznaczonym czasie.
            </p>
            <div className="border-t border-slate-300 pt-6">
              <p className="text-sm text-slate-600 mb-2">Twoja Nagroda</p>
              <p className="text-5xl font-bold text-slate-600">0.00 zł</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-6">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Twoja rola:</span>{' '}
            {participant.role === 'seller' ? 'Sprzedający' : 'Kupujący'}
          </p>
          <p className="text-sm text-slate-700 mt-2">
            <span className="font-semibold">Wariant:</span> {participant.variant}
          </p>
          {participant.declaredPrice && (
            <p className="text-sm text-slate-700 mt-2">
              <span className="font-semibold">Zadeklarowana cena:</span>{' '}
              {participant.declaredPrice.toFixed(2)} zł
            </p>
          )}
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Wyniki eksperymentu zostały zapisane. Gospodarz ma dostęp do wszystkich danych.
        </p>

        <button
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
        >
          Zakończ
        </button>
      </div>
    </div>
  );
}
