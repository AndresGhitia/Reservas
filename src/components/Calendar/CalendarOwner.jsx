import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { format } from 'date-fns';  // Importa 'format' desde 'date-fns'
import { es } from 'date-fns/locale';  // Importa el locale en español
import './CalendarOwner.css';

function CalendarComponent({ selectedSpace, calendarData, setCalendarData, setSelectedDate, onClose, disableBooking, addTimeSlots, sport }) {
  const [date, setDate] = useState(null);
  const [timeSlots, setLocalTimeSlots] = useState([]);
  const [closedDays, setClosedDays] = useState([]);

  useEffect(() => {
    if (selectedSpace) {
      const fetchClosedDays = async () => {
        try {
          const spaceRef = doc(db, 'owners', auth.currentUser.uid, 'spaces', selectedSpace.id);
          const spaceSnap = await getDoc(spaceRef);
      
          if (spaceSnap.exists()) {
            const { closedDays: fetchedClosedDays } = spaceSnap.data();
            console.log("closedDays desde Firestore:", fetchedClosedDays); // Para ver los días en Firestore
            
            // Aquí no necesitamos convertir a Date, solo usamos los nombres de los días
            setClosedDays(fetchedClosedDays);
          }
        } catch (error) {
          console.error("Error al obtener los días cerrados: ", error);
        }
      };
  
      fetchClosedDays();
    }
  }, [selectedSpace]);
  
  const isDayClosed = useMemo(() => (date) => {
    // Obtener el nombre del día en español (por ejemplo, 'lunes', 'martes', etc.)
    const dayName = format(date, 'EEEE', { locale: es }).toLowerCase(); // Obtén el nombre del día en minúsculas
    
    // Verificar si el nombre del día está en el array de `closedDays`
    return closedDays.map(day => day.toLowerCase()).includes(dayName);
  }, [closedDays]);
  
  useEffect(() => {
    console.log("Días cerrados:", closedDays); // Asegúrate de que sean ['lunes', 'martes'] u otro formato correcto
  }, [closedDays]);
    
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
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecciona una fecha"
              inline
              filterDate={(date) => !isDayClosed(date)}


            />
          </div>
  
          <div className="timeslot-container-Owner">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                className={`timeslot-button ${slot.available ? "available" : "reserved"} ${disableBooking ? "disabled-business" : ""}`}
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
