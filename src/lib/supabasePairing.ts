import { Participant, ChatRoom, Variant, ExperimentType } from '../types';
import { SupabaseStorage } from './supabaseStorage';
import { AUTO_MESSAGE, hasAutoMessage } from './instructions';

export class SupabasePairing {
  static async assignRolesAndVariants(participants: Participant[]): Promise<void> {
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
          await SupabaseStorage.saveParticipant(seller);
          participantIndex++;
        }

        if (participantIndex < shuffled.length) {
          const buyer = shuffled[participantIndex];
          buyer.role = 'buyer';
          buyer.variant = variant;
          buyer.currentPage = 3;
          await SupabaseStorage.saveParticipant(buyer);
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

  static async createPairs(experimentId: string, experimentType: ExperimentType): Promise<void> {
    const participants = await SupabaseStorage.getParticipantsByExperiment(experimentId);
    const variants: Variant[] = ['A', 'B', 'C', 'D'];

    for (const variant of variants) {
      const sellers = participants.filter(p => p.variant === variant && p.role === 'seller');
      const buyers = participants.filter(p => p.variant === variant && p.role === 'buyer');
      const pairCount = Math.min(sellers.length, buyers.length);

      for (let i = 0; i < pairCount; i++) {
        const seller = sellers[i];
        const buyer = buyers[i];
        const roomId = SupabaseStorage.generateId();
        const now = new Date();

        const room: ChatRoom = {
          id: roomId,
          experimentId,
          variant,
          sellerId: seller.id,
          buyerId: buyer.id,
          timerEndsAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
          status: 'waiting',
          createdAt: now.toISOString()
        };

        await SupabaseStorage.saveChatRoom(room);

        seller.pairId = roomId;
        seller.currentPage = 4;
        await SupabaseStorage.saveParticipant(seller);

        buyer.pairId = roomId;
        buyer.currentPage = 4;
        await SupabaseStorage.saveParticipant(buyer);
      }
    }
  }

  static async checkAndStartTimer(roomId: string): Promise<void> {
    const room = await SupabaseStorage.getChatRoom(roomId);
    if (!room) return;

    if (room.status === 'waiting') {
      const now = new Date();
      const endsAt = new Date(now.getTime() + 10 * 60 * 1000);

      room.timerEndsAt = endsAt.toISOString();
      room.status = 'active';
      await SupabaseStorage.saveChatRoom(room);

      console.log(`Timer started for room ${roomId} - ends at ${endsAt.toISOString()}`);
    }
  }

  static calculateReward(finalPrice: number, role: 'seller' | 'buyer'): number {
    if (role === 'seller') {
      return finalPrice - 700;
    } else {
      return 1100 - finalPrice;
    }
  }
}
