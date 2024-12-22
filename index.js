const express = require('express')
require('dotenv').config()
require('./database/connection')

const morgan = require('morgan')

const cors = require('cors')
//middleware
const UserRoute = require('./routes/userRoute')
const BookingRoute = require('./routes/bookingRoute')
const PaymentRoute = require('./routes/paymentRoute')


const app = express()
const port = process.env.PORT || 5000

app.use(morgan('dev'))

app.get('/hello', (request, response)=>{
    return response.send('Hello, World!!!!!!!!!!')
})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})

app.use(express.json())
app.use(cors())

app.use('/api', UserRoute);
app.use('/api', BookingRoute);
app.use('/api', PaymentRoute);

app.use('/public/uploads', express.static('public/uploads'));