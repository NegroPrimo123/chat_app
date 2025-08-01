const express = require('express');
const router = express.Router();
const chatController = require('../Controller/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Применяем middleware аутентификации ко всем маршрутам чата
router.use(authMiddleware);

// Создание комнаты
router.post('/rooms', chatController.createRoom);

// Получение комнат пользователя
router.get('/rooms', chatController.getUserRooms);

// Получение сообщений комнаты
router.get('/rooms/:roomId/messages', chatController.getRoomMessages);

// Отправка сообщения в чат
router.post('/rooms/messages', chatController.sendMessage);

module.exports = router