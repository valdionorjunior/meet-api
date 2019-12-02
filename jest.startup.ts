import * as jestcli from 'jest-cli';

import 'jest';
import {Server} from './server/server';
import {environment} from './common/environment';
import {reviewsRouter} from './reviews/reviews.router';
import {Review} from './reviews/reviews.model';
import {usersRouter} from './users/users.router';
import {User} from './users/users.model';
import {restaurantsRouter} from './restaurants/restaurants.router';
import {Restaurant} from './restaurants/restaurants.model';

let server : Server;

const beforeAllTests = () =>{
    environment.db.url = process.env.DB_URL || 'mongodb+srv://junior:bwi280281@cluster0-58kv2.gcp.mongodb.net/dev-meet-tests?retryWrites=true&w=majority';
    environment.server.port = process.env.SERVER_PORT || 3001;
    server= new Server();
    return server.bootstrap([usersRouter, reviewsRouter, restaurantsRouter])
                 .then(() => User.remove({}).exec())
                 .then(() =>{//usuario padrao
                    let admin = new User();
                    admin.name = 'Admin',
                    admin.email = 'admin@admin.com',
                    admin.password = 'admin',
                    admin.profiles = ['admin', 'user']
                    return admin.save();
                 })
                 .then(() => Review.remove({}).exec())
                 .then(() => Restaurant.remove({}).exec())
                //  .catch(console.error);
};

const afterAllTests = () =>{
    return server.shutdown();
};

beforeAllTests()
.then(()=>jestcli.run())
.then(()=>afterAllTests())
.catch(console.error);