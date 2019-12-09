var express = require('express');

let jwt = require('jsonwebtoken');
let config = require('../config.js');

var router = express.Router();
var Request = require("request");

var Revendedor = require("../model/Revendedor.js");
var Compra = require("../model/Compra.js");
var revendedorDAO;
var compraDAO;
//liberar o acesso para outras aplicações
router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});
//antes de qualquer requisição verificar se as DAOs estão instanciadas e cria-las caso não estejam
router.all('*', function (req, res, next) {
  if (!revendedorDAO) {
    var revendedorDAOClass = require("../dao/RevendedorDAO.js");
    //Cria DAO passando instancia do mongo criada no app.js
    revendedorDAO = new revendedorDAOClass(req.app.settings.mongo)
  }
  if (!compraDAO) {
    var compraDAOClass = require("../dao/CompraDAO.js");
    //Cria DAO passando instancia do mongo criada no app.js
    compraDAO = new compraDAOClass(req.app.settings.mongo)
  }
  return next()
});

/* GET home page. */
router.get('/', function (req, res) {
  next();
});
//Metodo para criação de novo revendedor, mais informações estão no README.me
router.post('/cadastrarRevendedor', function (req, res, next) {
  var revendedor = new Revendedor(req.body);
  revendedorDAO.addRevendedor(revendedor, (err, retorno) => {
    if (!err)
      res.send(retorno)
    else
      res.send(err, 400);
  });
});
//Metodo para validação do token de acesso
var checkToken = (req, res, next) => {
  //Verifica se existe algo no headers
  if (!req.headers)
    return res.json({
      success: false,
      message: 'Token está nulo!'
    });
  //obtem o token de acesso
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  //se o token for Bearer corta a string para apenas obter o codigo do mesmo
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }
  if (token) {
    //valida token de acesso
    jwt.verify(token, config.secret, (err, decoded) => {

      if (err) {
        //token invalido
        return res.json({
          success: false,
          message: 'Token não é valido'
        });
      } else {
        //se o token for valido
        req.decoded = decoded;
        return;
      }
    });
  } else {
    //token nulo
    return res.json({
      success: false,
      message: 'Token está nulo!'
    });
  }
};

//Metodo para logar no sistema, mais informações estão no README.me
router.post('/login', function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  //chama metodo da DAO que valida o login
  revendedorDAO.getRevendedorByEmailAndPassword(email, password, (err, retorno) => {
    if (!err && retorno) {
      //login com sucesso cria novo token de acesso
      let token = jwt.sign({ email: email },
        config.secret,
        {
          expiresIn: 864000
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
//metodo para criar nova compra, mais informações estão no README.md
router.post('/novaCompra', function (req, res, next) {
  //valida token de acesso informado
  if (checkToken(req, res, next)) {
    return;
  }
  //Utiliza o metodo de cadastro de compra na DAO
  var compra = req.body;
  compraDAO.addCompra(compra, (err, retorno) => {
    if (!err && retorno) {
      res.send(retorno)
    }
    else
      res.send(err, 400);
  });
});

//metodo para atualizar compra, mais informações estão no README.md
router.put('/atualizarCompra', function (req, res, next) {
  //valida token de acesso informado
  if (checkToken(req, res, next)) {
    return;
  }
  //Utiliza o metodo de atualização de compra na DAO
  var compra = new Compra(req.body);
  compraDAO.updateCompra(compra, (err, retorno) => {
    if (!err && retorno) {
      res.send(retorno)
    }
    else
      res.send(err, 400);
  });
});

//metodo para excluir compra, mais informações estão no README.md
router.delete('/excluirCompra/:id', function (req, res, next) {
  //valida token de acesso informado
  if (checkToken(req, res, next)) {
    return;
  }
  //Utiliza o metodo de exclusão de compra na DAO
  compraDAO.excluirCompra(req.param("id"), (err, retorno) => {
    if (!err && retorno) {
      res.send(retorno)
    }
    else
      res.send(err, 400);
  });
});
//lista todas compras efetuadas no sistema
router.get('/compras', function (req, res, next) {
  //valida token de acesso informado
  if (checkToken(req, res, next)) {
    return;
  }

  compraDAO.getCompras((err, dados) => {
    if (!err)
      res.send(dados)
    else
      res.send(err, 400);
  });
});


retirarMascara = (cpf) => {
  return cpf.replace(/\D/g, '');
}
validarCPF = (cpf) => {
  return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf);
}

//Metodo para listar cashback de um cpf informado
router.get('/totalCashback/:cpf', function (req, res, next) {
  //valida token de acesso
  if (checkToken(req, res, next)) {
    return;
  }
  //obtem cpf da url
  var cpf = req.param("cpf");
  //valida se o cpf está valido
  if (validarCPF(cpf)) {
    //retira a mascara pois a api só aceita numeros
    cpf = retirarMascara(cpf);
    //faz a requisição para a api informada na documentação
    Request.get({
      "headers": { 
        "content-type": "application/json" ,
        "token":"ZXPURQOARHiMc6Y0flhRC1LVlZQVFRnm"
      },
      "url": "https://mdaqk8ek5j.execute-api.us-east-1.amazonaws.com/v1/cashback?cpf=" + cpf
    }, (error, response, body) => {
      if (error) {
        res.send(error, 400);
      }
      //envia resultado da api
      res.send(body)
    });
  } else {
    //caso o cpf não tenha a mascara
    res.send('Informe um CPF válido (XXX.XXX.XXX-XX)', 400);
  }
});
//lista todos revendedores
router.get('/revendedores', function (req, res, next) {
  if (checkToken(req, res, next)) {
    return;
  }
  revendedorDAO.getRevendedores((err, dados) => {
    if (!err)
      res.send(dados)
    else
      res.send(err, 400);
  });
});

module.exports = router;
