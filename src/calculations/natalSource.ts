import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BirthData } from '../types';
import { EnrichedChartResult } from './planetLayer';
import { fetchNatalChart } from '../api/astroApi';

interface NatalContextType {
  birthData: BirthData;
  setBirthData: (data: BirthData) => void;
  enrichedChart: EnrichedChartResult | null;
  loading: boolean;
  error: string | null;
  houseSystem: string;
  refreshChart: () => void;
}

const NatalContext = createContext<NatalContextType | undefined>(undefined);

export const NatalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [birthData, setBirthDataState] = useState<BirthData>(() => {
    const saved = localStorage.getItem('hobastro_birthData');
    const defaultCity = {
      id: 'moscow',
      name: 'Moscow',
      names: { ru: 'Москва', en: 'Moscow' },
      country: 'Russia',
      region: 'Moscow',
      lat: 55.7558,
      lon: 37.6173,
      timezone: 'Europe/Moscow'
    };
    return saved ? JSON.parse(saved) : {
      name: "Иван Иванов",
      date: "1988-05-17",
      time: "00:33",
      birthCity: defaultCity,
      residenceCity: defaultCity,
      solarCity: defaultCity,
      gmtTime: "16 Мая 1988 - 20:33",
      houseSystem: "Placidus"
    };
  });

  const [enrichedChart, setEnrichedChart] = useState<EnrichedChartResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const houseSystem = birthData.houseSystem || 'Placidus';

  const setBirthData = (newData: BirthData) => {
    setBirthDataState(newData);
    localStorage.setItem('hobastro_birthData', JSON.stringify(newData));
  };

  const loadChart = () => {
    setLoading(true);
    setError(null);
    fetchNatalChart(birthData)
      .then(data => {
        setEnrichedChart(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to calculate natal chart');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadChart();
  }, [birthData.date, birthData.time, birthData.birthCity?.lat, birthData.birthCity?.lon, birthData.birthCity?.timezone, birthData.houseSystem, birthData.manualOverride]);

  const value = {
    birthData,
    setBirthData,
    enrichedChart,
    loading,
    error,
    houseSystem,
    refreshChart: loadChart
  };

  return React.createElement(NatalContext.Provider, { value }, children);
};

export const useNatal = () => {
  const context = useContext(NatalContext);
  if (!context) {
    throw new Error('useNatal must be used within a NatalProvider');
  }
  return context;
};
