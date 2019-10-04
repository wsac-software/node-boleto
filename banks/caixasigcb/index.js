const moment = require('moment')
const formatters = require('../../lib/formatters')
// const ediHelper = require('../../lib/edi-helper')
const helper = require('./helper')

exports.options = {
  logoURL: 'data:image/jpg;base64,' + helper.encodeBase64('caixa.jpg'),
  codigo: '104',
  layout: 'layout-caixasigcb'
}

exports.dvBarra = function (barra) {
  var resto2 = formatters.mod11(barra)
  return (resto2 === 0 || resto2 > 9) ? 1 : 11 - resto2
}

exports.dvCampoLivre = function (barra) {
  var resto2 = formatters.mod11(barra)
  return (resto2 > 9) ? 0 : 11 - resto2
}

exports.barcodeData = function (boleto) {
  boleto['nosso_numero'] = `14${formatters.addTrailingZeros(boleto['nosso_numero'], 15)}`;

  const codigoBanco = this.options.codigo
  const numMoeda = '9'
  const fatorVencimento = formatters.fatorVencimento(moment(boleto['data_vencimento']).utc().format())
  const valor = formatters.addTrailingZeros(boleto['valor'], 10)

  let campoLivre = ''
  let codigoCedenteWithDv = boleto['codigo_cedente']
  if (boleto['codigo_cedente_dv']) {
    codigoCedenteWithDv += '' + boleto['codigo_cedente_dv']
  }

  const codigoCedente = formatters.addTrailingZeros(codigoCedenteWithDv, 7)
  campoLivre = `${boleto['nosso_numero'].substr(2, 3)}${boleto['nosso_numero'].substr(0, 1)}`;
  campoLivre += `${boleto['nosso_numero'].substr(5, 2)}${boleto['nosso_numero'].substr(1, 1)}`;
  campoLivre += `${boleto['nosso_numero'].substr(8, 8)}`;
  campoLivre += this.dvCampoLivre(campoLivre);

  const barra = codigoBanco + numMoeda + fatorVencimento + valor + codigoCedente + campoLivre

  const dvBarra = this.dvBarra(barra)
  const lineData = barra.substring(0, 4) + dvBarra + barra.substring(4, barra.length)

  return lineData
}

exports.linhaDigitavel = function (barcodeData) {
  // 01-03    -> Código do banco sem o digito (1-3 do cód. barras)
  // 04-04    -> Código da Moeda (9-Real) (4-4 do cód. barras)
  // 05-09    -> Cinco primeiras posições do campo livre (20-24 do cód. barras)
  // 09-10    -> Dígito verificador dos números acima
  // 11-20    -> Posições 16 a 25 do campo livre (posições 35 a 44 do código de barras)
  // 21-21    -> Dígito verificador dos números acima (11-21)
  // 23-32    -> Composto pelas posições 16 a 25 do campo livre (posições 35 a 44 do código de barras)
  // 33-33    -> Dígito verificador dos números acima (23-33)
  // 34-34    -> DV geral do código de barras (posição 5 do código de barras);
  // 34-37    -> Fator de vencimento (posições 6 a 9 do código de barras)
  // 38-47    -> Nosso número do titulo (campo livre)

  var campos = []

  // 1. Campo - composto pelo código do banco, código da moéda, código da carteira e código da agencia
  // e DV (modulo10) deste campo
  var campo = barcodeData.substring(0, 3) +
    barcodeData.substring(3, 4) +
    barcodeData.substring(19, 24)
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
