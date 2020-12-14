import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index.js';

chai.use(chaiHttp);
chai.should();

describe("Beers", () => {
    describe("Get beer list with valid email header", () => {
        // Test to get all students record
        it("should get all beers", (done) => {
            chai.request(app)
                .get('/beers')
                .set({"x-user": "patrickssj222@gmail.com"})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
    describe("Get beer list with invalid email header", () => {
        // Test to get all students record
        it("should fail with message", (done) => {
            chai.request(app)
                .get('/beers')
                .set({"x-user": "patrick"})
                .end((err, res) => {
                    res.should.have.status(500);
                    done();
                });
        });
    });
});