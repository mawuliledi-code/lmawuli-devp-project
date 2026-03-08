// Store a reference to the <h1> in a variable
// Store a reference to the <h1>
const myHeading = document.querySelector("h1");
myHeading.textContent = "Campus Compass";

const myImage = document.querySelector("img");
myImage.addEventListener("click", () => {
  alert("Welcome to Campus Compass!");
});

