import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema'
import NoteModel from '../models/NoteModel'
import { Platform } from 'react-native'
import WaitingActionModel from '../models/WaitingActionModel'

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'notesApp',
  jsi: Platform.OS === 'ios'
})

export const database = new Database({
  adapter,
  modelClasses: [NoteModel, WaitingActionModel]
})