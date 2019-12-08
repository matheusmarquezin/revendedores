var express = require('express');

let jwt = require('jsonwebtoken');
let config = require('../config.js');

var router = express.Router();

var Revendedor = require("../model/Revendedor.js");
var revendedorDAO;

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

router.all('*', function (req, res, next) {
  if (!revendedorDAO) {
    var revendedorDAOClass = require("../dao/RevendedorDAO.js");
    revendedorDAO = new revendedorDAOClass(req.app.settings.mongo)
  }
  return next()
});

/* GET home page. */
router.get('/', function(req, res) {
  next();
});

router.post('/cadastrarRevendedor', function (req, res, next) {
  checkToken(req,res,next)
  var revendedor = new Revendedor(req.body);
  revendedorDAO.addRevendedor(revendedor, (err, retorno) => {
    if (!err)
      res.send(retorno)
    else
      res.send(err, 400);
  });
});

var checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }
  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      
      if (err) {
        return res.json({
          success: false,
          message: 'Token não é valido'
        });
      } else {
        req.decoded = decoded;
        return;
      }
    });
  } else {
    return res.json({
      success: false,
      message: 'Token está nulo!'
    });
  }
};

router.post('/login', function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  revendedorDAO.getRevendedorByEmailAndPassword(email,password, (err, retorno) =>{
    if (!err && retorno){
      let token = jwt.sign({email: email},
        config.secret,
        {
          expiresIn: '24h' // expires in 24 hours
        }
      );
      res.json({
        success: true,
        message: 'Autenticado com sucesso!',
        token: token
      });
    }
    else
      res.send(err, 400);
  });
});

router.get('/revendedores', function (req, res, next) {
  checkToken(req,res,next)
  revendedorDAO.getRevendedores((err, dados) => {
    if (!err)
      res.send(dados)
    else
      res.send(err, 400);
  });
});

module.exports = router;
