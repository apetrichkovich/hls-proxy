const http = require("http");
const https = require("https");
const dns = require("dns");
const URL = require("url").URL;

const args = process.argv.slice(2);
const serverPort = parseInt(args[0] || 7700);
const USER_AGENT = "user-agent";
const CHROME_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36";
const HTTP_SLASH = "http://";
const HTTPS_SLASH = "https://";
const HTTPS_COLON = "https:";
const LOCALHOST_HTTP = "http://localhost:" + serverPort + "/http://";
const LOCALHOST_HTTPS = "http://localhost:" + serverPort + "/https://";
const END = "end";
const DATA = "data";
const EMPTY_STRING = "";
const M3U = ".m3u";
const M3U8 = ".m3u8";
const ACAO_HEADER = "access-control-allow-origin";
const CL_HEADER = "content-length";
const STAR = "*";
const STARS = "*/*";
const HTTP_PORT = 80;
const HTTPS_PORT = 443;
const SLASH = "/";
const STARTING_MESSAGE = "starting on port ";
const REQUEST_ERROR = "request error";
const GOOGLE = "www.google.com";

http.createServer(onRequest).listen(serverPort);
console.log(STARTING_MESSAGE + serverPort);

function onRequest(client_req, client_res) {
    try {
        const url = new URL(client_req.url.replace(SLASH, EMPTY_STRING));
        dns.resolve(GOOGLE, function(err) {
            if (err) {
                client_res.end(REQUEST_ERROR);
            } else {
                let headers = {
                    host: url.host,
                    accept: STARS
                };
                headers[USER_AGENT] = CHROME_USER_AGENT;

                const options = {
                    hostname: url.hostname,
                    port: (parseInt(url.port) || (url.protocol === HTTPS_COLON ? HTTPS_PORT : HTTP_PORT)),
                    path: url.pathname + url.search,
                    method: client_req.method,
                    headers: headers
                };

                const proxy = (url.protocol === HTTPS_COLON ? https : http).request(options, function (res) {
                    res.headers[ACAO_HEADER] = STAR;

                    const isM3uOrM3u8 = (url.pathname.endsWith(M3U) || url.pathname.endsWith(M3U8));
                    let body;
                    if (isM3uOrM3u8) {
                        body = EMPTY_STRING;
                        res.on(DATA, function (chunk) {
                            body += chunk;
                        });
                    } else {
                        client_res.writeHead(res.statusCode, res.headers);
                        res.pipe(client_res, {
                            end: true
                        });
                    }

                    res.on(END, function () {
                        if (isM3uOrM3u8) {
                            body = body.split(HTTP_SLASH).join(LOCALHOST_HTTP)
                                .split(HTTPS_SLASH).join(LOCALHOST_HTTPS);
                            res.headers[CL_HEADER] = body.length.toString();
                            client_res.writeHead(res.statusCode, res.headers);
                            client_res.end(body);
                        }
                    });
                });

                client_req.pipe(proxy, {
                    end: true
                });
            }
        });
    } catch (e) {
        client_res.end(REQUEST_ERROR);
    }
}