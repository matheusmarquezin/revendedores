var Revendedor = require("../model/Revendedor.js");
const bcrypt = require('bcryptjs');

var ObjectId = require('mongodb').ObjectID;

class RevendedorDAO {

    constructor(connection) {
        this.connection = connection;
    }
    //lista todos revendedores
    getRevendedores(cb) {
        this.connection.collection("revendedores").find({}).toArray(function (err, revendedores) {
            return cb(err, revendedores);
        });
    }
    //busca revendedor pelo seu _id
    getRevendedorPorId(id, cb) {
        //faz busca no mongo pelo campo _id
        this.connection.collection("revendedores").findOne({ "_id": ObjectId(id) }, function (err, revendedorBanco) {
            var revendedor = null;
            if(revendedorBanco){
                revendedor = new Revendedor(revendedorBanco);
            }
            cb(err, revendedor)
        });
    }
    //busca revendedor pelo CPF
    getRevendedorPorCPF(cpf, cb) {
        //remove mascara de CPF
        cpf = cpf.replace(/\D/g, '');
        //faz busca no mongo pelo campo CPF
        this.connection.collection("revendedores").findOne({ "cpf": cpf }, function (err, revendedorBanco) {
            var revendedor = null;
            if(revendedorBanco){
                revendedor = new Revendedor(revendedorBanco);
            }
            cb(err, revendedor)
        });
    }
    //busca o revendedor pelo seu e-mail
    getRevendedorPorEmail(email, cb) {
        //busca no mongo pelo email
        this.connection.collection("revendedores").findOne({ "email": email }, function (err, revendedorBanco) {
            var revendedor = null;
            if(revendedorBanco){
                revendedor = new Revendedor(revendedorBanco);
            }
            cb(err, revendedor)
        });
    }
    //metodo utilizado para login
    getRevendedorByEmailAndPassword(email, password, cb) {
        //busca no mongo revendedor com o email informado
        this.connection.collection("revendedores").findOne({ "email": email }, function (err, revendedorBanco) {
            //valida se senha cadastrada no banco é igual a informada
            if (revendedorBanco && bcrypt.compareSync(password, revendedorBanco.password))
                //se estiver tudo certo retorna usuário do banco  
                cb(err, new Revendedor(revendedorBanco))
            else {
                cb('Usuário ou senha inválidos', null)
            }
        });
    }
    //verifica se todas informações foram enviadas
    validarInformacoes(revendedor, cb) {
        if (!revendedor) {
            cb('Informações inválidas!')
        }
        if (!revendedor.nome) {
            cb('nome inválido!')
        }
        if (!revendedor.cpf) {
            cb('cpf inválido')
        }
        if (!revendedor.email) {
            cb('email inválido')
        }
        if (!revendedor.password) {
            cb('password inválido')
        }
    };
    addRevendedor(revendedor, cb) {
        //valida dados do revendedor
        this.validarInformacoes(revendedor, (err) => {
            if (err) {
                cb(err, null)
            }
        })

        //Cria um hash com a senha informada
        var password = revendedor.password;

        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);

        revendedor.password = hash;
        //verifica se o CPF tem mascara
        var validaCPF = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(revendedor.cpf);

        if (validaCPF) {
            //remove mascara para gravar na base de dados
            revendedor.cpf = revendedor.cpf.replace(/\D/g, '');
            //valida se existe algum revendedor com o CPF cadastrado na base de dados
            this.getRevendedorPorCPF(revendedor.cpf, (err, revendedorExistente) => {
                if (!err && !revendedorExistente) {
                    //valida se não existe nenhum revendor com o email infomado cadastrado na base de dados
                    this.getRevendedorPorEmail(revendedor.email, (errEmail, revendedorExistenteEmail) => {

                        if (!errEmail && !revendedorExistenteEmail) {
                            //cria novo revendedor
                            this.connection.collection("revendedores").insertOne(revendedor.getRevendedorDb(), function (err, res) {
                                cb(err, res.ops[0]._id)
                            });
                        } else {
                            err = 'Já existe um revendedor com este email cadastrado!';
                            cb(err, null)
                        }
                    });
                } else {
                    err = 'Já existe um revendedor com este cpf cadastrado!';
                    cb(err, null)
                }
            });

        } else {
            //caso cpf invalido ou sem mascara
            var err = 'Informe um CPF válido (XXX.XXX.XXX-XX)';
            cb(err, null)
        }
    }
    //atualiza informações do revendedor (não existe rota para isso pois não estavam nas especificações)
    updateRevendedor(revendedor, cb) {
        var newvalues = {
            $set: revendedor.getRevendedorDb()
        }
        this.connection.collection("revendedores").updateOne({ "_id": revendedor.getRevendedorDb()._id }, newvalues, function (err, res) {
            cb(err, res);
        });
    }
    //exclui revendedor (não existe rota para isso pois não estavam nas especificações)
    removeRevendedor(id, cb) {
        this.connection.collection("revendedores").remove({ "_id": ObjectId(id) }, 1).then(function (err, res) {
            if (err)
                return cb(null);
            else
                return cb(res);
        });
    }
}
module.exports = RevendedorDAO;