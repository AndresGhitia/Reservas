import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './Calendar.css';

function CalendarComponent({ selectedSpace, calendarData, setCalendarData, setSelectedDate, onClose, disableBooking }) {
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
              // Timeslots now include name and whatsapp fields
              const timeslots = [
                { time: '09:00', available: true, name: null, whatsapp: null },
                { time: '10:00', available: true, name: null, whatsapp: null },
                { time: '11:00', available: true, name: null, whatsapp: null },
                { time: '12:00', available: true, name: null, whatsapp: null },
                { time: '13:00', available: true, name: null, whatsapp: null },
                { time: '14:00', available: true, name: null, whatsapp: null },
                { time: '15:00', available: true, name: null, whatsapp: null },
                { time: '16:00', available: true, name: null, whatsapp: null },
                { time: '17:00', available: true, name: null, whatsapp: null },
                { time: '18:00', available: true, name: null, whatsapp: null },
                { time: '19:00', available: true, name: null, whatsapp: null },
                { time: '20:00', available: true, name: null, whatsapp: null },
                { time: '21:00', available: true, name: null, whatsapp: null },
                { time: '22:00', available: true, name: null, whatsapp: null },
                { time: '23:00', available: true, name: null, whatsapp: null },
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

  // New function to ask for name and WhatsApp when reserving a slot
  const askUserDetails = () => {
    const name = prompt("Ingresa tu nombre:");
    const whatsapp = prompt("Ingresa tu número de WhatsApp:");
    return { name, whatsapp };
  };

  const handleTimeslotClick = async (slotIndex) => {
    if (!date || !selectedSpace || disableBooking) return;

    const formattedDate = date.toISOString().split('T')[0];
    const calendarRef = doc(db, 'owners', auth.currentUser.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);

    const selectedSlot = timeSlots[slotIndex];

    if (selectedSlot.available) {
      // If the slot is available, reserve it
      const { name, whatsapp } = askUserDetails();

      if (!name || !whatsapp) {
        alert('Se necesitan nombre y número de WhatsApp para realizar una reserva.');
        return;
      }

      const updatedTimeSlots = timeSlots.map((slot, index) => {
        if (index === slotIndex) {
          return { ...slot, available: false, name, whatsapp }; // Update with name and WhatsApp
        }
        return slot;
      });

      try {
        await setDoc(calendarRef, { date: formattedDate, timeslots: updatedTimeSlots });
        setLocalTimeSlots(updatedTimeSlots);
      } catch (error) {
        console.error('Error al actualizar los horarios:', error);
      }
    } else {
      // If the slot is reserved, ask to release it
      const confirmRelease = window.confirm(`Deseas liberar el horario ${selectedSlot.time} reservado para ${selectedSlot.name}?`);

      if (confirmRelease) {
        const updatedTimeSlots = timeSlots.map((slot, index) => {
          if (index === slotIndex) {
            return { ...slot, available: true, name: null, whatsapp: null }; // Release the slot
          }
          return slot;
        });

        try {
          await setDoc(calendarRef, { date: formattedDate, timeslots: updatedTimeSlots });
          setLocalTimeSlots(updatedTimeSlots);
        } catch (error) {
          console.error('Error al liberar el horario:', error);
        }
      }
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
            showNeighboringMonth={false}
          />
        </div>

        <div className="timeslot-container">
          {timeSlots.map((slot, index) => (
            <button
              key={index}
              className={`timeslot-button ${slot.available ? 'available' : 'reserved'} ${disableBooking ? 'disabled-business' : ''}`}
              onClick={() => handleTimeslotClick(index)}
              disabled={disableBooking}
            >
              {slot.time} - {disableBooking ? (slot.available ? 'Disponible' : 'Ocupado') : (slot.available ? 'Reservar' : ` ${slot.name}`)}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

export default CalendarComponent;
