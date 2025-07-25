# Календарь Бухгалтера - Архитектура приложения

## Обзор

Приложение представляет собой комплексный инструмент для бухгалтеров, объединяющий личный и производственный календари с набором вспомогательных инструментов.

## Основные режимы работы

### 1. Личный календарь
Аналог Google Calendar с возможностями:
- **Управление задачами**: создание, редактирование, выполнение личных задач
- **Система слоев**: 
  - Праздники РФ (системный слой)
  - Мои задачи (системный слой)
  - Налоговые сроки (системный слой)
  - Возможность добавления пользовательских слоев
- **Переключение видов**: годовой и месячный обзор
- **Интерактивность**: клик по дате открывает детальную информацию

### 2. Производственный календарь
Профессиональный инструмент по образцу календаря на Клерке:
- **Режимы рабочей недели**: 5-дневная и 6-дневная
- **Периоды просмотра**: 
  - Год (с разбивкой по кварталам и месяцам)
  - Квартал (с детальной статистикой)
  - Месяц (с подробными данными)
- **Статистика**:
  - Календарные дни
  - Рабочие дни
  - Выходные и праздничные
  - Норма рабочего времени (40/36/24 часовая неделя)
- **Табличное представление** данных по периодам

## Инструменты

Доступны в любом режиме через FAB-меню:

### 1. Расчет отпускных
- Выбор периода отпуска (визуально на календаре или через датапикеры)
- Ввод средней зарплаты за 12 месяцев
- Автоматический расчет:
  - Количества дней отпуска (без праздников)
  - Среднедневного заработка
  - Начисленной суммы
  - НДФЛ
  - Суммы к выплате

### 2. Калькулятор рабочих дней
- Выбор периода для расчета
- Подсчет рабочих дней с учетом праздников
- Общее количество календарных дней

## Архитектура компонентов

```
src/
├── App.tsx                          # Главный компонент с переключением режимов
├── screens/
│   ├── PersonalCalendarScreen.tsx   # Личный календарь
│   └── IndustrialCalendarScreen.tsx # Производственный календарь
├── components/
│   ├── Calendar/
│   │   ├── MonthView.tsx           # Месячное представление
│   │   ├── YearView.tsx            # Годовое представление
│   │   └── StatsPanel.tsx          # Панель статистики
│   ├── Calculator/
│   │   └── VacationCalculator.tsx  # Калькулятор отпускных
│   ├── Modals/
│   │   ├── DateDetailsModal.tsx    # Детали даты
│   │   └── WorkdayCalculatorModal.tsx # Калькулятор рабочих дней
│   ├── FABMenu.tsx                 # Меню быстрых действий
│   └── SafeHeader.tsx              # Безопасный заголовок
├── hooks/
│   ├── useCalendarData.ts          # Данные календаря
│   └── useTasks.ts                 # Управление задачами
├── utils/
│   ├── dateUtils.ts                # Утилиты для дат
│   ├── vacationCalculator.ts       # Логика расчета отпускных
│   └── workdayCalculator.ts       # Логика расчета рабочих дней
├── constants/
│   └── calendarData.ts             # Статические данные календаря
└── types/
    └── index.ts                    # TypeScript типы
```

## Состояния приложения

### Глобальные состояния:
- `calendarMode`: 'personal' | 'industrial' - текущий режим календаря
- `toolMode`: 'none' | 'vacation' | 'workdays' - активный инструмент

### Локальные состояния:
- Личный календарь: слои, задачи, выбранная дата
- Производственный календарь: тип недели, период просмотра
- Инструменты: даты, суммы, результаты расчетов

## Особенности реализации

1. **Изоляция режимов**: При активации инструмента основной календарь блокируется
2. **Универсальность инструментов**: Доступны из любого режима
3. **Визуальная интеграция**: Выбор дат для отпуска происходит прямо на календаре
4. **Адаптивность**: Поддержка различных размеров экранов
5. **Производительность**: Мемоизация тяжелых вычислений

## Использование

### Переключение режимов:
- Тап по кнопкам "Личный" / "Производственный" в верхней панели

### Работа с инструментами:
1. Нажмите на FAB-кнопку (плавающая кнопка)
2. Выберите нужный инструмент
3. Для закрытия нажмите крестик в панели инструмента

### Личный календарь:
- Управление слоями через кнопку "Слои"
- Добавление задач через клик по дате
- Переключение год/месяц в заголовке

### Производственный календарь:
- Выбор типа недели в верхней панели
- Выбор периода (год/квартал/месяц)
- Просмотр детальной статистики