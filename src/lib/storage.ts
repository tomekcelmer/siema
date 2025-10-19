import { Experiment, Participant, ChatRoom, ChatMessage } from '../types';

const STORAGE_KEYS = {
  EXPERIMENTS: 'experiments',
  PARTICIPANTS: 'participants',
  CHAT_ROOMS: 'chatRooms',
  CHAT_MESSAGES: 'chatMessages',
  CURRENT_PARTICIPANT: 'currentParticipant'
};

export class StorageManager {
  private static getItem<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private static setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getExperiments(): Experiment[] {
    return this.getItem<Experiment>(STORAGE_KEYS.EXPERIMENTS);
  }

  static saveExperiment(experiment: Experiment): void {
    const experiments = this.getExperiments();
    const index = experiments.findIndex(e => e.id === experiment.id);
    if (index >= 0) {
      experiments[index] = experiment;
    } else {
      experiments.push(experiment);
    }
    this.setItem(STORAGE_KEYS.EXPERIMENTS, experiments);
  }

  static getExperiment(id: string): Experiment | undefined {
    return this.getExperiments().find(e => e.id === id);
  }

  static getParticipants(): Participant[] {
    return this.getItem<Participant>(STORAGE_KEYS.PARTICIPANTS);
  }

  static saveParticipant(participant: Participant): void {
    const participants = this.getParticipants();
    const index = participants.findIndex(p => p.id === participant.id);
    if (index >= 0) {
      participants[index] = participant;
    } else {
      participants.push(participant);
    }
    this.setItem(STORAGE_KEYS.PARTICIPANTS, participants);
  }

  static getParticipant(id: string): Participant | undefined {
    return this.getParticipants().find(p => p.id === id);
  }

  static getParticipantBySessionId(sessionId: string): Participant | undefined {
    return this.getParticipants().find(p => p.sessionId === sessionId);
  }

  static getParticipantsByExperiment(experimentId: string): Participant[] {
    return this.getParticipants().filter(p => p.experimentId === experimentId);
  }

  static getChatRooms(): ChatRoom[] {
    return this.getItem<ChatRoom>(STORAGE_KEYS.CHAT_ROOMS);
  }

  static saveChatRoom(room: ChatRoom): void {
    const rooms = this.getChatRooms();
    const index = rooms.findIndex(r => r.id === room.id);
    if (index >= 0) {
      rooms[index] = room;
    } else {
      rooms.push(room);
    }
    this.setItem(STORAGE_KEYS.CHAT_ROOMS, rooms);
  }

  static getChatRoom(id: string): ChatRoom | undefined {
    return this.getChatRooms().find(r => r.id === id);
  }

  static getChatRoomsByExperiment(experimentId: string): ChatRoom[] {
    return this.getChatRooms().filter(r => r.experimentId === experimentId);
  }

  static getChatMessages(): ChatMessage[] {
    return this.getItem<ChatMessage>(STORAGE_KEYS.CHAT_MESSAGES);
  }

  static saveChatMessage(message: ChatMessage): void {
    const messages = this.getChatMessages();
    messages.push(message);
    this.setItem(STORAGE_KEYS.CHAT_MESSAGES, messages);
    window.dispatchEvent(new CustomEvent('chatMessage', { detail: message }));
  }

  static getMessagesByRoom(roomId: string): ChatMessage[] {
    return this.getChatMessages().filter(m => m.roomId === roomId);
  }

  static getCurrentParticipant(): Participant | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_PARTICIPANT);
    return data ? JSON.parse(data) : null;
  }

  static setCurrentParticipant(participant: Participant | null): void {
    if (participant) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PARTICIPANT, JSON.stringify(participant));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PARTICIPANT);
    }
  }

  static generateId(): string {
    return crypto.randomUUID();
  }
}
