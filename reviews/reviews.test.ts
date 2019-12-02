import 'jest';
import * as request from 'supertest';
const auth: string = (<any> global).auth;

let address: string = (<any>global).address;

test('get /reviews', ()=> {
    return request(address)
        .get('/reviews')
        .set('Authorization', auth) //repassando o token para autorização https
        .then(response =>{
            expect(response.status).toBe(200);
            expect(response.body.items).toBeInstanceOf(Array);
        }).catch(fail);

});

test('post /reviews', ()=>{
    return request(address)
    .post('/reviews')
    .set('Authorization', auth) //repassando o token para autorização https
    .send({
        date: '2019-11-26T08:19:32',
        rating: 4,
        comments: 'Comentario sobre Test!',
        user : '5dd6d9ac22004430642807e1',
        restaurant : '5ddbd50e9419d44b40ef9322'
    })
    .then( response =>{
        expect(response.status).toBe(200);
        expect(response.body._id).toBeDefined();
        expect(response.body.date).toContain('2019-11-26T');
        expect(response.body.rating).toBe(4);
        expect(response.body.comments).toBe('Comentario sobre Test!');
        expect(response.body.user).toBeDefined();
        expect(response.body.restaurant).toBeDefined();  
    })
    .catch(fail);
});

test('get /reviews/aaaa - Not found', ()=> {
    return request(address)
        .get('/reviews/aaaa')
        .set('Authorization', auth) //repassando o token para autorização https
        .then(response =>{
            expect(response.status).toBe(404);
        }).catch(fail);

});