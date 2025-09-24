import { database } from '../database/index';
import WaitingActionModel from '../models/WaitingActionModel';
import { NoteDTO } from '../types/model/note';
import { Q } from '@nozbe/watermelondb';
import { WaitingActionDTO } from '../types/model/waiting-action';
import { RemoteNoteService } from './remote-notes-services';
import { WatermelonNoteService } from './watermelon-notes-service';
import { connectionService } from './conneciont-service';
import { generateRandomId } from './generate-id';
import Toast from 'react-native-toast-message';


export const WatermelonWaitingActionService = {
  /**
   * Récupère toutes les actions en attente
   */
  async getAllWaitingAction(): Promise<WaitingActionDTO[]> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');
    const waitingActions = await waitingActionsCollection.query().fetch();

    return waitingActions.map(action => ({
      id: action.id,
      type_action: action.type_action,
      note: action.note,
      time: action.time.toISOString()
    }));
  },

  /**
   * Crée une nouvelle action en attente
   */
  async createWaitingAction(actionData: Omit<WaitingActionDTO, 'id'>): Promise<WaitingActionDTO> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');

    let newAction: WaitingActionModel;
    await database.write(async () => {
      newAction = await waitingActionsCollection.create(action => {
        action.type_action = actionData.type_action;
        action.note = actionData.note;
        action.time = new Date(actionData.time);
      });
    });

    return {
      id: newAction!.id,
      type_action: newAction!.type_action,
      note: newAction!.note,
      time: newAction!.time.toISOString()
    };
  },

  /**
   * Récupère une action en attente par son ID
   */
  async getById(id: string): Promise<WaitingActionDTO | null> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');

    try {
      const action = await waitingActionsCollection.find(id);

      if (!action) return null;

      return {
        id: action.id,
        type_action: action.type_action,
        note: action.note,
        time: action.time.toISOString()
      };
    } catch (error) {
      console.error('Error finding waiting action:', error);
      return null;
    }
  },

  /**
   * Applique une action en attente et la supprime
  * NE MARCHE PAS !!!
  * ERROR="Remember that if you're calling a reader/writer from another reader/writer, you must use callReader()/callWriter(). See docs for more details."
   */
  async applyAndDeleteOne(id: string): Promise<boolean> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');

    try {
      const action = await waitingActionsCollection.find(id);

      if (!action) {
        console.warn(`Waiting action with id ${id} not found`);
        return false;
      }

      await database.write(async () => {
        // Ici vous pouvez ajouter la logique pour appliquer l'action
        // Par exemple, synchroniser avec le serveur distant
        switch (action.type_action) {
          case 'CREATE':
            console.log('Applying CREATE action:', action.note);
            var newNote = action.note.after; //prenddre .after
            newNote.synced = true;
            newNote.date_sync = (new Date()).toISOString();

            if (!newNote.supabase_id) throw new Error("NO SUPABASE ID PRESENT IN NOTE FROM WAITING ACTION")

            await RemoteNoteService.create(newNote);
            await WatermelonNoteService.update(action.note.after.id, {
              synced: true,
              date_sync: (new Date()).toISOString(),
            })
            break;
          case 'UPDATE':
            console.log('Applying UPDATE action:', action.note);
            // Logique pour mettre à jour la note sur le serveur
            break;
          case 'DELETE':
            console.log('Applying DELETE action:', action.note);
            // Logique pour supprimer la note sur le serveur
            break;
        }

        // Supprimer l'action après application
        await action.destroyPermanently();
      });

      return true;
    } catch (error) {
      console.error('Error applying and deleting waiting action:', error);
      return false;
    }
  },

  /**
 * Applique toutes les actions en attente et les supprime
 * Utilise la fonction applyAndDeleteOne
 */
  async applyAndDeleteAll(): Promise<{ applied: number; failed: number, failureCauses: string[] }> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');
    const allActions = await waitingActionsCollection.query().fetch();

    let applied = 0;
    let failed = 0;
    const failureCauses: string[] = [];
    const failedActions: string[] = [];

    // Process actions sequentially to avoid conflicts
    for (const action of allActions) {
      try {
        switch (action.type_action) {
          case 'CREATE':
            console.log('Applying CREATE action:', action.note);
            var newNote = action.note.after; //prenddre .after
            newNote.synced = true;
            newNote.date_sync = (new Date()).toISOString();

            const isConnected =  await connectionService.isConnected();
            if (!newNote.supabase_id) throw new Error("NO SUPABASE ID PRESENT IN NOTE FROM WAITING ACTION")
            if (!isConnected) throw new Error("NOT COPNNECTED !!");
            const noteGotByTitle = await RemoteNoteService.getByTitle(newNote.nom_note);
            if (noteGotByTitle) {
              console.warn(`Note with title ${newNote.nom_note} already exists on remote`);
              failureCauses.push(`Note with title ${newNote.nom_note} already exists on remote`);
              failed++;
              failedActions.push(action.id);
              continue;
            }
            await RemoteNoteService.create(newNote);
            await WatermelonNoteService.update(action.note.after.id, {
              synced: true,
              date_sync: (new Date()).toISOString(),
            })
            applied++;
            break;
          case 'UPDATE':
            console.log('Applying UPDATE action:', action.note);
            var updatedNote = action.note.after; //prenddre .after
            updatedNote.synced = true;
            updatedNote.date_sync = (new Date()).toISOString();
            const supabaseId = updatedNote.supabase_id || (await WatermelonNoteService.getById(action.note.id))?.supabase_id || generateRandomId();
            const remoteNote = await RemoteNoteService.getBySupabaseId(supabaseId);
            if (!(await connectionService.isConnected())) throw new Error("NOT COPNNECTED !!")
            if (!remoteNote) {
              console.warn(`Remote note with supabase_id ${supabaseId} not found`);
              failed++;
              failedActions.push(action.id);
              failureCauses.push(`Remote note with supabase_id ${supabaseId} not found`);
              continue;
            }
            await RemoteNoteService.update(supabaseId, updatedNote);
            await WatermelonNoteService.update(action.note.after.id, {
              synced: true,
              date_sync: (new Date()).toISOString(),
            });

            break;
          case 'DELETE':
            console.log('Applying DELETE action:', action.note);
            const noteToDelete = action.note.before; //prenddre .before
            if (!noteToDelete.supabase_id) {
              console.warn(`Note with id ${noteToDelete.id} has no supabase_id, cannot delete on server.`);
              failed++;
              failedActions.push(action.id);
              failureCauses.push(`Note with id ${noteToDelete.id} has no supabase_id, cannot delete on server.`);
              continue;
            }
            if (!(await connectionService.isConnected())) throw new Error("NOT COPNNECTED !!")
            await RemoteNoteService.delete(noteToDelete.supabase_id);
            applied++;
            break;
        }
      } catch (error) {
        console.error(`Error applying action ${action.id}:`, error);
        failed++;
        failedActions.push(action.id);
      }
    }
    // Supprimer toutes les actions après application
    await database.write(async () => {
      for (const action of allActions) {
        if (failedActions.includes(action.id)) continue;
        await action.destroyPermanently();
      }
    });

    return { applied, failed, failureCauses };
  },

  /**
   * Supprime toutes les actions en attente sans les appliquer
   */
  async clearAll(): Promise<void> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');

    await database.write(async () => {
      const allActions = await waitingActionsCollection.query().fetch();
      for (const action of allActions) {
        await action.destroyPermanently();
      }
    });
  },

  /**
   * Compte le nombre d'actions en attente
   */
  async getCount(): Promise<number> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');
    const count = await waitingActionsCollection.query().fetchCount();
    return count;
  },

  /**
   * Récupère les actions en attente par type
   */
  async getByType(type: 'CREATE' | 'UPDATE' | 'DELETE'): Promise<WaitingActionDTO[]> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');
    const actions = await waitingActionsCollection.query(
      Q.where('type_action', type)
    ).fetch();

    return actions.map(action => ({
      id: action.id,
      type_action: action.type_action,
      note: action.note,
      time: action.time.toISOString()
    }));
  },

  /**
   * Supprime une action en attente par son ID
   */
  async deleteWaitingAction(id: string): Promise<void> {
    const waitingActionsCollection = database.get<WaitingActionModel>('waiting_action');

    try {
      const action = await waitingActionsCollection.find(id);
      if (action) {
        await database.write(async () => {
          await action.destroyPermanently();
        });
      } else {
        console.warn(`Waiting action with id ${id} not found`);
      }
    } catch (error) {
      console.error('Error deleting waiting action:', error);
    }
  }
};