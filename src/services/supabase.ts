import { createClient } from '@supabase/supabase-js';
import { NoteDTO } from '../types/model/note';
import 'react-native-url-polyfill/auto'; // Nécessaire pour React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_KEY } from '@env';

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: NoteDTO;
        Insert: Omit<NoteDTO, 'id'>;
        Update: Partial<NoteDTO>;
      }
    }
  }
}

// Configuration plus robuste pour React Native
const supabaseUrl = SUPABASE_URL; // Remplacez par votre URL
const supabaseKey = SUPABASE_KEY; // Remplacez par votre clé


export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important pour React Native
  },
  // Options supplémentaires recommandées
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  }
});
