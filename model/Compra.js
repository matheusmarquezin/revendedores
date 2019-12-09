
var ObjectId = require('mongodb').ObjectID;

class Compra {
    //cria novo objeto compra
    constructor(compra) {
        var _id;
        var codigo;
        var valor;
        var data;
        var status;
        var porcentagemCashback;
        var valorCashback;
        var revendedor;
        //preenche dados da compra informados na criação do objeto
        if (compra) {
            this._id = ObjectId(compra._id);
            this.codigo = compra.codigo;
            this.valor = compra.valor;
            this.data = compra.data;
            this.porcentagemCashback = compra.porcentagemCashback;
            this.valorCashback = compra.valorCashback;
            this.status = compra.status;
            this.revendedor = ObjectId(compra.revendedor);
        }
    }
    //metodo utilizado para gravar as informações no mongo
    getCompraDb() {
        return {
            "_id": ObjectId(this._id),
            "codigo": this.codigo,
            "valor": this.valor, 
            "data": this.data, 
            "status": this.status, 
            "porcentagemCashback": this.porcentagemCashback, 
            "valorCashback": this.valorCashback,
            "revendedor": ObjectId(this.revendedor)
        };
    }
    //metodo utilizado para customizar a visualização da compra quando é listada para o usuario
    toJsonReturn(){
        return {
            "_id": ObjectId(this._id),
            "codigo": this.codigo,
            "valor": this.valor, 
            "data": this.data, 
            "status": this.status, 
            "porcentagemCashback": (this.porcentagemCashback * 100) +'%', 
            "valorCashback": this.valorCashback,
            "revendedor": ObjectId(this.revendedor)
        };
    }
}
module.exports = Compra;