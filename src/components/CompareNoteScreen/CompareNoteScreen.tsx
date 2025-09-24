import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from "react-native";
import CustomHeader from "../CustomHeader/CustomHeader";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/root-stack-param-list";
import { EnumRouteNames } from "../../types/enum-route-names";
import { useEffect, useState } from "react";
import { NoteDTO, defaultNoteDTO } from "../../types/model/note";
import CategoriesSelector from "../HomeScreen/CategoriesSelector/CategoriesSelector";
import { ThemeColor } from "../../constants/colors";
import Loading from "../Loading/Loading";
import { WatermelonNoteService } from "../../services/watermelon-notes-service";
import { RemoteNoteService } from "../../services/remote-notes-services";
import Toast from "react-native-toast-message";

type CompareNoteRouteProps = RouteProp<RootStackParamList, EnumRouteNames.COMPARE_NOTE_SCREEN>;
type CompareNoteScreenProps = {
    route: CompareNoteRouteProps;
};

export default function CompareNoteScreen({ route }: CompareNoteScreenProps) {
    const { noteTitle, id, supabase_id } = route.params;
    const [localeNote, setLocaleNote] = useState<NoteDTO>();
    const [remoteNote, setRemoteNote] = useState<NoteDTO>();
    const [activeTab, setActiveTab] = useState<'local' | 'remote'>('local');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
    const [loading, setLoading] = useState<boolean>(false);

    // Fonction pour simuler le chargement des notes (à remplacer par votre logique réelle)
    const loadNote = async (type: 'local' | 'remote') => {
        try {
            setLoading(true);

            if (type === 'local') {
                const localeNote = await WatermelonNoteService.getById(id);
                if (localeNote) {
                    setLocaleNote(localeNote);
                    setSelectedCategories(localeNote.categorie || ['All']);
                } else {
                    throw new Error('Local note not found');
                }
            } else {
                const remoteNote = await RemoteNoteService.getBySupabaseId(supabase_id);
                if (remoteNote) {
                    setRemoteNote(remoteNote);
                    setSelectedCategories(remoteNote.categorie || ['All']);
                } else {
                    throw new Error('Remote note not found');
                }
            }
        } catch (error) {
            console.error('Error loading note:', error);
            Toast.show({
                type: 'error',
                text1: 'Erreur de chargement',
                text2: `Impossible de charger la note ${type === 'local' ? 'locale' : 'distante'}.`
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Charger la note locale par défaut
        loadNote('local');
        // Charger aussi la note distante
        loadNote('remote');
    }, []);

    const handleUseThisVersion = async () => {
        const noteToUse = activeTab === 'local' ? localeNote : remoteNote;
        if (!noteToUse) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Aucune note à utiliser.'
            });
            return;
        }
        try {
            setLoading(true);
            if (activeTab === 'local') {
                await WatermelonNoteService.update(id, {
                    contenu_note: noteToUse.contenu_note,
                });
                setLocaleNote(noteToUse)
            } else {
                await WatermelonNoteService.update(supabase_id, {
                    contenu_note: noteToUse.contenu_note
                });
                setRemoteNote(noteToUse);
            }
        } catch (error) {
            console.error('Error updating note:', error);
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Impossible de mettre à jour la note.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Vérifie si les notes sont différentes et que les deux versions sont bien récupérées
    const isUseVersionEnabled = () => {
        return localeNote && remoteNote && 
               (localeNote.contenu_note !== remoteNote.contenu_note || 
                localeNote.nom_note !== remoteNote.nom_note ||
                localeNote.categorie !== remoteNote.categorie);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
            <CustomHeader title={`Compare note: "${noteTitle}"`} />

            {/* Tabs pour sélectionner la version */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'local' && styles.activeTab
                    ]}
                    onPress={() => {
                        setActiveTab('local');
                        loadNote('local');
                    }}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'local' && styles.activeTabText
                    ]}>
                        Version Locale
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'remote' && styles.activeTab
                    ]}
                    onPress={() => {
                        setActiveTab('remote');
                        loadNote('remote');
                    }}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'remote' && styles.activeTabText
                    ]}>
                        Version Distante
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Sélecteur de catégorie */}
            <CategoriesSelector
                selectedCategories={selectedCategories}
                onCategorySelect={setSelectedCategories}
                readOnly={true}
            />

            {
                (loading) ? <Loading /> : (
                    <>
                        {/* Contenu de la note avec scroll */}
                        <ScrollView
                            style={styles.noteContentContainer}
                            contentContainerStyle={styles.noteContent}
                        >
                            <Text style={styles.noteTitle}>
                                {activeTab === 'local' ? localeNote?.nom_note : remoteNote?.nom_note}
                            </Text>
                            <Text style={styles.noteText}>
                                {activeTab === 'local' ? localeNote?.contenu_note : remoteNote?.contenu_note}
                            </Text>
                        </ScrollView>

                        {/* Bouton pour utiliser cette version */}
                        <TouchableOpacity
                            style={[
                                styles.useVersionButton,
                                !isUseVersionEnabled() && styles.disabledButton
                            ]}
                            onPress={handleUseThisVersion}
                            disabled={!isUseVersionEnabled()}
                        >
                            <Text style={styles.useVersionButtonText}>
                                Utiliser cette version
                            </Text>
                        </TouchableOpacity>
                    </>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    tabButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    activeTab: {
        backgroundColor: ThemeColor.primary,
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFF',
    },
    noteContentContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
    },
    noteContent: {
        paddingBottom: 80,
    },
    noteTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: ThemeColor.primary,
        marginBottom: 15,
    },
    noteText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
    useVersionButton: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: ThemeColor.primary,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignSelf: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    useVersionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});