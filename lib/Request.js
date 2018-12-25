class Request {
    constructor(socket) {
        this._httpVersion = "";
        this._method = "";
        this._path = "";
        this._headers = {};
        this._socket = socket;
    }

    get httpVersion() {
        return this._httpVersion;
    }

    get socket() {
        return this._socket;
    }

    get method() {
        return this._method;
    }

    get path() {
        return this._path;
    }

    get headers() {
        return this._headers;
    }

    _setHttpVersion(rawVersion) {
        this._httpVersion = rawVersion.split("/")[1];
    }

    _setPath(path) {
        this._path = path;
    }

    _setMethod(method) {
        this._method = method;
    }

    _setHeader(name, value) {
        this._headers[name.trim().toLowerCase()] = value.trim().toString();
    }

    parse() {
        let reqBuffer = new Buffer('')
            , buf
            , reqHeader;

        while (true) {
            buf = this._socket.read();
            if (buf === null) break;

            reqBuffer = Buffer.concat([reqBuffer, buf]);
            let marker = reqBuffer.indexOf("\r\n\r\n");

            if (marker !== -1) {
                let remaining = reqBuffer.slice(marker + 4);
                reqHeader = reqBuffer.slice(0, marker).toString();
                this._socket.unshift(remaining);
                break;
            }
        }

        const reqHeaders = reqHeader.split("\r\n");
        const reqLine = reqHeaders.shift().split(" ");

        this._setMethod(reqLine[0]);
        this._setPath(reqLine[1]);
        this._setHttpVersion(reqLine[2]);

        reqHeaders.map((raw) => {
            const [name, value] = raw.split(": ");
            this._setHeader(name, value);
        });
    }
}

module.exports = Request;