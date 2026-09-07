import React, { FC, ReactNode, useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, TimePicker, Row, Col, AutoComplete, Select } from 'antd';
import { City, BirthData } from '../types';
import dayjs from 'dayjs';
import { Pencil } from 'lucide-react';

const timezones = ['UTC', 'Europe/Kiev', 'Europe/Moscow', 'America/New_York', 'Asia/Tokyo'];

const PageWrapper: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <div style={{ background: '#fff', padding: '16px', border: '1px solid #d9d9d9', fontSize: 13 }}>
    <h1 style={{ fontSize: '15px', marginBottom: '16px', borderBottom: '1px solid #d9d9d9', paddingBottom: '8px', color: '#003366', fontWeight: 'bold' }}>{title}</h1>
    {children}
  </div>
);

const EditIcon = ({ onClick }: { onClick: () => void }) => (
  <Button type="link" onClick={onClick} style={{ color: '#ff9900', padding: 0, height: 'auto', fontSize: '12px' }}>
    <Pencil size={12} style={{ marginRight: 4 }} />
    Редактировать
  </Button>
);

const NatalDataDisplay = ({ data, onEdit }: { data: BirthData; onEdit: () => void }) => (
  <div style={{ marginBottom: '16px', padding: '8px', background: '#f9f9f9', border: '1px solid #d9d9d9' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <p style={{ margin: 0, fontSize: 13 }}>
        <strong>Дата рождения:</strong> {dayjs(data.date).format('D MMM YYYY')} - {data.time}
      </p>
      <EditIcon onClick={onEdit} />
    </div>
    <p style={{ margin: 0, fontSize: 13 }}><strong>Время по Гринвичу:</strong> {data.gmtTime || 'N/A'}</p>
    <p style={{ margin: 0, fontSize: 13 }}><strong>Система домов:</strong> {data.houseSystem || 'Placidus'}</p>
    {data.birthCity && (
      <>
        <p style={{ margin: 0, fontSize: 13 }}><strong>Широта, Долгота:</strong> {data.birthCity.lat}° с. ш., {data.birthCity.lon}° в. д.</p>
        <p style={{ margin: 0, fontSize: 13 }}><strong>Город рождения:</strong> {data.birthCity.name}, {data.birthCity.country}</p>
      </>
    )}
  </div>
);

import { cities } from '../data/cities';

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const CityInput: FC<{ label: string; onSelect: (city: City) => void }> = ({ label, onSelect }) => {
  const [value, setValue] = useState('');

  const filteredCities = cities
    .filter(city => {
      if (value.length < 2) return false;
      const normalizedValue = normalize(value);
      return (
        normalize(city.names.ru).includes(normalizedValue) ||
        normalize(city.names.en).includes(normalizedValue)
      );
    })
    .sort((a, b) => {
      const normalizedValue = normalize(value);
      const getScore = (city: City) => {
        const ru = normalize(city.names.ru);
        const en = normalize(city.names.en);
        if (ru === normalizedValue || en === normalizedValue) return 0;
        if (ru.startsWith(normalizedValue) || en.startsWith(normalizedValue)) return 1;
        return 2;
      };
      return getScore(a) - getScore(b);
    });

  const options = filteredCities.map(city => ({
    value: `${city.names.en} (${city.names.ru}), ${city.country}, ${city.region}, (${city.lat > 0 ? city.lat : -city.lat}°${city.lat > 0 ? 'n' : 's'}, ${city.lon > 0 ? city.lon : -city.lon}°${city.lon > 0 ? 'e' : 'w'})`,
    city: city
  }));
  
  return (
    <Form.Item label={label} style={{ marginBottom: 8 }}>
      <AutoComplete 
        value={value}
        options={options} 
        onSearch={setValue}
        onSelect={(_, option) => {
            setValue(option.value);
            onSelect(option.city);
        }}
      />
    </Form.Item>
  );
};

export const NatalChart = () => {
  const [birthData, setBirthData] = useState<BirthData>(() => {
    const saved = localStorage.getItem('hobastro_birthData');
    const defaultCity = cities[0];
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
  
  const [isEditing, setIsEditing] = useState(!localStorage.getItem('hobastro_birthData'));
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);

  const [dateValue, setDateValue] = useState(birthData.date.split('-').reverse().join('.'));
  const [timeValue, setTimeValue] = useState(birthData.time + ':00');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i === 2 || i === 4) formatted += '.';
      formatted += value[i];
    }
    
    setDateValue(formatted);
    form.setFieldsValue({ date: formatted });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i === 2 || i === 4) formatted += ':';
      formatted += value[i];
    }
    
    setTimeValue(formatted);
    form.setFieldsValue({ time: formatted });
  };

  const validate = (values: any) => {
    const date = dayjs(values.date, 'DD.MM.YYYY', true);
    const time = dayjs(values.time, 'HH:mm:ss', true);
    if (!date.isValid()) return 'Неверная дата (DD.MM.YYYY)';
    if (!time.isValid()) return 'Неверное время (HH:mm:ss)';
    return null;
  };

  const handleFinish = (values: any) => {
    const formattedDate = dateValue.split('.').reverse().join('-');
    const err = validate({ date: dateValue, time: timeValue });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setBirthData({ ...birthData, name: values.name, date: formattedDate, time: timeValue.slice(0, 5), birthCity: birthData.birthCity });
    setIsEditing(false);
  };

  useEffect(() => {
    localStorage.setItem('hobastro_birthData', JSON.stringify(birthData));
  }, [birthData]);

  if (!isEditing) {
    return (
      <PageWrapper title="Натальная карта">
        <NatalDataDisplay data={birthData} onEdit={() => setIsEditing(true)} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Натальная карта">
      {error && <div style={{ color: 'red', marginBottom: 8 }}>Неверно введены данные: {error}</div>}
      <Form form={form} layout="vertical" size="small" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col xs={24} md={4}><Form.Item label="Имя" name="name" initialValue={birthData.name} rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col xs={24} md={4}>
            <Form.Item label="Дата (DD.MM.YYYY)" name="date" initialValue={dateValue} rules={[{ required: true }]}>
              <Input value={dateValue} onChange={handleDateChange} maxLength={10} placeholder="DD.MM.YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} md={4}>
            <Form.Item label="Время (HH:mm:ss)" name="time" initialValue={timeValue} rules={[{ required: true }]}>
              <Input value={timeValue} onChange={handleTimeChange} maxLength={8} placeholder="HH:mm:ss" />
            </Form.Item>
          </Col>
        </Row>
        <CityInput label="Город рождения" onSelect={(city) => setBirthData({...birthData, birthCity: city})} />
        <Button type="primary" htmlType="submit">Сохранить</Button>
      </Form>
    </PageWrapper>
  );
};

const DerivedPage = ({ title, content }: { title: string; content: ReactNode }) => {
    const saved = localStorage.getItem('hobastro_birthData');
    const birthData = saved ? JSON.parse(saved) : null;
    
    if (!birthData) return <PageWrapper title={title}>Данные не найдены.</PageWrapper>;
    
    return (
        <PageWrapper title={title}>
            <NatalDataDisplay data={birthData} onEdit={() => {}} />
            <div style={{ marginTop: '16px', borderTop: '1px solid #d9d9d9', paddingTop: '16px' }}>
                {content}
            </div>
        </PageWrapper>
    );
}

export const SolarReturn = () => <DerivedPage title="Солярная карта" content="Данные соляра..." />;
export const Progressions = () => <DerivedPage title="Прогрессии" content="Данные прогрессий..." />;
export const Directions = () => <DerivedPage title="Дирекции" content="Данные дирекций..." />;
export const Transits = () => <DerivedPage title="Транзиты" content="Данные транзитов..." />;
export const Relocation = () => <PageWrapper title="Релокация">Данные релокации</PageWrapper>;
export const Formulas = () => <PageWrapper title="Формулы">Данные формул</PageWrapper>;
export const Analysis = () => <PageWrapper title="Анализ">Данные анализа</PageWrapper>;
