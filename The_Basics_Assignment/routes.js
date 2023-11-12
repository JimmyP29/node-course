const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>System Users</title></head>');
        res.write('<body><form action="/create-user" method="POST"><input type="text" name="username"><button type="submit">Send</button></form></body>');
        res.write('</html>');
        return res.end();
    }

    if (url === '/users') {
        res.write('<html>');
        res.write('<head><title>System Users</title></head>');
        res.write('<ul><li>User 1</li><li>User 2</li><li>User 3</li></ul>')
        res.write('</html>');
        return res.end();
    }

    if (url === '/create-user') {
        const body = [];

        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });


        return req.on('end', () => {
            // Buffer
            const parsedBody = Buffer.concat(body).toString();
            console.log(parsedBody);
            const username = parsedBody.split('=')[1];

            res.statusCode = 302; // 302 === redirection
            res.setHeader('Location', '/');
            console.log(username)
            return res.end();
        });
    }

    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>My First Page</title></head>');
    res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
    res.write('</html>');
    res.end();
};

// Could also use exports.handler = requestHandler;
module.exports = requestHandler;
