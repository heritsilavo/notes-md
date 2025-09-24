import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { WatermelonWaitingActionService } from "../../services/watermelon-waiting-action-service";
import { WaitingActionDTO } from "../../types/model/waiting-action";
import Loading from "../Loading/Loading";
import CustomHeader from "../CustomHeader/CustomHeader";
import { ThemeColor } from "../../constants/colors";
import { Modal, Portal, Button, Divider } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useConnectionState } from "../../../App";
import { NetInfoState } from "@react-native-community/netinfo";

// Ajout de couleurs supplémentaires pour les états
const ExtendedThemeColors = {
  ...ThemeColor,
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#2196F3',
  lightGray: '#F5F5F5',
  darkGray: '#333333',
};

export default function WaitingActionListScreen() {
    const [actions, setActions] = useState<WaitingActionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState<WaitingActionDTO | null>(null);
    const [visible, setVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const connectionState : NetInfoState | null = useConnectionState();

    const showModal = (action: WaitingActionDTO) => {
      setSelectedAction(action);
      setVisible(true);
    };
    const hideModal = () => setVisible(false);

    const showConfirmDialog = () => setConfirmVisible(true);
    const hideConfirmDialog = () => setConfirmVisible(false);

    const refreshWaitingActionsList = async () => {
        try {
            setLoading(true);
            const waitingActions = await WatermelonWaitingActionService.getAllWaitingAction();
            setActions(waitingActions);
        } catch (error) {
            console.error("Error fetching waiting actions:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteAction = async () => {
      if (!selectedAction) return;
      
      try {
        await WatermelonWaitingActionService.deleteWaitingAction(selectedAction.id);
        refreshWaitingActionsList();
        hideConfirmDialog();
        hideModal();
      } catch (error) {
        console.error("Error deleting action:", error);
      }
    }

    const getActionColor = (type: 'CREATE' | 'UPDATE' | 'DELETE') => {
      switch(type) {
        case 'CREATE': return ExtendedThemeColors.success;
        case 'UPDATE': return ExtendedThemeColors.warning;
        case 'DELETE': return ExtendedThemeColors.danger;
        default: return ExtendedThemeColors.primary;
      }
    }

    const getActionIcon = (type: 'CREATE' | 'UPDATE' | 'DELETE') => {
      switch(type) {
        case 'CREATE': return 'add-circle';
        case 'UPDATE': return 'edit';
        case 'DELETE': return 'delete';
        default: return 'info';
      }
    }

    useEffect(() => {
        refreshWaitingActionsList()
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="Waiting Actions" />
            
            {actions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No waiting actions found.</Text>
                </View>
            ) : (
                <FlatList
                    data={actions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.actionCard}
                            onPress={() => showModal(item)}
                        >
                            <View style={styles.cardHeader}>
                                <Icon 
                                    name={getActionIcon(item.type_action)} 
                                    size={24} 
                                    color={getActionColor(item.type_action)} 
                                />
                                <Text style={[styles.actionType, { color: getActionColor(item.type_action) }]}>
                                    {item.type_action}
                                </Text>
                                <Text style={styles.actionTime}>
                                    {new Date(item.time).toLocaleString()}
                                </Text>
                            </View>
                            <Text style={styles.noteTitle} numberOfLines={1}>
                                {item.note.before.nom_note || item.note.after.nom_note}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* Modal de détails */}
            <Portal>
                <Modal 
                    visible={visible} 
                    onDismiss={hideModal}
                    contentContainerStyle={styles.modalContainer}
                >
                    {selectedAction && (
                        <View>
                            <View style={styles.modalHeader}>
                                <Icon 
                                    name={getActionIcon(selectedAction.type_action)} 
                                    size={28} 
                                    color={getActionColor(selectedAction.type_action)} 
                                />
                                <Text style={[styles.modalTitle, { color: getActionColor(selectedAction.type_action) }]}>
                                    {selectedAction.type_action} Action
                                </Text>
                            </View>
                            
                            <Divider style={styles.divider} />
                            
                            <Text style={styles.detailLabel}>Note Title:</Text>
                            <Text style={styles.detailValue}>
                                {selectedAction.note.before.nom_note || selectedAction.note.after.nom_note}
                            </Text>
                            
                            <Text style={styles.detailLabel}>Scheduled for:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(selectedAction.note.before.date_heure_note || selectedAction.note.after.date_heure_note).toLocaleString()}
                            </Text>
                            
                            {selectedAction.type_action === 'UPDATE' && (
                                <>
                                    <Text style={styles.detailLabel}>Changes:</Text>
                                    {Object.entries(selectedAction.note.changes).map(([key, value]) => (
                                        <Text key={key} style={styles.detailValue}>
                                            {key}: {String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}
                                        </Text>
                                    ))}
                                </>
                            )}
                            
                            <Text style={styles.detailLabel}>Action Time:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(selectedAction.time).toLocaleString()}
                            </Text>
                            
                            <View style={styles.modalButtons}>
                                <Button 
                                    mode="outlined" 
                                    onPress={hideModal}
                                    style={styles.cancelButton}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Close
                                </Button>
                                <Button 
                                    mode="contained" 
                                    onPress={showConfirmDialog}
                                    style={[styles.deleteButton, { backgroundColor: ExtendedThemeColors.danger }]}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Delete
                                </Button>
                            </View>
                        </View>
                    )}
                </Modal>
                
                {/* Modal de confirmation */}
                <Modal 
                    visible={confirmVisible} 
                    onDismiss={hideConfirmDialog}
                    contentContainerStyle={styles.confirmModal}
                >
                    <Text style={styles.confirmTitle}>Confirm Deletion</Text>
                    <Text style={styles.confirmMessage}>
                        Are you sure you want to delete this waiting action? This action cannot be undone.
                    </Text>
                    <View style={styles.confirmButtons}>
                        <Button 
                            mode="outlined" 
                            onPress={hideConfirmDialog}
                            style={styles.cancelButton}
                            labelStyle={styles.buttonLabel}
                        >
                            Cancel
                        </Button>
                        <Button 
                            mode="contained" 
                            onPress={handleDeleteAction}
                            style={[styles.deleteButton, { backgroundColor: ExtendedThemeColors.danger }]}
                            labelStyle={styles.buttonLabel}
                        >
                            Delete
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ExtendedThemeColors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: ExtendedThemeColors.darkGray,
    },
    listContainer: {
        padding: 16,
    },
    actionCard: {
        backgroundColor: ExtendedThemeColors.lightGray,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionType: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        marginRight: 'auto',
    },
    actionTime: {
        fontSize: 12,
        color: ExtendedThemeColors.darkGray,
    },
    noteTitle: {
        fontSize: 14,
        color: ExtendedThemeColors.darkGray,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    confirmModal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 40,
        borderRadius: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    divider: {
        marginVertical: 10,
        backgroundColor: ExtendedThemeColors.lightGray,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: ExtendedThemeColors.primary,
        marginTop: 8,
    },
    detailValue: {
        fontSize: 14,
        color: ExtendedThemeColors.darkGray,
        marginBottom: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    confirmButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    cancelButton: {
        marginRight: 10,
        borderColor: ExtendedThemeColors.primary,
    },
    deleteButton: {
        minWidth: 100,
    },
    buttonLabel: {
        fontSize: 14,
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ExtendedThemeColors.danger,
        marginBottom: 10,
    },
    confirmMessage: {
        fontSize: 14,
        color: ExtendedThemeColors.darkGray,
    },
});