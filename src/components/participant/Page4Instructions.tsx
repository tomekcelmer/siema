import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Participant } from '../../types';
import { getInstructions } from '../../lib/instructions';

interface Page4InstructionsProps {
  participant: Participant;
  onNext: (declaredPrice: number) => Promise<void>;
}

export function Page4Instructions({ participant, onNext }: Page4InstructionsProps) {
  const [declaredPrice, setDeclaredPrice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const instructions = getInstructions(
    participant.role!,
    participant.variant!
  );

  const roleText = participant.role === 'seller' ? 'SPRZEDAJĄCY' : 'KUPUJĄCY';
  const variantText = `WARIANT ${participant.variant}`;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setDeclaredPrice('');
      setError('');
      return;
    }

    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value)) {
      setDeclaredPrice(value);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSubmitting) return;

    const price = parseFloat(declaredPrice);

    if (isNaN(price)) {
      setError('Cena musi być liczbą');
      return;
    }

    if (price <= 0) {
      setError('Cena musi być dodatnia');
      return;
    }

    setIsSubmitting(true);
    try {
      await onNext(price);
    } catch (err) {
      console.error('Error saving declared price:', err);
      setError('Wystąpił błąd. Spróbuj ponownie.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="mb-6 flex gap-3">
          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
            {roleText}
          </span>
          <span className="bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold text-sm">
            {variantText}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          Instrukcje
        </h1>

        <div className="prose max-w-none text-slate-700 space-y-3 mb-8 bg-slate-50 p-6 rounded-lg">
          {instructions.map((line, index) => (
            <p key={index} className={line === '' ? 'h-2' : ''}>
              {line}
            </p>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-lg border-2 border-blue-100">
          <label className="block text-base font-semibold text-slate-800 mb-3">
            {participant.role === 'seller'
              ? 'Cena poniżej której nie zamierzasz schodzić (zł):'
              : 'Cena której nie zamierzasz przekroczyć (zł):'}
          </label>

          <input
            type="text"
            value={declaredPrice}
            onChange={handlePriceChange}
            placeholder="Wpisz zadeklarowaną kwotę (zł)"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors mb-2 placeholder:text-slate-400"
            required
          />

          {error && (
            <p className="text-red-600 text-sm mb-2">{error}</p>
          )}

          <p className="text-xs text-slate-600 italic mb-4">
            *Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Zapisywanie...' : 'Gotowy'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
