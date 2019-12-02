import * as restify from 'restify';
import {BadRequestError} from 'restify-errors';

const mpContentType = 'application/merge-patch+json';

export const mergePatchBodyParser = (req: restify.Request, resp: restify.Response, next) =>{
    if(req.contentType() === mpContentType && req.method === 'PATCH'){
        try {
            (<any>req).rawBody = req.body;
            req.body = JSON.parse(req.body);
        } catch (error) {
            return next(new BadRequestError(`Invalide Content: ${error.message}`));
        }
    }
    return next();
};