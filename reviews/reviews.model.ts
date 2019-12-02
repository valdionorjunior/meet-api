import * as mongoose from "mongoose";
import { Restaurant } from "../restaurants/restaurants.model";
import { User } from "../users/users.model";

export interface Review extends mongoose.Document{
    date: Date,
    rating: number,
    comments: string,
    restaurant: mongoose.Types.ObjectId | Restaurant, //podemos pegar o ObjectId ou o proprio Documento
    user: mongoose.Types.ObjectId | User //podemos pegar o ObjectId ou o proprio Documento
}

const rewiewSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    rating:{
        type: Number,
        required: true
    },
    comments:{
        type: String,
        required: true,
        maxlength: 500
    },
    restaurant:{
        type: mongoose.Schema.Types.ObjectId, //passamos a referencia ao dado que queremos, 
        ref:'Restaurant',//modelo para referencia
        required: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId, //passamos a referencia ao dado que queremos, 
        ref:'User',//modelo para referencia
        required: true,
    }
});

export const Review = mongoose.model<Review>('Review', rewiewSchema);