import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Dialog, Paragraph, Text } from 'react-native-paper';
import { ThemeColor } from '../../../../../constants/colors';

type ContextualMenuModalProps = {
    visible: boolean;
    hideDialog: () => void;
    handleEditNote: () => void;
    handleDeleteNote: () => void;
};

export default function ContextualMenuModal( {handleDeleteNote, handleEditNote, hideDialog, visible }: ContextualMenuModalProps ) {

    return (
        <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Options de la note</Dialog.Title>
            <Dialog.Content style={styles.dialogContent}>
                <Paragraph style={styles.dialogParagraph}>
                    Que souhaitez-vous faire avec cette note ?
                </Paragraph>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.dialogButton, styles.editButton]} 
                        onPress={handleEditNote}
                    >
                        <Text style={styles.editButtonText}> Éditer</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.dialogButton, styles.deleteButton]} 
                        onPress={handleDeleteNote}
                    >
                        <Text style={styles.deleteButtonText}> Supprimer</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.dialogButton, styles.cancelButton]} 
                        onPress={hideDialog}
                    >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                </View>
            </Dialog.Content>
        </Dialog>
    )
}

const styles = StyleSheet.create({
    dialog: {
        borderRadius: 16,
        backgroundColor: ThemeColor.background,
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
        color: ThemeColor.primary,
        textAlign: 'center',
        paddingBottom: 8,
    },
    dialogContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    dialogParagraph: {
        fontSize: 16,
        color: ThemeColor.primary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
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
        backgroundColor: ThemeColor.primary,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    deleteButton: {
        backgroundColor: ThemeColor.primary,
    },
    deleteButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '800',
    },
    cancelButton: {
        backgroundColor: ThemeColor.background,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '800',
    },
});