'use client';

import { useEffect, useState } from 'react';
import withAuth from '@/components/withAuth';

// Определяем типы для наших данных
interface NavMenu {
  id: number;
  label: string;
  link: string;
}

interface NavigationData {
  logo: {
    text: string;
    link: string;
  };
  menu: NavMenu[];
}

type TSidebar = {
  [key: string]: {
    enabled: boolean;
    label: string;
    url?: string;
  };
}

type TButtons = {
  [key: string]: {
    enabled: boolean;
    label: string;
  };
}

type TSocials = {
  [key: string]: {
    enabled: boolean;
    url: string;
  };
}

interface MainData {
  title: string;
  subtitle: string;
  videoUrl: string;
  buttons: TButtons;
  sidebar: TSidebar;
  socials: TSocials;
}

interface SliderData {
  enabled: boolean;
  title: string;
  description: string;
  count: number;
  data?: unknown[]; // data теперь опционально, так как оно генерируется на лету
}

function AdminPanel() {
  const [navData, setNavData] = useState<NavigationData | null>(null);
  const [mainData, setMainData] = useState<MainData | null>(null);
  const [sliderData, setSliderData] = useState<SliderData | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [navRes, mainRes, sliderRes] = await Promise.all([
          fetch('/api/navigation'),
          fetch('/api/main'),
          fetch('/api/slider'),
        ]);

        if (!navRes.ok || !mainRes.ok || !sliderRes.ok) {
          throw new Error('Failed to fetch initial data');
        }

        setNavData(await navRes.json());
        setMainData(await mainRes.json());
        setSliderData(await sliderRes.json());
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функция для сохранения данных
  const handleSave = async (mockName: string, data: unknown) => {
    setSaving((prev) => ({ ...prev, [mockName]: true }));
    try {
      const response = await fetch(`/api/${mockName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to save ${mockName} data`);
      }
      console.log(`${mockName} data saved successfully`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setSaving((prev) => ({ ...prev, [mockName]: false }));
    }
  };

  // Обработчики изменений для навигации
  const handleNavChange = (index: number, value: string) => {
    if (navData) {
      const newMenu = [...navData.menu];
      newMenu[index].label = value;
      setNavData({ ...navData, menu: newMenu });
    }
  };

  const addNavItem = () => {
    if (navData) {
      const newMenu = [...navData.menu];
      const newId = newMenu.length > 0 ? Math.max(...newMenu.map(item => item.id)) + 1 : 1;
      newMenu.push({ id: newId, label: 'Новый пункт', link: '/' });
      setNavData({ ...navData, menu: newMenu });
    }
  };

  const removeNavItem = (idToRemove: number) => {
    if (navData) {
      const newMenu = navData.menu.filter(item => item.id !== idToRemove);
      setNavData({ ...navData, menu: newMenu });
    }
  };

  const handleMainChange = (field: keyof MainData | string, value: string | boolean) => {
    if (mainData) {
      const fieldParts = (field as string).split('.');
      
      if (fieldParts.length > 1) {
        const [parent, key, property] = fieldParts as [keyof MainData, string, string];
        const newParentState = { ...(mainData[parent] as object) };
        
        if (key in newParentState) {
            (newParentState as Record<string, Record<string, unknown>>)[key][property] = value;
            setMainData({ ...mainData, [parent]: newParentState });
        }
      } else {
        setMainData({ ...mainData, [field as keyof MainData]: value });
      }
    }
  };
  
  const handleSliderChange = (field: keyof SliderData, value: string | boolean | number) => {
    if (sliderData) {
      if (field === 'count') {
        let numValue = Number(value);
        if (numValue < 0) numValue = 0;
        if (numValue > 20) numValue = 20;
        setSliderData({ ...sliderData, [field]: numValue });
      } else {
        setSliderData({ ...sliderData, [field]: value });
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Панель управления моками</h1>

      {navData && (
        <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h2>Навигация</h2>
          {navData.menu.map((item, index) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleNavChange(index, e.target.value)}
                style={{ flexGrow: 1, marginRight: '1rem' }}
              />
              <button onClick={() => removeNavItem(item.id)} style={{ backgroundColor: '#e53e3e', minWidth: '80px' }}>
                Удалить
              </button>
            </div>
          ))}
          <button onClick={addNavItem} style={{ backgroundColor: '#38a169', marginRight: '1rem' }}>
            Добавить пункт
          </button>
          <button onClick={() => handleSave('navigation', navData)} disabled={saving['navigation']}>
            {saving['navigation'] ? 'Сохранение...' : 'Сохранить навигацию'}
          </button>
        </section>
      )}

      {mainData && (
        <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h2>Основной контент</h2>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Заголовок:{' '}
              <input
                type="text"
                value={mainData.title}
                onChange={(e) => handleMainChange('title', e.target.value)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Подзаголовок:{' '}
              <input
                type="text"
                value={mainData.subtitle}
                onChange={(e) => handleMainChange('subtitle', e.target.value)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              URL видео в основном блоке:{' '}
              <input
                type="text"
                value={mainData.videoUrl}
                onChange={(e) => handleMainChange('videoUrl', e.target.value)}
              />
            </label>
          </div>
          <h3 style={{marginTop: '1.5rem'}}>Кнопки</h3>
          {Object.keys(mainData.buttons).map(key => (
            <div key={key} style={{ marginBottom: '0.5rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={mainData.buttons[key].enabled}
                  onChange={(e) => handleMainChange(`buttons.${key}.enabled`, e.target.checked)}
                />
                {' '}Кнопка "{mainData.buttons[key].label}"
              </label>
            </div>
          ))}

          <h3 style={{marginTop: '1.5rem'}}>Сайдбар</h3>
          {Object.keys(mainData.sidebar).map(key => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={mainData.sidebar[key].enabled}
                  onChange={(e) => handleMainChange(`sidebar.${key}.enabled`, e.target.checked)}
                />
                {' '}Элемент "{mainData.sidebar[key].label}"
              </label>
              {mainData.sidebar[key].url !== undefined && (
                 <label style={{marginTop: '0.5rem'}}>
                  URL:{' '}
                  <input
                    type="text"
                    value={mainData.sidebar[key].url}
                    onChange={(e) => handleMainChange(`sidebar.${key}.url`, e.target.value)}
                  />
                 </label>
              )}
            </div>
          ))}

          <h3 style={{marginTop: '1.5rem'}}>Социальные сети</h3>
          {mainData.socials && Object.keys(mainData.socials).map(key => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={mainData.socials[key].enabled}
                  onChange={(e) => handleMainChange(`socials.${key}.enabled`, e.target.checked)}
                />
                {' '}{key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <label style={{marginTop: '0.5rem'}}>
                URL:{' '}
                <input
                  type="text"
                  value={mainData.socials[key].url}
                  onChange={(e) => handleMainChange(`socials.${key}.url`, e.target.value)}
                />
              </label>
            </div>
          ))}

          <button onClick={() => handleSave('main', mainData)} disabled={saving['main']}>
            {saving['main'] ? 'Сохранение...' : 'Сохранить основной контент'}
          </button>
        </section>
      )}

      {sliderData && (
        <section style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h2>Слайдер "Отзывы"</h2>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              <input
                type="checkbox"
                checked={sliderData.enabled}
                onChange={(e) => handleSliderChange('enabled', e.target.checked)}
              />
              {' '}Включить слайдер
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Заголовок слайдера:{' '}
              <input
                type="text"
                value={sliderData.title}
                onChange={(e) => handleSliderChange('title', e.target.value)}
                disabled={!sliderData.enabled}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Описание слайдера:{' '}
              <input
                type="text"
                value={sliderData.description}
                onChange={(e) => handleSliderChange('description', e.target.value)}
                disabled={!sliderData.enabled}
              />
            </label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Количество слайдов (0-20):{' '}
              <input
                type="number"
                value={sliderData.count}
                onChange={(e) => handleSliderChange('count', e.target.valueAsNumber)}
                min="0"
                max="20"
                disabled={!sliderData.enabled}
              />
            </label>
          </div>
          <button onClick={() => {
            const configToSave = { ...sliderData };
            delete configToSave.data;
            handleSave('slider', configToSave);
          }} disabled={saving['slider']}>
            {saving['slider'] ? 'Сохранение...' : 'Сохранить настройки слайдера'}
          </button>
        </section>
      )}
    </main>
  );
}

export default withAuth(AdminPanel);
