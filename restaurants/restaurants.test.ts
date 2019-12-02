import 'jest';
import * as request from 'supertest';
const auth: string = (<any> global).auth;

let address: string = (<any>global).address;

test('get /restaurants', () => {
    return request(address)
        .get('/restaurants')
        .set('Authorization', auth) //repassando o token para autorização https
        .then(response =>{
            expect(response.status).toBe(200);
            expect(response.body.items).toBeInstanceOf(Array);
        })
        .catch(fail);
});

test('post /restaurants', ()=>{
    return request(address)
        .post('/restaurants')
        .set('Authorization', auth) //repassando o token para autorização https
        .send({
            name: 'test do caldeirão'
        })
        .then(response =>{
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined();
            expect(response.body.name).toBe('test do caldeirão')
        }).catch(fail);
})

test('put /restaurants/:id', ()=>{
    return request(address)
        .post('/restaurants')
        .set('Authorization', auth) //repassando o token para autorização https
        .send({
            name: 'test do caldeirão'
        })
        .then(response => request(address)
            .put(`/restaurants/${response.body._id}`)
            .set('Authorization', auth) //repassando o token para autorização https
            .send({
                name: 'Acarajé Nordestino'
            }))
        .then(response =>{
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined();
            expect(response.body.name).toBe('Acarajé Nordestino');
        })
        .catch(fail);
});

test('patch /restaurants/:id', ()=>{
    return request(address)
        .post('/restaurants')
        .set('Authorization', auth) //repassando o token para autorização https
        .send({
            name: 'test do caldeirão'
        })
        .then(response => request(address)
            .patch(`/restaurants/${response.body._id}`)
            .set('Authorization', auth) //repassando o token para autorização https
            .send({
                name: 'Acarajé Nordestino',
                menu:[{name:'macarrão', price: '99'}]
            }))
        .then(response =>{
            // console.log(response.body)//aqui um bom exemplo pra veriricar se realmente esta vindo o menu
            expect(response.status).toBe(200);
            expect(response.body._id).toBeDefined();
            expect(response.body.name).toBe('Acarajé Nordestino');
        })
        .catch(fail);
});

// test('', ()=>{

// });
