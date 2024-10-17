import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './Calendar.css';

function CalendarUser({ selectedSpace, calendarData, setCalendarData, setSelectedDate, onClose, disableBooking, ownerId, cel }) {
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
            const calendarRef = doc(db, 'owners', ownerId, 'spaces', selectedSpace.id, 'calendar', formattedDate);
            const calendarSnap = await getDoc(calendarRef);

            if (calendarSnap.exists()) {
              setLocalTimeSlots(calendarSnap.data().timeslots);
            } else {
              const spaceRef = doc(db, 'owners', ownerId, 'spaces', selectedSpace.id);
              const spaceSnap = await getDoc(spaceRef);

              if (spaceSnap.exists()) {
                const { openTime, closeTime } = spaceSnap.data();
                const timeslots = generateTimeSlots(openTime, closeTime);

                await setDoc(calendarRef, { date: formattedDate, timeslots });
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
  }, [date, selectedSpace, calendarData, ownerId]);

  const generateTimeSlots = (openTime, closeTime) => {
    const timeSlots = [];
    let [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    while (openHour < closeHour || (openHour === closeHour && openMinute < closeMinute)) {
      const time = `${String(openHour).padStart(2, '0')}:${String(openMinute).padStart(2, '0')}`;
      timeSlots.push({ time, available: true, name: null, whatsapp: null });

      openHour += 1; // Incrementar por una hora
      if (openHour === 24) openHour = 0; // Reiniciar si se llega a la medianoche
    }

    return timeSlots;
  };

  const handleTimeslotClick = async (slotIndex) => {
    const selectedSlot = timeSlots[slotIndex];
    if (selectedSlot.available) {
      // El horario está disponible, procede con la lógica de reserva.
      const message = encodeURIComponent(`Hola, estoy interesado en reservar el espacio ${selectedSpace.name} para el horario ${selectedSlot.time}.`);
      const whatsappLink = `https://wa.me/${cel}?text=${message}`;
      window.open(whatsappLink, '_blank');
    } else {

      alert("Este horario está reservado.");

      {/*
      // El horario está reservado, ofrece la opción de recibir una notificación.
      const notifyUser = window.confirm("Este horario está reservado. ¿Deseas recibir una notificación si se libera?");
      if (notifyUser) {
        const userWhatsapp = prompt("Por favor, ingresa tu número de WhatsApp para ser notificado:");
        if (userWhatsapp) {
          // Guardar la solicitud en Firestore.
          await saveNotificationRequest(selectedSlot.time, userWhatsapp, selectedSpace.id, ownerId, selectedSpace.name, date);
          alert("Te notificaremos si el horario se libera.");
        } else {
          alert("No se proporcionó un número de WhatsApp.");
        }
      }
     */}

    }
  };
  
  const saveNotificationRequest = async (time, whatsappNumber, spaceId, ownerId, spaceName) => {
    try {
      // Usar el número de teléfono combinado con la hora como identificador del documento
      const notificationId = `${whatsappNumber}_${time}`;
      const notificationRef = doc(db, 'owners', ownerId, 'spaces', spaceId, 'notifications', notificationId);
  
      await setDoc(notificationRef, {
        time,
        whatsapp: whatsappNumber,
        spaceName,
        notified: false // Campo para indicar si ya se notificó
      });
    } catch (error) {
      console.error("Error al guardar la solicitud de notificación: ", error);
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
          <div className="calendar-header">
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
               // disabled={disableBooking}
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
