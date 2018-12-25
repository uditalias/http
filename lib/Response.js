const HTTP_STATUS_REASON = {
    "200": "OK",
    "401": "UNAUTHORIZE"
}

class Response {
    constructor(socket, request) {
        this._request = request;
        this._status;
        this._statusText;
        this._body = "";
        this._headers = {};
        this._socket = socket;
        this._isChunked = false;
        this._headersSent = false;

        this.setContentType("text/plain");
        this.setStatus(200);
    }

    _sendHeaders() {
        if (this._headersSent) {
            return;
        }

        this._headersSent = true;
        this.setHeader("Date", (new Date).toGMTString());
        this._socket.write(`HTTP/${this._request.httpVersion} ${this._status} ${this._statusText}\r\n`);

        Object.keys(this._headers).forEach((header) => {
            this._socket.write(`${header}: ${this._headers[header]}\r\n`);
        });

        this._socket.write("\r\n");
    }

    setStatus(status, text) {
        this._status = status;
        this._status = text || HTTP_STATUS_REASON[status];
    }

    setHeader(name, value) {
        this._headers[name.trim().toLowerCase()] = value.toString().trim();
    }

    setContentType(type) {
        this.setHeader("Content-Type", type);
    }

    write(chunk) {
        if (!this._headersSent) {
            if (!this._headers["content-length"]) {
                this._isChunked = true;
                this.setHeader("transfer-encoding", "chunked");
            }

            this._sendHeaders();
        }

        if (this._isChunked) {
            const size = chunk.length.toString(16);
            this._socket.write(`${size}\r\n`);
            this._socket.write(chunk);
            this._socket.write("\r\n");
        } else {
            this._socket.write(chunk);
        }
    }

    end(chunk) {
        if (!this._headersSent) {
            if (!this._headers["content-length"]) {
                this.setHeader("contnet-length", chunk ? chunk.length : 0);
            }
            this._sendHeaders();
        }

        if (this._isChunked) {
            if (chunk) {
                const size = chunk.lenght.toString(16);
                this._socket.write(`${size}\r\n`);
                this._socket.write(chunk);
                this._socket.write("\r\n");
            }
            this._socket.end("0\r\n\r\n");
        } else {
            this._socket.end(chunk);
        }
    }
}

module.exports = Response;