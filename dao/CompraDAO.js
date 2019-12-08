var Compra = require("../model/Compra.js");

var revendedorDAOClass = require("../dao/RevendedorDAO.js");
var revendedorDAO;
var ObjectId = require('mongodb').ObjectID;

class CompraDAO {

    constructor(connection) {
        this.connection = connection;
        this.status = ['Aprovado', 'Em validação']
    }
    validarDadosCompra(compra,cb){
        if(!compra){
            cb('Informações inválidas!',null);
            return;
        }
        if(!compra.codigo){
            cb('codigo inválido!',null)
            return;
        }
        if(!compra.valor || !parseFloat(compra.valor)){
            cb('valor inválido!',null)
            return;
        }
        if(!compra.data){
            cb('data inválida!',null)
            return;
        }
        if(!compra.cpf){
            cb('cpf inválido!',null)
            return;
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

    verificarPorcentagemCashback(valor){
        var porcentagem = 0;
        if(valor){
            if(valor <= 1000){
                porcentagem = 0.1;
            }else if(valor <= 1500){
                porcentagem = 0.15;
            }else{
                porcentagem = 0.20;
            }
        }
        return porcentagem;
    }
    calculaCashback(valor,porcentagem){
        return valor + (valor * porcentagem)
    }

    addCompra(compra, cb) {
        this.validarDadosCompra(compra, (err,id_revendedor) => {
            if (err) {
                cb(err, null)
            }else{
                compra.revendedor = id_revendedor;
                compra.valor = parseFloat(compra.valor);
                if(compra.cpf == '153.509.460-56'){
                    compra.status = this.status[0];
                }else{
                    compra.status = this.status[1];
                }
                compra.porcentagemCashback = this.verificarPorcentagemCashback(compra.valor);
                compra.valorCashback = this.calculaCashback(compra.valor, compra.porcentagemCashback);
                var nova_compra = new Compra(compra);

                this.connection.collection("compras").insertOne(nova_compra.getCompraDb(), function (err, res) {
                    cb(err, res.ops[0]._id)
                });
            }
        })           
    }
    getCompraPorId(id, cb) {
        this.connection.collection("compras").findOne({ "_id": ObjectId(id) }, function (err, compraBanco) {
            var compra = null;
            if(compraBanco){
                compra = new Compra(compraBanco);
            }
            cb(err, compra)
        });
    }
    updateCompra(compra, cb) {
        this.getCompraPorId(compra._id,(err,compraBanco)=>{
            console.log(err)
            if(!err && compraBanco.status != this.status[0]){
                compra.porcentagemCashback = this.verificarPorcentagemCashback(compra.valor);
                compra.valorCashback = this.calculaCashback(compra.valor, compra.porcentagemCashback);

                revendedorDAO = new revendedorDAOClass(this.connection)
                revendedorDAO.getRevendedorPorId(compra.revendedor, (err,resultado)=>{
                    if(err || !resultado){
                        cb('Revendedor não existe!',null)
                    }else if (resultado){
                        compra.revendedor = resultado._id;
                        if(resultado.cpf == '153.509.460-56'){
                            compra.status = this.status[0];
                        }else{
                            compra.status = this.status[1];
                        }
                        var newvalues = {
                            $set: compra.getCompraDb()
                        }
                        this.connection.collection("compras").updateOne({ "_id": compra.getCompraDb()._id }, newvalues, function (err, res) {
                            cb(err, res);
                        });
                    }
                })
            }else{
                cb('Você não pode atualizar uma compra com status :' +compra.status,null)
            }
        });
    }
}
module.exports = CompraDAO;