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
app.use(cors())
app.use(express.json())

app.use('/api/opps', oppRoutes)
app.use('/api/users', userRoutes)
app.use('/api/costumer', costumerRoutes)
app.use('/api/project', projectRoutes)

//process.env.DB_URI

mongoose.connect("mongodb://localhost:27017/", { dbName: 'OTP_DB' })
    .then( () => {
        console.log("Connected to DB successfully")
        app.listen(4000, ()=>console.log("Listening to port 4000"))
    })
    .catch((err) => console.log(err))