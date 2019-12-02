// import {Router} from '../common/router'
import {ModelRouter} from '../common/model.router'
import * as restify from 'restify'
import { User } from './users.model';
import { authenticate } from '../security/auth.handler';
import { authorize } from '../security/authz.hendler';//força os perfis e authenticação

class UsersRouter extends ModelRouter<User>{

    //Ouvindo evento para 
    constructor(){
        super(User);
        this.on('beforeRender', document=>{
            document.password = undefined;
            // delete documento.password on call method get for user
        });
        
    }

    findByEmail = (req, resp, next) =>{
        if(req.query.email){
            User.findByEmail(req.query.email)
                .then(user => user ? [user]: [])
                .then(this.renderAll(resp, next, {
                    pageSize: this.pageSize,
                    url: req.url
                }))
                .catch(next);
        }else{
            next();
        }
    }

    applyRoutes(application: restify.Server){
        application.get({path:`${this.basePath}`, version:'2.0.0'}, [authorize('admin'), this.findByEmail, this.findAll]);
        application.get({path:`${this.basePath}`, version:'1.0.0'}, [authorize('admin'), this.findAll]);
        // application.get('/users', this.findAll);
        application.get(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.findById]);
        application.post(`${this.basePath}`, [authorize('admin'), this.save]);
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace]);
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update]);
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.deleteOne]);
        
        //registro de autenticação
        application.post(`${this.basePath}/authenticate`,authenticate);
    }
} 

export const usersRouter = new UsersRouter();