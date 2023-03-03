import {Readability} from "@mozilla/readability";
import http from "http";
import url from 'url';
import {JSDOM} from "jsdom";

console.time('start WebServer need time');
const server = http.createServer();

server.on('request', onRequest)
server.on('error', onError)

server.listen(3456, function () {
    console.log("server listen on 3456")
    console.timeEnd('start WebServer need time');
});

function onRequest(req, res) {
    let path = url.parse(req.url).pathname
    switch (path) {
        case '/content':
            onContent(req, res)
            break

        default:
            res.end("hello world.")
    }
}

function onError(err) {
    console.log(err)
}

function onContent(req, res) {
    if (req.method !== "POST") {
        res.writeHead(405)
        res.end('method not allowed')
        return
    }

    let post = '';
    req.on('data', (chunk) => {post += chunk})
    req.on('end', () => {
        res.writeHead(200, {'Content-Type': 'application/json'});

        let content = JSON.parse(post).content || ""
        console.log("receive content: %d", String(content).length)
        if (content === "") {
            return res.end('{}')
        }

        let doc = new JSDOM(content);
        let article = new Readability(doc.window.document, {debug: false}).parse()

        res.end(JSON.stringify(article))
    })
}

