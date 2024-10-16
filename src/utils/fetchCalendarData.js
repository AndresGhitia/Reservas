// utils/fetchCalendarData.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchCalendarData = async (ownerId, spaceId) => {
    try {
        const calendarRef = collection(db, 'owners', ownerId, 'spaces', spaceId, 'calendar');
        const querySnapshot = await getDocs(calendarRef);
        const calendarData = {};

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            calendarData[data.date] = data.slots; // Suponiendo que la estructura es { date, slots }
        });

        return calendarData;
    } catch (error) {
        console.error('Error al obtener los datos del calendario:', error);
        throw error;
    }
};
