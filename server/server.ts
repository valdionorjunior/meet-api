import * as fs from  'fs';
import * as restify from 'restify';
import * as mongoose from 'mongoose';

import {environment} from '../common/environment';
import {Router} from '../common/router';
import {mergePatchBodyParser} from './merge-patch.parser';
import {handleError} from './error.handler';
import {logger} from '../common/logger';

//repassa o token para o servidor
import { tokenPerser } from '../security/token.parser';
import corsMiddleware = require('restify-cors-middleware');

export class Server{

  application: restify.Server;

  //Concecção com o Banco
  initalizeDb() { 
   (<any>mongoose).Promise = global.Promise
    mongoose.set('useFindAndModify', false);
    return mongoose.connect(environment.db.url, { useNewUrlParser: true, useUnifiedTopology: true });
  };

  initRoutes( routers: Router[]): Promise<any> {
    return new Promise((resolve, reject) =>{
      try{

        const opstions: restify.ServerOptions= {
          name: 'meet-api',
          version: '1.0.0',
          log: logger
        }

        //se https estiver sendo usado atribui propriedade e valores do certificado para serem enviadas à requisição
        if(environment.security.enableHTTPS){
          opstions.certificate = fs.readFileSync(environment.security.certificate),
          opstions.key = fs.readFileSync(environment.security.key)
        }

        this.application = restify.createServer(opstions);

        //tratamenbto de cors
        const corsOptions: corsMiddleware.Options={
          preflightMaxAge: 10, //Optional
          origins: ['*'],
          allowHeaders: ['authorization'],
          exposeHeaders: ['x-custom-headers']
        }

        const cors: corsMiddleware.CorsMiddleware = corsMiddleware(corsOptions);

        this.application.pre(cors.preflight);
        this.application.pre(restify.plugins.requestLogger({
          log: logger
        }));

        this.application.use(cors.preflight);
        //fim config cors
        
        //Configurando o metodo logger nas requisições da aplicação
        this.application.pre(restify.plugins.requestLogger({
          log: logger
        }));

        this.application.use(restify.plugins.queryParser());
        this.application.use(restify.plugins.bodyParser()); //transforma o body para
        this.application.use(mergePatchBodyParser); //muda o contentType do metodo  patch
        this.application.use(tokenPerser); //repassa o token para o servidor -> ficnado disponivle em todo request

        //Routers
        for ( let router of routers){
          router.applyRoutes(this.application);
        }
        //fim Routers

        this.application.listen(environment.server.port, ()=>{
          resolve(this.application);
        });

        this.application.on('restifyError', handleError);
        //audit logger
        // //assinatura (req, resp, route, error)
        // this.application.on('after', restify.plugins.auditLogger({
        //   log: logger,
        //   event: 'after',
        //   server: this.application
        // }));

        // this.application.on('audit', data=>{
        //   //aqui podemos manipular também os logs do audit logger;
        // });

      }catch(error){
        reject(error);
      }
    });
  }

  bootstrap( routers: Router[] = []): Promise<Server>{
    // return this.initRoutes(routers)
    // .then(()=> this);
    return this.initalizeDb().then(()=>
      this.initRoutes(routers)
        .then(()=> this));
  }

  shutdown(){
    return mongoose.disconnect()
                   .then(()=>this.application.close());
  }

}
