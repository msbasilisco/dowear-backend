const express = require('express')
const cors = require('cors')

const app = express()

var corOptions = {
    origin: 'https://localhost:8081'
}

app.use(cors(corOptions))
app.use(express.json())
app.use(express.urlencoded({extended: true}))


//routers
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
app.use('/api/users',userRoutes)
app.use('/api/products/',productRoutes)

//testing the api
app.get('/', (req,res)=>{
    res.json({message: 'Connection has been established!'})
})


const PORT = process.env.PORT || 3000

//server
app.listen(PORT, ()=>{
    console.log(`server is now running on port ${PORT}`)
})