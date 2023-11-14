const path = require('path');

const express = require('express');

const userRoutes = require('./routes/user');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(userRoutes);

app.listen(3000);
