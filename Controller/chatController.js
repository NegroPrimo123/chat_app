const pool = require('../db');

class ChatController {
    // Создание чат-комнаты
    async createRoom(req, res) {
        const { name } = req.body;
        const userId = req.user.userId;

        try {
            const newRoom = await pool.query(
                'INSERT INTO chat_rooms (name, created_by) VALUES ($1, $2) RETURNING *',
                [name, userId]
            );

            // Автоматически добавляем создателя в комнату
            await pool.query(
                'INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2)',
                [newRoom.rows[0].id, userId]
            );

            res.status(201).json(newRoom.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // Получение списка комнат пользователя
    async getUserRooms(req, res) {
        const userId = req.user.userId;

        try {
            const rooms = await pool.query(
                `SELECT cr.* FROM chat_rooms cr
                 JOIN room_participants rp ON cr.id = rp.room_id
                 WHERE rp.user_id = $1`,
                [userId]
            );

            res.json(rooms.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // Получение сообщений комнаты
    async getRoomMessages(req, res) {
        const { roomId } = req.params;
        const userId = req.user.userId;

        try {
            // Проверяем, что пользователь участник комнаты
            const isParticipant = await pool.query(
                'SELECT 1 FROM room_participants WHERE room_id = $1 AND user_id = $2',
                [roomId, userId]
            );

            if (isParticipant.rows.length === 0) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const messages = await pool.query(
                `SELECT u.username, content
                 FROM messages m
                 JOIN users u ON m.user_id = u.id
                 WHERE m.room_id = $1
                 ORDER BY m.sent_at ASC`,
                [roomId]
            );

            res.send(messages.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Отправка сообщения в чат
    async sendMessage(req, res) {
        const { roomId, content } = req.body;
        const userId = req.user.userId;

        try {
            // Проверяем, что пользователь участник комнаты
            const isParticipant = await pool.query(
                'SELECT 1 FROM room_participants WHERE room_id = $1 AND user_id = $2',
                [roomId, userId]
            );

            if (isParticipant.rows.length === 0) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const newMessage = await pool.query(
                `INSERT INTO messages (room_id, user_id, content)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [roomId, userId, content]
            );

            // Здесь можно добавить логику для веб-сокетов, если нужно

            res.status(201).json(newMessage.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = new ChatController();