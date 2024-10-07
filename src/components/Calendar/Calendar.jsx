import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './Calendar.css';

function CalendarComponent({ selectedSpace, calendarData, setCalendarData, setSelectedDate, onClose, disableBooking , addTimeSlots,}) {
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
                { time: '08:00', available: true, name: null, whatsapp: null },
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

  const askUserDetails = () => {
    const name = prompt("Reserva a nombre de:");
    const whatsapp = prompt("Número de WhatsApp:");
    return { name, whatsapp };
  };

  const handleTimeslotClick = async (slotIndex) => {
    if (!date || !selectedSpace || disableBooking) return;

    const formattedDate = date.toISOString().split('T')[0];
    const calendarRef = doc(db, 'owners', auth.currentUser.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);

    const selectedSlot = timeSlots[slotIndex];

    if (selectedSlot.available) {
      const { name, whatsapp } = askUserDetails();

      if (!name || !whatsapp) {
        alert('Se necesitan nombre y número de WhatsApp para realizar una reserva.');
        return;
      }

      const updatedTimeSlots = timeSlots.map((slot, index) => {
        if (index === slotIndex) {
          return { ...slot, available: false, name, whatsapp };
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
      const confirmRelease = window.confirm(`Deseas liberar el horario ${selectedSlot.time} reservado para ${selectedSlot.name}?`);

      if (confirmRelease) {
        const updatedTimeSlots = timeSlots.map((slot, index) => {
          if (index === slotIndex) {
            return { ...slot, available: true, name: null, whatsapp: null };
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

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'numeric' });
  };

  return (
    <div className="Calendar-modal">
      <div className="modal-content">
     
        <div className="modal-header">
         
         <div ClassNme= "calendar-header">
          <h3>Disponibilidad de {selectedSpace?.name || "Espacio"}</h3>
          <p>Horarios del día {date ? formatDate(date) : ""}</p>
         </div>
          <button className="modal-close-button" onClick={onClose}>✖</button>
       
        </div>
        
       <div className='calendar-container'> 
        <div className="date-container">
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
              {slot.time} - {disableBooking ? (slot.available ? 'Disponible' : 'Ocupado') : (slot.available ? 'Reservar' : `${slot.name} ${slot.whatsapp}`)}
            </button>
          ))}
        </div>
       </div>

      </div>
    </div>
  );
}

export default CalendarComponent;
