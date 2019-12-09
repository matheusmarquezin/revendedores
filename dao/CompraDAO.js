var Compra = require("../model/Compra.js");

var revendedorDAOClass = require("../dao/RevendedorDAO.js");
var revendedorDAO;
var ObjectId = require('mongodb').ObjectID;

class CompraDAO {
    //Cria objeto CompraDAO informando a conexão do mongo
    constructor(connection) {
        this.connection = connection;
        //auxilia na mudança de status e validação
        this.status = ['Aprovado', 'Em validação']
    }
    //lista compras
    getCompras(cb) {
        //faz um busca no mongo de todas as compras
        this.connection.collection("compras").find({}).toArray(function (err, compras) {
            var resultado = [];
            //cria lista de compras com as informações customizadas pelo retorno do metodo toJsonReturn
            for(var index in compras){
                resultado.push(new Compra(compras[index]).toJsonReturn())
            }
            return cb(err, resultado);
        });
    }
    //verifica se todos os dados informados estão corretos, caso sim retorna _id do revendedor
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
            //busca _id do revendedor cadastrado no sistema
            revendedorDAO.getRevendedorPorCPF(compra.cpf, (err,resultado)=>{
                if(err || !resultado){
                    cb('Não existe nenhum revendedor cadastrado com este cpf!',null)
                }else if (resultado){
                    cb(null,resultado._id)
                }
            })
        }
    }
    //metodo para obter porcentagem de cashback de acordo com a documentação
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
    //calcula valor do cashback
    calculaCashback(valor,porcentagem){
        return (valor * porcentagem)
    }
    //cria nova compra
    addCompra(compra, cb) {
        //se todos os dados estive corretos este metodo vaibuscar o _id do revendedor cadastrado com o cpf informado
        this.validarDadosCompra(compra, (err,id_revendedor) => {
            if (err) {
                cb(err, null)
            }else{
                compra.revendedor = id_revendedor;
                compra.valor = parseFloat(compra.valor);
                //valida cpf informado na documentação pois quando é informado o status deve sempre ser Aprovado
                if(compra.cpf == '153.509.460-56' || compra.cpf == '15350946056'){
                    compra.status = this.status[0];
                }else{
                    compra.status = this.status[1];
                }
                //valida porcentagem e calcula o valor do cashback
                compra.porcentagemCashback = this.verificarPorcentagemCashback(compra.valor);
                compra.valorCashback = this.calculaCashback(compra.valor, compra.porcentagemCashback);
                //cria objeto compra
                var nova_compra = new Compra(compra);
                //insere na base de dados
                this.connection.collection("compras").insertOne(nova_compra.getCompraDb(), function (err, res) {
                    cb(err, res.ops[0]._id)
                });
            }
        })           
    }
    //busca compra pelo _id do mongo
    getCompraPorId(id, cb) {
        this.connection.collection("compras").findOne({ "_id": ObjectId(id) }, function (err, compraBanco) {
            var compra = null;
            if(compraBanco){
                compra = new Compra(compraBanco);
            }
            cb(err, compra)
        });
    }
    //atualiza compra
    updateCompra(compra, cb) {
        //verifica se a comrpa existe
        this.getCompraPorId(compra._id,(err,compraBanco)=>{
            //se existe verifica se o status é em validação, pois não podem ser alteradas compras com status Aprovado
            if(!err && compraBanco.status == this.status[1]){
                //faz o calculo de porcentagem e valor de cashback caso o valor tenha mudado
                compra.porcentagemCashback = this.verificarPorcentagemCashback(compra.valor);
                compra.valorCashback = this.calculaCashback(compra.valor, compra.porcentagemCashback);

                revendedorDAO = new revendedorDAOClass(this.connection)
                //valida se revendedor informado existe
                revendedorDAO.getRevendedorPorId(compra.revendedor, (err,resultado)=>{
                    if(err || !resultado){
                        cb('Revendedor não existe!',null)
                    }else if (resultado){
                        //se existir verifica se é com o CPF informado na documentação (este CPF o status deve ser aprovado)
                        compra.revendedor = resultado._id;
                        if(resultado.cpf == '153.509.460-56'|| compra.cpf == '15350946056'){
                            compra.status = this.status[0];
                        }else{
                            compra.status = this.status[1];
                        }

                        //atualiza compra
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
    //exclui compra informada
    excluirCompra(id, cb) {
        //verifica se o _id informado é valido
        if(!ObjectId.isValid(id)){
            return cb('Chave da compra é inválida!',null)
        }
        //verifica se compra existe na base de dados
        this.getCompraPorId(id, (err, compra)=>{
            if(err || !compra){
                return cb('Compra informada não existe!',null);                
            }
            //verifica se o status é em validação
            if(compra.status == this.status[1]){
                //exclui a compra
                this.connection.collection("compras").remove({ "_id": ObjectId(id) }, 1).then(function (err, res) {
                    return cb(err,res);
                });
            }else{
                cb('Você não pode excluir uma compra com status :' +compra.status,null)
            }
        })
        
    }
}
module.exports = CompraDAO;