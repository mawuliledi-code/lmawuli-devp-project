
const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/CraveLab')
.then(() => console.log('💽 Database connected'))
  .catch(error => console.error(error))

const express = require("express");
const app = express();
app.use(express.static('public'))

app.set('view engine', 'ejs')

const PORT = 3000

const cookies = [
  "Chocolate Chip",
  "Banana"
]

const readablePrice = (price) => {
  return `$${price.toFixed(2)}`
}


app.listen(PORT, () => {
  console.log(`👋 Started server on port ${PORT}`)
})

app.get('/', (request, response) => {
  const numberOfCravingInStock = 40
  response.render('index', {
    nameOfThePage: "GravingLab",
    numberOfCravingInStock: numberOfCravingInStock,
    numberOfCravingSold: 3283
  })
})


app.get('/craving', (request, response) => {
    response.render('cravings/index', {cookies:cookies})
})


app.get('/cookies', (request, response) => {
  response.render('cookies/index', { 
    cookies: cookies,
    readablePrice: readablePrice
  })
})