const net = require("net")
    , Request = require("./Request")
    , Response = require("./Response");


function createServer(requestHandler) {
    const server = net.createServer();

    server.on(
        "connection",
        (socket) => handleConnection(socket, requestHandler)
    );

    return server;
}

function handleConnection(socket, requestHandler) {
    socket.once("readable", function () {
        const request = new Request(socket);
        request.parse();

        const response = new Response(socket, request);

        requestHandler(request, response);
    });
}

module.exports = {
    createServer
};