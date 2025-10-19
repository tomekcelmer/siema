import { Participant, ChatRoom, Variant, ExperimentType } from '../types';
import { StorageManager } from './storage';
import { AUTO_MESSAGE, hasAutoMessage } from './instructions';

export class PairingManager {
  static assignRolesAndVariants(participants: Participant[]): void {
    const totalPairs = Math.floor(participants.length / 2);

    const variantCounts = this.distributeVariants(totalPairs);

    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    let participantIndex = 0;
    const variants: Variant[] = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const pairCount = variantCounts[i];

      for (let pairNum = 0; pairNum < pairCount; pairNum++) {
        if (participantIndex < shuffled.length) {
          const seller = shuffled[participantIndex];
          seller.role = 'seller';
          seller.variant = variant;
          seller.currentPage = 3;
          StorageManager.saveParticipant(seller);
          participantIndex++;
        }

        if (participantIndex < shuffled.length) {
          const buyer = shuffled[participantIndex];
          buyer.role = 'buyer';
          buyer.variant = variant;
          buyer.currentPage = 3;
          StorageManager.saveParticipant(buyer);
          participantIndex++;
        }
      }
    }
  }

  private static distributeVariants(totalPairs: number): number[] {
    const baseCount = Math.floor(totalPairs / 4);
    const remainder = totalPairs % 4;

    const counts = [baseCount, baseCount, baseCount, baseCount];

    for (let i = 0; i < remainder; i++) {
      counts[i]++;
    }

    return counts;
  }

  static createPairs(experimentId: string, experimentType: ExperimentType): void {
    const participants = StorageManager.getParticipantsByExperiment(experimentId);

    const variants: Variant[] = ['A', 'B', 'C', 'D'];

    variants.forEach(variant => {
      const sellers = participants.filter(p => p.variant === variant && p.role === 'seller');
      const buyers = participants.filter(p => p.variant === variant && p.role === 'buyer');

      const pairCount = Math.min(sellers.length, buyers.length);

      for (let i = 0; i < pairCount; i++) {
        const seller = sellers[i];
        const buyer = buyers[i];

        const roomId = StorageManager.generateId();

        const now = new Date();
        const endsAt = new Date(now.getTime() + 10 * 60 * 1000);

        const room: ChatRoom = {
          id: roomId,
          experimentId,
          variant,
          sellerId: seller.id,
          buyerId: buyer.id,
          timerStartedAt: now.toISOString(),
          timerEndsAt: endsAt.toISOString(),
          status: 'active',
          createdAt: now.toISOString()
        };

        StorageManager.saveChatRoom(room);

        seller.pairId = roomId;
        seller.currentPage = 5;
        StorageManager.saveParticipant(seller);

        buyer.pairId = roomId;
        buyer.currentPage = 5;
        StorageManager.saveParticipant(buyer);

        if (hasAutoMessage(variant)) {
          setTimeout(() => {
            const systemMessage = {
              id: StorageManager.generateId(),
              roomId,
              participantId: seller.id,
              messageText: AUTO_MESSAGE,
              messageType: 'system' as const,
              createdAt: new Date().toISOString()
            };
            StorageManager.saveChatMessage(systemMessage);
          }, 100);
        }
      }
    });
  }

  static calculateReward(finalPrice: number, role: 'seller' | 'buyer'): number {
    if (role === 'seller') {
      return finalPrice - 700;
    } else {
      return 1100 - finalPrice;
    }
  }
}
