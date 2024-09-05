import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './Calendar.css';

function CalendarComponent({ selectedSpace, calendarData, setCalendarData, setTimeSlots, setSelectedDate, onClose }) {
  const [date, setDate] = useState(null);
  const [timeSlots, setLocalTimeSlots] = useState([]);

  useEffect(() => {
    if (selectedSpace && date) {
      const fetchCalendarData = async () => {
        try {
          const formattedDate = date.toISOString().split('T')[0];
          const selectedDayData = calendarData.find(day => day.date === formattedDate);

          if (selectedDayData) {
            setLocalTimeSlots(selectedDayData.timeslots);
          } else {
            const calendarRef = doc(db, 'owners', auth.currentUser.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);
            const calendarSnap = await getDoc(calendarRef);

            if (calendarSnap.exists()) {
              setLocalTimeSlots(calendarSnap.data().timeslots);
            } else {
              const timeslots = [
                { time: '09:00', available: true },
                { time: '10:00', available: true },
                { time: '11:00', available: true },
                { time: '12:00', available: true },
                { time: '13:00', available: true },
                { time: '14:00', available: true },
                { time: '15:00', available: true },
                { time: '16:00', available: true },
                { time: '17:00', available: true },
                { time: '18:00', available: true },
                { time: '19:00', available: true },
                { time: '20:00', available: true },
                { time: '21:00', available: true },
                { time: '22:00', available: true },
                { time: '23:00', available: true },

              ];
              await setDoc(calendarRef, { date: formattedDate, timeslots });
              setLocalTimeSlots(timeslots);
            }
          }
        } catch (error) {
          console.error("Error al obtener los horarios: ", error);
        }
      };

      fetchCalendarData();
    }
  }, [date, selectedSpace, calendarData]);

  const handleTimeslotClick = async (slotIndex) => {
    if (!date || !selectedSpace) return;

    const formattedDate = date.toISOString().split('T')[0];
    const calendarRef = doc(db, 'owners', auth.currentUser.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);
    
    const updatedTimeSlots = timeSlots.map((slot, index) => {
      if (index === slotIndex) {
        return { ...slot, available: !slot.available };
      }
      return slot;
    });

    try {
      await setDoc(calendarRef, { date: formattedDate, timeslots: updatedTimeSlots });
      setLocalTimeSlots(updatedTimeSlots);
    } catch (error) {
      console.error('Error al actualizar los horarios:', error);
    }
  };

  useEffect(() => {
    if (date) {
      setSelectedDate(date);
    }
  }, [date, setSelectedDate]);

  return (
    <div className="Calendar-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Disponibilidad de {selectedSpace?.name || "Espacio"}</h3>
          <button className="modal-close-button" onClick={onClose}>✖</button>
        </div>
        
        <div className="calendar-container">
          <Calendar
            onChange={setDate}
            value={date}
          />
        </div>

        <div className="timeslot-container">
          {timeSlots.map((slot, index) => (
            <button
              key={index}
              className={`timeslot-button ${slot.available ? 'available' : 'reserved'}`}
              onClick={() => handleTimeslotClick(index)}
            >
              {slot.time} - {slot.available ? 'Reservar' : 'Reservado'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarComponent;
