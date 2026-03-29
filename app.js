
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/CraveLab')
  .then(() => console.log('💽 Database connected'))
  .catch(error => console.error(error));


// Schema and model
const cookieSchema = new mongoose.Schema({
  slug: String,
  name: String,
  priceInCents: Number
});

const Cookie = mongoose.model('Cookie', cookieSchema);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const cookies = [
  "Chocolate Chip",
  "Banana"
];

const readablePrice = (price) => {
  return `$${price.toFixed(2)}`;
};


app.get('/', (request, response) => {
  const numberOfCravingInStock = 40;
  response.render('index', {
    nameOfThePage: "CraveLab",
    numberOfCravingInStock: numberOfCravingInStock,
    numberOfCravingSold: 3283
  });
});

app.get('/craving', (request, response) => {
  response.render('cravings/index', { cookies: cookies });
});

app.get('/cookies', (request, response) => {
  const slug = request.params.slug
  const cookie ={}

  response.render('cookies/index', {
    cookies: cookies,
    readablePrice: readablePrice
  });
});

app.post('/cookies', async (request, response) => {
  try {
  const newCookie = new Cookie({
    slug: 'classic-chocolate-chip',
    name: 'Classic Chocolate chip',
    priceInCent: 200
  });

  await newCookie.save();
    response.send('Cookie Created ');
  } catch (error) {
    console.error(error);
    response.send('Error: The cookie could not be created ');
  }
});

app.get('/cookies', async (request, response) => {
  try {
    const cookies = await Cookie.find({}).exec()

    response.render('cookies/index', { 
      cookies: cookies,
      readablePrice: readablePrice
    })
  }catch(error) {
    console.error(error)
    response.render('cookies/index', { 
      cookies: [],
      readablePrice: readablePrice
    })
  }
})



app.get('/cookies/new', (request, response) => {
  response.render('cookies/new');
});

app.get('/cookies', async (request, response) => {
  const cookies = await Cookies.find({}).exec()

  response.render('cookies/index', {
    cookies: cookies,
    readablePrice: readablePrice
  })
})

app.get('/cookies/:slug', async (request, response) => {
  try {
    const slug = request.params.slug
    const cookie = await Cookie.findOne({ slug: slug }).exec()
    if(!cookie) throw new Error('Cookie not found')

    response.render('cookies/show', { 
      cookie: cookie,
      readablePrice: readablePrice
    })
  }catch(error) {
    console.error(error)
    response.status(404).send('Could not find the cookie you\'re looking for.')
  }
})

app.listen(PORT, () => {
  console.log(`👋 Started server on port ${PORT}`);
});
