import { Router } from "./router";
import * as mongoose  from "mongoose";
import { NotFoundError} from 'restify-errors';

export abstract  class ModelRouter<D extends mongoose.Document> extends Router {
    
    basePath: string;

    //propriedades de paginação
    pageSize: number = 4;

    constructor(protected model: mongoose.Model<D>) {
        super();
        this.basePath = `/${model.collection.name}`; //base de link pelo nome das colections do banco
    }
    
    protected preperOne(query: mongoose.DocumentQuery<D,D>): mongoose.DocumentQuery<D,D>{
        return query;
    } 

    envelope(document: any){
        let resource = Object.assign({_links:{}}, document.toJSON());
        resource._links.self = `${this.basePath}/${resource._id}`; //puxa o nome da coleção do banco para a url
        return resource;
    }

    envelopAll(documents: any[], options: any ={}) : any{
        const resource: any ={
            _links:{
                self: `${options.url}`
            },
            items: documents
        } 
        if(options.page && options.count && options.pageSize){
            if(options.page > 1){
                resource._links.previous = `${this.basePath}?_page=${options.page-1}`;
            }
            
            //calculo para quantidade de elementos
            const remining = options.count - (options.page * options.pageSize);

            if(remining > 0){
                resource._links.next = `${this.basePath}?_page=${options.page+1}`;
            }
        }
        return resource;
    };

    validateId = (req, resp, next)=>{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            next( new NotFoundError('Document Nor Found.') );
        }else{
            next();
        }
    };

    findAll = (req, resp, next)=>{
        //variavel que pega a provavel pagina que passarmos caso queiramos uma pagina especifica
        let page = parseInt(req.query._page || 1); //começa da primeira pagina ou pagina 0;
        page = page > 0 ? page : 1;

        //Skip - > calculo para pular para outra pagina pegando aparti dos proximos elemetos que n estao na pagian
        const skip = (page -1) * this.pageSize;
        
        //conta todos os item para calculo de qtd de paginas
        this.model.count({}).exec()
        .then(count => 
        // resp.json({message: 'users router'})
            this.model.find()
            .skip(skip)//quantidade de elementos pular por pagina
            .limit(this.pageSize) //limita o numero de registro de acordo a quantidade por pagina
            .then( //this.model -> usamo o this pois a classe não é concreta e sim abstrata
                //     users =>{
                //     resp.json(users);
                //     return next();
                // } enchugado pela loinha abaixo
                this.renderAll(resp, next, {
                    page, count, pageSize: this.pageSize, url: req.url
                })))
        .catch(next);
    };

    findById =  (req, resp, next)=>{
        this.preperOne(this.model.findById(req.params.id))
        .then( //this.model -> usamo o this pois a classe não é concreta e sim abstrata
        //     user =>{
        //     if(user){
        //         resp.json(user);
        //         return next();
        //     }
        //     resp.send(404);
        //     return next();
        // } enxugado pela linha abaixo
        this.render(resp, next)
        ).catch(next);
    };

    save =  (req, resp, next)=>{
        // let user = new User(req.body);
        let document = new this.model(req.body);
        document.save().then(
        //     user =>{
        //     user.password = undefined; //limpar o password na respota
        //     resp.json(user);
        //     return next();
        // } enxugado pela linha abaixo
        this.render(resp, next)
        ).catch(next);
    };

    replace = (req, resp, next)=>{
        const options = {runValidators: true, overwrite: true};
        this.model.update({_id: req.params.id}, req.body, options)
        .exec().then(result =>{
            if(result.n){
                return this.preperOne(this.model.findById(req.params.id));
            }else{
                // resp.send(404);
                throw new NotFoundError('Documento não encontrado.');
            }
        }).then(
        //     user =>{
        //     resp.json(user);
        //     return next();
        // } enxugado
        this.render(resp, next)
        ).catch(next);
    };

    update =(req, resp, next)=>{
        const options = {runValidators: true, new : true};
        this.model.findByIdAndUpdate(req.params.id, req.body, options)
        .then(
        //     user =>{
        //     if(user){
        //         resp.json(user);
        //         return next();
        //     }
        //     resp.send(404);
        //     return next();
        // }enxugado pela linha abaixo
        this.render(resp, next)
        ).catch(next);
    };

    deleteOne = (req, resp, next)=>{
        // this.model.remove({ _id: req.params.id }) remove foi depreciado entrou deleteOne
        this.model.deleteOne({ _id: req.params.id })
        .exec().then(cmdResult =>{
            if(cmdResult.n){
                resp.send(204);
            }else{
                // resp.send(404);
                throw new NotFoundError('Documento não encontrado.');
            }
            return next();
        }).catch(next);
    };
}