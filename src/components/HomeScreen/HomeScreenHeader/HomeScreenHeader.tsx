import React from "react"
import { View, TouchableWithoutFeedback, TextInput, StyleSheet, TouchableOpacity } from "react-native"
import MagnifyingGlassIcon from '../../../../icons/Iconsax/Linear/searchnormal1.svg';
import NotificationIcon from '../../../../icons/Iconsax/Linear/notification.svg';
import MenuMeatBallsIcon from '../../../../icons/menu-meatballs-2.svg';
import { useRef } from "react";
import { Menu } from 'react-native-paper';
import { ThemeColor } from "../../../constants/colors";
import { useRefreshWaitingList } from "../HomeScreen";
import { useNavigation } from "@react-navigation/native";
import { EnumRouteNames } from "../../../types/enum-route-names";
import { useConnectionState } from "../../../../App";

type HomeScreenHeaderProps = {
    navigation: any;
    getAllNewOnlineNotesAndCreate: () => Promise<void>;
    searchKeyword: string;
    setSearchKeyword: (keyword: string) => void;
    handleClickClearLocaleDatabase: () => void
}

export default function HomeScreenHeader( { searchKeyword, setSearchKeyword , navigation, getAllNewOnlineNotesAndCreate, handleClickClearLocaleDatabase }: HomeScreenHeaderProps ) {
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    const refreshVerifWaitingAction = useRefreshWaitingList();
    const searchInputRef = useRef<TextInput>(null);

    const connectionState = useConnectionState();

    const handleClickRefresh = () => {
        refreshVerifWaitingAction();
        closeMenu();
    }

    const router = useNavigation();
    const handleClickActionsEnAttentes = () => {
        navigation.navigate(EnumRouteNames.WAITING_ACTIONS);
        closeMenu();
    }

    const handleClickClearLocaleDatabaseInMenu = () => {
        handleClickClearLocaleDatabase()
        closeMenu()
    }

    return <View style={styles.header}>
        <View style={styles.searchContainer}>
            <TouchableWithoutFeedback onPress={() => { searchInputRef.current?.focus() }}>
                <MagnifyingGlassIcon width={24} height={24} />
            </TouchableWithoutFeedback>
            <TextInput
                ref={searchInputRef}
                placeholder="Search"
                style={styles.searchInput}
                placeholderTextColor="#7C7C7C"
                value={searchKeyword}
                onChangeText={setSearchKeyword}
            ></TextInput>
        </View>
        <View style={styles.headerButtonsContainer}>
            <TouchableOpacity>
                <NotificationIcon width={24} height={24} />
            </TouchableOpacity>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <TouchableOpacity onPress={openMenu}>
                        <MenuMeatBallsIcon width={24} height={24} />
                    </TouchableOpacity>
                }
                contentStyle={{backgroundColor: ThemeColor.background}}
            >
                <Menu.Item titleStyle={{color: ThemeColor.primary}} onPress={handleClickRefresh} title="Verifier les actions en attentes" />
                <Menu.Item titleStyle={{color: ThemeColor.primary}} onPress={handleClickActionsEnAttentes} title="Liste des action en attents" />
                <Menu.Item disabled={!(connectionState?.isConnected && connectionState.isInternetReachable)} titleStyle={{color: ThemeColor.primary}} onPress={() => {
                    getAllNewOnlineNotesAndCreate();
                    closeMenu();
                }} title="Recuperer les nouvelles notes en ligne" />
                <Menu.Item titleStyle={{color: ThemeColor.primary}} onPress={handleClickClearLocaleDatabaseInMenu} title="Nettoyer la base de données locale" />
            </Menu>

        </View>
    </View>
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 44,
        marginTop: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        borderRadius: 5,
        backgroundColor: "#e8e8e8",
        flex: 1,
        paddingHorizontal: 16,
    },
    searchInput: {
        height: 40,
        marginLeft: 8,
        borderRadius: 8,
        flex: 1,
        color: '#7C7C7C',
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginLeft: 10,
    },
});