export interface NoteDTO {
  id: string //local(WatermolonDB/SQLite) Id
  supabase_id: string //Id pour Supabase // supabase_id is optional because it may not be set until the note is synced with
  nom_note: string
  contenu_note: string
  date_creation: string
  categorie: string[],
  balises?: string[] // Optional, can be added later
  synced: boolean
  date_sync: string | null
  date_heure_note: string
  visible_pour_date_seulement: boolean
  rappel: string | null
  typenote: string
  user_id: string
  status: 'created' | 'synced' | 'modified' | 'deleted',
  date_modification?: string
  parents: string[]
  enfants: string[]
}

export const defaultNoteDTO: NoteDTO = {
  id: '', // Généré normalement par WatermelonDB/SQLite
  supabase_id: '', // Vide jusqu'à synchronisation
  nom_note: 'Titre Du note',
  contenu_note: '',
  date_creation: new Date().toISOString(), // Date actuelle
  categorie: ['all'], // Vous pouvez mettre une catégorie par défaut
  synced: false, // Non synchronisé par défaut
  date_sync: null, // Pas encore synchronisé
  date_heure_note: new Date().toISOString(), // Date/heure actuelle
  visible_pour_date_seulement: false, // Visible partout par défaut
  rappel: null, // Pas de rappel par défaut
  typenote: 'texte', // Type par défaut
  user_id: '', // À remplir avec l'ID de l'utilisateur connecté
  status: 'created', // Statut initial
  date_modification: undefined,
  parents: [],
  enfants: []
};