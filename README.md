#### Como utilizar

- Login 
	- URL : [http://127.0.0.1:3000/login](http://127.0.0.1:3000/login)
	- Metodo : POST
	- Authorization : N/A
	- Retorno : Token de acesso com 24 de validade
	- Body :
```javascript
	{
			"email":"m@gmail.com",
			"password":"123"
	}
```

- Cadastrar revendedor
	- URL :  [http://127.0.0.1:3000/cadastrarRevendedor](http://127.0.0.1:3000/cadastrarRevendedor)
	- Metodo : POST
	- Authorization : N/A
	- Retorno : _id do revendedor cadastrado no banco de dados
	- Body :
```javascript
	{
			"nome":"Teste",
			"cpf":"153.509.460-56",
			"email":"teste@gmail.com",
			"password":"123"
	}
```

- Nova Compra
	- URL :  [http://127.0.0.1:3000/novaCompra](http://127.0.0.1:3000/novaCompra)
	- Metodo : POST
	- Authorization : Token de acesso obtido no login
	- Retorno : _id da compra cadastrada no banco de dados
	- Body :
```javascript
	{
			"codigo":"123",
			"valor":"2000",
			"data":"11/12/2019",
			"cpf":"153.509.460-56"
	}
```

- Atualizar Compra
	- URL :  [http://127.0.0.1:3000/atualizarCompra](http://127.0.0.1:3000/atualizarCompra)
	- Metodo : PUT
	- Authorization : Token de acesso obtido no login
	- Retorno : JSON com informações sobre a atualização
	- Body :
		_id é a chave no banco de dados da compra
		revendedor é o _id do revendedor gravado no banco de dados
```javascript
	{
    	"_id" : "5ded74300784df4b17b39630",
    	"codigo" : "123",
    	"valor" : 1200,
    	"data" : "09/12/2019",
    	"status":"Em validação",
    	"revendedor" : "5ded3b08ddf38a393fcc8bea"
	}
```

- Excluir compras
	- URL:  [http://127.0.0.1:3000/excluirCompra/(digitar_id)](http://127.0.0.1:3000/excluirCompra/_id)
	- Metodo : DELETE
	- Authorization : Token de acesso obtido no login
	- Body : N/A
	- Retorno : JSON com resultado da exclusão

- Listar Compras Cadastradas
	- URL : [http://127.0.0.1:3000/compras](http://127.0.0.1:3000/compras)
	- Metodo : GET
	- Authorization : Token de acesso obtido no login
	- Body : N/A
	- Retorno : JSON com lista de todas as compras cadastradas

- Acumulado Cashback
	- URL : [http://127.0.0.1:3000/totalCashback/153.509.460-56](http://127.0.0.1:3000/totalCashback/153.509.460-56)
	- Metodo : GET
	- Authorization : Token de acesso obtido no login
	- Body : N/A
	- Retorno : JSON com resultado da API especificada na documentação
