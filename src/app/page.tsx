import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';

// Функция для чтения данных напрямую из файла
async function getMockData(mockName: string) {
  const dataDir = path.join(process.cwd(), 'src', 'data');
  const filePath = path.join(dataDir, `${mockName}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { error: `Could not read ${mockName}.json` };
  }
}

export default async function HomePage() {
  // Получаем данные для всех эндпоинтов
  const mainData = await getMockData('main');
  const sliderData = await getMockData('slider');
  const navigationData = await getMockData('navigation');

  // Для слайдера мы хотим показать пример сгенерированных данных
  const sliderExampleData = { ...sliderData };
  if (sliderExampleData && !sliderExampleData.error) {
    sliderExampleData.data = [
      {
        "id": 1,
        "photo": "https://picsum.photos/36/36?random=1",
        "name": "Пример Имени",
        "date": "25.09.2025",
        "text": "Это пример случайно сгенерированного отзыва."
      },
      { "...": "и так далее, в зависимости от count" }
    ]
  }

  const endpoints = [
    { name: 'main', data: mainData, description: 'Данные для основного блока на главной странице (заголовок, подзаголовок, URL видео, кнопки, сайдбар с URL, социальные сети).' },
    { name: 'slider', data: sliderExampleData, description: 'Данные для слайдера с отзывами. API на лету генерирует случайные отзывы в количестве, указанном в поле `count`.' },
    { name: 'navigation', data: navigationData, description: 'Данные для навигационного меню (логотип и пункты меню). Ссылка (link) для каждого пункта всегда ведёт на \'/\'.' },
  ];

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>API Mock Endpoints</h1>
      <p>
        Это приложение предоставляет мок-данные для фронтенда. 
        Вы можете управлять этими данными в{' '}
        <Link href="/admin" style={{ color: '#0070f3' }}>
          панели администратора
        </Link>.
      </p>
      <p style={{ marginTop: '1rem', fontSize: '1.1rem', backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
        Базовый URL для всех эндпоинтов: {' '}
        <a href="https://revmo-api.netlify.app" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold' }}>
          https://revmo-api.netlify.app
        </a>
      </p>

      {endpoints.map(({ name, data, description }) => (
        <section key={name} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', backgroundColor: '#fafafa' }}>
          <h2>
            Endpoint: <code style={{ backgroundColor: '#e3e3e3', padding: '4px 8px', borderRadius: '4px' }}>/api/{name}</code>
          </h2>
          <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{description}</p>
          <h3>Структура данных:</h3>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>
      ))}
    </main>
  );
}
