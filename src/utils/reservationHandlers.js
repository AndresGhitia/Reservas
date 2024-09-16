// src/utils/reservationHandlers.js

import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Ajusta el path si es necesario

export const handleReserveSlot = async (slotIndex, selectedSpace, selectedDate, timeSlots, setTimeSlots) => {
  try {
    const user = auth.currentUser;
    if (user && selectedSpace && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const calendarRef = doc(db, 'owners', user.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);
      const updatedSlots = [...timeSlots];
      updatedSlots[slotIndex].available = false;

      await setDoc(calendarRef, {
        date: formattedDate,
        timeslots: updatedSlots,
      });

      setTimeSlots(updatedSlots);
    }
  } catch (error) {
    console.error("Error al reservar el horario: ", error);
  }
};

export const handleCancelReservation = async (slotIndex, selectedSpace, selectedDate, timeSlots, setTimeSlots) => {
  try {
    const user = auth.currentUser;
    if (user && selectedSpace && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const calendarRef = doc(db, 'owners', user.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);
      const updatedSlots = [...timeSlots];
      updatedSlots[slotIndex].available = true;

      await setDoc(calendarRef, {
        date: formattedDate,
        timeslots: updatedSlots,
      });

      setTimeSlots(updatedSlots);
    }
  } catch (error) {
    console.error("Error al cancelar la reserva: ", error);
  }
};
