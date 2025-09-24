import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { ThemeColor } from "../../../constants/colors";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";
import { EnumRouteNames } from "../../../types/enum-route-names";


export default function PlusButton() {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    const handlePress = () => {
        navigation.navigate(EnumRouteNames.NOTE_EDITOR); // Navigate to the CreateNote screen
    };

    return (
        <View style={styles.plusButtonContainer}>
            <TouchableOpacity style={styles.plusButton} onPress={handlePress} activeOpacity={0.7}>
                <Text style={styles.plusButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    plusButtonContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1000,
    },
    plusButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: ThemeColor.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 0
    },
    plusButtonText: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: 'bold',
        margin: 0
    },
});