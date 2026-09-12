import React, { FC, ReactNode, useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, AutoComplete, Select } from 'antd';
import { City, BirthData } from '../types';
import dayjs from 'dayjs';
import { Pencil } from 'lucide-react';
import { calculateAspects } from '../calculations/aspectEngine';
import { NatalWheel } from '../components/NatalWheel';
import { CelestialTable } from '../components/CelestialTable';
import { BindhuTable } from '../components/BindhuTable';
import { createBindhuMatrix } from '../calculations/bindhuEngine';
import { validateShestopalovKoch, createShestopalovBaseData } from '../calculations/shestopalovEngine';
import { ShestopalovWidget } from '../components/ShestopalovWidget';
import { createHouseMatrix } from '../calculations/houseMatrixEngine';
import { HouseMatrixWidget } from '../components/HouseMatrixWidget';
import { useNatal } from '../calculations/natalSource';

const timezones = ['UTC', 'Europe/Kiev', 'Europe/Moscow', 'America/New_York', 'Asia/Tokyo'];

const timezoneOptions = [
  { value: 'Автоматически', label: 'Автоматически' },
  { value: 'UT/GMT −12 [З]', label: 'UT/GMT −12 [З]' },
  { value: 'UT/GMT −11 [З]', label: 'UT/GMT −11 [З]' },
  { value: 'UT/GMT −10 [З]', label: 'UT/GMT −10 [З]' },
  { value: 'UT/GMT −9 [З]', label: 'UT/GMT −9 [З]' },
  { value: 'UT/GMT −8 [З]', label: 'UT/GMT −8 [З]' },
  { value: 'UT/GMT −7 [З]', label: 'UT/GMT −7 [З]' },
  { value: 'UT/GMT −6 [З]', label: 'UT/GMT −6 [З]' },
  { value: 'UT/GMT −5 [З]', label: 'UT/GMT −5 [З]' },
  { value: 'UT/GMT −4 [З]', label: 'UT/GMT −4 [З]' },
  { value: 'UT/GMT −3 [З]', label: 'UT/GMT −3 [З]' },
  { value: 'UT/GMT −2 [З]', label: 'UT/GMT −2 [З]' },
  { value: 'UT/GMT −1 [З]', label: 'UT/GMT −1 [З]' },
  { value: 'UT/GMT 0', label: 'UT/GMT 0' },
  { value: 'UT/GMT +1 [В]', label: 'UT/GMT +1 [В]' },
  { value: 'UT/GMT +2 [В]', label: 'UT/GMT +2 [В]' },
  { value: 'UT/GMT +3 [В]', label: 'UT/GMT +3 [В]' },
  { value: 'UT/GMT +4 [В]', label: 'UT/GMT +4 [В]' },
  { value: 'UT/GMT +5 [В]', label: 'UT/GMT +5 [В]' },
  { value: 'UT/GMT +6 [В]', label: 'UT/GMT +6 [В]' },
  { value: 'UT/GMT +7 [В]', label: 'UT/GMT +7 [В]' },
  { value: 'UT/GMT +8 [В]', label: 'UT/GMT +8 [В]' },
  { value: 'UT/GMT +9 [В]', label: 'UT/GMT +9 [В]' },
  { value: 'UT/GMT +10 [В]', label: 'UT/GMT +10 [В]' },
  { value: 'UT/GMT +11 [В]', label: 'UT/GMT +11 [В]' },
  { value: 'UT/GMT +12 [В]', label: 'UT/GMT +12 [В]' },
  { value: 'UT/GMT +13 [В]', label: 'UT/GMT +13 [В]' },
  { value: 'UT/GMT +14 [В]', label: 'UT/GMT +14 [В]' },
];

const dstOptions = [
  { value: 'auto', label: 'Автоматически' },
  { value: 'observe', label: 'Соблюдать' },
  { value: 'ignore', label: 'Не соблюдать' },
];

function decimalToDegMin(dec: number): { deg: number; min: number } {
  const abs = Math.abs(dec);
  const deg = Math.floor(abs);
  const min = Math.round((abs - deg) * 60);
  return { deg, min };
}

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

import { cities as staticCities } from '../data/cities';

const CityInput: FC<{ label: string; onSelect: (city: City) => void; initialCity?: City }> = ({ label, onSelect, initialCity }) => {
  const [value, setValue] = useState(initialCity ? (initialCity.names?.ru || initialCity.name) : '');
  const [options, setOptions] = useState<{ value: string; city: City; label: ReactNode }[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = React.useRef<any>(null);
  const lastReqIdRef = React.useRef(0);

  useEffect(() => {
    if (initialCity) {
      setValue(initialCity.names?.ru || initialCity.name || '');
    }
  }, [initialCity]);

  const handleSearch = (searchText: string) => {
    setValue(searchText);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchText || searchText.trim().length < 2) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const reqId = ++lastReqIdRef.current;

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(searchText)}`);
        if (reqId !== lastReqIdRef.current) return;

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const items = await response.json();
        if (reqId !== lastReqIdRef.current) return;

        if (!Array.isArray(items) || items.length === 0) {
          const filteredStatic = staticCities.filter(c => 
            c.names.ru.toLowerCase().includes(searchText.toLowerCase()) ||
            c.names.en.toLowerCase().includes(searchText.toLowerCase())
          );
          
          if (filteredStatic.length > 0) {
            const staticOpts = filteredStatic.map(c => ({
              value: `${c.names.ru}, ${c.country}`,
              city: c,
              label: (
                <div style={{ fontSize: 13, padding: '4px 0' }}>
                  <strong>{c.names.ru}</strong> ({c.names.en}), {c.region}, {c.country}
                  <div style={{ fontSize: '11px', color: '#666' }}>Шир: {c.lat}°, Долг: {c.lon}°</div>
                </div>
              )
            }));
            setOptions(staticOpts);
          } else {
            setOptions([{
              value: searchText,
              city: {
                id: 'custom-' + Date.now(),
                name: searchText,
                names: { ru: searchText, en: searchText },
                country: '',
                region: '',
                lat: 50.45,
                lon: 30.52,
                timezone: 'UTC'
              },
              label: <div style={{ color: '#888', fontStyle: 'italic', padding: '4px 0' }}>Город не найден в Nominatim. Нажмите для использования введённого значения.</div>
            }]);
          }
          setLoading(false);
          return;
        }

        const mappedOpts = items.map((item: any) => {
          const addr = item.address || {};
          const cityName = addr.city || addr.town || addr.village || addr.hamlet || item.name || searchText;
          const region = addr.state || addr.region || addr.county || '';
          const country = addr.country || '';
          
          const displayName = [cityName, region, country].filter(Boolean).join(', ');
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);

          const matchedStatic = staticCities.find(c => 
            c.names.ru.toLowerCase() === cityName.toLowerCase() ||
            c.names.en.toLowerCase() === cityName.toLowerCase()
          );

          const getNearestTimezone = (l: number, lo: number) => {
            let nearest = staticCities[0];
            let minDst = Infinity;
            for (const c of staticCities) {
              const d = Math.pow(c.lat - l, 2) + Math.pow(c.lon - lo, 2);
              if (d < minDst) {
                minDst = d;
                nearest = c;
              }
            }
            return nearest.timezone;
          };

          const cityObj: City = {
            id: String(item.place_id || Math.random()),
            name: cityName,
            names: { ru: cityName, en: cityName },
            country: country,
            region: region,
            lat: lat,
            lon: lon,
            timezone: matchedStatic?.timezone || getNearestTimezone(lat, lon)
          };

          return {
            value: displayName,
            city: cityObj,
            label: (
              <div style={{ fontSize: 13, padding: '4px 0' }}>
                <strong>{cityName}</strong>
                {region ? `, ${region}` : ''}
                {country ? `, ${country}` : ''}
                <div style={{ fontSize: '11px', color: '#666' }}>
                  {lat.toFixed(2)}° {lat >= 0 ? 'с. ш.' : 'ю. ш.'}, {lon.toFixed(2)}° {lon >= 0 ? 'в. д.' : 'з. д.'}
                </div>
              </div>
            )
          };
        });

        setOptions(mappedOpts);
        setLoading(false);
      } catch (err) {
        if (reqId !== lastReqIdRef.current) return;
        console.error('Error fetching cities:', err);
        setLoading(false);
        setOptions([]);
      }
    }, 400); // 400ms debounce
  };

  return (
    <Form.Item label={label} style={{ marginBottom: 8 }}>
      <AutoComplete
        value={value}
        options={options}
        onSearch={handleSearch}
        onSelect={(val, option) => {
          setValue(val);
          onSelect(option.city);
        }}
        placeholder="Начните вводить название города (например, Белая Церковь)..."
        notFoundContent={loading ? <div style={{ padding: 8, textAlign: 'center', color: '#888' }}>Загрузка...</div> : <div style={{ padding: 8, textAlign: 'center', color: '#888' }}>Ничего не найдено</div>}
        style={{ width: '100%' }}
      />
    </Form.Item>
  );
};

export const NatalChart = () => {
  const { birthData, setBirthData, enrichedChart, loading, error: fetchError } = useNatal();
  
  const [isEditing, setIsEditing] = useState(false);
  const [houseSystem, setHouseSystem] = useState<string>(birthData.houseSystem || 'Placidus');
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);

  const [dateValue, setDateValue] = useState(birthData.date.split('-').reverse().join('.'));
  const [timeValue, setTimeValue] = useState(birthData.time + ':00');

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const [manualOpen, setManualOpen] = useState<boolean>(birthData.manualOverride?.enabled || false);

  const [shestopalovEnabled, setShestopalovEnabled] = useState<boolean>(() => {
    return localStorage.getItem('hobastro_shestopalov_enabled') === 'true';
  });

  const getInitialLatDMS = () => {
    const dec = birthData.manualOverride?.lat !== undefined ? birthData.manualOverride.lat : birthData.birthCity.lat;
    return decimalToDegMin(dec);
  };
  const getInitialLatDir = (): 'N' | 'S' => {
    if (birthData.manualOverride?.latDir) return birthData.manualOverride.latDir;
    return birthData.birthCity.lat >= 0 ? 'N' : 'S';
  };
  const getInitialLonDMS = () => {
    const dec = birthData.manualOverride?.lon !== undefined ? birthData.manualOverride.lon : birthData.birthCity.lon;
    return decimalToDegMin(dec);
  };
  const getInitialLonDir = (): 'E' | 'W' => {
    if (birthData.manualOverride?.lonDir) return birthData.manualOverride.lonDir;
    return birthData.birthCity.lon >= 0 ? 'E' : 'W';
  };
  const getInitialTz = () => birthData.manualOverride?.timezone || 'Автоматически';
  const getInitialDst = () => birthData.manualOverride?.dst || 'auto';

  const [latDeg, setLatDeg] = useState<number>(getInitialLatDMS().deg);
  const [latMin, setLatMin] = useState<number>(getInitialLatDMS().min);
  const [latDir, setLatDir] = useState<'N' | 'S'>(getInitialLatDir());

  const [lonDeg, setLonDeg] = useState<number>(getInitialLonDMS().deg);
  const [lonMin, setLonMin] = useState<number>(getInitialLonDMS().min);
  const [lonDir, setLonDir] = useState<'E' | 'W'>(getInitialLonDir());

  const [selectedTz, setSelectedTz] = useState<string>(getInitialTz());
  const [selectedDst, setSelectedDst] = useState<'auto' | 'observe' | 'ignore'>(getInitialDst());

  const updateManualData = (
    lDeg: number, lMin: number, lDir: 'N' | 'S',
    loDeg: number, loMin: number, loDir: 'E' | 'W',
    tz: string, dst: 'auto' | 'observe' | 'ignore',
    enabled: boolean
  ) => {
    const latDec = lDir === 'S' ? -(lDeg + lMin / 60) : (lDeg + lMin / 60);
    const lonDec = loDir === 'W' ? -(loDeg + loMin / 60) : (loDeg + loMin / 60);
    setBirthData({
      ...birthData,
      manualOverride: {
        enabled,
        lat: latDec,
        latDir: lDir,
        lon: lonDec,
        lonDir: loDir,
        timezone: tz,
        dst
      }
    });
  };

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
    const updated = { ...birthData, name: values.name, date: formattedDate, time: timeValue.slice(0, 5), birthCity: birthData.birthCity, houseSystem: values.houseSystem || houseSystem };
    setBirthData(updated);
    setHouseSystem(updated.houseSystem);
    setIsEditing(false);
  };

  if (!isEditing) {
    if (loading) {
      return <PageWrapper title="Натальная карта"><div style={{ padding: 24, textAlign: 'center' }}>Расчёт натальной карты...</div></PageWrapper>;
    }
    if (fetchError) {
      return <PageWrapper title="Натальная карта"><div style={{ color: 'red', padding: 24 }}>Ошибка расчёта: {fetchError}</div></PageWrapper>;
    }
    if (!enrichedChart) return null;

    const aspects = calculateAspects(enrichedChart.positions);
    const bindhuMatrix = createBindhuMatrix(enrichedChart, aspects);
    const houseMatrix = createHouseMatrix(enrichedChart);
    const shestopalovData = createShestopalovBaseData(enrichedChart, birthData.houseSystem, shestopalovEnabled);

    const handleShestopalovToggle = (enabled: boolean) => {
      setShestopalovEnabled(enabled);
      localStorage.setItem('hobastro_shestopalov_enabled', String(enabled));
    };

    return (
      <PageWrapper title="Натальная карта">
        <NatalDataDisplay data={birthData} onEdit={() => setIsEditing(true)} />
        <div style={{ margin: '16px 0' }}>
          <NatalWheel 
            chart={enrichedChart} 
            aspects={aspects} 
            selectedObjectId={selectedObjectId}
            onSelectObject={setSelectedObjectId}
          />
        </div>
        <CelestialTable chart={enrichedChart} />
        <BindhuTable 
          matrix={bindhuMatrix} 
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
        />
        <HouseMatrixWidget
          matrix={houseMatrix}
          selectedObjectId={selectedObjectId}
          onSelectObject={setSelectedObjectId}
        />
        <ShestopalovWidget 
          data={shestopalovData} 
          onToggle={handleShestopalovToggle} 
        />
        
        <div style={{ marginTop: 16, padding: 12, background: '#f0f2f5', border: '1px solid #d9d9d9', fontSize: 12 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 13, color: '#003366' }}>Диагностический расчет натальной карты</h3>
          <p style={{ margin: '0 0 4px 0' }}><strong>Количество рассчитанных объектов:</strong> {enrichedChart.positions.length}</p>
          <p style={{ margin: '0 0 4px 0' }}><strong>ID объектов:</strong> {enrichedChart.positions.map(p => p.id).join(', ')}</p>
          <p style={{ margin: '0 0 4px 0' }}><strong>ASC:</strong> {enrichedChart.houses.angles.ascendant.sign} {enrichedChart.houses.angles.ascendant.degree.toFixed(2)}° ({enrichedChart.houses.angles.ascendant.longitude.toFixed(2)}°)</p>
          <p style={{ margin: '0 0 4px 0' }}><strong>MC:</strong> {enrichedChart.houses.angles.mc.sign} {enrichedChart.houses.angles.mc.degree.toFixed(2)}° ({enrichedChart.houses.angles.mc.longitude.toFixed(2)}°)</p>
          <p style={{ margin: '0 0 4px 0' }}><strong>Количество домов:</strong> {enrichedChart.houses.cusps.length}</p>
          <p style={{ margin: '0 0 8px 0' }}><strong>Количество найденных аспектов:</strong> {aspects.length}</p>
          
          <div style={{ marginTop: 8, borderTop: '1px solid #d9d9d9', paddingTop: 8 }}>
            <strong>Первые объекты:</strong>
            <ul>
              {enrichedChart.positions.slice(0, 3).map(p => (
                <li key={p.id}>
                  {p.name} ({p.id}): {p.sign} {p.degree.toFixed(2)}° | Скорость: {p.speed.toFixed(3)} | Ретро: {p.retrograde ? 'да' : 'нет'}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 8, borderTop: '1px solid #d9d9d9', paddingTop: 8 }}>
            <strong>Примеры аспектов (первые 3):</strong>
            <ul>
              {aspects.slice(0, 3).map((a, idx) => (
                <li key={idx}>
                  {a.source.name} — {a.target.name} : {a.aspectNameRu} (Орб: {a.orb}°)
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Натальная карта">
      {error && <div style={{ color: 'red', marginBottom: 8}}>Неверно введены данные: {error}</div>}
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
        <CityInput label="Город рождения" initialCity={birthData.birthCity} onSelect={(city) => {
          const dLat = decimalToDegMin(city.lat);
          const dLon = decimalToDegMin(city.lon);
          setLatDeg(dLat.deg);
          setLatMin(dLat.min);
          setLatDir(city.lat >= 0 ? 'N' : 'S');
          setLonDeg(dLon.deg);
          setLonMin(dLon.min);
          setLonDir(city.lon >= 0 ? 'E' : 'W');
          setSelectedTz('Автоматически');
          setSelectedDst('auto');
          setBirthData({
            ...birthData,
            birthCity: city,
            manualOverride: {
              enabled: manualOpen,
              lat: city.lat,
              latDir: city.lat >= 0 ? 'N' : 'S',
              lon: city.lon,
              lonDir: city.lon >= 0 ? 'E' : 'W',
              timezone: 'Автоматически',
              dst: 'auto'
            }
          });
        }} />

        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => {
              const nextOpen = !manualOpen;
              setManualOpen(nextOpen);
              updateManualData(latDeg, latMin, latDir, lonDeg, lonMin, lonDir, selectedTz, selectedDst, nextOpen);
            }}
            style={{
              color: '#ff9900',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline'
            }}
          >
            Ввести вручную
          </button>
        </div>

        {manualOpen && (
          <div style={{ background: '#fafafa', border: '1px solid #d9d9d9', padding: '12px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ minWidth: '90px', fontSize: 13 }}>Широта:</span>
              <Input 
                style={{ width: '90px' }} 
                value={`${latDeg}°${latMin < 10 ? '0' + latMin : latMin}′`}
                onChange={(e) => {
                  const val = e.target.value;
                  const digits = val.replace(/[^\d]/g, ' ');
                  const parts = digits.trim().split(/\s+/).filter(Boolean);
                  const d = parseInt(parts[0], 10) || 0;
                  const m = parseInt(parts[1], 10) || 0;
                  setLatDeg(d);
                  setLatMin(m);
                  updateManualData(d, m, latDir, lonDeg, lonMin, lonDir, selectedTz, selectedDst, true);
                }}
                placeholder="49°49′"
              />
              <Select
                style={{ width: '110px' }}
                value={latDir}
                onChange={(val) => {
                  setLatDir(val);
                  updateManualData(latDeg, latMin, val, lonDeg, lonMin, lonDir, selectedTz, selectedDst, true);
                }}
                options={[
                  { value: 'N', label: 'Север' },
                  { value: 'S', label: 'Юг' }
                ]}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ minWidth: '90px', fontSize: 13 }}>Долгота:</span>
              <Input 
                style={{ width: '90px' }} 
                value={`${lonDeg}°${lonMin < 10 ? '0' + lonMin : lonMin}′`}
                onChange={(e) => {
                  const val = e.target.value;
                  const digits = val.replace(/[^\d]/g, ' ');
                  const parts = digits.trim().split(/\s+/).filter(Boolean);
                  const d = parseInt(parts[0], 10) || 0;
                  const m = parseInt(parts[1], 10) || 0;
                  setLonDeg(d);
                  setLonMin(m);
                  updateManualData(latDeg, latMin, latDir, d, m, lonDir, selectedTz, selectedDst, true);
                }}
                placeholder="30°07′"
              />
              <Select
                style={{ width: '110px' }}
                value={lonDir}
                onChange={(val) => {
                  setLonDir(val);
                  updateManualData(latDeg, latMin, latDir, lonDeg, lonMin, val, selectedTz, selectedDst, true);
                }}
                options={[
                  { value: 'E', label: 'Восток' },
                  { value: 'W', label: 'Запад' }
                ]}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ minWidth: '90px', fontSize: 13 }}>Часовой пояс:</span>
              <Select
                style={{ width: '220px' }}
                value={selectedTz}
                onChange={(val) => {
                  setSelectedTz(val);
                  updateManualData(latDeg, latMin, latDir, lonDeg, lonMin, lonDir, val, selectedDst, true);
                }}
                options={timezoneOptions}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '90px' }}>
                <div style={{ fontSize: 13 }}>Зимнее:</div>
                <div style={{ fontSize: '11px', color: '#888' }}>Летнее время</div>
              </div>
              <Select
                style={{ width: '220px' }}
                value={selectedDst}
                onChange={(val) => {
                  setSelectedDst(val);
                  updateManualData(latDeg, latMin, latDir, lonDeg, lonMin, lonDir, selectedTz, val, true);
                }}
                options={dstOptions}
              />
            </div>
          </div>
        )}
        <Form.Item label="Система домов" name="houseSystem" initialValue={birthData.houseSystem || 'Placidus'}>
          <Select
            options={[
              { value: 'Placidus', label: 'Placidus' },
              { value: 'Koch', label: 'Koch' },
              { value: 'Equal', label: 'Equal House' },
              { value: 'Regiomontanus', label: 'Regiomontanus' },
              { value: 'WholeSign', label: 'Whole Sign' },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">Сохранить</Button>
      </Form>
    </PageWrapper>
  );
};

const DerivedPage = ({ title, content }: { title: string; content: ReactNode }) => {
    const { birthData, enrichedChart, loading } = useNatal();
    
    if (loading) return <PageWrapper title={title}>Загрузка натальных данных из общего источника...</PageWrapper>;
    if (!birthData || !enrichedChart) return <PageWrapper title={title}>Данные не найдены.</PageWrapper>;
    
    return (
        <PageWrapper title={title}>
            <NatalDataDisplay data={birthData} onEdit={() => {}} />
            <div style={{ padding: '8px 12px', background: '#f0f5ff', border: '1px solid #91caff', marginBottom: 16, fontSize: 12, color: '#003366' }}>
              <strong>Источник данных:</strong> Использован общий предрассчитанный источник натальной карты (Планеты: {enrichedChart.positions.length}, Дома: {enrichedChart.houses.cusps.length}, ASC: {enrichedChart.houses.angles.ascendant.sign}). Повторный астрономический расчёт не выполнялся.
            </div>
            <div style={{ marginTop: '16px', borderTop: '1px solid #d9d9d9', paddingTop: '16px' }}>
                {content}
            </div>
        </PageWrapper>
    );
};

export const SolarReturn = () => <DerivedPage title="Солярная карта" content="Данные солярного прогноза (используют предрассчитанные натальные планеты, аспекты и углы ASC/MC/IC/DSC)." />;
export const Progressions = () => <DerivedPage title="Прогрессии" content="Данные вторичных прогрессий (доступ к натальному источнику без повторного вызова Swiss Ephemeris)." />;
export const Directions = () => <DerivedPage title="Дирекции" content="Данные символических дирекций (опора на единый кэш натальной карты)." />;
export const Transits = () => <DerivedPage title="Транзиты" content="Данные транзитной карты (натальный фундамент доступен напрямую)." />;
export const Relocation = () => <DerivedPage title="Релокация" content="Данные карты релокации (используют натальные планеты и новые координаты места проживания/соляра)." />;
export const Formulas = () => <DerivedPage title="Формулы" content="Расчёт астрологических формул событий (подключено к общему натальному источнику)." />;
export const Analysis = () => <DerivedPage title="Анализ" content="Комплексный анализ натальной карты и прогнозов на базе общего источника." />;

export const ShestopalovPage = () => {
  const { birthData, enrichedChart, loading } = useNatal();
  const [enabled, setEnabled] = useState<boolean>(() => {
    return localStorage.getItem('hobastro_shestopalov_enabled') === 'true';
  });

  const houseSystem = birthData?.houseSystem || 'Placidus';
  const validation = validateShestopalovKoch(houseSystem);

  const handleToggle = (newVal: boolean) => {
    if (!validation.isKoch) return;
    setEnabled(newVal);
    localStorage.setItem('hobastro_shestopalov_enabled', String(newVal));
  };

  return (
    <PageWrapper title="Режим Шестопалова">
      {birthData && <NatalDataDisplay data={birthData} onEdit={() => {}} />}
      
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          padding: '16px', 
          background: validation.isKoch ? '#f0f5ff' : '#fffbe6', 
          border: `1px solid ${validation.isKoch ? '#91caff' : '#ffe58f'}`,
          fontSize: 13 
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#003366', margin: '0 0 8px 0' }}>
            Управление режимом Шестопалова
          </h2>
          <p style={{ margin: '0 0 12px 0', color: '#555' }}>
            Метод С. В. Шестопалова использует исключительно систему домов Кох. При активации базовые рассчитанные данные карты из общего источника сохраняются для использования во всех прогнозных методах проекта без повторного астрономического расчёта.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div>
              <strong>Система домов карты:</strong> <span style={{ color: validation.isKoch ? '#389e0d' : '#cf1322', fontWeight: 'bold' }}>{houseSystem}</span>
            </div>
            <div>
              <strong>Статус метода:</strong> <span style={{ color: validation.isKoch ? '#389e0d' : '#cf1322', fontWeight: 'bold' }}>{validation.isKoch ? 'Доступен' : 'Недоступен (требуется Кох)'}</span>
            </div>
            {enrichedChart && (
              <div>
                <strong>Источник:</strong> <span style={{ color: '#389e0d', fontWeight: 'bold' }}>Общий кэш (планет: {enrichedChart.positions.length})</span>
              </div>
            )}
          </div>

          {!validation.isKoch && (
            <div style={{ padding: '8px 12px', background: '#fff', border: '1px solid #ffa39e', color: '#cf1322', fontSize: '12px', marginBottom: '12px' }}>
              {validation.message}
            </div>
          )}

          {validation.isKoch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button
                type={enabled ? 'primary' : 'default'}
                onClick={() => handleToggle(!enabled)}
                style={{
                  background: enabled ? '#003366' : '#fff',
                  color: enabled ? '#fff' : '#003366',
                  borderColor: '#003366'
                }}
              >
                {enabled ? 'Шестопалов активен' : 'Включить Шестопалова'}
              </Button>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {enabled ? 'Режим включен. Данные передаются в прогнозные модули.' : 'Режим выключен.'}
              </span>
            </div>
          )}
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: '#f9f9f9', border: '1px solid #d9d9d9', fontSize: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#003366', margin: '0 0 6px 0' }}>Архитектурные примечания</h3>
          <ul style={{ margin: 0, paddingLeft: '16px', color: '#555', lineHeight: '1.5' }}>
            <li>Используется исключительно система домов Кох.</li>
            <li>При другой системе домов Шестопалов остается недоступен.</li>
            <li>Данные берутся из общего структурированного источника (NatalProvider / EnrichedChartResult) без повторного расчета планет и дублирования Swiss Ephemeris.</li>
            <li>Формулы Шестопалова будут реализованы следующим шагом поверх этого фундамента.</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};
