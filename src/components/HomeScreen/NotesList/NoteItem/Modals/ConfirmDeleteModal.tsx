import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Paragraph, Text } from 'react-native-paper';

type ConfirmDeleteModalProps = {
    deleteVisible: boolean;
    hideDeleteDialog: () => void;
    confirmDelete: () => void;
};

export default function ConfirmDeleteModal({deleteVisible, hideDeleteDialog, confirmDelete }: ConfirmDeleteModalProps) {
    return (<Dialog visible={deleteVisible} onDismiss={hideDeleteDialog} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>Confirmer la suppression</Dialog.Title>
        <Dialog.Content style={styles.dialogContent}>
            <Paragraph style={styles.dialogParagraph}>
                Êtes-vous sûr de vouloir supprimer cette note ?
            </Paragraph>
            <Paragraph style={[styles.dialogParagraph, styles.warningText]}>
                Cette action est irréversible.
            </Paragraph>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.dialogButton, styles.confirmDeleteButton]}
                    onPress={confirmDelete}
                >
                    <Text style={styles.confirmDeleteButtonText}>Confirmer la suppression</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.dialogButton, styles.cancelButton]}
                    onPress={hideDeleteDialog}
                >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
            </View>
        </Dialog.Content>
    </Dialog>)
}

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        paddingBottom: 8,
    },
    dialogContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    dialogParagraph: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    warningText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 16,
    },
    buttonContainer: {
        gap: 12,
    },
    dialogButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    editButton: {
        backgroundColor: '#3B82F6',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmDeleteButton: {
        backgroundColor: '#DC2626',
    },
    confirmDeleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
});