//responsavel por passar o token.

import * as restify from 'restify';
import * as jwt from 'jsonwebtoken';
import {User} from '../users/users.model';
import { environment } from '../common/environment';

export const tokenPerser: restify.RequestHandler = (req, resp, next) =>{
    const token = extractToken(req);// extrai o token da requisição
    if(token){
       jwt.verify(token, environment.security.apiSecret, applyBearer(req, next));//verifica se o token é valido(usando a chate de assinatura)
    }else{
        next();
    }
};

function extractToken(req: restify.Request){
    //iremos esperar que o token venha como header
    //Authorization: Bearer ' ' TOKEN
    let token = undefined;
    const authorization = req.header('authorization');
    if(authorization){// separamos somente o token para uma variavel
        const parts: string [] = authorization.split(' ');
        if(parts.length === 2 && parts[0] === 'Bearer'){
            token = parts[1];
        }
    }
    return token;
}   

function applyBearer(req: restify.Request, next): (error, decoded) => void{
    return (error, decoded) =>{ //verifica se o token foi codificado
       if(decoded){
            User.findByEmail(decoded.sub).then(user=>{
                if(user){//verifica se usuario é valido associa usuario no request
                    //cria uma nova propriedade passando o usuario // registado no index.d.ts
                    req.authenticated = user;
                }
                next();
            }).catch(next);
       }else{
           next();
       }
    }
}