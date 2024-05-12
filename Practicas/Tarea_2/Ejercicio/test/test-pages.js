import fetch from "node-fetch";


describe('Main page content', function () {
    it('Servidor funcionando',  function () {
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
