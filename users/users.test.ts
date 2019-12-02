import 'jest';
import * as request from 'supertest';

const address: string = (<any>global).address;
const auth: string = (<any> global).auth;

test('get /users', ()=> {
    return request(address)
        .get('/users')
        .set('Authorization', auth) //repassando o token para autorização https
        .then(response =>{
            expect(response.status).toBe(200);
            expect(response.body.items).toBeInstanceOf(Array);
        }).catch(fail);
});

test('post /users', ()=>{
    return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({//metodo send é o corpo do post, passamos o objeto com os dados de envio
        name:  'usuario1',
        email: 'user@email.com',
        password: '123123123',
        cpf: '355.901.010-18'
    })
    .then(response =>{
        expect(response.status).toBe(200);
        expect(response.body._id).toBeDefined();
        expect(response.body.name).toBe('usuario1');
        expect(response.body.email).toBe('user@email.com');
        expect(response.body.password).toBeUndefined();
        expect(response.body.cpf).toBe('355.901.010-18');
    }).catch(fail);
});

test('get /users/aaaa - not found', () =>{
    return request(address)
    .get('/users/aaaa')
    .set('Authorization', auth)
        .then(response =>{
            expect(response.status).toBe(404);
        }).catch(fail);
});

test('patch /users:id', ()=>{
    return request(address)
    .post('/users')
    .set('Authorization', auth)
    .send({//metodo send é o corpo do post, passamos o objeto com os dados de envio
        name:  'usuario2',
        email: 'user2@email.com',
        password: '123123123'
    })
    .then(response => request(address)
                    .patch(`/users/${response.body._id}`)
                    .set('Authorization', auth)
                    .send({
                        name:'user2 - patch'
                    }))
    .then(response =>{
        expect(response.status).toBe(200);
        expect(response.body._id).toBeDefined();
        expect(response.body.name).toBe('user2 - patch');
        expect(response.body.email).toBe('user2@email.com');
        expect(response.body.password).toBeUndefined();
    }).catch(fail);
});
