import {ModelRouter} from '../common/model.router'
import * as restify from 'restify'
import * as mongoose  from "mongoose";
import { NotFoundError } from 'restify-errors';
import { Review } from './reviews.model';
import { authorize } from '../security/authz.hendler';

class ReviewsRouter extends ModelRouter<Review> {
    constructor() {
        super(Review);
    }

    protected preperOne(query: mongoose.DocumentQuery<Review,Review>): mongoose.DocumentQuery<Review,Review>{
        return query.populate('user', 'name')//traz os valores da referencia do ObjectID aqui traz somente o nome
                    .populate('restaurant');//traz os valores da referencia do ObjectID aqui traz tudo.
                    console.log('passou por aqui');
    } 

    //incorporando link para menu.
    envelope(document: any){
        let resource = super.envelope(document);
        const restId = document.restaurant._id ? document.restaurant._id : document.restaurant;
        resource._links.restaurant = `/restaurants/${restId}`; //puxa o nome da coleção do banco para a url
        return resource;
    }

    /*findById =  (req, resp, next)=>{
        this.model.findById(req.params.id)
        .populate('user', 'name')//traz os valores da referencia do ObjectID aqui traz somente o nome
        .populate('restaurant')//traz os valores da referencia do ObjectID aqui traz tudo.
        .then(this.render(resp, next)
        ).catch(next);
    };*/

    applyRoutes(application: restify.Server){
        application.get(`${this.basePath}`, this.findAll);
        application.get(`${this.basePath}/:id`, [this.validateId, this.findById]);
        application.post(`${this.basePath}`, [authorize('user'), this.save]);
        // application.put(`${this.basePath}/:id`, [this.validateId, this.replace]);
        // application.patch(`${this.basePath}/:id`, this.validateId, this.update);
        // application.del(`${this.basePath}/:id`, [this.validateId, this.deleteOne]);
    }
}

export const reviewsRouter = new ReviewsRouter();