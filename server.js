const RobotService = require('./services/robot-service.js');
const MouseService = require('./services/mouse-service.js');
const GamepadService = require('./services/gamepad-service.js');
const KeyboardService = require('./services/keyboard-service.js');

const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const robotService = new RobotService()
const services = {
    'gamepad': new GamepadService(robotService),
    'keyboard': new KeyboardService(robotService),
    'mouse': new MouseService(robotService)
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res, next) => {
    res.render('index.html');
});

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`App Express is running!`);
});

 
function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}
 
function onMessage(ws, data) {
    ws.send(`recebido!`);

    let comand = JSON.parse(data);
    let typeComand = comand.type_comand;
    if (services.hasOwnProperty(typeComand)) {
        services[typeComand].handle(comand);
    }
}
 
function onConnection(ws, req) {
    ws.on('message', data => onMessage(ws, data));
    ws.on('error', error => onError(ws, error));
} 

const wss = new WebSocket.Server({
    server
});

wss.on('connection', onConnection);
