var Revendedor = require("../model/Revendedor.js");
const bcrypt = require('bcryptjs');

var ObjectId = require('mongodb').ObjectID;

class RevendedorDAO {

    constructor(connection) {
        this.connection = connection;
    }
    getRevendedores(cb) {
        this.connection.collection("revendedores").find({}).toArray(function (err, revendedores) {
            return cb(err, revendedores);
        });
    }
    getRevendedorPorId(id, cb) {
        this.connection.collection("revendedores").findOne({ "_id": ObjectId(id) }, function (err, revendedorBanco) {
            var revendedor = null;
            if(revendedorBanco){
                revendedor = new Revendedor(revendedorBanco);
            }
            cb(err, revendedor)
        });
    }
    getRevendedorPorCPF(cpf, cb) {
        cpf = cpf.replace(/\D/g, '');
        this.connection.collection("revendedores").findOne({ "cpf": cpf }, function (err, revendedorBanco) {
            var revendedor = null;
            if(revendedorBanco){
                revendedor = new Revendedor(revendedorBanco);
            }
            cb(err, revendedor)
        });
    }
    getRevendedorPorEmail(email, cb) {
        this.connection.collection("revendedores").findOne({ "email": email }, function (err, revendedorBanco) {
            var revendedor = null;
            if(revendedorBanco){
                revendedor = new Revendedor(revendedorBanco);
            }
            cb(err, revendedor)
        });
    }
    getRevendedorByEmailAndPassword(email, password, cb) {
        this.connection.collection("revendedores").findOne({ "email": email }, function (err, revendedorBanco) {

            if (revendedorBanco && bcrypt.compareSync(password, revendedorBanco.password))
                cb(err, new Revendedor(revendedorBanco))
            else {
                cb('Usuário ou senha inválidos', null)
            }
        });
    }
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
        this.validarInformacoes(revendedor, (err) => {
            if (err) {
                cb(err, null)
            }
        })
        var password = revendedor.password;

        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);

        revendedor.password = hash;

        var validaCPF = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(revendedor.cpf);

        if (validaCPF) {

            revendedor.cpf = revendedor.cpf.replace(/\D/g, '');
            this.getRevendedorPorCPF(revendedor.cpf, (err, revendedorExistente) => {
                if (!err && !revendedorExistente) {

                    this.getRevendedorPorEmail(revendedor.email, (errEmail, revendedorExistenteEmail) => {

                        if (!errEmail && !revendedorExistenteEmail) {
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
            var err = 'Informe um CPF válido (XXX.XXX.XXX-XX)';
            cb(err, null)
        }
    }

    updateRevendedor(revendedor, cb) {
        var newvalues = {
            $set: revendedor.getRevendedorDb()
        }
        this.connection.collection("revendedores").updateOne({ "_id": revendedor.getRevendedorDb()._id }, newvalues, function (err, res) {
            cb(err, res);
        });
    }
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