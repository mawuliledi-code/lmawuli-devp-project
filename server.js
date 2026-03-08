const http = require("http");

const port = 3000;

const server = http.createServer((req, res) => {
  const path = req.url;

  console.log("Request:", req.method, path);

  res.setHeader("Content-Type", "text/html");

  if (path === "/") {
    res.end(`<h1>Home Page</h1>
             <p>Welcome to my website!</p>
             <a href="/about">About</a><br>
             <a href="/user/Name">User Page</a>`);

  } else if (path === "/about") {
    res.end(`<h1>About Page</h1>
             <p>This website demonstrates a Node.js backend with multiple routes.</p>
             <a href="/">Home</a>`);

  } else if (path.startsWith("/user/")) {
    const username = path.split("/")[2];
    res.end(`<h1>User Page</h1>
             <p>Hello ${username}, welcome to this page!</p>
             <a href="/">Home</a>`);

  } else {
    res.end(`<h1>404 - Page Not Found</h1>
             <a href="/">Home</a>`);
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
