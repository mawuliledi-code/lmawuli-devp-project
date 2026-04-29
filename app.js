require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("💽 Database connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");

const burgerSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  design: {
    type: String,
    required: true,
    trim: true,
  },
  patty: { type: String, default: "" },
  toppings: { type: [String], default: [] },
  sauce: { type: String, default: "" },
  priceInCents: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Burger = mongoose.model("Burger", burgerSchema);

const readablePrice = (price) => `$${(price / 100).toFixed(2)}`;



app.get("/", async (req, res) => {
  try {
    const burgers = await Burger.find({}).exec();
    res.render("cravings/index", {
      title: "StackLab 🍔",
      nameOfThePage: "StackLab 🍔",
      numberOfBurgers: burgers.length,
      numberSold: 3283,
      burgers,
      readablePrice,
    });
  } catch (error) {
    console.error(error);
    res.render("cravings/index", {
      title: "StackLab 🍔",
      nameOfThePage: "StackLab 🍔",
      numberOfBurgers: 0,
      numberSold: 3283,
      burgers: [],
      readablePrice,
    });
  }
});



app.get("/burgers", (req, res) => {
  res.redirect("/");
});



app.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact | StackLab" });
});

app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  console.log("Contact form submitted:", { name, email, subject, message });
  res.redirect("/contact");
});



app.get("/burgers/new", (req, res) => {
  res.render("burgers/new", { title: "New Burger | StackLab" });
});



app.post("/burgers", async (req, res) => {
  try {
    const toppings =
      typeof req.body.toppings === "string"
        ? req.body.toppings
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : Array.isArray(req.body.toppings)
        ? req.body.toppings
        : [];

    const priceInCents = Number(req.body.priceInCents);

    if (Number.isNaN(priceInCents)) {
      return res.status(400).send("Error: priceInCents must be a number.");
    }

    const newBurger = new Burger({
      name: req.body.name,
      slug: req.body.slug,
      design: req.body.design,
      patty: req.body.patty,
      toppings,
      sauce: req.body.sauce,
      priceInCents,
      createdAt: req.body.date ? new Date(req.body.date) : undefined,
    });

    await newBurger.save();
    res.redirect("/");
  } catch (error) {
    console.error("Create burger error:", error);

    if (error?.code === 11000) {
      return res
        .status(400)
        .send("Error: That slug already exists. Please choose a unique slug.");
    }

    res.status(400).send("Error: Burger could not be created.");
  }
});



app.get("/burgers/:slug", async (req, res) => {
  try {
    const burger = await Burger.findOne({ slug: req.params.slug.toLowerCase() });
    if (!burger) throw new Error("Burger not found");
    res.render("burgers/show", { 
      title: `${burger.name} | StackLab`,
      burger, 
      readablePrice 
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Burger not found.");
  }
});



app.get("/burgers/:slug/edit", async (req, res) => {
  try {
    const burger = await Burger.findOne({ slug: req.params.slug.toLowerCase() });
    if (!burger) throw new Error("Burger not found");
    res.render("burgers/edit", { 
      title: "Edit Burger | StackLab",
      burger 
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Burger not found.");
  }
});



app.post("/burgers/:slug", async (req, res) => {
  try {
    const updates = { ...req.body };

    if (typeof updates.priceInCents !== "undefined") {
      updates.priceInCents = Number(updates.priceInCents);
    }

    const burger = await Burger.findOneAndUpdate(
      { slug: req.params.slug.toLowerCase() },
      updates,
      { returnDocument: "after", runValidators: true }
    );

    if (!burger) throw new Error("Burger not found");
    res.redirect(`/burgers/${burger.slug}`);
  } catch (error) {
    console.error("Update burger error:", error);
    res.status(400).send("Error updating burger.");
  }
});



app.get("/burgers/:slug/delete", async (req, res) => {
  try {
    await Burger.findOneAndDelete({ slug: req.params.slug.toLowerCase() });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(400).send("Error deleting burger.");
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`👋 Started StackLab server on port ${PORT}`);
});
