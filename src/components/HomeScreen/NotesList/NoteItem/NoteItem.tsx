import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NoteDTO } from "../../../../types/model/note";
import { getNoteColors } from "../../../../functions/NotesItem/get-note-color";
import { truncateContent } from "../../../../functions/NotesItem/truncate-content";
import CloudCheckCircleCheckedIcon from "../../../../../icons/cloud-check-circle.svg"
import CloudCheckCircleIcon from "../../../../../icons/cloud-check-circle-1.svg";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";
import { EnumRouteNames } from "../../../../types/enum-route-names";
import { connectionService } from "../../../../services/conneciont-service";
import Toast from "react-native-toast-message";
import { RemoteNoteService } from "../../../../services/remote-notes-services";
import { generateRandomId } from "../../../../services/generate-id";
import { WatermelonNoteService } from "../../../../services/watermelon-notes-service";
import { useRefreshNote } from "../../HomeScreen";
import { useState } from "react";
import { Button, Dialog, Paragraph, Portal } from "react-native-paper";
import ContextualMenuModal from "./Modals/ContextualMenuModal";
import ConfirmDeleteModal from "./Modals/ConfirmDeleteModal";
import { WaitingActionDTO } from "../../../../types/model/waiting-action";
import { WatermelonWaitingActionService } from "../../../../services/watermelon-waiting-action-service";

const NoteItem: React.FC<{ item: NoteDTO; index: number }> = ({ item }) => {
    const [syncinng, setSyncing] = useState(false);
    const [visible, setVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);

    const { backgroundColor, textColor } = getNoteColors(item.typenote);
    console.log("COLORS", backgroundColor, textColor);


    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    const refReshNote = useRefreshNote();

    const handlePress = () => {
        navigation.navigate(EnumRouteNames.NOTE_EDITOR, {
            note: item,
            isEditing: false,
            isExistingNote: true,
        });
    };

    const handleSyncPress = async () => {
        const isConnected = await connectionService.isConnected();

        //VERIFIER LA CONNEXION INTERNET AVANT DE SYNC
        if (!isConnected) {
            Toast.show({
                type: 'error',
                text1: 'Pas de connexion Internet',
                text2: 'Impossible de synchroniser la note.',
                position: 'bottom',
                visibilityTime: 3000,
                autoHide: true,
            });
            console.warn("No internet connection. Cannot sync note.");
            return;
        }

        setSyncing(true);
        const remoteNotes = await RemoteNoteService.getAll();
        const existingNote = remoteNotes.find(note => note.nom_note === item.nom_note);

        if (existingNote) {
            //TODO: Gérer le cas où la note existe déjà sur le serveur
            Toast.show({
                type: 'info',
                text1: 'Note déjà synchronisée',
                text2: 'Cette note existe déjà sur le serveur.',
                position: 'bottom',
                visibilityTime: 3000,
                autoHide: true,
            });
            return;
        }

        // Créer une nouvelle note sur le serveur
        const newNote: NoteDTO = {
            supabase_id: generateRandomId(),
            synced: true,
            date_sync: new Date().toISOString(),
            nom_note: item.nom_note,
            contenu_note: item.contenu_note,
            date_creation: item.date_creation,
            categorie: item.categorie,
            date_heure_note: item.date_heure_note,
            visible_pour_date_seulement: item.visible_pour_date_seulement,
            rappel: item.rappel,
            typenote: item.typenote,
            user_id: item.user_id,
            status: item.status,
            id: item.id,
        };

        const createdNote = await RemoteNoteService.create(newNote);
        if (createdNote) {
            // Mettre à jour la note locale avec les informations de synchronisation
            await WatermelonNoteService.update(item.id, {
                synced: true,
                date_sync: item.date_sync,
                supabase_id: item.supabase_id,
            });
            refReshNote(); // Rafraîchir la liste des notes

            Toast.show({
                type: 'success',
                text1: 'Note synchronisée',
                text2: 'La note a été synchronisée avec succès.',
                position: 'bottom',
                visibilityTime: 3000,
                autoHide: true,
            });
        }
        setSyncing(false);
    }

    const confirmDelete = async () => {
        try {
            const isConnected = await connectionService.isConnected();
            if (isConnected && item.synced && item.supabase_id) {
                // Si connecté, supprimer la note du serveur
                await RemoteNoteService.delete(item.supabase_id);
            } else if (!isConnected && item.synced) {
                if (!item.supabase_id) {
                    console.warn("Note is not synced and has no supabase_id, cannot delete on server.");
                    throw new Error("Note is marked synced but has no supabase_id, cannot delete on server.");
                }
                const waitinAction : WaitingActionDTO = {
                    id: generateRandomId(),
                    type_action: 'DELETE',
                    note: {
                        id: item.id,
                        before: item,
                        after: item, 
                        changes: {},
                    },
                    time: new Date().toISOString(),
                }
                await WatermelonWaitingActionService.createWaitingAction(waitinAction);
                console.log("Note will be deleted later when back online: ", item);
            } else {
                console.warn("No internet connection. Deleting note locally: ", item);
            }
        } catch (error) {
            console.warn("Error deleting note:", error);
            Toast.show({
                type: 'error',
                text1: 'Erreur de suppression',
                text2: 'Une erreur est survenue lors de la suppression de la note.',
                position: 'bottom',
                visibilityTime: 5000,
                autoHide: true,
            });
        } finally {
            setDeleteVisible(false);
            setVisible(false);
            // Supprimer la note localement
            await WatermelonNoteService.delete(item.id);
            refReshNote(); // Rafraîchir la liste des notes

            Toast.show({
                type: 'success',
                text1: 'Note supprimée',
                text2: 'La note a été supprimée avec succès.',
                position: 'bottom',
                visibilityTime: 3000,
                autoHide: true,
            });
        }
    };

    const handleEditNote = () => {
        setVisible(false);
        navigation.navigate(EnumRouteNames.NOTE_EDITOR, {
            note: item,
            isEditing: true,
            isExistingNote: true,
        });
    };

    return (
        <>
            <TouchableOpacity style={[styles.noteContainer, { backgroundColor }]} activeOpacity={0.8} onLongPress={() => setVisible(true)} onPress={handlePress}>
                <View style={styles.noteHeader}>
                    <TouchableOpacity onPress={!item.synced ? handleSyncPress : () => { }} style={styles.syncContainer}>
                        {syncinng ? (
                            <View style={styles.syncIcon}>
                                <ActivityIndicator size="small" color={textColor} />
                            </View>
                        ) : item.synced ? (
                            <CloudCheckCircleCheckedIcon width={24} height={24} fill={textColor} />
                        ) : (
                            <CloudCheckCircleIcon width={24} height={24} fill={textColor} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Titre de la note */}
                <Text style={[styles.noteTitle, { color: textColor }]} numberOfLines={2}>
                    {item.nom_note}
                </Text>
                {/* Catégories de la note */}
                <View style={styles.categoriesContainer}>
                    {Array.isArray(item.categorie) && item.categorie.map((cat, idx) => (
                        <Text key={cat + idx} style={styles.categoryBadge}>{cat}</Text>
                    ))}
                </View>

                {/* Contenu avec puces numérotées si c'est une liste */}
                <View style={styles.contentContainer}>
                    <Text style={[styles.noteContent, { color: textColor }]} numberOfLines={6}>
                        {truncateContent(item.contenu_note, 150)}
                    </Text>
                </View>

            </TouchableOpacity>

            {/** Modals */}
            <Portal>
                <ContextualMenuModal
                    visible={visible}
                    hideDialog={() => setVisible(false)}
                    handleEditNote={handleEditNote}
                    handleDeleteNote={() => {
                        setVisible(false);
                        setDeleteVisible(true);
                    }}
                />

                <ConfirmDeleteModal
                    deleteVisible={deleteVisible}
                    hideDeleteDialog={() => setDeleteVisible(false)}
                    confirmDelete={confirmDelete}
                />
            </Portal>
        </>
    );
};

const styles = StyleSheet.create({
    // ...existing code...
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    categoryBadge: {
        backgroundColor: '#E0E7FF',
        color: '#1A365D',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontSize: 10,
        marginRight: 4,
        marginBottom: 2,
    },
    noteContainer: {
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative',
        flex: 1,
        height: '100%',
        overflow: 'hidden',
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 4,
        height: 24,
        paddingHorizontal: 8,
    },
    syncContainer: {
        alignItems: 'center',
    },
    syncIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncIconText: {
        fontSize: 10,
    },
    unsyncIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unsyncIconText: {
        fontSize: 10,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '900',
        marginBottom: 12,
        lineHeight: 20,
    },
    contentContainer: {
        flex: 1,
    },
    noteContent: {
        fontSize: 12,
        lineHeight: 18,
        opacity: 0.8,
    },
    listItem: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 4,
        opacity: 0.8,
    },
    reminderIndicator: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reminderText: {
        fontSize: 12,
    },

});

export default NoteItem;