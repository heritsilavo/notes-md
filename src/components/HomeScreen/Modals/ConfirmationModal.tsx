import { StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { Modal, Button } from "react-native-paper";

type ConfirmationModalProps = {
    visible: boolean;
    waitingActionsCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ visible, waitingActionsCount, onConfirm, onCancel }) => (
    <Modal
        visible={visible}
        onDismiss={onCancel}
        contentContainerStyle={styles.modalContainer}
    >
        <Text style={styles.modalTitle}>Actions en attente</Text>
        <Text style={styles.modalText}>
            Vous avez {waitingActionsCount} action(s) en attente de synchronisation.
            Voulez-vous les appliquer maintenant ?
        </Text>
        <View style={styles.modalButtons}>
            <Button
                mode="outlined"
                onPress={onCancel}
                style={styles.button}
            >
                Non
            </Button>
            <Button
                mode="contained"
                onPress={onConfirm}
                style={styles.button}
            >
                Oui, appliquer
            </Button>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 24,
        margin: 20,
        borderRadius: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#1a1a1a',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
    }
});