import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './Calendar.css';

function CalendarUser({ selectedSpace, calendarData, setCalendarData, setSelectedDate, onClose, disableBooking , addTimeSlots, ownerId  }) {
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
            // Usar ownerId en lugar de auth.currentUser.uid
            const calendarRef = doc(db, 'owners', ownerId, 'spaces', selectedSpace.id, 'calendar', formattedDate);
            const calendarSnap = await getDoc(calendarRef);
  
            if (calendarSnap.exists()) {
              // Si ya existen horarios guardados para la fecha, úsalos
              setLocalTimeSlots(calendarSnap.data().timeslots);
            } else {
              const spaceRef = doc(db, 'owners', ownerId, 'spaces', selectedSpace.id);
              const spaceSnap = await getDoc(spaceRef);
  
              if (spaceSnap.exists()) {
                const { openTime, closeTime } = spaceSnap.data();  // Recuperar los tiempos de apertura y cierre
  
                // Crear los "timeslots" a partir del rango de horarios
                const timeslots = generateTimeSlots(openTime, closeTime);
  
                // Guardar los horarios en Firestore para esa fecha específica
                await setDoc(calendarRef, { date: formattedDate, timeslots });
  
                // Actualizar el estado local con los horarios recién creados
                setLocalTimeSlots(timeslots);
              } else {
                console.error('No se encontró el espacio seleccionado.');
              }
            }
          }
        } catch (error) {
          console.error("Error al obtener los horarios: ", error);
        }
      };
  
      fetchCalendarData();
    }
  }, [date, selectedSpace, calendarData, ownerId]); // Agregar ownerId como dependencia para asegurarse de que el valor se use correctamente
  
  
  
  
  const generateTimeSlots = (openTime, closeTime) => {
    const timeSlots = [];
    let [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
    while (openHour < closeHour || (openHour === closeHour && openMinute < closeMinute)) {
      const time = `${String(openHour).padStart(2, '0')}:${String(openMinute).padStart(2, '0')}`;
      timeSlots.push({ time, available: true, name: null, whatsapp: null });
  
      // Increment by 1 hour (or you can adjust for 30-minute intervals if needed)
      openHour += 1;
      if (openHour === 24) openHour = 0; // Reiniciar si se llega a la medianoche
    }
  
    return timeSlots;
  };
  

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

export default CalendarUser;