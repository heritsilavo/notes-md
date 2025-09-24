import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { ThemeColor } from '../../../constants/colors';
import { Day } from '../../../types/day';
import { generateWeekDays } from '../../../functions/generate-week-days';

interface DaysSelectorProps {
    selectedDay?: Date;
    onDaySelect?: (day: Day) => void;
}

const DaysSelector: React.FC<DaysSelectorProps> = ({ selectedDay, onDaySelect }) => {
    const [days, setDays] = useState<Day[]>([]);
    const [currentSelectedDay, setCurrentSelectedDay] = useState<Date>(selectedDay || new Date());
    const flatListRef = useRef<FlatList>(null);

    const ITEM_WIDTH = 50;
    const ITEM_MARGIN = 5;

    useEffect(() => {
        const weekDays = generateWeekDays();
        setDays(weekDays);
    }, []);

    useEffect(() => {
        if (days.length > 0 && flatListRef.current) {
            const today = new Date();
            const dayOfWeek = today.getDay();
            
            // Si c'est vendredi (5), samedi (6) ou dimanche (0)
            if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
                // Petit délai pour s'assurer que la FlatList est bien montée
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        }
    }, [days]);

    const handleDaySelect = (day: Day) => {
        setCurrentSelectedDay(day.date);
        if (onDaySelect) {
            onDaySelect(day);
        }
    };

    const renderDay = ({ item }: { item: Day }) => {
        const isSelected = currentSelectedDay.toDateString() === item.date.toDateString();

        return (
            <TouchableOpacity
                onPress={() => handleDaySelect(item)}
                style={[
                    styles.dayContainer,
                    { width: ITEM_WIDTH },
                    item.isToday && styles.todayContainer,
                    isSelected && !item.isToday && styles.selectedContainer
                ]}
            >
                <Text style={[
                    styles.dayNameText,
                    item.isToday && styles.todayText,
                    isSelected && !item.isToday && styles.selectedText
                ]}>
                    {item.dayName}
                </Text>
                <Text style={[
                    styles.dayNumberText,
                    item.isToday && styles.todayText,
                    isSelected && !item.isToday && styles.selectedText
                ]}>
                    {item.dayNumber}
                </Text>
                <Text style={[
                    styles.monthText,
                    item.isToday && styles.todayText,
                    isSelected && !item.isToday && styles.selectedText
                ]}>
                    {item.monthName}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={days}
                renderItem={renderDay}
                keyExtractor={(item) => item.date.toISOString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                scrollEnabled={true}
                decelerationRate="fast"
                snapToInterval={ITEM_WIDTH + (ITEM_MARGIN * 2)} // Snap sur chaque élément
                snapToAlignment="start"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 91,
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    flatListContent: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    dayContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
        borderRadius: 12,
        backgroundColor: 'transparent',
        minHeight: 75,
        marginRight: 5,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    todayContainer: {
        backgroundColor: ThemeColor.primary, // Bleu foncé comme dans l'image
    },
    selectedContainer: {
        backgroundColor: '#E8E8E8',
    },
    dayNameText: {
        fontSize: 12,
        fontWeight: '500',
        color: ThemeColor.primary,
        marginBottom: 2,
    },
    dayNumberText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ThemeColor.primary,
        marginBottom: 2,
    },
    monthText: {
        fontSize: 12,
        fontWeight: '400',
        color: ThemeColor.primary,
    },
    todayText: {
        color: '#FFFFFF',
    },
    selectedText: {
        color: '#1A365D',
    },
});

export default DaysSelector;