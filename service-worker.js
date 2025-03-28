// Имя кэша для хранения файлов приложения
const CACHE_NAME = 'todo-app-v1';
// Список URL-адресов, которые нужно кэшировать для работы офлайн
const urlsToCache = [
  './',
  './index.html', // Основной HTML файл
  './styles.css', // CSS стили
  './script.js', // JavaScript логика
  './manifest.json', // Манифест для PWA
  './icon-192.png', // Иконка приложения (маленькая)
  './icon-512.png', // Иконка приложения (большая)
  './.well-known/assetlinks.json', // Файл для связи с Android приложением
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' // Внешняя библиотека иконок
];

// Обработчик события установки Service Worker
self.addEventListener('install', event => {
  // Ожидание завершения кэширования перед завершением установки
  event.waitUntil(
    // Открытие кэша с указанным именем
    caches.open(CACHE_NAME)
      .then(cache => {
        // Добавление всех указанных URL в кэш
        return cache.addAll(urlsToCache);
      })
  );
});

// Обработчик события запроса ресурсов (перехват сетевых запросов)
self.addEventListener('fetch', event => {
  // Предоставление ответа на запрос
  event.respondWith(
    // Проверка наличия запрашиваемого ресурса в кэше
    caches.match(event.request)
      .then(response => {
        // Если ресурс найден в кэше, возвращаем его
        if (response) {
          return response;
        }
        // Если ресурса нет в кэше, делаем сетевой запрос
        return fetch(event.request).then(
          response => {
            // Проверка валидности ответа
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Клонирование ответа для кэширования (т.к. ответ можно использовать только один раз)
            const responseToCache = response.clone();
            // Открытие кэша для сохранения нового ресурса
            caches.open(CACHE_NAME)
              .then(cache => {
                // Сохранение запроса и ответа в кэше
                cache.put(event.request, responseToCache);
              });
            // Возврат оригинального ответа
            return response;
          }
        );
      })
  );
});

// Обработчик события активации Service Worker (происходит после установки)
self.addEventListener('activate', event => {
  // Список кэшей, которые нужно сохранить (текущая версия)
  const cacheWhitelist = [CACHE_NAME];
  // Ожидание завершения очистки старых кэшей
  event.waitUntil(
    // Получение списка всех имеющихся кэшей
    caches.keys().then(cacheNames => {
      // Обработка всех кэшей параллельно
      return Promise.all(
        cacheNames.map(cacheName => {
          // Если кэш не входит в белый список (устаревшая версия)
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Удаление устаревшего кэша
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});