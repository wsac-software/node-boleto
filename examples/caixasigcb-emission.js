var express = require('express')
var path = require('path')

var app = express()

var Boleto = require('../index').Boleto
Boleto.barcodeRenderEngine = 'bmp'

var boleto = new Boleto({
  'banco': 'caixasigcb',
  'data_emissao': new Date(),
  'data_vencimento': new Date(new Date().getTime() + 5 * 24 * 3600 * 1000),
  'valor': 150000,
  'nosso_numero': '661',
  'numero_documento': '1',
  'cedente': 'Pagar.me Pagamentos S/A',
  'cedente_cnpj': '18727053000174',
  'cedente_endereco': 'Rua 10',
  'cedente_uf': 'GO',
  'cedente_cep': '74620999',
  'agencia': '1229',
  'codigo_cedente': '469',
  'codigo_cedente_dv': '4',
  'carteira': 'RG',
  'modalidade': '01',
  'pagador': 'Nome do pagador',
  'pagador_documento': '017.563.902.74',
  'pagador_endereco': 'Rua 10',
  'pagador_uf': 'GO',
  'pagador_cep': '74620999',
  'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
  'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.',
  'descricao': 'Descrição 01 <br /> Descrição 02',
})

app.use(express.static(path.join(__dirname, '/../')))

app.get('/', function (req, res) {
  boleto.renderHTML(function (html) {
    return res.send(html)
  })
})

app.listen(3003)
