import { supabase } from './supabase';
import { Experiment, Participant, ChatRoom, ChatMessage, ExperimentType, Role, Variant } from '../types';

export class SupabaseStorage {
  static generateId(): string {
    return crypto.randomUUID();
  }

  // ============ EXPERIMENTS ============
  static async getExperiment(id: string): Promise<Experiment | null> {
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching experiment:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      experimentType: data.experiment_type as ExperimentType,
      status: data.status as 'waiting' | 'active' | 'completed',
      createdAt: data.created_at
    };
  }

  static async saveExperiment(experiment: Experiment): Promise<void> {
    const { error } = await supabase
      .from('experiments')
      .upsert({
        id: experiment.id,
        name: experiment.name,
        experiment_type: experiment.experimentType,
        status: experiment.status,
        host_password: 'Pandka123'
      });

    if (error) {
      console.error('Error saving experiment:', error);
      throw error;
    }
  }

  // ============ PARTICIPANTS ============
  static async getParticipant(id: string): Promise<Participant | null> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching participant:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      sessionId: data.session_id,
      experimentId: data.experiment_id,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role as Role | undefined,
      variant: data.variant as Variant | undefined,
      currentPage: data.current_page,
      consentGiven: data.consent_given,
      declaredPrice: data.declared_price ?? undefined,
      finalPrice: data.final_price ?? undefined,
      reward: data.reward ?? undefined,
      transactionTime: data.transaction_time ?? undefined,
      pairId: data.pair_id ?? undefined,
      createdAt: data.created_at
    };
  }

  static async getParticipantBySessionId(sessionId: string): Promise<Participant | null> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching participant by session:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      sessionId: data.session_id,
      experimentId: data.experiment_id,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role as Role | undefined,
      variant: data.variant as Variant | undefined,
      currentPage: data.current_page,
      consentGiven: data.consent_given,
      declaredPrice: data.declared_price ?? undefined,
      finalPrice: data.final_price ?? undefined,
      reward: data.reward ?? undefined,
      transactionTime: data.transaction_time ?? undefined,
      pairId: data.pair_id ?? undefined,
      createdAt: data.created_at
    };
  }

  static async getParticipantsByExperiment(experimentId: string): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }

    return (data || []).map(p => ({
      id: p.id,
      sessionId: p.session_id,
      experimentId: p.experiment_id,
      firstName: p.first_name,
      lastName: p.last_name,
      role: p.role as Role | undefined,
      variant: p.variant as Variant | undefined,
      currentPage: p.current_page,
      consentGiven: p.consent_given,
      declaredPrice: p.declared_price ?? undefined,
      finalPrice: p.final_price ?? undefined,
      reward: p.reward ?? undefined,
      transactionTime: p.transaction_time ?? undefined,
      pairId: p.pair_id ?? undefined,
      createdAt: p.created_at
    }));
  }

  static async saveParticipant(participant: Participant): Promise<void> {
    const { error } = await supabase
      .from('participants')
      .upsert({
        id: participant.id,
        session_id: participant.sessionId,
        experiment_id: participant.experimentId,
        first_name: participant.firstName,
        last_name: participant.lastName,
        role: participant.role || null,
        variant: participant.variant || null,
        current_page: participant.currentPage,
        consent_given: participant.consentGiven,
        declared_price: participant.declaredPrice ?? null,
        final_price: participant.finalPrice ?? null,
        reward: participant.reward ?? null,
        transaction_time: participant.transactionTime ?? null,
        pair_id: participant.pairId ?? null
      });

    if (error) {
      console.error('Error saving participant:', error);
      throw error;
    }
  }

  // ============ CHAT ROOMS ============
  static async getChatRoom(id: string): Promise<ChatRoom | null> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chat room:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      experimentId: data.experiment_id,
      sellerId: data.seller_id,
      buyerId: data.buyer_id,
      variant: data.variant as Variant,
      status: data.status as 'active' | 'completed' | 'no_transaction',
      timerEndsAt: data.timer_ends_at,
      createdAt: data.created_at
    };
  }

  static async getChatRoomsByExperiment(experimentId: string): Promise<ChatRoom[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat rooms:', error);
      return [];
    }

    return (data || []).map(r => ({
      id: r.id,
      experimentId: r.experiment_id,
      sellerId: r.seller_id,
      buyerId: r.buyer_id,
      variant: r.variant as Variant,
      status: r.status as 'active' | 'completed' | 'no_transaction',
      timerEndsAt: r.timer_ends_at,
      createdAt: r.created_at
    }));
  }

  static async saveChatRoom(room: ChatRoom): Promise<void> {
    const { error } = await supabase
      .from('chat_rooms')
      .upsert({
        id: room.id,
        experiment_id: room.experimentId,
        seller_id: room.sellerId,
        buyer_id: room.buyerId,
        variant: room.variant,
        status: room.status,
        timer_ends_at: room.timerEndsAt
      });

    if (error) {
      console.error('Error saving chat room:', error);
      throw error;
    }
  }

  // ============ CHAT MESSAGES ============
  static async getMessagesByRoom(roomId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).map(m => ({
      id: m.id,
      roomId: m.room_id,
      participantId: m.participant_id,
      messageText: m.message_text,
      messageType: m.message_type as 'chat' | 'offer',
      offerPrice: m.offer_price ?? undefined,
      offerStatus: m.offer_status as 'pending' | 'accepted' | 'rejected' | undefined,
      createdAt: m.created_at
    }));
  }

  static async saveChatMessage(message: ChatMessage): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .upsert({
        id: message.id,
        room_id: message.roomId,
        participant_id: message.participantId,
        message_text: message.messageText,
        message_type: message.messageType,
        offer_price: message.offerPrice ?? null,
        offer_status: message.offerStatus ?? null,
        created_at: message.createdAt
      });

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // ============ REALTIME SUBSCRIPTIONS ============
  static subscribeToParticipants(experimentId: string, callback: (participants: Participant[]) => void) {
    const channel = supabase
      .channel(`participants:${experimentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `experiment_id=eq.${experimentId}`
        },
        async () => {
          const participants = await this.getParticipantsByExperiment(experimentId);
          callback(participants);
        }
      )
      .subscribe();

    return channel;
  }

  static subscribeToChatRoom(roomId: string, callback: (room: ChatRoom | null) => void) {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
          filter: `id=eq.${roomId}`
        },
        async () => {
          const room = await this.getChatRoom(roomId);
          callback(room);
        }
      )
      .subscribe();

    return channel;
  }

  static subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void) {
    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          const messages = await this.getMessagesByRoom(roomId);
          callback(messages);
        }
      )
      .subscribe();

    return channel;
  }

  static unsubscribe(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }

  // ============ LOCAL STORAGE (dla currentParticipant) ============
  static setCurrentParticipant(participant: Participant): void {
    localStorage.setItem('currentParticipant', JSON.stringify(participant));
  }

  static getCurrentParticipant(): Participant | null {
    const data = localStorage.getItem('currentParticipant');
    return data ? JSON.parse(data) : null;
  }

  static clearCurrentParticipant(): void {
    localStorage.removeItem('currentParticipant');
  }
}
