/*
  # Dodanie polityk DELETE dla wszystkich tabel

  1. Zmiany
    - Dodanie polityk DELETE dla experiments
    - Dodanie polityk DELETE dla participants  
    - Dodanie polityk DELETE dla chat_rooms
    - Dodanie polityk DELETE dla chat_messages

  2. Bezpieczeństwo
    - Wszyscy mogą usuwać (zgodnie z obecnym modelem bezpieczeństwa)
    - CASCADE już skonfigurowane w foreign keys
*/

-- Polityki DELETE dla experiments
CREATE POLICY "Anyone can delete experiments" ON experiments FOR DELETE USING (true);

-- Polityki DELETE dla participants
CREATE POLICY "Anyone can delete participants" ON participants FOR DELETE USING (true);

-- Polityki DELETE dla chat_rooms
CREATE POLICY "Anyone can delete chat rooms" ON chat_rooms FOR DELETE USING (true);

-- Polityki DELETE dla chat_messages
CREATE POLICY "Anyone can delete messages" ON chat_messages FOR DELETE USING (true);
