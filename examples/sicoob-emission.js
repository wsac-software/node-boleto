var express = require('express')
var path = require('path')

var app = express()

var Boleto = require('../index').Boleto
Boleto.barcodeRenderEngine = 'bmp'

var boleto = new Boleto({
  'banco': 'sicoob',
  'data_emissao': new Date(),
  'data_vencimento': new Date(new Date().getTime() + 5 * 24 * 3600 * 1000),
  'valor': 1500,
  'nosso_numero': '661',
  'numero_documento': '1',
  'cedente': 'Pagar.me Pagamentos S/A',
  'cedente_cnpj': '18727053000174',
  'agencia': '1229',
  'codigo_cedente': '469',
  'codigo_cedente_dv': '4',
  'carteira': '1',
  'parcela': 1,
  'modalidade': '01',
  'pagador': 'Nome do pagador\nCPF: 000.000.000-00',
  'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
  'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
})

app.use(express.static(path.join(__dirname, '/../')))

app.get('/', function (req, res) {
  boleto.renderHTML(function (html) {
    return res.send(html)
  })
})

app.listen(3003)
