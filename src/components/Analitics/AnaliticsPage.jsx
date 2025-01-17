import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import SpaceDetailsModal from './SpaceDetailsModal';
import { getWeek } from 'date-fns';
import ChartsComponent from './ChartsComponent';
import SpaceCard from './SpaceCard'; // Importa el nuevo componente

const AnalyticsPage = () => {
  const [spaces, setSpaces] = useState([]);
  const [ownerData, setOwnerData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ownerRef = doc(db, 'owners', auth.currentUser.uid);
        const ownerSnap = await getDoc(ownerRef);

        if (ownerSnap.exists()) {
          setOwnerData(ownerSnap.data());
        } else {
          setError('No se encontró el propietario en la base de datos.');
        }

        const spacesRef = collection(db, 'owners', auth.currentUser.uid, 'spaces');
        const spacesSnap = await getDocs(spacesRef);

        if (spacesSnap.empty) {
          setError('No se encontraron espacios.');
        } else {
          const spacesList = [];
          for (const docSnapshot of spacesSnap.docs) {
            const space = { id: docSnapshot.id, ...docSnapshot.data() };
            const calendarRef = collection(db, 'owners', auth.currentUser.uid, 'spaces', space.id, 'calendar');
            const calendarSnap = await getDocs(calendarRef);

            let occupiedCount = 0;
            const reservationsByDay = {};
            const reservationsByWeek = {};
            const reservationsByMonth = {};

            calendarSnap.docs.forEach((calendarDoc) => {
              const { timeslots, date } = calendarDoc.data();
              const dayKey = date.split('T')[0];
              const weekKey = getWeek(new Date(date));
              const monthKey = date.split('-').slice(0, 2).join('-');

              const occupied = timeslots.filter((slot) => !slot.available).length;

              reservationsByDay[dayKey] = (reservationsByDay[dayKey] || 0) + occupied;
              reservationsByWeek[weekKey] = (reservationsByWeek[weekKey] || 0) + occupied;
              reservationsByMonth[monthKey] = (reservationsByMonth[monthKey] || 0) + occupied;

              occupiedCount += occupied;
            });

            space.occupiedCount = occupiedCount;
            space.reservationsByDay = reservationsByDay;
            space.reservationsByWeek = reservationsByWeek;
            space.reservationsByMonth = reservationsByMonth;

            spacesList.push(space);
          }

          setSpaces(spacesList);
        }
      } catch (err) {
        console.error('Error al obtener datos: ', err);
        setError('Hubo un problema al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (space) => {
    setSelectedSpace(space);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSpace(null);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div>
        <h2>Rendimiento de tu complejo</h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
        {spaces.length > 0 ? (
          spaces.map((space) => (
            <SpaceCard key={space.id} space={space} onOpenModal={handleOpenModal} />
          ))
        ) : (
          <p>No hay espacios disponibles.</p>
        )}
      </div>

      <SpaceDetailsModal open={openModal} onClose={handleCloseModal} space={selectedSpace} />

      <ChartsComponent spaces={spaces} />
    </div>
  );
};

export default AnalyticsPage;
