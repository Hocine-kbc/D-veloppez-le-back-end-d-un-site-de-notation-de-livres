const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bookRoutes = require('./routes/books.routes');
const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
