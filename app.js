const { createServer } = require("./lib/http");

const server = createServer(function (req, res) {

    res.setContentType("text/html");

    res.write("<h1>It Works!</h1>");

});

server.listen(3001);