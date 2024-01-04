const bodyParser = require('body-parser')
//import * as bodyParser from 'body-parser'

//import * as cors from 'cors'

const cors = require('cors')

module.exports = (app: any) => {
    app.use(bodyParser.json())

    app.use(cors({
        origin: '*'
    }))
}