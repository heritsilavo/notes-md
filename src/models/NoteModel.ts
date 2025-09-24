import { Model } from '@nozbe/watermelondb'
import { field, date, text, readonly, json } from '@nozbe/watermelondb/decorators'

export default class NoteModel extends Model {
  static table = 'notes'

  @text('nom_note') nom_note!: string
  @text('contenu_note') contenu_note!: string
  @date('date_creation') date_creation!: Date
  @json('categorie', (raw) => Array.isArray(raw) ? raw : (typeof raw === 'string' ? JSON.parse(raw) : []))
  categorie!: string[]
  @field('synced') synced!: boolean
  @date('date_sync') date_sync!: Date | null
  @date('date_modification') date_modification!: Date | null
  @date('date_heure_note') date_heure_note!: Date
  @field('visible_pour_date_seulement') visible_pour_date_seulement!: boolean
  @date('rappel') rappel!: Date | null
  @text('typenote') typenote!: string
  @text('supabase_id') supabase_id?: string
  @text('status') status!: 'created' | 'synced' | 'modified' | 'deleted'
  @text('user_id') user_id!: string

}