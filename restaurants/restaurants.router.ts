import {ModelRouter} from '../common/model.router'
import * as restify from 'restify'
import { Restaurant } from './restaurants.model';
import { NotFoundError } from 'restify-errors';
import { authorize } from '../security/authz.hendler';

class RestaurantsRouter extends ModelRouter<Restaurant>{
   
    constructor() {
        super(Restaurant);
    }

    //incorporando link para menu.
    envelope(document: any){
        let resource = super.envelope(document);
        resource._links.menu = `${this.basePath}/${resource._id}/menu`; //puxa o nome da coleção do banco para a url
        return resource;
    }

    findMenu = (req, resp, next) => {
        Restaurant.findById(req.params.id, "+menu")//indicamos que queremos trazer a propriedade menu para o mogoose.
            .then(rest => {
                if(!rest){
                    throw new NotFoundError('Restaurante não encontrado!');
                }else{
                    resp.json(rest.menu);
                    return next();
                }
            }).catch(next);
    };

    replaceMenu = ( req, resp, next) =>{
        Restaurant.findById(req.params.id)
            .then( rest =>{
                if(!rest){
                    throw new NotFoundError('Restaurante não encontrado!');
                }else{
                    rest.menu = req.body; // arry de menu item
                    return rest.save();
                }
            }).then(rest =>{
                resp.json(rest.menu);
                return next();
            }).catch(next);
    };

    applyRoutes(application: restify.Server){
        application.get(`${this.basePath}`, this.findAll);
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
        application.post(`${this.basePath}`, [authorize('admin'), this.save]);
        application.put(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.replace]);
        application.patch(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.update]);
        application.del(`${this.basePath}/:id`, [authorize('admin'), this.validateId, this.deleteOne]);

        application.get(`${this.basePath}/:id/menu`, [this.validateId, this.findMenu]);
        application.put(`${this.basePath}/:id/menu`, [this.validateId, this.replaceMenu]);
    }

}

export const restaurantsRouter = new RestaurantsRouter();