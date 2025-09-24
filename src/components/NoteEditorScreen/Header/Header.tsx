import { View, TouchableOpacity, Text, StyleSheet, TextInput } from "react-native";
import { HEADER_HEIGHT } from "../../../constants/noteEditor";
import ArrowLeftIcon from '../../../../icons/Iconsax/Linear/arrowleft.svg';
import SaveIcon from '../../../../icons/Iconsax/Linear/directboxsend.svg';
import EyeFilledIcon from '../../../../icons/eye-filled.svg';
import EditMdIcon from '../../../../icons/edit-markdown.svg';
import CompareIcon from '../../../../icons/compare.svg';
import ClipBoardTextIcon from '../../../../icons/Iconsax/Linear/clipboardtext.svg';
import { useEditMode } from "../NoteEditorScreen";
import { NoteDTO } from "../../../types/model/note";


type HeaderProps = {
  handleBackPress: () => void;
  handleSavePress: () => void;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleComparePress?: () => void;
  initialNote?: NoteDTO;
  isExistingNote: boolean;
};

export const Header = ({ initialNote, handleComparePress, handleBackPress, handleSavePress, title, setTitle, isExistingNote }: HeaderProps) => {

  const { editMode, setEditMode } = useEditMode();

  const toggleEditMode = () => {
    setEditMode(() => !editMode);
  };

  return <View style={styles.header}>
    <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
      <ArrowLeftIcon width={25} height={25} />
    </TouchableOpacity>
    <TextInput value={title} editable={!isExistingNote} onChangeText={(t)=> !isExistingNote && setTitle(t)} style={styles.title_input} />
    <View style={{ flexDirection: "row", alignItems: 'center' }}>
      <TouchableOpacity onPress={() => { }} style={styles.headerButton}>
        <ClipBoardTextIcon width={25} height={25} />
      </TouchableOpacity>
      {
        (initialNote?.id && initialNote.supabase_id && initialNote.synced) && <TouchableOpacity onPress={handleComparePress} style={styles.headerButton}>
          <CompareIcon width={25} height={25} />
        </TouchableOpacity>
      }
      <TouchableOpacity onPress={toggleEditMode} style={styles.headerButton}>
        {editMode ? <EyeFilledIcon width={25} height={25} /> : <EditMdIcon width={25} height={25} />}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSavePress} style={styles.headerButton}>
        <SaveIcon width={25} height={25} />
      </TouchableOpacity>
    </View>
  </View>
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: HEADER_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title_input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    fontSize: 18,
    color: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 10,
  },
  headerButton: {
    paddingHorizontal: 12,
  }
});