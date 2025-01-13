export const calculateAccountingData = (calendarData, spaces) => {
    const accountingData = spaces.map((space) => {
        const { id, price } = space; // Suponiendo que cada espacio tiene un "price"
        const reservations = calendarData[id] || {}; // Obtiene las reservas de esta cancha
        let totalIncome = 0;
        let totalReservations = 0;

        // Recorrer las reservas y sumar ingresos
        Object.keys(reservations).forEach((date) => {
            const slots = reservations[date];
            totalReservations += slots.length;
            totalIncome += slots.length * price; // Multiplicar por el precio por reserva
        });

        return {
            spaceId: id,
            spaceName: space.name,
            totalReservations,
            totalIncome,
        };
    });

    return accountingData;
};
