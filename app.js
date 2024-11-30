const express = require('express')
const cors = require('cors')
const db = require('./models')

const app = express()

var corOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corOptions))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

db.sequelize.authenticate()
    .then(() => {
        console.log('Database connection established successfully.')
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err)
    })

const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
app.use('/api/users',userRoutes)
app.use('/api',productRoutes)
app.use('/api/cart', cartRoutes)

app.get('/', (req,res)=>{
    res.json({message: 'Connection has been established!'})
})

const PORT = process.env.PORT || 3000

db.sequelize
    .sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch(err => {
        console.error('Failed to sync database:', err)
    })