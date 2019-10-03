const moment = require('moment')
const formatters = require('../../lib/formatters')
// const ediHelper = require('../../lib/edi-helper')
const helper = require('./helper')

exports.options = {
  logoURL: 'data:image/jpg;base64,' + helper.encodeBase64('caixa.jpg'),
  codigo: '756',
  layout: 'layout-caixasigcb'
}

exports.dvBarra = function (barra) {
  var resto2 = formatters.mod11(barra, 9, 1)
  return (resto2 == 0 || resto2 == 1 || resto2 == 10) ? 1 : 11 - resto2
}

exports.barcodeData = function (boleto) {
  var codigoBanco = this.options.codigo
  var numMoeda = '9'

  var fatorVencimento = formatters.fatorVencimento(moment(boleto['data_vencimento']).utc().format())

  var agencia = formatters.addTrailingZeros(boleto['agencia'], 4)

  var valor = formatters.addTrailingZeros(boleto['valor'], 10)

  var codigoCedenteWithDv = boleto['codigo_cedente']

  if (boleto['codigo_cedente_dv']) {
    codigoCedenteWithDv += '' + boleto['codigo_cedente_dv']
  }

  var codigoCedente = formatters.addTrailingZeros(codigoCedenteWithDv, 7)

  var nossoNumeroDv = formatters.mod11Sicoob(boleto['nosso_numero'], boleto['agencia'], codigoCedenteWithDv)

  var campoLivre = 1 + agencia + formatters.addTrailingZeros(boleto['modalidade'], 2) + codigoCedente + formatters.addTrailingZeros(boleto['nosso_numero'] + '' + nossoNumeroDv, 8) + formatters.addTrailingZeros(boleto['parcela'], 3)

  var barra = codigoBanco + numMoeda + fatorVencimento + valor + campoLivre

  var dvBarra = this.dvBarra(barra)
  var lineData = barra.substring(0, 4) + dvBarra + barra.substring(4, barra.length)

  return lineData
}

exports.linhaDigitavel = function (barcodeData) {
  // 01-03    -> Código do banco sem o digito
  // 04-04    -> Código da Moeda (9-Real)
  // 05-05    -> Dígito verificador do código de barras
  // 06-09    -> Fator de vencimento
  // 10-19    -> Valor Nominal do Título
  // 20-20    -> Código da carteira
  // 21-24    -> Código da Agencia (sem dígito)
  // 25-26    -> Modalidade de cobrança (campo livre)
  // 27-33    -> Código de cedente (campo livre)
  // 34-41    -> Nosso número do titulo (campo livre)
  // 42-44    -> Número de parcela do titulo (campo livre)

  var campos = []

  // 1. Campo - composto pelo código do banco, código da moéda, código da carteira e código da agencia
  // e DV (modulo10) deste campo
  var campo = barcodeData.substring(0, 3) + barcodeData.substring(3, 4) + barcodeData.substring(19, 20) + barcodeData.substring(20, 24)
  campo = campo + formatters.mod10(campo)
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length)
  campos.push(campo)

  // 2. Campo - composto pelas posiçoes 1 a 10 do campo livre
  // e livre e DV (modulo10) deste campo
  campo = barcodeData.substring(24, 34)
  campo = campo + formatters.mod10(campo)
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length)
  campos.push(campo)

  // 3. Campo composto pelas posicoes 10 a 20 do campo livre
  // e livre e DV (modulo10) deste campo
  campo = barcodeData.substring(34, 44)
  campo = campo + formatters.mod10(campo)
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length)
  campos.push(campo)

  // 4. Campo - digito verificador do codigo de barras
  campo = barcodeData.substring(4, 5)
  campos.push(campo)

  // 5. Campo composto pelo fator vencimento e valor nominal do documento, sem
  // indicacao de zeros a esquerda e sem edicao (sem ponto e virgula). Quando se
  // tratar de valor zerado, a representacao deve ser 000 (tres zeros).
  campo = barcodeData.substring(5, 9) + barcodeData.substring(9, 19)
  campos.push(campo)

  return campos.join(' ')
}

exports.parseEDIFile = function (fileContent) {
  try {
    var lines = fileContent.split('\n')
    var parsedFile = {
      boletos: []
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i]
      var registro = line.substring(0, 1)

      if (registro === '0') {
        // TODO
      } else if (registro === '1') {
        // TODO
      }
    }

    return parsedFile
  } catch (e) {
    console.log(e)
    return null
  }
}
