import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Menu, Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NoteDTO } from '../../../types/model/note';
import NoteItem from './NoteItem/NoteItem';
import { generateRandomRatio } from '../../../functions/NotesList/generate-random-ratio';
import { ThemeColor } from '../../../constants/colors';
import { ResponsiveGrid } from '../../MyFlexibleGrid/responsive-grid/ResponsiveGrid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotesListeWithChilds } from './NotesListeWIthChilds';

interface NotesListProps {
  liste: NoteDTO[];
  onRefresh: () => Promise<void>;
}

type ViewType = "CARDS" | "LISTE";
type SortBy = "date" | "name";
type SortOrder = "asc" | "desc";

export default function NotesList({ liste, onRefresh }: NotesListProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<ViewType>("CARDS");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // États pour les menus dropdown
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [viewMenuVisible, setViewMenuVisible] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSortBy = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setSortMenuVisible(false);
  };

  const handleViewChange = (newViewType: ViewType) => {
    setViewType(newViewType);
    setViewMenuVisible(false);
  };

  const getSortLabel = () => {
    const baseLabel = sortBy === "date" ? "Date" : "Nom";
    const orderSymbol = sortOrder === "asc" ? "↑" : "↓";
    return `${baseLabel} ${orderSymbol}`;
  };

  const getViewLabel = () => {
    return viewType === "CARDS" ? "Grille" : "Liste";
  };

  // Tri et préparation des données
  const sortedNotesWithRatios = useMemo(() => {
    const notesWithRatios = liste.map(note => ({
      ...note,
      ...generateRandomRatio()
    }));

    return notesWithRatios.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        // Tri par date de modification si elle existe, sinon par date de création
        const dateA = new Date(a.date_modification || a.date_creation).getTime();
        const dateB = new Date(b.date_modification || b.date_creation).getTime();
        comparison = dateA - dateB;
      } else {
        // Tri par nom de la note
        const nameA = a.nom_note.toLowerCase();
        const nameB = b.nom_note.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [liste, sortBy, sortOrder]);

  const renderItem = React.useCallback(({ item, index }: { item: NoteDTO & { widthRatio: number; heightRatio: number }; index: number }) => (
    <View style={viewType === "LISTE" ? styles.listItemWrapper : styles.itemWrapper}>
      <NoteItem item={item} index={index} />
    </View>
  ), [viewType]);

  const renderListItem = ({ item, index }: { item: NoteDTO & { widthRatio: number; heightRatio: number }; index: number }) => (
    <View style={styles.listItemContainer}>
      <NoteItem item={item} index={index} />
    </View>
  );

  // Clés pour le local storage
  const VIEW_TYPE_KEY = 'notesList_viewType';
  const SORT_BY_KEY = 'notesList_sortBy';
  const SORT_ORDER_KEY = 'notesList_sortOrder';

  // Charger les valeurs du local storage au montage
  React.useEffect(() => {
    (async () => {
      const storedViewType = await AsyncStorage.getItem(VIEW_TYPE_KEY);
      const storedSortBy = await AsyncStorage.getItem(SORT_BY_KEY);
      const storedSortOrder = await AsyncStorage.getItem(SORT_ORDER_KEY);
      if (storedViewType === 'CARDS' || storedViewType === 'LISTE') setViewType(storedViewType as ViewType);
      if (storedSortBy === 'date' || storedSortBy === 'name') setSortBy(storedSortBy as SortBy);
      if (storedSortOrder === 'asc' || storedSortOrder === 'desc') setSortOrder(storedSortOrder as SortOrder);
    })();
  }, []);

  // Sauvegarder dans le local storage à chaque changement
  React.useEffect(() => {
    AsyncStorage.setItem(VIEW_TYPE_KEY, viewType);
  }, [viewType]);
  React.useEffect(() => {
    AsyncStorage.setItem(SORT_BY_KEY, sortBy);
  }, [sortBy]);
  React.useEffect(() => {
    AsyncStorage.setItem(SORT_ORDER_KEY, sortOrder);
  }, [sortOrder]);

  if (liste.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune note disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barre de contrôles */}
      <View style={styles.controlsContainer}>
        {/* Menu de tri */}
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setSortMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Icon name="swap-vert" size={18} color="#6B7280" style={styles.buttonIcon} />
              <Text style={styles.dropdownButtonText}>
                Tri: {getSortLabel()}
              </Text>
              <Icon name="keyboard-arrow-down" size={18} color="#6B7280" />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => {
              setSortBy("date");
              setSortOrder("desc");
              setSortMenuVisible(false);
            }}
            title="Date (récent → ancien)"
            leadingIcon={() => <Icon name="access-time" size={18} color="#6B7280" />} // Correction icône
            titleStyle={[
              styles.menuItemText,
              sortBy === "date" && sortOrder === "desc" ? styles.activeMenuText : undefined
            ]}
          />
          <Menu.Item
            onPress={() => {
              setSortBy("date");
              setSortOrder("asc");
              setSortMenuVisible(false);
            }}
            title="Date (ancien → récent)"
            leadingIcon={() => <Icon name="access-time" size={18} color="#6B7280" />} // Correction icône
            titleStyle={[
              styles.menuItemText,
              sortBy === "date" && sortOrder === "asc" ? styles.activeMenuText : undefined
            ]}
          />
          <Divider style={styles.menuDivider} />
          <Menu.Item
            onPress={() => {
              setSortBy("name");
              setSortOrder("asc");
              setSortMenuVisible(false);
            }}
            title="Nom (A → Z)"
            leadingIcon={() => <Icon name="sort-by-alpha" size={18} color="#6B7280" />} // Correction icône
            titleStyle={[
              styles.menuItemText,
              sortBy === "name" && sortOrder === "asc" ? styles.activeMenuText : undefined
            ]}
          />
          <Menu.Item
            onPress={() => {
              setSortBy("name");
              setSortOrder("desc");
              setSortMenuVisible(false);
            }}
            title="Nom (Z → A)"
            leadingIcon={() => <Icon name="sort-by-alpha" size={18} color="#6B7280" />} // Correction icône
            titleStyle={[
              styles.menuItemText,
              sortBy === "name" && sortOrder === "desc" ? styles.activeMenuText : undefined
            ]}
          />
        </Menu>

        {/* Menu de vue */}
        <Menu
          visible={viewMenuVisible}
          onDismiss={() => setViewMenuVisible(false)}
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setViewMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Icon 
                name={viewType === "CARDS" ? "grid-view" : "view-list"} 
                size={18} 
                color="#6B7280" 
                style={styles.buttonIcon} 
              />
              <Text style={styles.dropdownButtonText}>
                Vue: {getViewLabel()}
              </Text>
              <Icon name="keyboard-arrow-down" size={18} color="#6B7280" />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => handleViewChange("CARDS")}
            title="Grille"
            leadingIcon={() => <Icon name="grid-view" size={18} color="#6B7280" />} // Correction icône
            titleStyle={[
              styles.menuItemText,
              viewType === "CARDS" ? styles.activeMenuText : undefined
            ]}
          />
          <Menu.Item
            onPress={() => handleViewChange("LISTE")}
            title="Liste"
            leadingIcon={() => <Icon name="view-list" size={18} color="#6B7280" />} // Correction icône
            titleStyle={[
              styles.menuItemText,
              viewType === "LISTE" ? styles.activeMenuText : undefined
            ]}
          />
        </Menu>
      </View>

      {/* Contenu selon le type de vue */}
      {viewType === "CARDS" ? (
        <ResponsiveGrid
          data={sortedNotesWithRatios}
          maxItemsPerColumn={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          virtualization={true}
          virtualizedBufferFactor={2}
          showScrollIndicator={false}
          style={styles.grid}
          itemContainerStyle={styles.itemContainer}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[ThemeColor.primary]}
              tintColor={ThemeColor.primary}
            />
          }
        />
      ) : (
        <NotesListeWithChilds notes={sortedNotesWithRatios} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    width: '100%',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginBottom: 8,
    gap: 10
  },
  // Styles pour les boutons dropdown - Plus fidèles à l'image
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius:6,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 130,
  },
  buttonIcon: {
    marginRight: 6,
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    textAlign: 'left',
  },
  // Styles pour les menus
  menuContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151',
  },
  activeMenuText: {
    color: ThemeColor.primary,
    fontWeight: '600',
  },
  menuDivider: {
    backgroundColor: '#F3F4F6',
    height: 1,
    marginVertical: 4,
  },
  // Styles pour le contenu
  grid: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  list: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemContainer: {
    padding: 8,
  },
  itemWrapper: {
    flex: 1,
    height: '100%',
  },
  listItemWrapper: {
    width: '100%',
  },
  listItemContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});