import { Day } from "../types/day";

/**
 * Génère une liste des jours de la semaine à partir de la date actuelle.
 * Le premier jour de la semaine est le lundi.
 *
 * @returns {Day[]} Un tableau d'objets représentant les jours de la semaine.
 */
export const generateWeekDays = () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculer l'offset pour lundi

        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);

        const weekDays: Day[] = [];
        const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(monday);
            currentDate.setDate(monday.getDate() + i);

            const isToday = currentDate.toDateString() === today.toDateString();

            weekDays.push({
                date: currentDate,
                dayName: dayNames[i],
                dayNumber: currentDate.getDate(),
                monthName: monthNames[currentDate.getMonth()],
                isToday: isToday
            });
        }

        return weekDays;
    };