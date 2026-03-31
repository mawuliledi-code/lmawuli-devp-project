
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');  // ← moved to top

const app = express();
const PORT = 3000;

// ── DATABASE ──────────────────────────────────────────
mongoose.connect('mongodb://127.0.0.1:27017/StackLab')
  .then(() => console.log('💽 Database connected'))
  .catch(error => console.error(error));

// ── SCHEMA ────────────────────────────────────────────
const burgerSchema = new mongoose.Schema({
  slug:         String,
  name:         String,
  design:       String,
  patty:        String,
  toppings:     [String],
  sauce:        String,
  priceInCents: Number,
  createdAt: {
    type:    Date,
    default: Date.now
  }
});

const Burger = mongoose.model('Burger', burgerSchema);

// ── HELPER ────────────────────────────────────────────
const readablePrice = (price) => `$${(price / 100).toFixed(2)}`;

// ── MIDDLEWARE ────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));  // ← only once
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// ── ROUTES ────────────────────────────────────────────
app.get('/', async (req, res) => {
  try {
    const burgers = await Burger.find({}).exec();
    res.render('cravings/index', {
      nameOfThePage:   'StackLab 🍔',
      numberOfBurgers: burgers.length,
      numberSold:      3283,
      burgers,
      readablePrice
    });
  } catch (error) {
    console.error(error);
    res.render('cravings/index', {
      nameOfThePage:   'StackLab 🍔',
      numberOfBurgers: 0,
      numberSold:      3283,
      burgers:         [],
      readablePrice
    });
  }
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/burgers', async (req, res) => {
  try {
    const burgers = await Burger.find({}).exec();
    res.render('burgers/index', { burgers, readablePrice });
  } catch (error) {
    console.error(error);
    res.render('burgers/index', { burgers: [], readablePrice });
  }
});

app.get('/burgers/new', (req, res) => {
  res.render('burgers/new');
});

app.post('/burgers', async (req, res) => {
  try {
    const newBurger = new Burger({
      name:         req.body.name,
      slug:         req.body.slug,
      patty:        req.body.patty,
      toppings:     req.body.toppings || [],
      sauce:        req.body.sauce,
      priceInCents: req.body.priceInCents
    });
    await newBurger.save();
    res.redirect('/burgers');
  } catch (error) {
    console.error(error);
    res.send('Error: Burger could not be created.');
  }
});

app.get('/burgers/:slug', async (req, res) => {
  try {
    const burger = await Burger.findOne({ slug: req.params.slug });
    if (!burger) throw new Error('Burger not found');
    res.render('burgers/show', { burger, readablePrice });
  } catch (error) {
    console.error(error);
    res.status(404).send('Burger not found.');
  }
});

app.get('/burgers/:slug/edit', async (req, res) => {
  try {
    const burger = await Burger.findOne({ slug: req.params.slug });
    if (!burger) throw new Error('Burger not found');
    res.render('burgers/edit', { burger });
  } catch (error) {
    console.error(error);
    res.status(404).send('Burger not found.');
  }
});

app.post('/burgers/:slug', async (req, res) => {
  try {
    const burger = await Burger.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    );
    res.redirect(`/burgers/${burger.slug}`);
  } catch (error) {
    console.error(error);
    res.send('Error updating burger.');
  }
});

app.get('/burgers/:slug/delete', async (req, res) => {
  try {
    await Burger.findOneAndDelete({ slug: req.params.slug });
    res.redirect('/burgers');
  } catch (error) {
    console.error(error);
    res.send('Error deleting burger.');
  }
});

// ── START ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`👋 Started StackLab server on port ${PORT}`);
});
