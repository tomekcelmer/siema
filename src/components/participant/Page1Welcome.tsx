import { ChevronRight } from 'lucide-react';

interface Page1WelcomeProps {
  onNext: () => void;
}

export function Page1Welcome({ onNext }: Page1WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 text-center">
          Witamy w Eksperymencie Negocjacyjnym
        </h1>

        <div className="prose max-w-none text-slate-700 text-lg space-y-4 mb-12">
          <p>
            Dziękujemy za udział w naszym badaniu. Eksperyment składa się z kilku etapów:
          </p>

          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Rejestracja i wyrażenie zgody na udział</li>
            <li>Oczekiwanie na rozpoczęcie eksperymentu</li>
            <li>Zapoznanie się z instrukcją</li>
            <li>Negocjacje z przypisanym partnerem</li>
            <li>Podsumowanie wyników i nagrody</li>
          </ol>

          <p className="font-semibold mt-6">
            Cały proces zajmie maksymalnie 15-20 minut. Będziesz mieć 10 minut na przeprowadzenie negocjacji.
          </p>

          <p className="text-base text-slate-600 mt-4">
            Twoje dane osobowe są anonimowe i używane wyłącznie do celów badawczych.
            Możesz przerwać udział w eksperymencie w dowolnym momencie.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            Dalej
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
