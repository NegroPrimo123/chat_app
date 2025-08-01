const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const path = require('path');

const userRouter = require('./Router/userRouter');
const chatRouter = require('./Router/chatRouter');

// Middleware
app.use(express.json())
app.use(cors())

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Подключаем роуты
app.use('/api/auth', userRouter);
app.use('/api/chat', chatRouter);

app.use(express.static(path.join(__dirname, 'public')));
// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 4001;

app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
});

