import { useState, useEffect } from 'react';
import { StorageManager } from '../lib/storage';
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
    StorageManager.getCurrentParticipant()
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = StorageManager.getCurrentParticipant();
      if (current) {
        const updated = StorageManager.getParticipant(current.id);
        if (updated) {
          setParticipant(updated);
          setCurrentPage(updated.currentPage);
          StorageManager.setCurrentParticipant(updated);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateParticipant = (updates: Partial<Participant>) => {
    if (!participant) return;

    const updated = { ...participant, ...updates };
    StorageManager.saveParticipant(updated);
    setParticipant(updated);
    setCurrentPage(updated.currentPage);
    StorageManager.setCurrentParticipant(updated);
  };

  const handleGoToRegistration = () => {
    setCurrentPage(2);
  };

  if (!participant) {
    if (currentPage === 1) {
      return <Page1Welcome onNext={handleGoToRegistration} />;
    } else {
      return (
        <Page2Registration
          onRegister={(data) => {
            const newParticipant: Participant = {
              id: StorageManager.generateId(),
              sessionId: StorageManager.generateId(),
              experimentId: 'current',
              firstName: data.firstName,
              lastName: data.lastName,
              currentPage: 3,
              consentGiven: data.consent,
              createdAt: new Date().toISOString()
            };
            StorageManager.saveParticipant(newParticipant);
            setParticipant(newParticipant);
            setCurrentPage(3);
            StorageManager.setCurrentParticipant(newParticipant);
          }}
        />
      );
    }
  }

  switch (participant.currentPage) {
    case 1:
      return <Page1Welcome onNext={handleGoToRegistration} />;
    case 2:
      return (
        <Page2Registration
          onRegister={(data) => {
            const newParticipant: Participant = {
              id: StorageManager.generateId(),
              sessionId: StorageManager.generateId(),
              experimentId: 'current',
              firstName: data.firstName,
              lastName: data.lastName,
              currentPage: 3,
              consentGiven: data.consent,
              createdAt: new Date().toISOString()
            };
            StorageManager.saveParticipant(newParticipant);
            setParticipant(newParticipant);
            StorageManager.setCurrentParticipant(newParticipant);
          }}
        />
      );
    case 3:
      return <Page3Waiting participant={participant} />;
    case 4:
      return (
        <Page4Instructions
          participant={participant}
          onNext={(declaredPrice) => {
            handleUpdateParticipant({
              declaredPrice,
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
            handleUpdateParticipant({ currentPage: 8 });
          }}
        />
      );
    case 8:
      return <Page8Complete participant={participant} onBack={onBack} />;
    default:
      return <Page1Welcome onNext={handleNextPage} />;
  }
}
