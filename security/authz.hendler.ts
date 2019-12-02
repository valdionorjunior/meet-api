// responsável por forçar o usuario a fazer parte de um perfil e ha está autenticado em alguns momentos

import * as restify from 'restify';
import {ForbiddenError} from 'restify-errors';

//recebe os pefies para verificar e autenticar, retorna um requestRender
export const authorize: (...profiles: string[]) => restify.RequestHandler = (...profiles) => {
    return (req, resp, next)=>{
        if(req.authenticated !== undefined && req.authenticated.hasAny(...profiles)){
            req.log.debug('User %s is authorized with profiles %j on route %s. Required profiles %j',//nivel de debug
                    req.authenticated._id,
                    profiles, req.authenticated.profiles,
                    req.path(),
                    profiles);
            next(); //pode passar pra frente
        }else{
            //pegando as referencias confiuradas para log no server
            if(req.authenticated){//se usuario for autenticado
                req.log.debug(
                    'Permission Denied for %s. Required profiles: %j. user profiles: %j.',//nivel de debug
                        req.authenticated._id, profiles, req.authenticated.profiles);
            }
            next(new ForbiddenError('(Pemossion Denied!) Credenciais Invalidas para acesso!'));
        }
    }
}
