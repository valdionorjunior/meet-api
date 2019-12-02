import * as restify from 'restify';
import * as jwt from 'jsonwebtoken';
import {NotAuthorizedError} from 'restify-errors';
import {User} from '../users/users.model';
import { environment } from '../common/environment';

export const authenticate: restify.RequestHandler = (req, resp, next) => {
    const {email, password} = req.body;

    User.findByEmail(email, '+password')//essa string +password indica de irá trazer o campo passord
    .then(user =>{
        if(user && user.matches(password)){//usamos om method de instancia para comparar os password (em hash)
            //gera token;
            const token = jwt.sign(//criar o token carregando as informaçoes (chaves para seren registradas, usuario, tempo do token, quem criou o token(chave de assinatura))
                {sub: user.email, iss:'meet-api-secret'},
                environment.security.apiSecret);
            resp.json({name: user.name, email: user.email, accessToken: token}); 
            return next(false);
        } else{
            return next(new NotAuthorizedError('Credenciais inválidas!'));
        }
    }).catch(next);
};