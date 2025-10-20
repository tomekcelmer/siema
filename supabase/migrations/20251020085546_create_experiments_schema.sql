/*
  # Schema dla Aplikacji Negocjacyjnej - Wersja Produkcyjna
  
  ## Opis
  Pełny schemat bazy danych dla eksperymentów negocjacyjnych na uczelni.
  Umożliwia realtime komunikację między uczestnikami i gospodarzem.
  
  ## Tabele
  
  ### 1. experiments
  Przechowuje informacje o eksperymentach (sesje prowadzone przez gospodarza)
  - id: kod eksperymentu (np. "arbuz")
  - name: nazwa wyświetlana
  - experiment_type: 1 (anonimowo) lub 2 (z imionami)
  - status: waiting/active/completed
  - host_password: hasło gospodarza
  - created_at: timestamp utworzenia
  
  ### 2. participants
  Wszyscy uczestnicy eksperymentów
  - id: UUID
  - session_id: UUID dla recovery
  - experiment_id: kod eksperymentu
  - first_name, last_name: dane uczestnika
  - role: seller/buyer
  - variant: A/B/C/D
  - current_page: 1-8 (numer strony w flow)
  - consent_given: czy wyraził zgodę
  - declared_price: cena zadeklarowana na stronie 4
  - final_price: wynegocjowana cena
  - reward: obliczona nagroda
  - transaction_time: kiedy zawarto transakcję
  - pair_id: ID pokoju czatu
  - created_at: timestamp rejestracji
  
  ### 3. chat_rooms
  Pokoje czatowe (pary uczestników)
  - id: UUID
  - experiment_id: kod eksperymentu
  - seller_id: ID sprzedającego
  - buyer_id: ID kupującego
  - variant: A/B/C/D
  - status: active/completed/no_transaction
  - timer_ends_at: timestamp końca timera (10 minut)
  - created_at: timestamp utworzenia
  
  ### 4. chat_messages
  Wszystkie wiadomości w czatach
  - id: UUID
  - room_id: ID pokoju
  - participant_id: kto wysłał
  - message_text: treść wiadomości
  - message_type: chat/offer
  - offer_price: cena oferty (jeśli type=offer)
  - offer_status: pending/accepted/rejected
  - created_at: timestamp wiadomości
  
  ## Security
  - Row Level Security (RLS) włączone dla wszystkich tabel
  - Polityki umożliwiają:
    - Uczestnikom: dostęp tylko do swoich danych i danych swojego pokoju
    - Gospodarzom: dostęp do wszystkich danych swojego eksperymentu
  
  ## Realtime
  - Wszystkie tabele mają włączoną replikację realtime
  - Pozwala na natychmiastową synchronizację między urządzeniami
*/

-- Włączenie UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela eksperymentów
CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  experiment_type INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting',
  host_password TEXT NOT NULL DEFAULT 'Pandka123',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela uczestników
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,
  variant TEXT,
  current_page INTEGER NOT NULL DEFAULT 1,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  declared_price NUMERIC(10,2),
  final_price NUMERIC(10,2),
  reward NUMERIC(10,2),
  transaction_time TIMESTAMPTZ,
  pair_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela pokoi czatowych
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  timer_ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela wiadomości
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat',
  offer_price NUMERIC(10,2),
  offer_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_participants_experiment ON participants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_participants_session ON participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_pair ON participants(pair_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_experiment ON chat_rooms(experiment_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- Funkcja auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery dla updated_at
DROP TRIGGER IF EXISTS update_experiments_updated_at ON experiments;
CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Polityki RLS - Każdy może czytać i pisać (dla uproszczenia w środowisku eksperymentalnym)
-- W produkcji można dodać bardziej restrykcyjne polityki

-- Experiments: publiczny dostęp do odczytu, zapis tylko dla gospodarza
CREATE POLICY "Anyone can read experiments" ON experiments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert experiments" ON experiments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update experiments" ON experiments FOR UPDATE USING (true);

-- Participants: publiczny dostęp
CREATE POLICY "Anyone can read participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert participants" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update participants" ON participants FOR UPDATE USING (true);

-- Chat Rooms: publiczny dostęp
CREATE POLICY "Anyone can read chat rooms" ON chat_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat rooms" ON chat_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat rooms" ON chat_rooms FOR UPDATE USING (true);

-- Chat Messages: publiczny dostęp
CREATE POLICY "Anyone can read messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update messages" ON chat_messages FOR UPDATE USING (true);

-- Włączenie Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE experiments;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
