import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeColor } from "../../../constants/colors";
import { BUTTON_BAR_HEIGHT } from "../../../constants/noteEditor";

type FormattingToolbarProps = {
    formattingActions: {
        bold: () => void,
        italic: () => void,
        underline: () => void,
        strikethrough: () => void, 
        headline1: () => void,
        headline2: () => void,
        headline3: () => void,
        headline4: () => void,
        headline5: () => void,
        headline6: () => void,
        quote: () => void,
        code: () => void,
        link: () => void,
        bulletList: () => void,
        numberedList: () => void,
        checkbox: () => void
    };
}

const FormattingButton = ({ iconName, onPress }: { iconName: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
        <Icon name={iconName} size={24} color="#fff" />
    </TouchableOpacity>
);

export const FormattingToolbar = ({ formattingActions }: FormattingToolbarProps) => (
    <View style={styles.container}>
        <View style={styles.buttonsContainer}>
            <FormattingButton iconName="format-bold" onPress={formattingActions.bold} />
            <FormattingButton iconName="format-italic" onPress={formattingActions.italic} />
            <FormattingButton iconName="format-underline" onPress={formattingActions.underline} />
            <FormattingButton iconName="format-strikethrough" onPress={formattingActions.strikethrough} />
            <FormattingButton iconName="format-header-1" onPress={formattingActions.headline1} />
            <FormattingButton iconName="format-header-2" onPress={formattingActions.headline2} />
            <FormattingButton iconName="format-header-3" onPress={formattingActions.headline3} />
            <FormattingButton iconName="format-list-bulleted" onPress={formattingActions.bulletList} />
            <FormattingButton iconName="format-list-numbered" onPress={formattingActions.numberedList} />
            <FormattingButton iconName="format-quote-close" onPress={formattingActions.quote} />
            <FormattingButton iconName="code-tags" onPress={formattingActions.code} />
            <FormattingButton iconName="link" onPress={formattingActions.link} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        minHeight: BUTTON_BAR_HEIGHT,
        backgroundColor: ThemeColor.background,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        
    },
    buttonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 0,
        backgroundColor: ThemeColor.primary,
        width: '90%',
        borderRadius: 10,
        paddingVertical: 8,
    },
    button: {
        borderRadius: 5,
        minWidth: 40,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "rgba(66, 66, 66, 0.15)", 
    },
});