import { database } from '../database/index';
import NoteModel from '../models/NoteModel';
import { NoteDTO } from '../types/model/note';
import { Q } from '@nozbe/watermelondb';

export const WatermelonNoteService = {
  /**
   * Récupère toutes les notes
   */
  async getAll(): Promise<NoteDTO[]> {
    const notesCollection = database.get<NoteModel>('notes');
    const notes = await notesCollection.query().fetch();

    return notes
      .filter(note => note.status !== 'deleted') // Exclure les notes supprimées
      .map(note => ({
        id: note.id,
        supabase_id: note.supabase_id || '',
        nom_note: note.nom_note,
        contenu_note: note.contenu_note,
        date_creation: note.date_creation.toISOString(),
        categorie: note.categorie,
        synced: note.synced,
        date_sync: note.date_sync?.toISOString() || null,
        date_heure_note: note.date_heure_note.toISOString(),
        visible_pour_date_seulement: note.visible_pour_date_seulement,
        rappel: note.rappel?.toISOString() || null,
        typenote: note.typenote,
        user_id: note.user_id,
        status: note.status
      }));
  },

  /**
   * Récupère une note par son ID local
   */
  async getById(id: string): Promise<NoteDTO | null> {
    const notesCollection = database.get<NoteModel>('notes');
    const note = await notesCollection.find(id);

    if (!note) return null;

    return {
      id: note.id,
      supabase_id: note.supabase_id || '',
      nom_note: note.nom_note,
      contenu_note: note.contenu_note,
      date_creation: note.date_creation.toISOString(),
      categorie: note.categorie,
      synced: note.synced,
      date_sync: note.date_sync?.toISOString() || null,
      date_heure_note: note.date_heure_note.toISOString(),
      visible_pour_date_seulement: note.visible_pour_date_seulement,
      rappel: note.rappel?.toISOString() || null,
      typenote: note.typenote,
      user_id: note.user_id,
      status: note.status
    };
  },

  /**
   * Crée une nouvelle note
   */
  async create(noteData: NoteDTO): Promise<NoteDTO> {
    const notesCollection = database.get<NoteModel>('notes');

    let newNote: NoteModel;
    await database.write(async () => {
      newNote = await notesCollection.create(note => {
        note.supabase_id = noteData.supabase_id || '';
        note.nom_note = noteData.nom_note;
        note.contenu_note = noteData.contenu_note;
        note.date_creation = new Date(noteData.date_creation);
        note.categorie = noteData.categorie;
        note.synced = noteData.synced || false;
        note.date_sync = new Date(noteData.date_sync || Date.now());
        note.date_heure_note = new Date(noteData.date_heure_note || Date.now());
        note.visible_pour_date_seulement = noteData.visible_pour_date_seulement;
        note.rappel = noteData.rappel ? new Date(noteData.rappel) : null;
        note.typenote = noteData.typenote;
        note.user_id = noteData.user_id;
        note.status = 'created';
      });
    });

    return {
      id: newNote!.id,
      supabase_id: newNote!.supabase_id || '',
      nom_note: newNote!.nom_note,
      contenu_note: newNote!.contenu_note,
      date_creation: newNote!.date_creation.toISOString(),
      categorie: newNote!.categorie,
      synced: newNote!.synced,
      date_sync: newNote!.date_sync?.toISOString() || null,
      date_heure_note: newNote!.date_heure_note.toISOString(),
      visible_pour_date_seulement: newNote!.visible_pour_date_seulement,
      rappel: newNote!.rappel?.toISOString() || null,
      typenote: newNote!.typenote,
      user_id: newNote!.user_id,
      status: newNote!.status
    };
  },

  /**
   * Met à jour une note existante
   */
  async update(id: string, noteData: Partial<NoteDTO>): Promise<NoteDTO> {
    const notesCollection = database.get<NoteModel>('notes');
    let updatedNote: NoteModel;

    await database.write(async () => {
      const note = await notesCollection.find(id);
      updatedNote = await note.update(updated => {
        if (noteData.nom_note) updated.nom_note = noteData.nom_note;
        if (noteData.contenu_note) updated.contenu_note = noteData.contenu_note;
        if (noteData.categorie) updated.categorie = noteData.categorie;
        if (noteData.date_heure_note) updated.date_heure_note = new Date(noteData.date_heure_note);
        if (noteData.visible_pour_date_seulement !== undefined)
          updated.visible_pour_date_seulement = noteData.visible_pour_date_seulement;
        if (noteData.rappel !== undefined)
          updated.rappel = noteData.rappel ? new Date(noteData.rappel) : null;
        if (noteData.typenote) updated.typenote = noteData.typenote;
        if (noteData.supabase_id) updated.supabase_id = noteData.supabase_id;
        if (noteData.status) updated.status = noteData.status;
        if (noteData.synced !== undefined) updated.synced = noteData.synced;
        if (noteData.date_sync !== undefined)
          updated.date_sync = noteData.date_sync ? new Date(noteData.date_sync) : null;
      });
    });

    return {
      id: updatedNote!.id,
      supabase_id: updatedNote!.supabase_id || '',
      nom_note: updatedNote!.nom_note,
      contenu_note: updatedNote!.contenu_note,
      date_creation: updatedNote!.date_creation.toISOString(),
      categorie: updatedNote!.categorie,
      synced: updatedNote!.synced,
      date_sync: updatedNote!.date_sync?.toISOString() || null,
      date_heure_note: updatedNote!.date_heure_note.toISOString(),
      visible_pour_date_seulement: updatedNote!.visible_pour_date_seulement,
      rappel: updatedNote!.rappel?.toISOString() || null,
      typenote: updatedNote!.typenote,
      user_id: updatedNote!.user_id,
      status: updatedNote!.status
    };
  },

  /**
   * Supprime une note
   */
  async delete(id: string): Promise<void> {
    const notesCollection = database.get<NoteModel>('notes');

    await database.write(async () => {
      const note = await notesCollection.find(id);
      await note.markAsDeleted(); // Mark as deleted for sync
      // Pour une suppression immédiate sans sync: await note.destroyPermanently();
    });
  },

  /**
   * Supprime définitivement une note
   * @param id L'ID de la note à supprimer définitivement
   */
  async hardDelete(id: string): Promise<void> {
    const notesCollection = database.get<NoteModel>('notes');
    await database.write(async () => {
      const note = await notesCollection.find(id);
      await note.destroyPermanently(); // Supprime définitivement la note
    });
  },

  /**
   * Récupère les notes non synchronisées
   */
  async getUnsyncedNotes(): Promise<NoteDTO[]> {
    const notesCollection = database.get<NoteModel>('notes');
    const notes = await notesCollection.query(
      Q.where('synced', false)
    ).fetch();

    return notes.map(note => ({
      id: note.id,
      supabase_id: note.supabase_id || '',
      nom_note: note.nom_note,
      contenu_note: note.contenu_note,
      date_creation: note.date_creation.toISOString(),
      categorie: note.categorie,
      synced: note.synced,
      date_sync: note.date_sync?.toISOString() || null,
      date_heure_note: note.date_heure_note.toISOString(),
      visible_pour_date_seulement: note.visible_pour_date_seulement,
      rappel: note.rappel?.toISOString() || null,
      typenote: note.typenote,
      user_id: note.user_id,
      status: note.status
    }));
  },

  /**
   * Récupère les notes par catégorie
   */
  async getByCategory(category: string): Promise<NoteDTO[]> {
    const notesCollection = database.get<NoteModel>('notes');
    const notes = await notesCollection.query().fetch();
    // Filtrer les notes dont le tableau categorie contient la catégorie recherchée
    const filtered = notes.filter(note => Array.isArray(note.categorie) && note.categorie.includes(category));
    return filtered.map(note => ({
      id: note.id,
      supabase_id: note.supabase_id || '',
      nom_note: note.nom_note,
      contenu_note: note.contenu_note,
      date_creation: note.date_creation.toISOString(),
      categorie: note.categorie,
      synced: note.synced,
      date_sync: note.date_sync?.toISOString() || null,
      date_heure_note: note.date_heure_note.toISOString(),
      visible_pour_date_seulement: note.visible_pour_date_seulement,
      rappel: note.rappel?.toISOString() || null,
      typenote: note.typenote,
      user_id: note.user_id,
      status: note.status
    }));
  },

  /**
   * Mark all as deleted
   */
  async markAllAsDeleted(): Promise<void> {
    const notesCollection = database.get<NoteModel>('notes');

    await database.write(async () => {
      const allNotes = await notesCollection.query().fetch();
      for (const note of allNotes) {
        await note.markAsDeleted();
      }
    });
  },

  /**
   * Clear all notes
   */
  async clearAll(): Promise<void> {
    const notesCollection = database.get<NoteModel>('notes');

    await database.write(async () => {
      const allNotes = await notesCollection.query().fetch();
      for (const note of allNotes) {
        await note.destroyPermanently();
      }
    });
  }
};