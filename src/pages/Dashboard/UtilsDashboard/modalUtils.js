export const handleCloseModal = (setShowModal, setSelectedSpace, setCalendarData, setSelectedDate, setTimeSlots) => {
    setShowModal(false);
    setSelectedSpace(null);
    setCalendarData([]);
    setSelectedDate(null);
    setTimeSlots([]);
  };