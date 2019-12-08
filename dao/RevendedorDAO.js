var Revendedor = require("../model/Revendedor.js");
const bcrypt = require('bcryptjs');

var ObjectId = require('mongodb').ObjectID;

class RevendedorDAO {

    constructor(connection) {
        this.connection = connection;
    }
    getRevendedores(cb){
        this.connection.collection("revendedores").find({}).toArray(function (err, revendedores) {
            return cb(err,revendedores);
        });
    }
    getRevendedorPorId(id, cb) {
        this.connection.collection("revendedores").findOne({ "_id": ObjectId(id) }, function (err, revendedorBanco) {
            cb(err,new Revendedor(revendedorBanco))
        });
    }
    getRevendedorPorCPF(cpf, cb) {
        this.connection.collection("revendedores").findOne({ "cpf": cpf }, function (err, revendedorBanco) {
            cb(err,new Revendedor(revendedorBanco))
        });
    }
    getRevendedorByEmailAndPassword(email,password, cb) {
        this.connection.collection("revendedores").findOne({"email": email}, function (err, revendedorBanco) {
                   
            if(revendedorBanco && bcrypt.compareSync(password, revendedorBanco.password))
                cb(err,new Revendedor(revendedorBanco))
            else{
                cb(err = 404, null)
            }
        });
    }
    addRevendedor(revendedor, cb) {

        var password = revendedor.password;

        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);

        revendedor.password = hash;
        var validaCPF = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(revendedor.cpf);

        if(validaCPF){
            this.getRevendedorPorCPF(revendedor.cpf, (err,revendedorExistente) =>{

                if(!err && !revendedorExistente){
                    this.connection.collection("revendedores").insertOne(revendedor.getRevendedorDb(), function (err, res) {
                        cb(err, res.ops[0]._id)
                    });
                }else{
                    err = 'Revendedor já cadastrado';
                    cb(err, null)
                }
            });
           
        }else{
            var err = 'CPF inválido';
            cb(err, null)
        }
    }

    updateRevendedor(revendedor, cb) {
        var newvalues = {
            $set: revendedor.getUsuarioDb()
         }
        this.connection.collection("revendedores").updateOne({ "_id": revendedor.getRevendedorDb()._id }, newvalues, function (err, res) {
            cb(err,res);
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