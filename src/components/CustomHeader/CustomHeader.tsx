import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ArrowLeftIcon from '../../../icons/Iconsax/Linear/arrowleft.svg';
import { useNavigation } from "@react-navigation/native";
import { HEADER_HEIGHT } from "../../constants/noteEditor";
import { ThemeColor } from "../../constants/colors";

type CustomHeaderProps = {
    title?: string;
};

export default function CustomHeader({ title }: CustomHeaderProps) {
    const router = useNavigation();

    const handleBackPress = () => {
        router.goBack();
    };

    return <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
            <ArrowLeftIcon width={25} height={25} />
        </TouchableOpacity>
        <Text style={styles.title}> {title || "Title"} </Text>
    </View>
};

const styles = StyleSheet.create({
    header: {
        width: "100%",
        height: HEADER_HEIGHT,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerButton: {
        paddingHorizontal: 12,
    },
    title: {
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 18,
        borderRadius: 8,
        marginHorizontal: 10,
        color: ThemeColor.primary
    }
});