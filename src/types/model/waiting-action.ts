import { NoteDTO } from "./note";

export interface WaitingActionDTO {
  id: string;
  type_action: 'CREATE' | 'UPDATE' | 'DELETE';
  note: {
    id: string;
    before: NoteDTO;
    after: NoteDTO;
    changes: Partial<NoteDTO>;
  };
  time: string; // ISO string
}