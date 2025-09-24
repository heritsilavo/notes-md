
-- TABLE D'HISTORIQUE DES NOTES
-- Cette table enregistre l'historique des modifications apportées aux notes.

CREATE TABLE notes_hist (
  -- Identifiants
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id TEXT REFERENCES notes(supabase_id),
  
  -- Contenu principal
  nom_note TEXT NOT NULL,
  avant JSONB NOT NULL,  -- Utilisation de JSONB au lieu de TEXT
  apres JSONB NOT NULL,   -- JSONB pour de meilleures performances
  
  -- Horodatage automatique
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Métadonnées
  action TEXT NOT NULL CHECK (action IN ('CREATION', 'MODIFICATION', 'SUPPRESSION', 'SYNCHRONISATION')),
  
  -- Index pour les performances
  CONSTRAINT fk_note FOREIGN KEY(note_id) REFERENCES notes(supabase_id)
);

-- Création des index
CREATE INDEX idx_notes_hist_note_id ON notes_hist(note_id);
CREATE INDEX idx_notes_hist_created_at ON notes_hist(created_at);
CREATE INDEX idx_notes_hist_action ON notes_hist(action);


-- FONCION TRIGGER POUR CREER L'HISTORIQUE
CREATE OR REPLACE FUNCTION gestion_historique_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO notes_hist (
      note_id, nom_note, avant, apres, action
    ) VALUES (
      NEW.supabase_id, NEW.nom_note, '{}'::jsonb, to_jsonb(NEW), 
      'CREATION'
    );
    
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Vérifier si le status a été modifié à 'deleted'
    IF (NEW.status = 'deleted' AND OLD.status != 'deleted') THEN
      INSERT INTO notes_hist (
        note_id, nom_note, avant, apres, action
      ) VALUES (
        NEW.supabase_id, NEW.nom_note, to_jsonb(OLD), to_jsonb(NEW),
        'SUPPRESSION'
      );
    ELSIF(NEW.status = 'synced' AND OLD.status != 'synced') THEN
      -- Cas de synchronisation
      INSERT INTO notes_hist (
        note_id, nom_note, avant, apres, action
      ) VALUES (
        NEW.supabase_id, NEW.nom_note, to_jsonb(OLD), to_jsonb(NEW),
        'SYNCHRONISATION'
      );
    ELSE
      -- Cas de modification normale
      INSERT INTO notes_hist (
        note_id, nom_note, avant, apres, action
      ) VALUES (
        NEW.supabase_id, NEW.nom_note, to_jsonb(OLD), to_jsonb(NEW),
        'MODIFICATION'
      );
    END IF;
    
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO notes_hist (
      note_id, nom_note, avant, apres, action
    ) VALUES (
      OLD.supabase_id, OLD.nom_note, to_jsonb(OLD), '{}'::jsonb,
      'SUPPRESSION'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Création du trigger
CREATE TRIGGER trigger_historique_notes
  AFTER INSERT OR UPDATE OR DELETE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION gestion_historique_notes();
