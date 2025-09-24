import { Model } from '@nozbe/watermelondb'
import { text, json, date } from '@nozbe/watermelondb/decorators'
import { NoteDTO } from '../types/model/note';

export default class WaitingActionModel extends Model {
  static table = 'waiting_action'

  @text('type_action')
  type_action!: 'CREATE' | 'UPDATE' | 'DELETE';

  @json('note', (raw) => raw)
  note!: {
    id: string;
    before: NoteDTO;
    after: NoteDTO;
    changes: Partial<NoteDTO>
  };

  @date('time')
  time!: Date;
}