import * as fs from 'fs'

import * as restify from 'restify'
import * as mongoose from 'mongoose'
import * as corsMiddleware from 'restify-cors-middleware'

import { environment } from '../common/environment'
import { Router } from '../common/router'
import { mergePatchBodyParser } from './merge-patch.parser'
import { handleError } from './error.handler'
import { tokenParser } from '../security/token.parser';
import { logger } from '../common/logger';

export class Server {

    application: restify.Server;

    initializeDb(): mongoose.MongooseThenable {
        (<any>mongoose).Promise = global.Promise
        return mongoose.connect(environment.db.url, {
            useMongoClient: true
        })
    }

    initRoutes(routers: Router[]): Promise<any> {
        return new Promise((resolve, reject) => {
            try {

                const options: restify.ServerOptions = {
                    name: 'meat-api',
                    version: '1.0.0',
                    log: logger
                }
                if(environment.security.enableHTTPS){
                    options.certificate = fs.readFileSync(environment.security.certificate),
                    options.key = fs.readFileSync(environment.security.key)
                }

                this.application = restify.createServer(options)

                const corsOptions: corsMiddleware.Options = {
                    preflightMaxAge: 10,
                    origins: ['*'],
                    allowHeaders: ['authorization'],
                    exposeHeaders: ['x-custom-header']
                }

                const cors: corsMiddleware.CorsMiddleware = corsMiddleware(corsOptions)

                this.application.pre(cors.preflight)

                this.application.pre(restify.plugins.requestLogger({
                    log: logger
                }))

                this.application.use(cors.actual)
                this.application.use(restify.plugins.queryParser())
                this.application.use(restify.plugins.bodyParser())
                this.application.use(mergePatchBodyParser)
                this.application.use(tokenParser)

                //routes

                for (let router of routers) {
                    router.applyRoutes(this.application)
                }


                /*this.application.get('/hello', (req, resp, next) => {
                    //resp.contentType = 'application/json';
                    //resp.status(400);
                    //resp.setHeader('Content-Type', 'application/json');
                    //resp.send({message: 'hello'})
                    resp.json({ message: 'hello' })
                    return next()
                })
                
                this.application.get('/info', [
                    (req, resp, next) => {
                        if (req.userAgent() && req.userAgent().includes('MSIE 7.0')) {
                            //resp.status(400)
                            //resp.json({ message: 'Please, update your browser' })
                            let error: any = new Error()
                            error.statusCode = 400;
                            error.message = 'Please, update your browser'
                            return next(error)
                        }
                        return next()
                    },
                    (req, resp, next) => {
                        resp.json({
                            browser: req.userAgent(),
                            method: req.method,
                            url: req.href(),
                            path: req.path(),
                            query: req.query
                
                        })
                        return next()
                    }])*/

                this.application.listen(environment.server.port, () => {
                    resolve(this.application)
                })
                this.application.on('restifyError', handleError)
                /*this.application.on('after', restify.plugins.auditLogger({
                    log: logger,
                    event: 'after',
                    server: this.application
                }))

                this.application.on('audit', data => {

                })*/
            } catch (error) {
                reject(error)
            }
        })
    }
    bootstrap(routers: Router[] = []): Promise<Server> {
        return this.initializeDb().then(() => this.initRoutes(routers).then(() => this))
    }

    shutDown() {
        return mongoose.disconnect().then(() => this.application.close())
    }
}