import sys
import json
import swisseph as swe
from datetime import datetime
import pytz

SIGNS = [
    'Овен', 'Телец', 'Близнецы', 'Рак', 
    'Лев', 'Дева', 'Весы', 'Скорпион', 
    'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
]

PLANETS = [
    ('sun', 'Солнце', swe.SUN),
    ('moon', 'Луна', swe.MOON),
    ('mercury', 'Меркурий', swe.MERCURY),
    ('venus', 'Венера', swe.VENUS),
    ('mars', 'Марс', swe.MARS),
    ('jupiter', 'Юпитер', swe.JUPITER),
    ('saturn', 'Сатурн', swe.SATURN),
    ('uranus', 'Уран', swe.URANUS),
    ('neptune', 'Нептун', swe.NEPTUNE),
    ('pluto', 'Плутон', swe.PLUTO),
    ('north_node', 'Северный узел', swe.TRUE_NODE),
    ('south_node', 'Южный узел', swe.TRUE_NODE),
    ('lilith', 'Лилит', swe.MEAN_APOG),
]

def get_zodiac_info(lon):
    lon = lon % 360
    sign_index = int(lon // 30) % 12
    degree = lon % 30
    return SIGNS[sign_index], degree

def calculate_houses(jd, lat, lon, house_system):
    # house_system: 'Placidus', 'Koch', 'Equal', 'Regiomontanus', 'WholeSign'
    system_map = {
        'Placidus': b'P',
        'Koch': b'K',
        'Equal': b'E',
        'Regiomontanus': b'R',
        'WholeSign': b'W' # handled specially or via swe if supported, but let's implement explicitly for robust WholeSign & Equal
    }
    
    # For Whole Sign and Equal, swe.houses with 'W' or 'E' can be used, 
    # but let's implement exact traditional rules to be 100% compliant with prompt requirements.
    
    # First get Placidus or basic standard to extract Ascendant and MC
    # swe.houses returns (cusps_tuple_1_12, ascmc_tuple)
    # ascmc: 0=Ascendant, 1=MC, 2=ARMC, 3=Vertex, 4=Co-Asc 1, 5=Co-Asc 2, 6=Polar Asc
    
    # We can use 'P' to get accurate Ascendant and MC/IC/Descendant
    std_houses, ascmc = swe.houses(jd, lat, lon, b'P')
    asc = ascmc[0]
    mc = ascmc[1]
    ic = (mc + 180) % 360
    dsc = (asc + 180) % 360
    
    cusps = []
    
    if house_system == 'WholeSign':
        # Whole Sign: House 1 starts at 0° of the sign where Ascendant resides.
        asc_sign_index = int(asc // 30)
        start_lon = asc_sign_index * 30.0
        for i in range(12):
            cusps.append((start_lon + i * 30.0) % 360)
    elif house_system == 'Equal':
        # Equal House: House 1 starts exactly at Ascendant degree, each house is 30°
        for i in range(12):
            cusps.append((asc + i * 30.0) % 360)
    else:
        swe_char = system_map.get(house_system, b'P')
        h_res, _ = swe.houses(jd, lat, lon, swe_char)
        cusps = list(h_res) # 0-indexed for houses 1..12
        
    houses_result = []
    house_names = [
        '1 дом', '2 дом', '3 дом', '4 дом', '5 дом', '6 дом',
        '7 дом', '8 дом', '9 дом', '10 дом', '11 дом', '12 дом'
    ]
    
    for i in range(12):
        c_lon = cusps[i] % 360
        sign, degree = get_zodiac_info(c_lon)
        houses_result.append({
            'id': f'house_{i+1}',
            'name': house_names[i],
            'number': i + 1,
            'longitude': float(c_lon),
            'sign': sign,
            'degree': float(degree)
        })
        
    asc_sign, asc_deg = get_zodiac_info(asc)
    mc_sign, mc_deg = get_zippy = get_zodiac_info(mc)
    ic_sign, ic_deg = get_zodiac_info(ic)
    dsc_sign, dsc_deg = get_zodiac_info(dsc)
    
    angles = {
        'ascendant': {'longitude': float(asc), 'sign': asc_sign, 'degree': float(asc_deg)},
        'mc': {'longitude': float(mc), 'sign': mc_sign, 'degree': float(ic_deg if False else mc_deg)},
        'ic': {'longitude': float(ic), 'sign': ic_sign, 'degree': float(ic_deg)},
        'descendant': {'longitude': float(dsc), 'sign': dsc_sign, 'degree': float(dsc_deg)}
    }
    
    return {
        'system': house_system,
        'angles': angles,
        'cusps': houses_result
    }

def calculate(data):
    date_str = data.get('date') # YYYY-MM-DD
    time_str = data.get('time') # HH:mm
    tz_str = data.get('timezone', 'UTC')
    tz_offset_minutes = data.get('timezoneOffsetMinutes')
    dst_mode = data.get('dstMode', 'auto')
    lat = data.get('lat', 50.45)
    lon_deg = data.get('lon', 30.52)
    house_system = data.get('houseSystem', 'Placidus')
    
    naive_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    
    if tz_offset_minutes is not None:
        local_dt = naive_dt.replace(tzinfo=pytz.FixedOffset(tz_offset_minutes))
        utc_dt = local_dt.astimezone(pytz.UTC)
    else:
        local_tz = pytz.timezone(tz_str)
        if dst_mode == 'observe':
            local_dt = local_tz.localize(naive_dt, is_dst=True)
        elif dst_mode == 'ignore':
            local_dt = local_tz.localize(naive_dt, is_dst=False)
        else:
            local_dt = local_tz.localize(naive_dt, is_dst=None)
        utc_dt = local_dt.astimezone(pytz.UTC)
    
    year = utc_dt.year
    month = utc_dt.month
    day = utc_dt.day
    hour = utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0
    
    jd = swe.julday(year, month, day, hour, swe.GREG_CAL)
    
    results = []
    for pid, name, body in PLANETS:
        if pid == 'south_node':
            res, flag = swe.calc_ut(jd, swe.TRUE_NODE, swe.FLG_SWIEPH | swe.FLG_SPEED)
            lon = (res[0] + 180) % 360
            speed = -res[3]
        else:
            res, flag = swe.calc_ut(jd, body, swe.FLG_SWIEPH | swe.FLG_SPEED)
            lon = res[0]
            speed = res[3]
            
        sign, degree = get_zodiac_info(lon)
        is_retrograde = speed < 0
        
        results.append({
            'id': pid,
            'name': name,
            'longitude': float(lon),
            'speed': float(speed),
            'sign': sign,
            'degree': float(degree),
            'retrograde': bool(is_retrograde)
        })
        
    houses_data = calculate_houses(jd, lat, lon_deg, house_system)
        
    return {
        'utc': utc_dt.strftime('%Y-%m-%d %H:%M:%S UTC'),
        'julianDay': float(jd),
        'positions': results,
        'houses': houses_data
    }

if __name__ == '__main__':
    input_data = json.loads(sys.stdin.read())
    output = calculate(input_data)
    print(json.dumps(output, ensure_ascii=False))
