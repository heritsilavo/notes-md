import { NoteDTO } from '../types/model/note';
import { decrypt, encrypt } from './crypto-js';
import { generateRandomId } from './generate-id';
import { supabase } from './supabase';
import Toast from 'react-native-toast-message';

export const RemoteNoteService = {
  /**
   * Récupère toutes les notes d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Liste des notes ou une erreur
   */
  async getAll(): Promise<NoteDTO[]> {
    const { data, error }: { data: NoteDTO[], error: any } = await supabase
      .from('notes')
      .select('*')
      .neq('status', 'deleted')
      .order('date_modification', { ascending: true });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
    const decryptedData = data.map(d => {
      var a = { ...d };
      if (!!d.contenu_note) a.contenu_note = decrypt(d.contenu_note);
      return a
    })
    return decryptedData;
  },

  /**
   * Crée une nouvelle note
   * @param note Données de la note à créer
   * @returns La note créée ou une erreur
   */
  async create(note: NoteDTO): Promise<NoteDTO | null> {
    const newNote: NoteDTO = {
      ...note,
      supabase_id: note.supabase_id || generateRandomId(),
      contenu_note: encrypt(note.contenu_note)
    };
    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    var a = { ...data };
    if (!!data.contenu_note) a.contenu_note = decrypt(data.contenu_note);
    return a
  },

  /**
   * Récupère une note par son ID Supabase
   * @param supabaseId ID Supabase de la note
   * @returns La note correspondante ou une erreur
   */
  async getBySupabaseId(supabaseId: string): Promise<NoteDTO | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('supabase_id', supabaseId)
      .single();

    if (error) {
      console.warn(`Error fetching note[${supabaseId}]:`, error);
      return null;
    }

    var a = { ...data };
    if (!!data.contenu_note) a.contenu_note = decrypt(data.contenu_note);
    return a
  },

  /**
   * Met à jour une note existante
   * @param supabaseId ID Supabase de la note à mettre à jour
   * @param updates Champs à mettre à jour
   * @returns La note mise à jour ou une erreur
   */
  async update(
    supabaseId: string,
    updates: Partial<NoteDTO>
  ): Promise<NoteDTO | null> {
    const cryptedUpdate = {
      ...updates,
      status: updates.status || 'modified',
      date_sync: new Date().toISOString(),
    }
    if (!!updates.contenu_note) {
      cryptedUpdate.contenu_note = encrypt(updates.contenu_note)
    }

    const { data, error } = await supabase
      .from('notes')
      .update(cryptedUpdate)
      .eq('supabase_id', supabaseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return null;
    }

    var a = { ...data };
    if (!!data.contenu_note) a.contenu_note = decrypt(data.contenu_note);
    return a
  },

  /**
   * Recupère une note par son titre
   * @param title Titre de la note à récupérer
   * @returns {NoteDTO | null} La note correspondante ou null si non trouvée
   */
  async getByTitle(title: string): Promise<NoteDTO | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .neq('status', 'deleted')
      .eq('nom_note', title)
      .single();

    if (error) {
      console.warn('Error fetching note by title:', error);
      return null;
    }

    var a = { ...data };
    if (!!data.contenu_note) a.contenu_note = decrypt(data.contenu_note);
    return a
  },

  async updateNoteByTitle(
    title: string,
    updates: Partial<NoteDTO>
  ): Promise<NoteDTO | null> {
    const cryptedUpdate = {
      ...updates,
      status: updates.status || 'modified',
      date_sync: new Date().toISOString(),
    }
    if (!!updates.contenu_note) {
      cryptedUpdate.contenu_note = encrypt(updates.contenu_note)
    }
    
    const { data, error } = await supabase
      .from('notes')
      .update(cryptedUpdate)
      .neq('status', 'deleted')
      .eq('nom_note', title)
      .select()
      .single();

    if (error) {
      console.error('Error updating note by title:', error);
      return null;
    }

    var a = { ...data };
    if (!!data.contenu_note) a.contenu_note = decrypt(data.contenu_note);
    return a
  },

  /**
   * Supprime une note (marquage comme supprimé)
   * @param supabaseId ID Supabase de la note à supprimer
   * @returns true si la suppression a réussi, false sinon
   */
  async delete(supabaseId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .update({ status: 'deleted' })
      .eq('supabase_id', supabaseId)
      .neq('status', "deleted")

    if (error) {
      console.error('Error hard deleting note:', error);
      return false;
    }

    return true;
  },

  /**
   * Supprime définitivement une note de la base de données
   * @param supabaseId ID Supabase de la note à supprimer
   * @returns true si la suppression a réussi, false sinon
   */
  async hardDelete(supabaseId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('supabase_id', supabaseId);

    if (error) {
      console.error('Error hard deleting note:', error);
      return false;
    }

    return true;
  },

  /**
   * Récupère les notes modifiées localement qui doivent être synchronisées
   * @param userId ID de l'utilisateur
   * @returns Liste des notes à synchroniser ou une erreur
   */
  async getNotesToSync(userId: string): Promise<NoteDTO[] | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .neq('status', 'deleted')
      .eq('user_id', userId)
      .neq('status', 'synced');

    if (error) {
      console.error('Error fetching notes to sync:', error);
      return null;
    }

    const decryptedData = data.map(d => {
      var a = { ...d };
      if (!!d.contenu_note) a.contenu_note = decrypt(d.contenu_note);
      return a
    })
    return decryptedData;
  },

  /**
   * Marque une note comme synchronisée
   * @param supabaseId ID Supabase de la note
   * @returns La note mise à jour ou une erreur
   */
  async markAsSynced(supabaseId: string): Promise<NoteDTO | null> {
    const { data, error } = await supabase
      .from('notes')
      .update({
        status: 'synced',
        synced: true,
        date_sync: new Date().toISOString()
      })
      .neq('status', 'deleted')
      .eq('supabase_id', supabaseId)
      .select()
      .single();

    if (error) {
      console.error('Error marking note as synced:', error);
      return null;
    }

    return data;
  },

  /**
   * Hard delete all notes
   * @returns void
   */
  async clearAll(): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .neq('status', 'blahblahblahhh');

    if (error) {
      console.error('Error clearing notes:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de supprimer les notes.'
      });
    }
  },

  /**
   * Get all notes where nom_note is not in provided list
   * @param excludedTitles List of titles to exclude
   * @returns {Promise<NoteDTO[]>}
   */
  async getNotesExcludingTitles(excludedTitles: string[]): Promise<NoteDTO[]> {
    if (!excludedTitles || excludedTitles.length === 0) {
      return this.getAll();
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .not('nom_note', 'in', `(${excludedTitles.map(title => `'${title}'`).join(',')})`)
      .neq('status', 'deleted')
      .order('date_heure_note', { ascending: false });

    if (error) {
      console.error('Error fetching notes excluding titles:', error);
      return [];
    }

    const decryptedData = data.map(d => {
      var a = { ...d };
      if (!!d.contenu_note) a.contenu_note = decrypt(d.contenu_note);
      return a
    })
    return decryptedData;
  }
};