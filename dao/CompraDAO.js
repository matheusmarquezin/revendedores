var Compra = require("../model/Compra.js");

var revendedorDAOClass = require("../dao/RevendedorDAO.js");
var revendedorDAO;

class CompraDAO {

    constructor(connection) {
        this.connection = connection;
    }
    validarDadosCompra(compra,cb){
        if(!compra){
            cb('Informações inválidas!',null);
        }
        if(!compra.codigo){
            cb('codigo inválido!',null)
        }
        if(!compra.valor){
            cb('valor inválido!',null)
        }
        if(!compra.data){
            cb('data inválida!',null)
        }
        if(!compra.cpf){
            cb('cpf inválido!',null)
        }else{
            revendedorDAO = new revendedorDAOClass(this.connection)
            revendedorDAO.getRevendedorPorCPF(compra.cpf, (err,resultado)=>{
                if(err || !resultado){
                    cb('Não existe nenhum revendedor cadastrado com este cpf!',null)
                }else if (resultado){
                    cb(null,resultado._id)
                }
            })
        }
    }
    addCompra(compra, cb) {
        this.validarDadosCompra(compra, (err,id_revendedor) => {
            if (err) {
                cb(err, null)
            }else{
                compra.revendedor = id_revendedor;

                if(compra.cpf == '153.509.460-56'){
                    compra.status = 'Aprovado';
                }else{
                    compra.status = 'Em validação';
                }

                var nova_compra = new Compra(compra);

                this.connection.collection("compras").insertOne(nova_compra.getCompraDb(), function (err, res) {
                    cb(err, res.ops[0]._id)
                });
            }
        })
                       
    }
}
module.exports = CompraDAO;