import { useState, useCallback } from "react";
import Toast from "react-native-toast-message";
import { WatermelonNoteService } from "../../services/watermelon-notes-service";
import { WatermelonWaitingActionService } from "../../services/watermelon-waiting-action-service";
import { NoteDTO } from "../../types/model/note";
import { RemoteNoteService } from "../../services/remote-notes-services";

const TOAST_MESSAGES = {
    SUCCESS: {
        ACTIONS_APPLIED: {
            text1: "Actions en attente appliquées",
            text2: (count: number) => `${count} action(s) restaurée(s)`
        },
        FAILED_ACTIONS_REMOVED: {
            text1: "Actions échouées supprimées",
            text2: "Toutes les actions non appliquées ont été supprimées."
        }
    },
    ERROR: {
        APPLY_ACTIONS: {
            text1: "Erreur lors de l'application des actions",
            text2: "Veuillez réessayer"
        },
        REMOVE_ACTIONS: {
            text1: "Erreur lors de la suppression des actions",
            text2: "Veuillez réessayer"
        }
    }
} as const;

export const useWaitingActions = () => {
    const [waitingActionsCount, setWaitingActionsCount] = useState(0);
    const [failedActions, setFailedActions] = useState<string[]>([]);

    const checkWaitingActions = useCallback(async () => {
        try {
            const count = await WatermelonWaitingActionService.getCount();
            setWaitingActionsCount(count);
            return count;
        } catch (error) {
            console.error("Erreur lors de la vérification des actions en attente:", error);
            return 0;
        }
    }, []);

    const applyWaitingActions = useCallback(async (): Promise<string[]> => {
        try {
            console.log("Application des actions en attente...");
            const { failureCauses = [] } = await WatermelonWaitingActionService.applyAndDeleteAll();

            Toast.show({
                type: 'success',
                ...TOAST_MESSAGES.SUCCESS.ACTIONS_APPLIED,
                text2: TOAST_MESSAGES.SUCCESS.ACTIONS_APPLIED.text2(waitingActionsCount)
            });

            return failureCauses;
        } catch (error) {
            Toast.show({
                type: 'error',
                ...TOAST_MESSAGES.ERROR.APPLY_ACTIONS
            });
            console.error("Erreur lors de l'application des actions:", error);
            throw error;
        }
    }, [waitingActionsCount]);

    const clearFailedActions = useCallback(async () => {
        try {
            await WatermelonWaitingActionService.clearAll();
            Toast.show({
                type: 'success',
                ...TOAST_MESSAGES.SUCCESS.FAILED_ACTIONS_REMOVED
            });
            setFailedActions([]);
        } catch (error) {
            Toast.show({
                type: 'error',
                ...TOAST_MESSAGES.ERROR.REMOVE_ACTIONS
            });
            console.error("Erreur lors de la suppression des actions:", error);
            throw error;
        }
    }, []);

    return {
        waitingActionsCount,
        failedActions,
        setFailedActions,
        checkWaitingActions,
        applyWaitingActions,
        clearFailedActions
    };
};

export const useNotes = () => {
    const [notes, setNotes] = useState<NoteDTO[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshNoteList = useCallback(async () => {
        setIsRefreshing(true);
        try {
            setNotes([]);

            const fetchedNotes = await WatermelonNoteService.getAll();
            console.log("Notes récupérées depuis WatermelonDB:", fetchedNotes);

            setNotes(fetchedNotes || []);
        } catch (error) {
            console.error("Erreur lors de la récupération des notes:", error);
            Toast.show({
                type: 'error',
                text1: "Erreur",
                text2: "Impossible de charger les notes"
            });
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    return {
        notes,
        isRefreshing,
        refreshNoteList
    };
};