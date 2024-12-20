# Streamify

Streamify — это веб-приложение для загрузки и потоковой передачи видео с YouTube. Оно позволяет пользователям загружать видео по URL и воспроизводить их через веб-интерфейс.

## Описание сервиса

Streamify позволяет:

- Загружать видео с YouTube.
- Хранить загруженные видео на сервере.
- Проводить потоковую передачу видео через веб-интерфейс.

## Функционал

### Уже реализовано

- **Загрузка видео**: Веб-приложение может загружать видео по предоставленному URL с YouTube и сохранять их на сервере.
- **Потоковая передача**: Поддержка потоковой передачи видео с возможностью управления прогрессом и скоростью загрузки.
- **Мониторинг пользователей**: Счётчик активных пользователей с обновлением в реальном времени.

### В разработке

- **Управление метаданными**: Добавление информации о видео, такой как название, автор, продолжительность и т.д.

### Планируется

- **Ограничение размера файлов**: Введение ограничений на размер загружаемых видеофайлов.
- **Очистка старых данных**: Функция для удаления старых или неактивных видеофайлов и записей.
- **Аутентификация и авторизация**: Добавление механизма аутентификации и авторизации пользователей.
- **Оптимизация прогресса загрузки**: Улучшение точности оценки скорости и прогресса загрузки.
- **Улучшение безопасности**: Защита от атак, таких как "Path Traversal".

## Настройка проекта

### Рекомендуемая среда разработки

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (отключите Vetur).

## Установка проекта

```sh
npm install
```

## Запуск в режиме разработки

```sh
npm run dev
```

```sh
cd server/
```

```sh
node app.js
```

## Компиляция и минимизация для продакшена

```sh
npm run build
```

```sh
cd server/
```

```sh
node app.js
```

```sh
npm start
```

## Файловая структура проекта

```
streamify/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/
│   │   └── main.css        # Основные стили проекта
│   ├── components/
│   │   ├── LoadingSpinner.vue   # Лодер пока видео скачивается
│   │   ├── VideoPlayer.vue     # Компонент для проигрывания видео
│   │   └── VideoForm.vue       # Форма для ввода ссылки на видео
│   │   └── UserCounter.vue    # Счетчик пользователей на сайте
│   ├── views/
│   │   └── HomePage.vue          # Главная страница
│   ├── App.vue                 # Главный компонент приложения
│   ├── main.js                 # Входная точка приложения
│   ├── router/
│   │   └── index.js               # Конфигурация маршрутизации (если потребуется)
├── server/
│   ├── modules/
│   │   ├── downloadManager.js  # Модуль для загрузки видео с YouTube
│   │   ├── streamManager.js    # Модуль для потоковой передачи видео
│   │   ├── sessionManager.js   # Модуль для управления сессиями
│   │   ├── metadataManager.js  # Модуль для управления метаданными видео (в разработке)
│   ├── utils/
│   │   ├── fileUtils.js        # Утилиты для работы с файлами
│   │   └── videoUtils.js       # Утилиты для работы с видео
│   ├── index.js                # Основной серверный код на Node.js
│   ├── storage/
│   │   ├── videosData.json     # Метаданные видео (uuid, path)
│   │   ├── sessions.json       # Сессии
│   ├── config.js               # Конфигурация приложения (порты, пути и т.д.)
├── .gitignore
├── package.json
└── README.md
```

## Рекомендации и улучшения

### Обработка ошибок при чтении и записи файлов

- Убедитесь, что для всех операций с файлами есть проверка на ошибки, чтобы предотвратить сбои приложения и потерю данных.

### Управление метаданными видео

- Подумайте о добавлении дополнительных метаданных в videosData.json, таких как название видео, автор, продолжительность и т.д., если это необходимо для вашего приложения.

### Ограничение размера загружаемых видео (!под вопросом!)

- Добавьте ограничение на размер видеофайлов, которые можно загрузить, чтобы избежать переполнения диска и улучшить производительность.

### Очистка старых данных

- Рассмотрите возможность добавления функции для очистки старых или неактивных видеофайлов и записей в videosData.json, чтобы поддерживать чистоту и организованность файловой системы.
  ###Аутентификация и авторизация
- Если ваше приложение предназначено для использования несколькими пользователями, добавьте механизм аутентификации и авторизации для улучшения безопасности.

### Оптимизация прогресса загрузки

- Периодически обновляйте прогресс загрузки, чтобы улучшить точность оценки скорости и прогресса.

### Безопасность

- Убедитесь, что ваше приложение защищено от атак, таких как атаки типа "Path Traversal", чтобы предотвратить доступ к файлам вне разрешённых директорий.

## Лицензия

Этот проект лицензирован под [MIT License](https://mit-license.org).

https://www.youtube.com/watch?v=xnfg7jzlCdc
