import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Dimensions,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { ThemeColor } from "../../constants/colors";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { useState, useEffect, useRef, createContext, useContext, useCallback, useMemo } from "react";
import { SelectionPosition, FormattingOptions } from "../../types/NotesEditor/types";
import { TOTAL_HEADER_SPACE, CATEGORY_SELECT_HEIGHT } from "../../constants/noteEditor";
import { Header } from "./Header/Header";
import { FormattingToolbar } from "./FormattingToolbar/FormattingToolbar";
import MarkdownViewer from "./MarkdownViewer/MarkdownViewer";
import { defaultNoteDTO, NoteDTO } from "../../types/model/note";
import { EnumRouteNames } from "../../types/enum-route-names";
import { connectionService } from "../../services/conneciont-service";
import { RemoteNoteService } from "../../services/remote-notes-services";
import { WatermelonNoteService } from "../../services/watermelon-notes-service";
import { generateRandomId } from "../../services/generate-id";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../../types/root-stack-param-list";
import CategoriesSelector from "../HomeScreen/CategoriesSelector/CategoriesSelector";
import { WaitingActionDTO } from "../../types/model/waiting-action";
import { WatermelonWaitingActionService } from "../../services/watermelon-waiting-action-service";
import { useConnectionState } from "../../../App";
import Loading from "../Loading/Loading";

// Types
type NoteEditorRouteProp = RouteProp<RootStackParamList, EnumRouteNames.NOTE_EDITOR>;

type EditModeContextType = {
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
};

type NoteEditorScreenProps = {
  route: NoteEditorRouteProp;
  navigation: NavigationProp<RootStackParamList, EnumRouteNames.NOTE_EDITOR>;
};

// Constants
const SELECTION_TIMEOUT = 50;
const DEFAULT_NOTE_TITLE = "Note title";
const DEFAULT_USER_ID = "default-user-123";

// Context
const EditModeContext = createContext<EditModeContextType>({
  editMode: false,
  setEditMode: () => { }
});

// Validation helpers
const validateNoteInputs = (title: string, content: string) => {
  if (!title.trim()) {
    return { isValid: false, error: "Note title cannot be empty" };
  }
  if (!content.trim()) {
    return { isValid: false, error: "Note content cannot be empty" };
  }
  return { isValid: true, error: null };
};

const showToast = (type: 'success' | 'error', text1: string, text2: string) => {
  Toast.show({ type, text1, text2 });
};

// Main component
export default function NoteEditorScreen({ route, navigation }: NoteEditorScreenProps) {
  // Route params with default values
  const params = useMemo(() => {
    return route.params || {
      note: { ...defaultNoteDTO },
      isEditing: true,
      isExistingNote: false
    };
  }, [route.params]);

  const { note: initialNote, isEditing, isExistingNote } = params;
  const connectionState = useConnectionState()

  // State
  const [note, setNote] = useState(initialNote.contenu_note || "");
  const [noteTitle, setNoteTitle] = useState(initialNote.nom_note || DEFAULT_NOTE_TITLE);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(true);
  const [selection, setSelection] = useState<SelectionPosition>({ start: 0, end: 0 });
  const [editMode, setEditMode] = useState(isEditing || false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState((isExistingNote && initialNote?.categorie) || ["All"]);

  // Refs
  const textInputRef = useRef<TextInput>(null);

  // Memoized values
  const inputHeight = useMemo(() => {
    const screenHeight = Dimensions.get('window').height;
    return isKeyboardVisible
      ? screenHeight - keyboardHeight - TOTAL_HEADER_SPACE - CATEGORY_SELECT_HEIGHT
      : screenHeight - TOTAL_HEADER_SPACE - CATEGORY_SELECT_HEIGHT;
  }, [isKeyboardVisible, keyboardHeight]);

  // Handlers
  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleSavePress = useCallback(async () => {
    if (!isExistingNote) {
      await creerUneNouvelleNote();
    } else {
      await modifierUneNote();
    }
  }, [isExistingNote, noteTitle, note, categories]);

  const handleSelectionChange = useCallback((e: any) => {
    const { selection } = e.nativeEvent;
    setSelection(selection);
  }, []);

  // Note creation logic
  const creerUneNouvelleNote = async () => {
    const validation = validateNoteInputs(noteTitle, note);
    if (!validation.isValid) {
      showToast('error', 'Error', validation.error!);
      console.warn(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      const isConnected = await connectionService.isConnected();
      console.log("Is connected to the internet:", isConnected);

      // Check for existing note with same title
      const createdNotes = await WatermelonNoteService.getAll();
      if (isConnected) {
        const remoteNotes = await RemoteNoteService.getAll();
        createdNotes.push(...remoteNotes);
      }

      const existingNote = createdNotes.find(n =>
        n.status !== "deleted" && n.nom_note === noteTitle
      );

      if (existingNote) {
        showToast('error', 'Error', 'A note with this title already exists. Please choose a different title.');
        console.warn("A note with this title already exists. Please choose a different title.");
        return;
      }

      // Create new note
      const currentTime = new Date().toISOString();
      let newNote: NoteDTO = {
        id: '',
        supabase_id: generateRandomId(),
        nom_note: noteTitle,
        contenu_note: note,
        date_creation: currentTime,
        date_heure_note: currentTime,
        date_sync: isConnected ? currentTime : null,
        categorie: categories,
        typenote: 'markdown',
        visible_pour_date_seulement: false,
        rappel: null,
        synced: isConnected,
        status: 'created',
        user_id: DEFAULT_USER_ID,
        parents: [],
        enfants: []
      };

      if (isConnected) {
        const remoteNote = await RemoteNoteService.create(newNote);

        if (remoteNote) {
          newNote = { ...remoteNote };
          console.log("Remote note created successfully:", remoteNote);
        } else {
          console.error("Failed to create remote note");
        }
      }

      newNote = await WatermelonNoteService.create(newNote);

      showToast('success', 'Success', 'Note saved successfully');
      console.log("Note created successfully:", newNote);

      // CREATE A LINE IN WAITING ACTION
      if (!isConnected) {
        const newWaitinActionDTO: WaitingActionDTO = {
          type_action: 'CREATE',
          id: generateRandomId(),
          time: (new Date()).toISOString(),
          note: {
            id: generateRandomId(),
            before: newNote,
            after: newNote,
            changes: newNote
          }
        }
        const createdWaitingAction = await WatermelonWaitingActionService.createWaitingAction(newWaitinActionDTO);
        console.log("CREATED WAITING ACTION:", createdWaitingAction);
      } else { // ajouter l'id locale dans la remote note
        await RemoteNoteService.update(newNote.supabase_id, { id: newNote.id });
      }

      navigation.navigate(EnumRouteNames.HOME, { refresh_note: true });

    } catch (error) {
      console.error("Error creating note:", error);
      showToast('error', 'Error', 'Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  // Note modification logic
  const modifierUneNote = useCallback(async () => {
    setIsLoading(true);
    console.log("note existante", initialNote);

    try {
      const isConnected = await connectionService.isConnected();
      const localeNote = await WatermelonNoteService.getById(initialNote.id);

      if (!localeNote) {
        console.error("Note not found in local database");
        showToast('error', 'Error', 'Note not found in local database');
        return;
      }

      const localUpdateDTO: Partial<NoteDTO> = {
        contenu_note: note,
        categorie: categories
      };
      console.log("LOCALE UPDATE DTO:", localUpdateDTO);


      const updatedNote = await WatermelonNoteService.update(initialNote.id, localUpdateDTO);
      console.log("Note updated successfully:", updatedNote);

      // Update remote version if connected
      if (isConnected && initialNote.supabase_id && initialNote.synced) {
        if (!!initialNote && initialNote.contenu_note !== note) {
          // TODO: Handle case where remote content has changed
          // Aficher une VUE pour gerer les conflits de contenu
          // Aficher les deux contenus et laisser l'utilisateur choisir ou concatener les deux
        }

        const existingRemoteNote = await RemoteNoteService.getBySupabaseId(initialNote.supabase_id);
        if (!existingRemoteNote) {
          console.warn("No remote note found with the Supabase ID:", initialNote.supabase_id);
          showToast('error', 'Error', 'No remote note found with the Supabase ID');
          return;
        }

        const remoteUpdateDTO: Partial<NoteDTO> = {
          contenu_note: note,
          date_sync: new Date().toISOString(),
          synced: true,
        categorie: categories
        };
        console.log("REMOTE UPDATE DTO", remoteUpdateDTO);

        const remoteNote = await RemoteNoteService.update(initialNote.supabase_id, remoteUpdateDTO);
        console.log("Remote note updated successfully:", remoteNote);
      } else if (isConnected && !initialNote.supabase_id) {
        console.warn("Note does not have a Supabase ID");
        const noteByNom = await RemoteNoteService.getByTitle(initialNote.nom_note);
        if (noteByNom) {
          const remoteUpdateDTO: Partial<NoteDTO> = {
            contenu_note: note,
            date_sync: new Date().toISOString(),
            synced: true,
            categorie: categories
          };
          console.log("REMOTE UPDATE DTO", remoteUpdateDTO);

          const remoteNote = await RemoteNoteService.update(noteByNom.supabase_id, remoteUpdateDTO);
          console.log("Remote note updated successfully:", remoteNote);
          await WatermelonNoteService.update(initialNote.id, { supabase_id: noteByNom.supabase_id });
        } else {
          console.warn("No remote note found with the title:", initialNote.nom_note);
          //Create a new remote note if it doesn't exist
          const newSupabaseID = generateRandomId();
          const newRemoteNote = await RemoteNoteService.create({
            ...localeNote,
            nom_note: noteTitle,
            contenu_note: note,
            date_sync: new Date().toISOString(),
            synced: true,
            categorie: categories,
            supabase_id: newSupabaseID
          });
          console.log("New remote note created successfully:", newRemoteNote);
          await WatermelonNoteService.update(initialNote.id, {
            supabase_id: newSupabaseID,
            synced: true,
            date_sync: new Date().toISOString()
          });
        }
      }

      // CREATE A LINE IN WAITING ACTION
      if (!isConnected) {
        const newWaitingActionDTO: WaitingActionDTO = {
          type_action: 'UPDATE',
          id: generateRandomId(),
          time: (new Date()).toISOString(),
          note: {
            id: initialNote.id,
            before: localeNote,
            after: updatedNote,
            changes: {
              ...localeNote,
              ...localUpdateDTO
            }
          }
        };
        const createdWaitingAction = await WatermelonWaitingActionService.createWaitingAction(newWaitingActionDTO);
        console.log("CREATED WAITING ACTION:", createdWaitingAction);
      }

      showToast('success', 'Success', 'Note updated successfully');
      navigation.navigate(EnumRouteNames.HOME, { refresh_note: true });

    } catch (error) {
      console.error("Error updating note:", error);
      showToast('error', 'Error', 'Failed to update note');
    } finally {
      setIsLoading(false);
    }
  }, [note, noteTitle, categories])

  // Keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Utility functions
  const updateTextInputSelection = useCallback((start: number, end: number) => {
    setTimeout(() => {
      textInputRef.current?.setSelection(start, end);
    }, SELECTION_TIMEOUT);
  }, []);

  // Formatting functions
  const applyFormatting = useCallback(({ prefix, suffix = prefix, defaultText = 'text', name }: FormattingOptions) => {
    const { start, end } = selection;
    const isTextSelected = start !== end;
    const selectedText = note.substring(start, end);

    let newText: string;
    let newSelectionStart: number;
    let newSelectionEnd: number;

    if (name === "BULLET_LIST" || name === "NUMBERED_LIST") {
      if (isTextSelected) {
        const lines = selectedText.split('\n');
        const formattedLines = lines.map(line => prefix + line);
        newText = note.substring(0, start) + formattedLines.join('\n') + note.substring(end);
        newSelectionStart = start + prefix.length;
        newSelectionEnd = end + (prefix.length * lines.length);
      } else {
        newText = note.substring(0, start) + prefix + defaultText + '\n' + note.substring(start);
        newSelectionStart = start + prefix.length;
        newSelectionEnd = newSelectionStart + defaultText.length;
      }
    } else {
      if (isTextSelected) {
        newText = note.substring(0, start) + prefix + selectedText + suffix + note.substring(end);
        newSelectionStart = start + prefix.length;
        newSelectionEnd = end + prefix.length;
      } else {
        newText = note.substring(0, start) + prefix + defaultText + suffix + note.substring(start);
        newSelectionStart = start + prefix.length;
        newSelectionEnd = newSelectionStart + defaultText.length;
      }
    }

    setNote(newText);
    updateTextInputSelection(newSelectionStart, newSelectionEnd);
  }, [note, selection, updateTextInputSelection]);

  // Formatting actions
  const formattingActions = useMemo(() => ({
    bold: () => applyFormatting({ name: "BOLD", prefix: '**', defaultText: 'bold text' }),
    italic: () => applyFormatting({ name: "ITALIC", prefix: '*', defaultText: 'italic text' }),
    underline: () => applyFormatting({ name: "UNDERLINE", prefix: '_', defaultText: 'underlined text' }),
    strikethrough: () => applyFormatting({ name: "STRIKETHROUGH", prefix: '~~', suffix: '~~', defaultText: 'strikethrough text' }),
    headline1: () => applyFormatting({ name: "H1", prefix: '# ', suffix: '\n', defaultText: 'Headline 1' }),
    headline2: () => applyFormatting({ name: "H2", prefix: '## ', suffix: '\n', defaultText: 'Headline 2' }),
    headline3: () => applyFormatting({ name: "H3", prefix: '### ', suffix: '\n', defaultText: 'Headline 3' }),
    headline4: () => applyFormatting({ name: "H4", prefix: '#### ', suffix: '\n', defaultText: 'Headline 4' }),
    headline5: () => applyFormatting({ name: "H5", prefix: '##### ', suffix: '\n', defaultText: 'Headline 5' }),
    headline6: () => applyFormatting({ name: "H6", prefix: '###### ', suffix: '\n', defaultText: 'Headline 6' }),
    quote: () => applyFormatting({ name: "QUOTE", prefix: '> ', suffix: '\n', defaultText: 'Quote' }),
    code: () => applyFormatting({ name: "CODE", prefix: '```\n', suffix: '\n```', defaultText: 'Code block' }),
    link: () => applyFormatting({ name: "LINK", prefix: '[', suffix: '](url)', defaultText: 'Link text' }),
    bulletList: () => applyFormatting({ name: "BULLET_LIST", prefix: '- ', suffix: '\n', defaultText: 'Bullet point' }),
    numberedList: () => applyFormatting({ name: "NUMBERED_LIST", prefix: '1. ', defaultText: 'Numbered item' }),
    checkbox: () => applyFormatting({ name: "CHECKBOX", prefix: '- [x] ', suffix: '\n', defaultText: 'Task' }),
  }), [applyFormatting]);

  const handleKeyPress = useCallback((e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key !== 'Enter') return;

    const { start } = selection;
    const textBeforeCursor = note.substring(0, start);
    const currentLineStart = textBeforeCursor.lastIndexOf('\n') + 1;
    const currentLine = note.substring(currentLineStart, start);

    e.preventDefault();

    let newText: string;
    let newCursorPosition: number;

    if (currentLine.startsWith('- [ ] ') || currentLine.startsWith('- [x] ')) {
      // Checkbox list
      newText = note.substring(0, start) + '\n- [ ] ' + note.substring(start);
      newCursorPosition = start + 7;
    } else if (currentLine.startsWith('- ')) {
      // Unordered list
      newText = note.substring(0, start) + '\n- ' + note.substring(start);
      newCursorPosition = start + 3;
    } else {
      // Ordered list
      const match = currentLine.match(/^(\d+)\. /);
      if (match) {
        const currentNumber = parseInt(match[1], 10);
        const newNumber = currentNumber + 1;
        newText = note.substring(0, start) + '\n' + newNumber + '. ' + note.substring(start);
        newCursorPosition = start + match[0].length + 1;
      } else {
        return; // No special formatting needed
      }
    }

    setTimeout(() => {
      setNote(newText);
      updateTextInputSelection(newCursorPosition, newCursorPosition);
    }, SELECTION_TIMEOUT);
  }, [note, selection, updateTextInputSelection]);

  const handleClickCompare = () => {
    (connectionState?.isConnected && connectionState.isInternetReachable)
      && navigation.navigate(EnumRouteNames.COMPARE_NOTE_SCREEN, {
        noteTitle: initialNote.nom_note,
        id: initialNote.id,
        supabase_id: initialNote.supabase_id
      });
  }

  // Loading state
  if (isLoading) <Loading />

  // Main render
  return (
    <EditModeContext.Provider value={{ editMode, setEditMode }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Header
          title={noteTitle}
          setTitle={setNoteTitle}
          handleBackPress={handleBackPress}
          handleSavePress={handleSavePress}
          handleComparePress={handleClickCompare}
          initialNote={initialNote}
          isExistingNote={isExistingNote}
          content={note}
        />

        <CategoriesSelector
          readOnly={!editMode}
          onCategorySelect={setCategories}
          selectedCategories={categories}
        />

        {editMode && (
          <TextInput
            ref={textInputRef}
            style={[styles.noteInput, { height: inputHeight }]}
            multiline
            placeholder="Écrivez votre note ici..."
            placeholderTextColor={ThemeColor.primary}
            autoFocus={false}
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
            onSelectionChange={handleSelectionChange}
            onKeyPress={handleKeyPress}
          />
        )}

        {editMode && <FormattingToolbar formattingActions={formattingActions} />}

        {!editMode && <MarkdownViewer note={note} />}
      </KeyboardAvoidingView>
    </EditModeContext.Provider>
  );
}

// Custom hook
export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColor.background,
    padding: 2
  },
  noteInput: {
    width: '100%',
    padding: 16,
    fontSize: 16,
    backgroundColor: ThemeColor.background,
    color: ThemeColor.primary
  }
});