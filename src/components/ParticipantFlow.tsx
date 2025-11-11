import { useState, useEffect } from 'react';
import { SupabaseStorage } from '../lib/supabaseStorage';
import { Participant } from '../types';
import { Page1Welcome } from './participant/Page1Welcome';
import { Page2Registration } from './participant/Page2Registration';
import { Page3Waiting } from './participant/Page3Waiting';
import { Page4Instructions } from './participant/Page4Instructions';
import { Page5WaitingPair } from './participant/Page5WaitingPair';
import { Page6Chat } from './participant/Page6Chat';
import { Page8Complete } from './participant/Page8Complete';

interface ParticipantFlowProps {
  onBack: () => void;
}

export function ParticipantFlow({ onBack }: ParticipantFlowProps) {
  const [participant, setParticipant] = useState<Participant | null>(
    SupabaseStorage.getCurrentParticipant()
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadParticipant = async () => {
      const current = SupabaseStorage.getCurrentParticipant();
      if (current) {
        const updated = await SupabaseStorage.getParticipant(current.id);
        if (updated) {
          setParticipant(updated);
          setCurrentPage(updated.currentPage);
          SupabaseStorage.setCurrentParticipant(updated);
        }
      }
    };

    loadParticipant();
    const interval = setInterval(loadParticipant, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateParticipant = async (updates: Partial<Participant>) => {
    if (!participant) return;

    const updated = { ...participant, ...updates };
    await SupabaseStorage.saveParticipant(updated);
    setParticipant(updated);
    setCurrentPage(updated.currentPage);
    SupabaseStorage.setCurrentParticipant(updated);
  };

  const handleNextPage = () => {
    setCurrentPage(2);
  };

  if (!participant) {
    if (currentPage === 1) {
      return <Page1Welcome onNext={handleNextPage} />;
    } else {
      return (
        <Page2Registration
          onRegister={async (data) => {
            const experiment = await SupabaseStorage.getExperiment(data.experimentCode);
            if (!experiment) {
              return false;
            }

            const newParticipant: Participant = {
              id: SupabaseStorage.generateId(),
              sessionId: SupabaseStorage.generateId(),
              experimentId: data.experimentCode,
              firstName: data.firstName,
              lastName: data.lastName,
              currentPage: 3,
              consentGiven: data.consent,
              createdAt: new Date().toISOString()
            };
            await SupabaseStorage.saveParticipant(newParticipant);
            setParticipant(newParticipant);
            setCurrentPage(3);
            SupabaseStorage.setCurrentParticipant(newParticipant);
            return true;
          }}
        />
      );
    }
  }

  const handleNextPageAfterCurrent = () => {
    if (participant) {
      handleUpdateParticipant({ currentPage: participant.currentPage + 1 });
    }
  };

  switch (participant.currentPage) {
    case 1:
      return <Page1Welcome onNext={handleNextPage} />;
    case 2:
      return (
        <Page2Registration
          onRegister={async (data) => {
            const experiment = await SupabaseStorage.getExperiment(data.experimentCode);
            if (!experiment) {
              return false;
            }

            await handleUpdateParticipant({
              firstName: data.firstName,
              lastName: data.lastName,
              consentGiven: data.consent,
              currentPage: 3
            });
            return true;
          }}
        />
      );
    case 3:
      return <Page3Waiting participant={participant} onStartOver={() => {
        setParticipant(null);
        setCurrentPage(1);
      }} />;
    case 4:
      return (
        <Page4Instructions
          participant={participant}
          onNext={async (declaredPrice) => {
            await handleUpdateParticipant({
              declaredPrice,
              instructionsRead: true,
              currentPage: 5
            });
          }}
        />
      );
    case 5:
      return <Page5WaitingPair participant={participant} />;
    case 6:
      return (
        <Page6Chat
          participant={participant}
          onComplete={() => {
            // CELOWO ZOSTAWIONE PUSTE.
            // Logika zmiany strony jest już poprawnie obsłużona
            // wewnątrz Page6Chat.tsx (ustawia currentPage: 8).
            // Wywołanie handleUpdateParticipant w tym miejscu
            // powodowało 'race condition' i nadpisywało
            // wyniki transakcji nieaktualnymi danymi.
          }}
        />
      );
    case 7:
      return <Page8Complete participant={participant} onBack={onBack} />;
    case 8:
      return <Page8Complete participant={participant} onBack={onBack} />;
  }
}
