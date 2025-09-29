import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 5,
  tables: [
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'supabase_id', type: 'string', isOptional: true },
        { name: 'nom_note', type: 'string' },
        { name: 'contenu_note', type: 'string' },
        { name: 'date_creation', type: 'number' },
        { name: 'categorie', type: 'string' }, // Stocker comme stringifié JSON
        { name: 'synced', type: 'boolean' },
        { name: 'date_sync', type: 'number', isOptional: true },
        { name: 'date_modification', type: 'number', isOptional: true },
        { name: 'date_heure_note', type: 'number' },
        { name: 'visible_pour_date_seulement', type: 'boolean' },
        { name: 'rappel', type: 'number', isOptional: true },
        { name: 'typenote', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'user_id', type: 'string' },
        { name: 'parents', type: 'string' }, // Stocker comme stringifié JSON
        { name: 'enfants', type: 'string' }  // Stocker comme stringifié JSON
      ]
    }),
    tableSchema({
      name: 'waiting_action',
      columns: [
        { name: 'type_action', type: 'string' },
        { name: 'note', type: 'string' }, // JSON stocké comme string
        { name: 'time', type: 'number' }   // Date stockée comme timestamp
      ]
    }),
  ]
});