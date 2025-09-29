import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NoteDTO } from "../../../../types/model/note";
import { useNavigation, NavigationProp, ParamListBase } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { EnumRouteNames } from "../../../../types/enum-route-names";
import { getNoteColors } from "../../../../functions/NotesItem/get-note-color";
import { ThemeColor } from "../../../../constants/colors";

type NoteTreeItemProps = {
  item: NoteDTO & { enfantNotes?: NoteDTO[] };
  index: number;
};

export const NoteTreeItem: React.FC<NoteTreeItemProps> = ({ item, index }) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [expanded, setExpanded] = useState(false);
  const { backgroundColor, textColor } = getNoteColors(item.typenote);

  const handlePress = () => {
    navigation.navigate(EnumRouteNames.NOTE_EDITOR, {
      note: item,
      isEditing: false,
      isExistingNote: true,
    });
  };

  const hasChildren = item.enfantNotes && item.enfantNotes.length > 0;

  return (
    <View>
      <View style={styles.rowWrap}>
        <View style={[styles.hierarchyBar, { backgroundColor: ThemeColor.primary, opacity: 0.18 }]} />
        <View style={[styles.row, { backgroundColor, borderColor: ThemeColor.primary + '22', shadowColor: ThemeColor.primary + '33' }]}> 
          {hasChildren ? (
            <TouchableOpacity onPress={() => setExpanded((v) => !v)} style={styles.arrowButton}>
              <Icon name={expanded ? "expand-more" : "chevron-right"} size={26} color={ThemeColor.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.arrowPlaceholder} />
          )}
          <TouchableOpacity
            style={[styles.noteButton, { backgroundColor: backgroundColor, borderColor: ThemeColor.primary + '22' }]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Text style={[styles.noteTitle, { color: textColor }]} numberOfLines={1}>{item.nom_note}</Text>
            {Array.isArray(item.categorie) && item.categorie.length > 0 && (
              <View style={styles.categoriesContainer}>
                {item.categorie.map((cat, idx) => (
                  <Text key={cat + idx} style={styles.categoryBadge}>{cat}</Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {expanded && hasChildren && (
        <View style={styles.childrenContainer}>
          {item.enfantNotes!.map((child, idx) => (
            <NoteTreeItem key={child.id} item={child} index={idx} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rowWrap: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  hierarchyBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 8,
    marginVertical: 4,
    alignSelf: "stretch",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 8,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 4,
  },
  arrowButton: {
    marginRight: 6,
    padding: 2,
    borderRadius: 16,
    backgroundColor: ThemeColor.secondary + '22',
  },
  arrowPlaceholder: {
    width: 26,
    height: 26,
    marginRight: 6,
  },
  noteButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: "center",
    borderWidth: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: "#E0E7FF",
    color: '#1A365D',
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
    overflow: 'hidden',
  },
  childrenContainer: {
    marginLeft: 32,
    borderLeftWidth: 2,
    borderLeftColor: ThemeColor.primary + '18',
    paddingLeft: 8,
    marginTop: 2,
  },
});
