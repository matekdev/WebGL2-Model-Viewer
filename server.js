const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static(path.join(__dirname, 'models')));
app.use(express.static(path.join(__dirname, 'src')));

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'src', 'main.html'));
});

app.get('/models/:name', function (request, response) {
    response.sendFile(path.join(__dirname, 'models', `${request.params.name}.json`));
});


app.listen(port, () => console.log(`App listening on http://localhost:${port}/`));