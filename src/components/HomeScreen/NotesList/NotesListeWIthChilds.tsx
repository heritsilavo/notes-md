import React from "react"
import { FlatList, View, StyleSheet } from "react-native"
import { NoteDTO } from "../../../types/model/note"
import { NoteTreeItem } from "./NoteItem/NoteTreeItem"

type NotesListeWithChildsProps = {
    notes: NoteDTO[]
}
type NoteWithChilds = NoteDTO & { parentNotes: NoteDTO[], enfantNotes: NoteDTO[] }

export function NotesListeWithChilds({ notes }: NotesListeWithChildsProps) {

    function buildTree(note: NoteDTO, allNotes: NoteDTO[]): NoteWithChilds {
        const parentIds: string[] = Array.isArray((note as any).parents) ? (note as any).parents : [];
        const enfantIds: string[] = Array.isArray((note as any).enfants) ? (note as any).enfants : [];
        const parentNotes = allNotes.filter(p => p.supabase_id && parentIds.includes(p.supabase_id));
        const enfantNotes = allNotes
            .filter(e => e.supabase_id && enfantIds.includes(e.supabase_id))
            .map(child => buildTree(child, allNotes));
        return {
            ...note,
            parentNotes,
            enfantNotes
        };
    }

    const getNoteWithChilds = (): NoteWithChilds[] => {
        // Only root notes (no parents)
        return notes
            .filter(n => {
                const parentIds: string[] = Array.isArray((n as any).parents) ? (n as any).parents : [];
                return parentIds.length === 0;
            })
            .map(root => buildTree(root, notes));
    }

    const notesWithChilds = getNoteWithChilds();

    return (
        <FlatList
            data={notesWithChilds}
            renderItem={({ item, index }) => (
                <View style={styles.listItemContainer}>
                    <NoteTreeItem item={item} index={index} />
                </View>
            )}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
        />
    )
}

const styles = StyleSheet.create({
    list: {
        flex: 1,
        backgroundColor: "transparent",
    },
    listItemContainer: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
})