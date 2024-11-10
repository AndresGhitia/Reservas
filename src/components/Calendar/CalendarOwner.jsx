import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './CalendarOwner.css';

function CalendarComponent({ selectedSpace, calendarData, setCalendarData, setSelectedDate, onClose, disableBooking, addTimeSlots, sport }) {
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
              const spaceRef = doc(db, 'owners', auth.currentUser.uid, 'spaces', selectedSpace.id);
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
  }, [date, selectedSpace, calendarData]);

  const generateTimeSlots = (openTime, closeTime) => {
    const timeSlots = [];
    let [openHour, openMinute] = openTime.split(':').map(Number);
    let [closeHour, closeMinute] = closeTime.split(':').map(Number);
  
    const incrementMinute = selectedSpace.sport === "Paddle" ? 30 : 60;
    let isOvernight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
  
    while (true) {
      const time = `${String(openHour).padStart(2, '0')}:${String(openMinute).padStart(2, '0')}`;
      timeSlots.push({ time, available: true, name: null, whatsapp: null });
  
      openMinute += incrementMinute;
  
      if (openMinute >= 60) {
        openMinute -= 60;
        openHour = (openHour + 1) % 24;
      }
  
      if (!isOvernight && openHour === closeHour && openMinute >= closeMinute) break;
      if (isOvernight && openHour === closeHour && openMinute >= closeMinute) break;
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
          <div className="calendar-header">
            <h3>Disponibilidad de {selectedSpace?.name || "Espacio"}</h3>
            <p>Horarios del día {date ? formatDate(date) : ""}</p>
          </div>
          <button className="modal-close-button" onClick={onClose}>✖</button>
        </div>
        
        <div className="calendar-container-Owner"> 
          <div className="date-container-Owner">
            <DatePicker
              selected={date}
              onChange={setDate}
              //minDate={new Date()} // Deshabilita fechas anteriores a hoy
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecciona una fecha"
              inline
            />
          </div>
  
          <div className="timeslot-container-Owner">
            {timeSlots.map((slot, index) => {
              const isHalfHourInterval = selectedSpace.sport === "Paddle";

              if (isHalfHourInterval) {
                if (index % 2 !== 0) return null;

                const nextSlot = timeSlots[index + 1];

                return (
                  <div key={index} className="timeslot-pair timeslot-half-hour">
                    <button
                      className={`timeslot-button half-hour ${slot.available ? "available" : "reserved"} ${disableBooking ? "disabled-business" : ""}`}
                      onClick={() => handleTimeslotClick(index)}
                      disabled={disableBooking}
                    >
                      {slot.time} - {disableBooking ? (slot.available ? 'Disponible' : 'Ocupado') : (slot.available ? 'Reservar' : `${slot.name} ${slot.whatsapp}`)}
                    </button>
                    
                    {nextSlot && (
                      <button
                        className={`timeslot-button half-hour ${nextSlot.available ? "available" : "reserved"} ${disableBooking ? "disabled-business" : ""}`}
                        onClick={() => handleTimeslotClick(index + 1)}
                        disabled={disableBooking}
                      >
                        {nextSlot.time} - {disableBooking ? (nextSlot.available ? 'Disponible' : 'Ocupado') : (nextSlot.available ? 'Reservar' : `${nextSlot.name} ${nextSlot.whatsapp}`)}
                      </button>
                    )}
                  </div>
                );
              } else {
                return (
                  <button
                    key={index}
                    className={`timeslot-button ${slot.available ? "available" : "reserved"} ${disableBooking ? "disabled-business" : ""}`}
                    onClick={() => handleTimeslotClick(index)}
                    disabled={disableBooking}
                  >
                    {slot.time} - {disableBooking ? (slot.available ? 'Disponible' : 'Ocupado') : (slot.available ? 'Reservar' : `${slot.name} ${slot.whatsapp}`)}
                  </button>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarComponent;
