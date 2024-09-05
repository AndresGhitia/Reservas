// src/components/CalendarComponent.jsx

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

function CalendarComponent({ selectedSpace, calendarData, setCalendarData, setTimeSlots, setSelectedDate }) {
  const [date, setDate] = useState(null);

  useEffect(() => {
    if (selectedSpace && date) {
      const fetchCalendarData = async () => {
        try {
          const formattedDate = date.toISOString().split('T')[0];
          const selectedDayData = calendarData.find(day => day.date === formattedDate);

          if (selectedDayData) {
            setTimeSlots(selectedDayData.timeslots);
          } else {
            const calendarRef = doc(db, 'owners', auth.currentUser.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);
            const calendarSnap = await getDoc(calendarRef);

            if (calendarSnap.exists()) {
              setTimeSlots(calendarSnap.data().timeslots);
            } else {
              const timeslots = [
                { time: '09:00', available: true },
                { time: '10:00', available: true },
                { time: '11:00', available: true },
                { time: '12:00', available: true },
                { time: '13:00', available: true },
                { time: '14:00', available: true },

              ];
              await setDoc(calendarRef, { date: formattedDate, timeslots });
              setTimeSlots(timeslots);
            }
          }
        } catch (error) {
          console.error("Error al obtener los horarios: ", error);
        }
      };

      fetchCalendarData();
    }
  }, [date, selectedSpace, calendarData, setTimeSlots]);

  useEffect(() => {
    if (date) {
      setSelectedDate(date); // Asegúrate de que la fecha se pase correctamente
    }
  }, [date, setSelectedDate]);

  return (
    <div className="calendar-container">
      <Calendar
        onChange={setDate}
        value={date}
      />
    </div>
  );
}

export default CalendarComponent;
