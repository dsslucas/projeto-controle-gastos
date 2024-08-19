const express = require('express')
const app = express()

const db = require('./config/database')

const globalFunctions = require('./config/globalFunctions.ts')
//const configApi = require('./api/config.ts')

const consign = require('consign')

const port = 3003

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.globalFunctions = globalFunctions;
//app.configApi = configApi;

consign()
    .include('./config/middleware.ts')
    .then('./api')
    .then('./config/routes.ts')
    //.then('./config/globalFunctions.ts')
    .into(app)

io.on('connection', (socket: any) => {
    console.log("New socket: ", socket.id)
})

app.database = db;

app.io = io;



app.listen(port, () => {
    console.log(`Backend running at port ${port}.`)
})