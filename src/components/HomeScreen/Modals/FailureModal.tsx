import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button, Modal } from "react-native-paper";

type FailureModalProps = {
  visible: boolean;
  failedActions: string[];
  loading: boolean;
  onClose: () => void;
  onRemoveActions: () => void;
}

export const FailureModal: React.FC<FailureModalProps> = ({ visible, failedActions, loading, onClose, onRemoveActions }) => (
  <Modal
    visible={visible}
    onDismiss={loading ? undefined : onClose}
    contentContainerStyle={styles.modalContainer}
    dismissable={!loading}
  >
    {loading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.modalTitle}>Suppression en cours...</Text>
      </View>
    ) : (
      <>
        <Text style={styles.modalTitle}>Actions non appliquées</Text>
        <Text style={styles.modalText}>
          Les actions suivantes n'ont pas pu être appliquées :
        </Text>
        <View style={styles.failureList}>
          {failedActions.map((action, index) => (
            <Text key={index} style={styles.failureItem}>
              • {action}
            </Text>
          ))}
        </View>
        <View style={styles.modalButtons}>
          <Button
            mode="contained"
            onPress={onClose}
            style={styles.button}
          >
            OK
          </Button>
          <Button
            mode="outlined"
            onPress={onRemoveActions}
            style={styles.button}
          >
            Supprimer
          </Button>
        </View>
      </>
    )}
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
    },
    loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  failureList: {
    marginBottom: 24,
    paddingHorizontal: 8,
    maxHeight: 200,
  },
  failureItem: {
    fontSize: 14,
    marginBottom: 8,
    color: '#d32f2f',
    lineHeight: 20,
  },
});