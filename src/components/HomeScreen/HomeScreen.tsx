import React, { use, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Portal } from 'react-native-paper';
import { NavigationProp, ParamListBase, RouteProp, useFocusEffect } from "@react-navigation/native";

import DaysSelector from "./DaysSelector/DaysSelector";
import CategoriesSelector from "./CategoriesSelector/CategoriesSelector";
import HomeScreenHeader from "./HomeScreenHeader/HomeScreenHeader";
import NotesList from "./NotesList/NotesList";
import PlusButton from "./PlusButton/PlusButton";

import { EnumRouteNames } from "../../types/enum-route-names";
import { RootStackParamList } from "../../types/root-stack-param-list";
import { WatermelonWaitingActionService } from "../../services/watermelon-waiting-action-service";
import { connectionService } from "../../services/conneciont-service";
import { useNotes, useWaitingActions } from "../../hooks/homescreens/hooks";
import { ConfirmationModal } from "./Modals/ConfirmationModal";
import { FailureModal } from "./Modals/FailureModal";
import { useConnectionState } from "../../../App";
import { WatermelonNoteService } from "../../services/watermelon-notes-service";
import { RemoteNoteService } from "../../services/remote-notes-services";
import Loading from "../Loading/Loading";
import Toast from "react-native-toast-message";

// Types
type NoteEditorRouteProp = RouteProp<RootStackParamList, EnumRouteNames.HOME>;

interface HomeScreenProps {
  route: NoteEditorRouteProp;
  navigation: NavigationProp<ParamListBase>;
}

// Context
const RefreshNoteContext = React.createContext<() => void>(() => { });
const RefreshWaitingActionContext = React.createContext<() => void>(() => { });

export default function HomeScreen({ route, navigation }: HomeScreenProps) {
  const { refresh_note: shouldRefreshNote = false } = route.params || {};
  const [refreshVerifWaitingAction, setRefreshVerifWaitingAction] = useState(Date.now())

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);

  const initialized = useRef(false);

  // Custom hooks
  const { notes, isRefreshing, refreshNoteList } = useNotes();
  const {
    waitingActionsCount,
    failedActions,
    setFailedActions,
    checkWaitingActions,
    applyWaitingActions,
    clearFailedActions
  } = useWaitingActions();
  const connectionState = useConnectionState()

  // Initialize component
  const initializeComponent = useCallback(async () => {
    try {
      console.log("Actions en attente:", await WatermelonWaitingActionService.getAllWaitingAction());

      const [isConnected, waitingCount] = await Promise.all([
        connectionService.isConnected(),
        checkWaitingActions()
      ]);

      if (!initialized.current && isConnected && waitingCount > 0) {
        setShowConfirmationModal(true);
      } else {
        initialized.current = true;
        await refreshNoteList();
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      // Fallback to refresh notes even if initialization fails
      initialized.current = true;
      await refreshNoteList();
    }
  }, [checkWaitingActions, refreshNoteList]);

  const getAllNewOnlineNotesAndCreate = useCallback(async () => {
    try {
      setIsLoading(true);
      const localeNotes = await WatermelonNoteService.getAll();
      const localeNoteTitles = localeNotes.map(note => note.nom_note);
      const newOnlineNotes = await (await RemoteNoteService.getAll()).filter(note => (!localeNoteTitles.includes(note.nom_note) || !note.id));
      for (const note of newOnlineNotes) {
        const newLocaleNote = await WatermelonNoteService.create({
          ...note,
          synced: true,
          status: 'synced',
          date_sync: new Date().toISOString(),
        });
        if (newLocaleNote && note.status !== 'synced') {
          await RemoteNoteService.update(note.supabase_id, {
            id: newLocaleNote.id,
            synced: true,
            status: 'synced',
            date_sync: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des notes en ligne:", error);
      throw error;
    } finally {
      setIsLoading(false);
      await refreshNoteList();
    }
  }, []);

  // Effects
  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);

  useEffect(() => {
    if (!!connectionState && connectionState.isConnected && connectionState.isInternetReachable) {//Si connecté

      checkWaitingActions().then((waitingActionsCount) => {
        if (waitingActionsCount > 0) {
          setShowConfirmationModal(true);
        }
      }).catch((error) => {
        console.error("ERROR CHECKING WAITING ACTION:", error);
      })

    }
  }, [connectionState, refreshVerifWaitingAction])

  // Refresh when screen comes into focus and shouldRefreshNote is true
  useFocusEffect(
    useCallback(() => {
      if (shouldRefreshNote && initialized.current) {
        refreshNoteList();
      }
    }, [shouldRefreshNote, refreshNoteList])
  );

  const handleClickClearLocaleDatabase = async () => {
    try {
      setIsLoading(true);
      await WatermelonNoteService.clearAll();
      await WatermelonWaitingActionService.clearAll();
    } catch (e) {
      console.log("Error: ", e);
      
      Toast.show({
        type: "error",
        text1: "Erreur lors de la suppression"
      })
    } finally {
      setIsLoading(false);
    }
  }

  // Handlers
  const handleConfirmActions = useCallback(async () => {
    try {
      const failureCauses = await applyWaitingActions();

      setShowConfirmationModal(false);
      initialized.current = true;
      await refreshNoteList();

      if (failureCauses.length > 0) {
        setFailedActions(failureCauses);
        setShowFailureModal(true);
      }
    } catch (error) {
      // Error handling is done in applyWaitingActions
      setShowConfirmationModal(false);
      initialized.current = true;
      await refreshNoteList();
    }
  }, [applyWaitingActions, refreshNoteList, setFailedActions]);

  const handleCancelActions = useCallback(async () => {
    setShowConfirmationModal(false);
    initialized.current = true;
    await refreshNoteList();
  }, [refreshNoteList]);

  const handleCloseFailureModal = useCallback(() => {
    setShowFailureModal(false);
    setFailedActions([]);
  }, [setFailedActions]);

  const handleRemoveFailedActions = useCallback(async () => {
    setIsLoadingDelete(true);
    try {
      await clearFailedActions();
      setShowFailureModal(false);
    } catch (error) {
      // Error handling is done in clearFailedActions
    } finally {
      setIsLoadingDelete(false);
    }
  }, [clearFailedActions]);

  // Memoized context value
  const contextValue = useMemo(() => refreshNoteList, [refreshNoteList]);

  const filteredNotes = notes.filter(note => {
    const matchesKeyword = note.nom_note.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = (selectedCategories.length > 0 && !selectedCategories.includes("All"))
      ? note.categorie.some((cat: string) => selectedCategories.includes(cat))
      : true;
    return matchesKeyword && matchesCategory;
  });

  if (isLoading) return <Loading />;

  return (
    <RefreshWaitingActionContext value={() => { setRefreshVerifWaitingAction(Date.now()) }}>
      <RefreshNoteContext.Provider value={contextValue}>
        <View style={styles.container}>
          <HomeScreenHeader handleClickClearLocaleDatabase={handleClickClearLocaleDatabase} searchKeyword={searchKeyword} setSearchKeyword={setSearchKeyword} getAllNewOnlineNotesAndCreate={getAllNewOnlineNotesAndCreate} navigation={navigation} />
          <DaysSelector />
          <CategoriesSelector
            selectedCategories={selectedCategories}
            onCategorySelect={setSelectedCategories}
          />
          <NotesList
            onRefresh={refreshNoteList}
            liste={filteredNotes}
          />
          <PlusButton />

          <Portal>
            <ConfirmationModal
              visible={showConfirmationModal}
              waitingActionsCount={waitingActionsCount}
              onConfirm={handleConfirmActions}
              onCancel={handleCancelActions}
            />

            <FailureModal
              visible={showFailureModal}
              failedActions={failedActions}
              loading={isLoadingDelete}
              onClose={handleCloseFailureModal}
              onRemoveActions={handleRemoveFailedActions}
            />
          </Portal>
        </View>
      </RefreshNoteContext.Provider>
    </RefreshWaitingActionContext>
  );
}

export const useRefreshNote = () => {
  const context = React.useContext(RefreshNoteContext);
  if (context === undefined) {
    throw new Error("useRefreshNote must be used within a RefreshNoteProvider");
  }
  return context;
};

export const useRefreshWaitingList = () => {
  const context = useContext(RefreshWaitingActionContext);
  if (context === undefined) {
    throw new Error("useRefreshNote must be used within a RefreshNoteProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  }
});