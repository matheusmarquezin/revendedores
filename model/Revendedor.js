
var ObjectId = require('mongodb').ObjectID;

class Revendedor {
    constructor(revendedor) {
        var _id;
        var nome;
        var email;
        var cpf;
        var password;

        if (revendedor) {
            this._id = ObjectId(revendedor._id);
            this.nome = revendedor.nome;
            this.email = revendedor.email;
            this.cpf = revendedor.cpf;
            this.password = revendedor.password;
        }
    }

    getRevendedorDb() {
        return {
            "_id": ObjectId(this._id),
            "nome": this.nome,
            "email": this.email, 
            "password": this.password, 
            "cpf": this.cpf
        };
    }
}
module.exports = Revendedor;