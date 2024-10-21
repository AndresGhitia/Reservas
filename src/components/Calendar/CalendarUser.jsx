import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './CalendarUser.css';

function CalendarUser({ selectedSpace, calendarData, setCalendarData, setSelectedDate, onClose, disableBooking, ownerId, cel, sport }) {
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

    const incrementMinute = sport === "Paddle" ? 30 : 60;

    while (
      openHour < closeHour ||
      (openHour === closeHour && openMinute < closeMinute)
    ) {
      const time = `${String(openHour).padStart(2, '0')}:${String(openMinute).padStart(2, '0')}`;
      timeSlots.push({ time, available: true, name: null, whatsapp: null });

      openMinute += incrementMinute;

      if (openMinute >= 60) {
        openMinute -= 60;
        openHour += 1;
      }

      if (openHour === 24) {
        openHour = 0;
      }
    }

    return timeSlots;
  };

  const handleTimeslotClick = async (slotIndex) => {
    const selectedSlot = timeSlots[slotIndex];
    if (selectedSlot.available) {
      const message = encodeURIComponent(`Hola, estoy interesado en reservar el espacio ${selectedSpace.name} para el horario ${selectedSlot.time}.`);
      const whatsappLink = `https://wa.me/${cel}?text=${message}`;
      window.open(whatsappLink, '_blank');
    } else {
      alert("Este horario está reservado.");
    }
  };

  const saveNotificationRequest = async (time, whatsappNumber, spaceId, ownerId, spaceName) => {
    try {
      const notificationId = `${whatsappNumber}_${time}`;
      const notificationRef = doc(db, 'owners', ownerId, 'spaces', spaceId, 'notifications', notificationId);

      await setDoc(notificationRef, {
        time,
        whatsapp: whatsappNumber,
        spaceName,
        notified: false
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
    <div className="calendar-content">
      <div className="modal-header">
        <div className="calendar-header">
          <h1>Disponibilidad {selectedSpace?.name || "Espacio"}</h1>
        </div>
        <div className="modal-close-button">
          <p onClick={onClose}>✖</p>
        </div>
      </div>
  
      <div className="calendar-container">
        <div className="date-container">
          <p>Horarios del día {date ? formatDate(date) : ""}</p>
          <DatePicker
            selected={date}
            onChange={(selectedDate) => setDate(selectedDate)}
            dateFormat="dd - MMMM - yyyy"
            className="datepicker-input"
            isClearable
            placeholderText="Selecciona una fecha"
          />
        </div>
  
        <div className="timeslot-container">
          {timeSlots.map((slot, index) => (
            <button
              key={index}
              className={`timeslot-button ${slot.available ? 'available' : 'reserved'} ${disableBooking ? 'disabled-business' : ''}`}
              onClick={() => handleTimeslotClick(index)}
            >
              {slot.time} - {disableBooking ? (slot.available ? 'Disponible' : 'Ocupado') : (slot.available ? 'Reservar' : `${slot.name} ${slot.whatsapp}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarUser;
