import React, { useState } from 'react';
import ReservationCharts from './ReservationCharts';
import IncomeCharts from './IncomeCharts';
import ProgressChart from './ProgressChart'; // Importamos el nuevo gráfico
import './ChartsComponents.css';

const ChartsComponent = ({ spaces }) => {
  const [isIncomeVisible, setIsIncomeVisible] = useState(true);
  const [isReservationVisible, setIsReservationVisible] = useState(true);
  const [isProgressVisible, setIsProgressVisible] = useState(true); // Nuevo estado para el gráfico de progreso

  const toggleIncomeVisibility = () => setIsIncomeVisible((prev) => !prev);
  const toggleReservationVisibility = () => setIsReservationVisible((prev) => !prev);
  const toggleProgressVisibility = () => setIsProgressVisible((prev) => !prev); // Nuevo toggle

  return (
    <div className='charts-page-container'>
      <div className="chart-group">
        <button className="chart-toggle" onClick={toggleReservationVisibility}>
          <i className={`fas ${isReservationVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          {isReservationVisible ? 'Ocultar' : 'Mostrar'}
        </button>
        {isReservationVisible && (
          <div className="chart-content">
            <ReservationCharts spaces={spaces} />
          </div>
        )}
      </div>

      <div className="chart-group">
        <button className="chart-toggle" onClick={toggleIncomeVisibility}>
          <i className={`fas ${isIncomeVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          {isIncomeVisible ? 'Ocultar' : 'Mostrar'}
        </button>
        {isIncomeVisible && (
          <div className="chart-content">
            <IncomeCharts spaces={spaces} />
          </div>
        )}
      </div>

      {/* Nuevo gráfico de progreso */}
      <div className="chart-group">
        <button className="chart-toggle" onClick={toggleProgressVisibility}>
          <i className={`fas ${isProgressVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          {isProgressVisible ? 'Ocultar' : 'Mostrar'}
        </button>
        {isProgressVisible && (
          <div className="chart-content">
            <ProgressChart spaces={spaces} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsComponent;
