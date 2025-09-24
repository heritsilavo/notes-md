CREATE TABLE notes (
  -- Identifiants
  supabase_id TEXT PRIMARY KEY,                 -- ID de Supabase
  id TEXT,                   -- ID local de WatermelonDB
  
  -- Contenu principal
  nom_note TEXT NOT NULL,
  contenu_note TEXT NOT NULL,
  
  -- Dates (stockées en TEXT comme dans le DTO)
  date_creation TEXT NOT NULL,
  date_heure_note TEXT NOT NULL,
  date_sync TEXT,
  
  -- Métadonnées
  categorie TEXT NOT NULL,
  typenote TEXT NOT NULL,                -- Respect de la casse exacte
  visible_pour_date_seulement BOOLEAN NOT NULL DEFAULT FALSE,
  rappel TEXT,                           -- Stocké en TEXT comme dans le DTO
  
  -- Synchronisation
  synced BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('synced', 'modified', 'deleted')),
  user_id TEXT NOT NULL                  -- Correspond au type string du DTO
);

-- Contraintes pour assurer l'intégrité des données
ALTER TABLE notes 
DROP CONSTRAINT IF EXISTS notes_status_check;

ALTER TABLE notes 
ADD CONSTRAINT notes_status_check 
CHECK (status IN ('synced', 'modified', 'deleted', 'created'));

-- Index pour améliorer les performances
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_supabase_id ON notes(supabase_id) WHERE supabase_id IS NOT NULL;

-- Table modification (change categorie type to Array of text, add new column balises type Array of text)
ALTER TABLE notes
ADD COLUMN balises TEXT[] DEFAULT ARRAY[]::TEXT[],  -- Ajout de la colonne balises
ALTER COLUMN categorie TYPE TEXT[] USING string_to_array(categorie, ',');  -- Conversion de categorie en tableau de texte
-- Mise à jour des valeurs existantes pour la colonne categorie (postgerql supabase)


ALTER TABLE notes
ADD COLUMN date_modification timestamp;  -- Ajout de la colonne date_modification

ALTER TABLE notes ADD COLUMN parents TEXT[];
ALTER TABLE notes ADD COLUMN enfants TEXT[];