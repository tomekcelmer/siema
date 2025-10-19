export type Role = 'seller' | 'buyer';
export type Variant = 'A' | 'B' | 'C' | 'D';
export type ExperimentType = 1 | 2;
export type ExperimentStatus = 'waiting' | 'active' | 'completed';
export type RoomStatus = 'active' | 'completed' | 'no_transaction';
export type MessageType = 'chat' | 'offer' | 'system';
export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface Experiment {
  id: string;
  name: string;
  experimentType: ExperimentType;
  status: ExperimentStatus;
  createdAt: string;
}

export interface Participant {
  id: string;
  sessionId: string;
  experimentId: string;
  firstName: string;
  lastName: string;
  role?: Role;
  variant?: Variant;
  declaredPrice?: number;
  finalPrice?: number;
  reward?: number;
  transactionTime?: string;
  pairId?: string;
  currentPage: number;
  consentGiven: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  experimentId: string;
  variant: Variant;
  sellerId: string;
  buyerId: string;
  timerStartedAt: string;
  timerEndsAt: string;
  status: RoomStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  participantId: string;
  messageText: string;
  messageType: MessageType;
  offerPrice?: number;
  offerStatus?: OfferStatus;
  createdAt: string;
}

export interface InstructionContent {
  variant: Variant;
  role: Role;
  text: string[];
}
