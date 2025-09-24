import { EnumRouteNames } from "./enum-route-names";
import { NoteDTO } from "./model/note";

export type RootStackParamList = {
  [EnumRouteNames.HOME]: {
    refresh_note?: boolean
  };
  [EnumRouteNames.NOTE_EDITOR]: {
    note: NoteDTO;
    isEditing: boolean;
    isExistingNote: boolean;
  };
  [EnumRouteNames.WAITING_ACTIONS]: undefined;
  [EnumRouteNames.COMPARE_NOTE_SCREEN]: {
    noteTitle: string;
    id: string;
    supabase_id: string;
  }
};