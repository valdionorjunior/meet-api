import * as mongoose from "mongoose";

export interface MenuItem extends mongoose.Document{
    name: string,
    price: number
}

export interface Restaurant extends mongoose.Document{
    name: string,
    menu: MenuItem[]
}

const menuSchema = new mongoose.Schema({ //schema do menu para banco
    name:{
        type: String,
        required: true 
    },
    price: {
        type: Number,
        required: true
    }
});

const restSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    menu:{
        type: [menuSchema],//passo a referencia do sshema do menu para que o mongoose valide colocando um array do menuSchema
        require: false,
        select: false,// por default não trazemos o menu nas queries
        default: [] 
    }
});

export const Restaurant = mongoose.model<Restaurant>('Restaurant', restSchema);