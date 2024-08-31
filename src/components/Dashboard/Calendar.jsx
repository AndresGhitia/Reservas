import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase'
import './CalendarModal.css'; 

function Calendar() {
  const { spaceId } = useParams(); // Obtener el ID del espacio desde la URL
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const calendarDocRef = doc(db, 'owners', user.uid, 'spaces', spaceId, 'calendar');
          const calendarDocSnap = await getDoc(calendarDocRef);
          if (calendarDocSnap.exists()) {
            setCalendarData(calendarDocSnap.data());
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos del calendario: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [spaceId]);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleSaveTimeSlot = async (timeSlot) => {
    const user = auth.currentUser;
    if (user && selectedDate) {
      const calendarDocRef = doc(db, 'owners', user.uid, 'spaces', spaceId, 'calendar', selectedDate);
      const calendarData = { ...calendarData, [timeSlot]: true };

      try {
        await setDoc(calendarDocRef, calendarData, { merge: true });
        setCalendarData(calendarData);
      } catch (error) {
        console.error("Error al guardar el horario: ", error);
      }
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1); // Días del mes
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"]; // Ejemplo de horarios

  return (
    <div>
      <h1>Calendario para el espacio</h1>
      <div className="calendar">
        {daysOfMonth.map(day => (
          <div 
            key={day} 
            className={`day ${selectedDate === day ? 'selected' : ''}`} 
            onClick={() => handleDayClick(day)}
          >
            {day}
          </div>
        ))}
      </div>
      {selectedDate && (
        <div className="time-slots">
          <h2>Horarios para el día {selectedDate}</h2>
          {timeSlots.map(timeSlot => (
            <div 
              key={timeSlot} 
              className={`time-slot ${calendarData[selectedDate] && calendarData[selectedDate][timeSlot] ? 'booked' : ''}`} 
              onClick={() => handleSaveTimeSlot(timeSlot)}
            >
              {timeSlot}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate(-1)}>Volver</button>
    </div>
  );
}

export default Calendar;
