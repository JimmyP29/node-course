const express = require('express');

const app = express();

// app.use((req, res, next) => {
//     console.log('working');
//     next();
// });

// app.use('/', (req, res, next) => {
//     console.log('working 2');
//     res.send('<h1>This is working</h1>');
// });

app.use('/users', (req, res, next) => {
    res.send('<h1>This page is for "/users"</h1>');
});

app.use('/', (req, res, next) => {
    res.send('<h1>This page is for "/"</h1>');
});

app.listen(3000);