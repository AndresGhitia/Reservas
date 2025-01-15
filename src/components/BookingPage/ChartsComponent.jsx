import React from 'react';
import ReservationCharts from './ReservationCharts'
import IncomeCharts from './IncomeCharts';

const Charts = ({ spaces }) => {

  return (
    <div
     className='charts-container'
    >   
      <ReservationCharts spaces={spaces} />
      <IncomeCharts spaces={spaces} />
      </div>
  );
};

export default Charts;
