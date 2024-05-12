import fetch from "node-fetch";
import { expect } from "chai";

describe('Main page content', function () {
    it('Servidor funcionando',  function (done) {
        fetch('http://localhost:3000/')
            .then(res => {
                expect(res.status).to.equal(200)
                done()
            })
            .catch(err => {
                console.log(err)
                done(err)
            })
    })
});
