import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface Page2RegistrationProps {
  onRegister: (data: { firstName: string; lastName: string; consent: boolean; experimentCode: string }) => void;
}

export function Page2Registration({ onRegister }: Page2RegistrationProps) {
  const [experimentCode, setExperimentCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [consent, setConsent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (experimentCode && firstName && lastName && consent) {
      onRegister({ firstName, lastName, consent, experimentCode: experimentCode.toLowerCase() });
    }
  };

  const isValid = experimentCode.trim() !== '' && firstName.trim() !== '' && lastName.trim() !== '' && consent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">
          Rejestracja Uczestnika
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="experimentCode" className="block text-sm font-semibold text-slate-700 mb-2">
              Kod Eksperymentu *
            </label>
            <input
              type="text"
              id="experimentCode"
              value={experimentCode}
              onChange={(e) => setExperimentCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Wpisz kod podany przez gospodarza"
              required
            />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
              Imię *
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Wpisz swoje imię"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
              Nazwisko *
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Wpisz swoje nazwisko"
              required
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border-2 border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                required
              />
              <span className="text-slate-700">
                <span className="font-semibold">Wyrażam udział w eksperymencie *</span>
                <br />
                <span className="text-sm text-slate-600">
                  Potwierdzam, że zostałem poinformowany o przebiegu eksperymentu
                  i wyrażam dobrowolną zgodę na udział w badaniu.
                </span>
              </span>
            </label>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={!isValid}
              className={`${
                isValid
                  ? 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
                  : 'bg-slate-300 cursor-not-allowed'
              } text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2`}
            >
              Dalej
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
