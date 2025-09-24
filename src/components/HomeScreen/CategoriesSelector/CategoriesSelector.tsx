import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from "react-native";

interface CategoriesSelectorProps {
    selectedCategories?: string[];
    onCategorySelect?: (categories: string[]) => void;
    readOnly?: boolean;
}

const NOTES_CATEGORIES = [
    'All',
    'Important',
    'Lecture notes',
    'To-do lists',
    'Shopping',
    'Work',
    'Personal',
    'Travel',
];

export default function CategoriesSelector({ selectedCategories = ['All'], onCategorySelect, readOnly }: CategoriesSelectorProps) {
    const [currentSelectedCategories, setCurrentSelectedCategories] = useState<string[]>(selectedCategories);
    // Synchronise l'état local si la prop change
    React.useEffect(() => {
        console.log("Selected categories updated:", selectedCategories);
        
        setCurrentSelectedCategories(selectedCategories);
    }, [selectedCategories]);
    const flatListRef = useRef<FlatList>(null);

    const handleCategorySelect = (category: string) => {
        let updatedCategories: string[];
        if (category === 'All') {
            updatedCategories = ['All'];
        } else {
            updatedCategories = currentSelectedCategories.includes(category)
                ? currentSelectedCategories.filter(c => c !== category && c !== 'All')
                : [...currentSelectedCategories.filter(c => c !== 'All'), category];
            if (updatedCategories.length === 0) updatedCategories = ['All'];
        }
        setCurrentSelectedCategories(updatedCategories);
        if (onCategorySelect) {
            onCategorySelect(updatedCategories);
        }
    };

    const renderCategory = ({ item }: { item: string }) => {
        const isSelected = currentSelectedCategories.includes(item);

        return (
            <TouchableOpacity
                onPress={() => !readOnly && handleCategorySelect(item)}
                style={[styles.categoryContainer, isSelected && styles.selectedContainer]}
            >
                <Text style={[styles.categoryText, isSelected && styles.selectedText]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={NOTES_CATEGORIES}
                renderItem={renderCategory}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                scrollEnabled={true}
                decelerationRate="fast"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        width: '100%',
        marginVertical: 10,
        paddingHorizontal: 16,
    },
    flatListContent: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    categoryContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        marginRight: 6,
        minHeight: 40,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    selectedContainer: {
        backgroundColor: '#1A365D',
        borderColor: '#1A365D',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
    },
    selectedText: {
        color: '#FFFFFF',
        fontWeight: '600',
    }
});
