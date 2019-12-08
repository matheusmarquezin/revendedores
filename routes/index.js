var express = require('express');
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
  var revendedor = new Revendedor(req.body);
  revendedorDAO.addRevendedor(revendedor, (err, retorno) => {
    if (!err)
      res.send(retorno)
    else
      res.send(err, 400);
  });
});

router.get('/revendedores', function (req, res, next) {
  revendedorDAO.getRevendedores((err, dados) => {
    if (!err)
      res.send(dados)
    else
      res.send(err, 400);
  });
});

module.exports = router;
