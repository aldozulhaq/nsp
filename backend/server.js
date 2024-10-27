import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import { oppRoutes } from './routes/oppRoutes.js'
import { userRoutes } from './routes/usersRoutes.js'
import { costumerRoutes } from './routes/costumersRoutes.js'
import { projectRoutes } from './routes/projectRoutes.js'

const app = express()

app.use(helmet())
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json())

app.use('/api/opps', oppRoutes)
app.use('/api/users', userRoutes)
app.use('/api/costumer', costumerRoutes)
app.use('/api/project', projectRoutes)

//process.env.DB_URI

mongoose.connect(process.env.DB_URI, { dbName: 'OTP_DB' })
    .then( () => {
        console.log("Connected to DB successfully")
        app.listen(4000, ()=>console.log("Listening to port 4000"))
    })
    .catch((err) => console.log(err))