"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const environment_1 = require("../common/environment");
class Server {
    initRoutes() {
        return new Promise((resolve, reject) => {
            try {
                this.application = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0'
                });
                this.application.use(restify.plugins.queryParser());
                this.application.get('/hello', (req, resp, next) => {
                    //resp.contentType = 'application/json';
                    //resp.status(400);
                    //resp.setHeader('Content-Type', 'application/json');
                    //resp.send({message: 'hello'})
                    resp.json({ message: 'hello' });
                    return next();
                });
                this.application.get('/info', [
                    (req, resp, next) => {
                        if (req.userAgent() && req.userAgent().includes('MSIE 7.0')) {
                            //resp.status(400)
                            //resp.json({ message: 'Please, update your browser' })
                            let error = new Error();
                            error.statusCode = 400;
                            error.message = 'Please, update your browser';
                            return next(error);
                        }
                        return next();
                    },
                    (req, resp, next) => {
                        resp.json({
                            browser: req.userAgent(),
                            method: req.method,
                            url: req.href(),
                            path: req.path(),
                            query: req.query
                        });
                        return next();
                    }
                ]);
                this.application.listen(environment_1.environment.server.port, () => {
                    resolve(this.application);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    bootstrap() {
        return this.initRoutes().then(() => this);
    }
}
exports.Server = Server;
