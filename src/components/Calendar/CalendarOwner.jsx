import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './Calendar.css';

function CalendarOwner({ selectedSpace, calendarData, setCalendarData, setSelectedDate, onClose, disableBooking, ownerId }) {
  const [date, setDate] = useState(null);
  const [timeSlots, setLocalTimeSlots] = useState([]);

  useEffect(() => {
    if (selectedSpace && date) {
      const fetchCalendarData = async () => {
        try {
          const formattedDate = date.toISOString().split('T')[0];
          console.log("Fetching data for:", formattedDate);
          const selectedDayData = calendarData.find(day => day.date === formattedDate);

          if (selectedDayData) {
            console.log("Data found locally for:", formattedDate);
            setLocalTimeSlots(selectedDayData.timeslots);
          } else {
            console.log("Fetching data from Firebase for:", formattedDate);
            const calendarRef = doc(db, 'owners', ownerId, 'spaces', selectedSpace.id, 'calendar', formattedDate);
            const calendarSnap = await getDoc(calendarRef);

            if (calendarSnap.exists()) {
              console.log("Data found in Firebase for:", formattedDate);
              setLocalTimeSlots(calendarSnap.data().timeslots);
            } else {
              console.log("No data found, generating new time slots.");
              const spaceRef = doc(db, 'owners', ownerId, 'spaces', selectedSpace.id);
              const spaceSnap = await getDoc(spaceRef);

              if (spaceSnap.exists()) {
                const { openTime, closeTime } = spaceSnap.data();
                const timeslots = generateTimeSlots(openTime, closeTime);
                
                await setDoc(calendarRef, { date: formattedDate, timeslots });
                setLocalTimeSlots(timeslots);
                console.log("Generated and saved new time slots:", timeslots);
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

    console.log("Generating slots from", openHour, ":", openMinute, "to", closeHour, ":", closeMinute);

    while (openHour < closeHour || (openHour === closeHour && openMinute < closeMinute)) {
      const time = `${String(openHour).padStart(2, '0')}:${String(openMinute).padStart(2, '0')}`;
      timeSlots.push({ time, available: true, name: null, whatsapp: null });

      openMinute += 30;
      if (openMinute >= 60) {
        openMinute -= 60;
        openHour += 1;
      }
    }

    console.log("Generated Time Slots:", timeSlots);
    return timeSlots;
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

export default CalendarOwner;
