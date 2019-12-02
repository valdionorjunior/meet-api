import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import {validateCPF} from  '../common/validators';
import {environment} from '../common/environment';

//controle statico
export interface User extends mongoose.Document{
    name: string;
    email: string,
    password: string,
    cpf: string,
    gender: string,
    profiles: string[], //perfis de acesso
    matches(password: string): boolean, // adicionamos o metodo de instancia para ficar disponivel
    hasAny(...profiles: string[]): boolean // dados os perfis(parametros), se conter ao menos um return tru
    //hasAny['admin', 'user', ... ]; o operador "..." faz com que possa passar também os lelementos diretamente, ao invés do array
};

export interface UserModel extends mongoose.Model<User>{
    findByEmail(email: string, projection?: string): Promise<User>
}

//Squema de coletion no Mongo
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 80,
        minlength: 3
    },
    email: {
        type: String,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        required: true
    },
    password: {
        type: String,
        select: false,
        required: true
    },
    gender:{
        type: String,
        required: false,
        enum:['Male','Female'],

    },
    cpf:{
        type: String,
        required: false,
        validate: { //validador personaliado
            validator: validateCPF,//função validadora 
            message: '{PATH}: Invalid CPF: ({VALUE}).'
        }
    },
    profiles:{
        type: [String],
        required: false
    }
});

//metodo associado ao model
//não usamos areo functions pois precisamos que o metodo faça dinamicamente o bind this
//  
userSchema.statics.findByEmail = function(email: string, projection: string){
    return this.findOne({email}, projection) //{email: email}
}

//metodo de instancia
//não usamos areo functions pois precisamos que o metodo faça dinamicamente o bind this
userSchema.methods.matches = function(password: string): boolean{
    return bcrypt.compareSync(password, this.password); //compara o hash criado com o password passado pelo usuario (gera outro hash ara o passor passado e coimpara com o trazido)
}

userSchema.methods.hasAny = function(...profiles: string[]): boolean { //verifica se há lagum perfil no usuario
    return profiles.some(profiles => this.profiles.indexOf(profiles)!== -1);
}

const hashPassword = (obj, next)=>{
    bcrypt.hash(obj.password, environment.security.saltRounds)
    .then( hash =>{
        obj.password = hash;
        next();
    }).catch(next);
}

const saveMiddleware = function (next){ //middleware para documentos
    const user: User = (<User>this);
    if(!user.isModified('password')){
        next();
    }else{//emcriptografa o password
        hashPassword(user, next);
    }
};

const updateMiddleware = function (next){
    if(!this.getUpdate().password){
        next();
    }else{//emcriptografa o password
        hashPassword(this.getUpdate(), next);
    }
};

userSchema.pre('save',saveMiddleware);
userSchema.pre('findOneAndUpdate', updateMiddleware);
userSchema.pre('update', updateMiddleware);

//Manipulador dos dados no mongo
// foi associado o conteudo do retorno a um contrato de interface
export const User = mongoose.model<User, UserModel>('User', userSchema);