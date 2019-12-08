
var ObjectId = require('mongodb').ObjectID;

class Compra {
    constructor(compra) {
        var _id;
        var codigo;
        var valor;
        var data;
        var status;
        var revendedor;

        if (compra) {
            this._id = ObjectId(compra._id);
            this.codigo = compra.codigo;
            this.valor = compra.valor;
            this.data = compra.data;
            this.status = compra.status;
            this.revendedor = ObjectId(compra.revendedor);
        }
    }

    getCompraDb() {
        return {
            "_id": ObjectId(this._id),
            "codigo": this.codigo,
            "valor": this.valor, 
            "data": this.data, 
            "status": this.status, 
            "revendedor": ObjectId(this.revendedor)
        };
    }
}
module.exports = Compra;