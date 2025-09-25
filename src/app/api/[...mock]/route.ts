import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// --- Генератор случайных данных для слайдера ---
const MOCK_REVIEWS = {
  names: ["Екатерина", "Алексей", "Мария", "Иван", "Ольга", "Дмитрий", "Анна", "Сергей", "Ирина", "Павел", "Наталья", "Виктор"],
  texts: [
    "Я привыкла быть в движении, но из-за болезни иногда приходится сбавлять темп. Приложение помогает отслеживать, как меняется состояние, и напоминает о лекарствах.",
    "Сначала было непривычно, но теперь я не представляю свой день без этого приложения. Всегда под рукой актуальная информация о моем состоянии и план лечения. Очень удобно.",
    "Благодаря приложению я стала лучше понимать свой организм. Аналитика и графики помогают видеть динамику, а напоминания не дают забыть о приеме лекарств. Рекомендую всем!",
    "Отличный инструмент для самоконтроля. Помогает не только следить за приемом препаратов, но и анализировать общее самочувствие. Стало проще общаться с врачом.",
    "Очень удобный интерфейс и понятная навигация. Вся нужная информация всегда под рукой. Большое спасибо разработчикам за такой полезный инструмент!",
    "Приложение стало моим незаменимым помощником. Напоминания о приеме лекарств и возможность вести дневник самочувствия — это именно то, что было нужно.",
    "Пользуюсь уже несколько месяцев. Стабильно работает, никаких сбоев. Помогает систематизировать уход за своим здоровьем и ничего не забывать.",
    "Рекомендую всем, кто хочет взять под контроль свое лечение. Удобно, просто и эффективно. Теперь я чувствую себя гораздо увереннее.",
    "Это приложение изменило мой подход к лечению. Теперь я могу легко отслеживать все изменения и делиться этой информацией с врачом. Очень ценно.",
    "Простое и интуитивно понятное приложение. Ничего лишнего, только самые необходимые функции. Помогает быть более дисциплинированным в вопросах здоровья.",
    "Наконец-то появилось приложение, которое действительно помогает. Графики состояния и напоминания — это супер-функции. Спасибо!",
    "Использую каждый день. Помогает не сбиваться с графика приема лекарств и видеть общую картину своего состояния. Очень полезная вещь."
  ]
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomReview(id: number) {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 60)); // Случайная дата в пределах 2 месяцев
  return {
    id,
    photo: `https://picsum.photos/36/36?random=${id}`,
    name: getRandomElement(MOCK_REVIEWS.names),
    date: date.toLocaleDateString('ru-RU'),
    text: getRandomElement(MOCK_REVIEWS.texts),
  };
}
// --- Конец генератора ---

const dataDir = path.join(process.cwd(), 'src', 'data');

async function getMockData(mockName: string) {
  const filePath = path.join(dataDir, `${mockName}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveMockData(mockName: string, data: unknown) {
  const filePath = path.join(dataDir, `${mockName}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

type RouteContext = {
    params: Promise<{ mock: string[] }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { mock } = await context.params;
  const mockName = mock.join('/');
  
  // Особая логика для слайдера
  if (mockName === 'slider') {
    const sliderConfig = await getMockData('slider');
    if (!sliderConfig || sliderConfig.error) {
      return NextResponse.json({ error: 'Slider config not found' }, { status: 404 });
    }

    const generatedData = {
      ...sliderConfig,
      data: Array.from({ length: sliderConfig.count }, (_, i) => generateRandomReview(i + 1)),
    };
    
    return NextResponse.json(generatedData);
  }

  // Стандартная логика для остальных моков
  const data = await getMockData(mockName);

  if (!data) {
    return NextResponse.json({ error: 'Mock data not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { mock } = await context.params;
  const mockName = mock.join('/');
  const newData = await request.json();

  await saveMockData(mockName, newData);

  return NextResponse.json({ success: true, data: newData });
}
