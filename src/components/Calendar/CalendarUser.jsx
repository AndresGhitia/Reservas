import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';
import './CalendarUser.css';
import { format } from 'date-fns';


function CalendarUser({ selectedSpace, calendarData , setSelectedDate, onClose, disableBooking, ownerId }) {

  const [whatsapp, setWhatsapp] = useState(null); // Estado para almacenar el whatsapp del propietario
  const [date, setDate] = useState(null);
  const [timeSlots, setLocalTimeSlots] = useState([]);
  const [closedDays, setClosedDays] = useState([]);


  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const ownerRef = doc(db, 'owners', ownerId); // Suponiendo que "owners" es la colección donde tienes la información
        const ownerSnap = await getDoc(ownerRef);

        if (ownerSnap.exists()) {
          const ownerData = ownerSnap.data();
          setWhatsapp(ownerData.whatsapp); // Guardamos el whatsapp del propietario
          // console.log('**** : '+ whatsapp)
        } else {
          console.error('No se encontraron datos del propietario.');
        }
      } catch (error) {
        console.error("Error al obtener los datos del propietario: ", error);
      }
    };

    if (ownerId) {
      fetchOwnerData();
    }
  }, [ownerId]); // Dependemos de `ownerId` para obtener los datos correctos

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



  const fetchClosedDays = async () => {
    if (selectedSpace && ownerId) {
      try {
        // Referencia al documento del espacio
        const spaceRef = doc(db, 'owners', ownerId, 'spaces', selectedSpace.id);
        const spaceSnap = await getDoc(spaceRef);

        if (spaceSnap.exists()) {
          const spaceData = spaceSnap.data();
          const { closedDays } = spaceData;

          // console.log("Array 'closedDays' desde Firestore:", closedDays); // Log para verificar el array

          // Verifica si closedDays tiene valores y actualiza el estado si es necesario
          if (Array.isArray(closedDays) && closedDays.length > 0) {
            setClosedDays(closedDays);
          } else {
            console.warn("El array 'closedDays' está vacío o no existe en Firestore.");
          }
        } else {
          console.error("No se encontró el documento del espacio seleccionado en Firestore.");
        }
      } catch (error) {
        console.error("Error al obtener 'closedDays' desde Firestore:", error);
      }
    }
  };

  useEffect(() => {
  //  console.log('Array closedDays:', closedDays); // Confirma los valores en closedDays
  }, [closedDays]);


  useEffect(() => {
    fetchClosedDays();
  }, [selectedSpace, ownerId]);

  const isDayClosed = useMemo(() => (date) => {
    const dayName = format(date, 'EEEE', { locale: es }).trim();
    const isClosed = closedDays.some(closedDay => {
      const normalizedClosedDay = closedDay.trim().toLowerCase();
      const normalizedDayName = dayName.toLowerCase();
      return normalizedClosedDay === normalizedDayName;
    });

    return isClosed;
  }, [closedDays]);



  const generateTimeSlots = (openTime, closeTime) => {
    const timeSlots = [];
    var [openHour, openMinute] = openTime.split(':').map(Number);
    var [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const incrementMinute = selectedSpace.sport === "Paddle" ? 30 : 60;
    var isOvernight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);

    while (true) {
      const time = `${String(openHour).padStart(2, '0')}:${String(openMinute).padStart(2, '0')}`;
      timeSlots.push({ time, available: true, name: null, whatsapp: null });

      openMinute += incrementMinute;

      if (openMinute >= 60) {
        openMinute -= 60;
        openHour = (openHour + 1) % 24; // manejar las 24 horas
      }
      if (!isOvernight && openHour === closeHour && openMinute >= closeMinute) break;
      if (isOvernight && openHour === closeHour && openMinute >= closeMinute) break;
    }
    return timeSlots;
  };

  const handleTimeslotClick = async (slotIndex) => {
    const selectedSlot = timeSlots[slotIndex];
  
    if (selectedSlot.available) {
      // Modal de confirmación con SweetAlert2
      const result = await Swal.fire({
        title: 'Confirmar reserva',
        text: `¿Deseas consultar por el horario seleccionado (${selectedSlot.time}) para el espacio ${selectedSpace.name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, consultar',
        cancelButtonText: 'Cancelar',
      });
  
      if (result.isConfirmed) {
        const message = encodeURIComponent(
          `Hola, estoy interesado en reservar el espacio ${selectedSpace.name} para el horario ${selectedSlot.time}.`
        );
  
        const whatsappLink = `https://wa.me/${whatsapp}?text=${message}`;
        window.open(whatsappLink, '_blank');
      }
    } else {
      // Modal de alerta con SweetAlert2
      Swal.fire({
        title: 'Horario reservado',
        text: 'Este horario está reservado. Selecciona otro horario!',
        icon: 'error',
        confirmButtonText: 'Entendido',
        target: document.querySelector('.Calendar-modal'), // Apunta correctamente al modal padre
        customClass: {
          popup: 'swal2-zindex' // Clase CSS con z-index adecuado
        }
      });
      
      
      
    }
  };

// ** FRAGMENTO DE CODIGO DESTINADO AL ENVIO DE NOTIFICACIONES VIA WHATSAPP
//  const saveNotificationRequest = async (time, whatsappNumber, spaceId, ownerId, spaceName) => {
//     try {
//       const notificationId = `${whatsappNumber}_${time}`;
//       const notificationRef = doc(db, 'owners', ownerId, 'spaces', spaceId, 'notifications', notificationId);

//       await setDoc(notificationRef, {
//         time,
//         whatsapp: whatsappNumber,
//         spaceName,
//         notified: false
//       });
//     } catch (error) {
//       console.error("Error al guardar la solicitud de notificación: ", error);
//     }
//   };

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
    <div className='calendar-modal'>
      <div className="calendar-content">
        <div className="modal-header-calendar">
          <p p className="login-header" >{selectedSpace?.name || "Espacio"}</p>
          <p>Horarios del día {date ? formatDate(date) : ""}</p>
          <span className="close" onClick={onClose}>&times;</span>
        </div>

        <div className="calendar-container">
          <div className="date-container">
            <DatePicker
              selected={date}
              onChange={(selectedDate) => setDate(selectedDate)}
              dateFormat="dd - MMMM - yyyy"
              className="datepicker-input"
              isClearable
              locale={es}
              minDate={new Date()} 
              placeholderText="Selecciona una fecha"
              onFocus={(e) => e.target.blur()} 
              onClick={(e) => e.preventDefault()} 
              onSelect={() => document.activeElement.blur()} 
              filterDate={(date) => !isDayClosed(date)} 
              inline
            />
          </div>

          <div className="timeslot-container">
            {timeSlots.map((slot, index) => {
              // Verificar si el incremento de tiempo es de 30 minutos
              const isHalfHourInterval = selectedSpace?.sport === "Paddle" ? true : false;

              if (isHalfHourInterval) {
                if (index % 2 !== 0) return null; // Saltar índices impares para agrupar en pares

                const nextSlot = timeSlots[index + 1];

                return (
                  <div key={index} className="timeslot-pair timeslot-half-hour">

                    <button
                      className={`timeslot-button half-hour ${slot.available ? 'available' : 'reserved'} ${disableBooking ? 'disabled-business' : ''}`}
                      onClick={() => handleTimeslotClick(index)}
                      disabled={disableBooking}
                    >
                      {slot.time} - {disableBooking ? (slot.available ? 'Disponible' : 'Ocupado') : (slot.available ? 'Reservar' : `Ocupado`)}
                    </button>

                    {nextSlot && (

                      <button
                        className={`timeslot-button half-hour ${nextSlot.available ? 'available' : 'reserved'} ${disableBooking ? 'disabled-business' : ''}`}
                        onClick={() => handleTimeslotClick(index + 1)}
                        disabled={disableBooking}
                      >
                        {nextSlot.time} - {disableBooking ? (nextSlot.available ? 'Disponible' : 'Ocupado') : (nextSlot.available ? 'Reservar' : `Ocupado`)}

                      </button>
                    )}
                  </div>

                );
              } else {
                // Mostrar individualmente para intervalos de 1 hora
                return (
                  <button
                    key={index}
                    className={`timeslot-button one-hour ${slot.available ? 'available' : 'reserved'} ${disableBooking ? 'disabled-business' : ''}`}
                    onClick={() => handleTimeslotClick(index)}
                    disabled={disableBooking}
                  >
                    {slot.time} - {disableBooking ? (slot.available ? 'Disponible' : 'Ocupado') : (slot.available ? 'Reservar' : `Ocupado`)}
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

export default CalendarUser;
