/**
 * delegua-dados: Módulo de Integração com a linguagem de programação Delégua
 *
 * Este módulo expõe todas as classes e funções da biblioteca delegua-dados
 * para integração com a linguagem de programação Delégua, seguindo os padrões de integração
 * estabelecidos em delegua-arquivos.
 * 
 * Nota: JSON, Excel e SQL I/O estão em pacotes separados opcionais:
 * - delegua-json
 * - delegua-excel
 * - delegua-sql
 */

import {
  Indice,
  Serie,
  RecorteDados,
  lerCSV,
  escreverCSV,
  IndiceTemporal,
  formatarData,
  reamostrar,
  Reamostrador
} from './fontes';
import { compreenderData, criarIntervaloDatas, diferencaDias, diferencaHoras } from './fontes/indice-temporal';

// Re-export para compatibilidade
export {
  Indice,
  Serie,
  RecorteDados,
  lerCSV,
  escreverCSV,
  IndiceTemporal,
  formatarData,
};

/**
 * Definições de métodos para Delégua
 */

// Métodos de Indice
const indiceMetodos = {
  obter: {
    tipoRetorno: 'generico',
    argumentos: [{ nome: 'posicao', tipo: 'numero' }],
  },
  filtrar: {
    tipoRetorno: 'Indice',
    argumentos: [{ nome: 'predicado', tipo: 'funcao' }],
  },
  mapear: {
    tipoRetorno: 'Indice',
    argumentos: [{ nome: 'funcao', tipo: 'funcao' }],
  },
  comprimento: {
    tipoRetorno: 'numero',
    argumentos: [],
  },
  nomes: {
    tipoRetorno: 'vetor',
    argumentos: [],
  },
  valores: {
    tipoRetorno: 'vetor',
    argumentos: [],
  },
  unico: {
    tipoRetorno: 'Indice',
    argumentos: [],
  },
};

// Métodos de Serie
const serieMetodos = {
  obter: {
    tipoRetorno: 'generico',
    argumentos: [{ nome: 'chave', tipo: 'generico' }],
  },
  filtrar: {
    tipoRetorno: 'Serie',
    argumentos: [{ nome: 'predicado', tipo: 'funcao' }],
  },
  mapear: {
    tipoRetorno: 'Serie',
    argumentos: [{ nome: 'funcao', tipo: 'funcao' }],
  },
  soma: {
    tipoRetorno: 'numero',
    argumentos: [],
  },
  media: {
    tipoRetorno: 'numero',
    argumentos: [],
  },
  minimo: {
    tipoRetorno: 'numero',
    argumentos: [],
  },
  maximo: {
    tipoRetorno: 'numero',
    argumentos: [],
  },
  tamanho: {
    tipoRetorno: 'numero',
    argumentos: [],
  },
  indice: {
    tipoRetorno: 'Indice',
    argumentos: [],
  },
  valores: {
    tipoRetorno: 'vetor',
    argumentos: [],
  },
  descrever: {
    tipoRetorno: 'texto',
    argumentos: [],
  },
};

// Métodos de RecorteDados
const recorteDadosMetodos = {
  obter: {
    tipoRetorno: 'generico',
    argumentos: [
      { nome: 'linha', tipo: 'numero' },
      { nome: 'coluna', tipo: 'numero' },
    ],
  },
  obterLinha: {
    tipoRetorno: 'vetor',
    argumentos: [{ nome: 'posicao', tipo: 'numero' }],
  },
  filtrar: {
    tipoRetorno: 'RecorteDados',
    argumentos: [{ nome: 'predicado', tipo: 'funcao' }],
  },
  mapear: {
    tipoRetorno: 'RecorteDados',
    argumentos: [{ nome: 'funcao', tipo: 'funcao' }],
  },
  colunas: {
    tipoRetorno: 'vetor',
    argumentos: [],
  },
  linhas: {
    tipoRetorno: 'numero',
    argumentos: [],
  },
  forma: {
    tipoRetorno: 'vetor',
    argumentos: [],
  },
  descrever: {
    tipoRetorno: 'texto',
    argumentos: [],
  },
  agrupar: {
    tipoRetorno: 'generico',
    argumentos: [
      { nome: 'colunas', tipo: 'generico' },
      { nome: 'funcao', tipo: 'funcao' },
    ],
  },
  ordenar: {
    tipoRetorno: 'RecorteDados',
    argumentos: [{ nome: 'coluna', tipo: 'texto' }],
  },
};

// Métodos de IndiceTemporal
const IndiceTemporalMetodos = {
  obter: {
    tipoRetorno: 'generico',
    argumentos: [{ nome: 'posicao', tipo: 'numero' }],
  },
  filtrar: {
    tipoRetorno: 'IndiceTemporal',
    argumentos: [{ nome: 'predicado', tipo: 'funcao' }],
  },
  mapear: {
    tipoRetorno: 'IndiceTemporal',
    argumentos: [{ nome: 'funcao', tipo: 'funcao' }],
  },
  entre: {
    tipoRetorno: 'IndiceTemporal',
    argumentos: [
      { nome: 'inicio', tipo: 'texto' },
      { nome: 'fim', tipo: 'texto' },
    ],
  },
  minima: {
    tipoRetorno: 'generico',
    argumentos: [],
  },
  maxima: {
    tipoRetorno: 'generico',
    argumentos: [],
  },
  estaOrdenado: {
    tipoRetorno: 'logico',
    argumentos: [],
  },
  ordenar: {
    tipoRetorno: 'IndiceTemporal',
    argumentos: [],
  },
  diferencas: {
    tipoRetorno: 'vetor',
    argumentos: [],
  },
  comprimento: {
    tipoRetorno: 'numero',
    argumentos: [],
  },
};

// Métodos de Reamostragem
const metodosReamostragem = {
  downsampling: {
    tipoRetorno: 'RecorteDados',
    argumentos: [
      { nome: 'agregacao', tipo: 'texto' },
      { nome: 'colunasNumero', tipo: 'vetor' },
    ],
  },
  upsampling: {
    tipoRetorno: 'RecorteDados',
    argumentos: [{ nome: 'metodoPreenchimento', tipo: 'texto' }],
  },
};

/**
 * Exportação principal para o módulo Delégua
 * Segue o padrão de delegua-arquivos com classes e funções
 */
export const DeleguaModuloDados = {
  // Classes
  Indice: {
    implementacao: Indice,
    metodos: indiceMetodos,
  },
  Serie: {
    implementacao: Serie,
    metodos: serieMetodos,
  },
  RecorteDados: {
    implementacao: RecorteDados,
    metodos: recorteDadosMetodos
  },
  IndiceTemporal: {
    implementacao: IndiceTemporal,
    metodos: IndiceTemporalMetodos,
  },
  Reamostrador: {
    implementacao: Reamostrador,
    metodos: metodosReamostragem,
  },

  // Funções de I/O - CSV
  lerCSV: {
    tipoRetorno: 'RecorteDados',
    funcao: lerCSV,
    argumentos: [
      { nome: 'caminhoArquivo', tipo: 'texto' },
      { nome: 'opcoes', tipo: 'objeto' },
    ],
    documentacao:
      '# `dados.lerCSV(caminhoArquivo, opcoes?)`\n\n' +
      'Lê um arquivo CSV e retorna um RecorteDados (DataFrame).\n\n' +
      '## Parâmetros\n\n' +
      '- `caminhoArquivo`: Caminho para o arquivo CSV a ser lido.\n' +
      '- `opcoes` (opcional): Dicionário com opções de leitura.\n' +
      '  - `delimitador`: Caractere delimitador (padrão: `,`).\n' +
      '  - `aspas`: Caractere de aspas (padrão: `"`).\n' +
      '  - `quebraLinha`: Caractere de quebra de linha (padrão: `\\n`).\n' +
      '  - `temCabecalho`: Se `verdadeiro`, primeira linha é cabeçalho (padrão: `verdadeiro`).\n' +
      '  - `colunas`: Vetor com nomes das colunas (se não houver cabeçalho).\n' +
      '  - `ignorarLinhasVazias`: Se `verdadeiro`, ignora linhas vazias (padrão: `verdadeiro`).\n\n' +
      '## Retorno\n\n' +
      'Retorna um objeto RecorteDados contendo os dados do arquivo CSV.\n\n' +
      '## Exemplo de Código\n\n' +
      '```delegua\n' +
      'importar tudo como dados de \'dados\'\n\n' +
      '// Ler arquivo CSV padrão\n' +
      'var df = dados.lerCSV("vendas.csv")\n' +
      'escreva(df.colunas()) // [\'produto\', \'quantidade\', \'preco\']\n\n' +
      '// Ler com delimitador personalizado\n' +
      'var df2 = dados.lerCSV("dados.txt", { \'delimitador\': \';\'  })\n\n' +
      '// Ler sem cabeçalho, definindo nomes das colunas\n' +
      'var df3 = dados.lerCSV("numeros.csv", { \n' +
      '    \'temCabecalho\': falso,\n' +
      '    \'colunas\': [\'A\', \'B\', \'C\']\n' +
      '})\n' +
      '```'
  },
  escreverCSV: {
    tipoRetorno: 'vazio',
    funcao: escreverCSV,
    argumentos: [
      { nome: 'df', tipo: 'RecorteDados' },
      { nome: 'caminhoArquivo', tipo: 'texto' },
      { nome: 'opcoes', tipo: 'objeto' },
    ],
    documentacao:
      '# `dados.escreverCSV(df, caminhoArquivo, opcoes?)`\n\n' +
      'Escreve um RecorteDados (DataFrame) em um arquivo CSV.\n\n' +
      '## Parâmetros\n\n' +
      '- `df`: O RecorteDados a ser escrito.\n' +
      '- `caminhoArquivo`: Caminho para o arquivo CSV de destino.\n' +
      '- `opcoes` (opcional): Dicionário com opções de escrita.\n' +
      '  - `delimitador`: Caractere delimitador (padrão: `,`).\n' +
      '  - `aspas`: Caractere de aspas (padrão: `"`).\n' +
      '  - `quebraLinha`: Caractere de quebra de linha (padrão: `\\n`).\n' +
      '  - `incluirCabecalho`: Se `verdadeiro`, inclui linha de cabeçalho (padrão: `verdadeiro`).\n' +
      '  - `incluirIndice`: Se `verdadeiro`, inclui índice como primeira coluna (padrão: `falso`).\n\n' +
      '## Retorno\n\n' +
      'Não retorna valor (escreve no arquivo).\n\n' +
      '## Exemplo de Código\n\n' +
      '```delegua\n' +
      'importar tudo como dados de \'dados\'\n\n' +
      'var df = dados.lerCSV("entrada.csv")\n\n' +
      '// Escrever arquivo CSV padrão\n' +
      'dados.escreverCSV(df, "saida.csv")\n\n' +
      '// Escrever com delimitador personalizado\n' +
      'dados.escreverCSV(df, "saida.txt", { \'delimitador\': \';\' })\n\n' +
      '// Escrever com índice\n' +
      'dados.escreverCSV(df, "com_indice.csv", { \'incluirIndice\': verdadeiro })\n' +
      '```'
  },

  // Funções de Data/Hora
  criarIntervaloDatas: {
    tipoRetorno: 'IndiceTemporal',
    funcao: criarIntervaloDatas,
    argumentos: [
      { nome: 'inicio', tipo: 'texto' },
      { nome: 'fim', tipo: 'texto' },
      { nome: 'frequencia', tipo: 'texto' },
    ],
    documentacao:
      '# `dados.criarIntervaloDatas(inicio, fim, frequencia)`\n\n' +
      'Cria um índice temporal com datas em intervalo regular entre início e fim.\n\n' +
      '## Parâmetros\n\n' +
      '- `inicio`: Data inicial no formato texto (ex: "2024-01-01").\n' +
      '- `fim`: Data final no formato texto (ex: "2024-12-31").\n' +
      '- `frequencia`: Frequência do intervalo. Valores aceitos:\n' +
      '  - `"D"`: Diário\n' +
      '  - `"W"`: Semanal\n' +
      '  - `"M"`: Mensal\n' +
      '  - `"Y"`: Anual\n' +
      '  - `"H"`: Horário\n' +
      '  - `"T"` ou `"min"`: Por minuto\n' +
      '  - `"S"`: Por segundo\n\n' +
      '## Retorno\n\n' +
      'Retorna um IndiceTemporal contendo as datas no intervalo especificado.\n\n' +
      '## Exemplo de Código\n\n' +
      '```delegua\n' +
      'importar tudo como dados de \'dados\'\n\n' +
      '// Criar intervalo de datas diário\n' +
      'var datas = dados.criarIntervaloDatas("2024-01-01", "2024-01-10", "D")\n' +
      'escreva(datas.comprimento()) // 10\n\n' +
      '// Criar intervalo mensal\n' +
      'var meses = dados.criarIntervaloDatas("2024-01-01", "2024-12-01", "M")\n' +
      'escreva(meses.comprimento()) // 12\n\n' +
      '// Criar intervalo horário\n' +
      'var horas = dados.criarIntervaloDatas("2024-01-01 00:00", "2024-01-01 23:00", "H")\n' +
      'escreva(horas.comprimento()) // 24\n' +
      '```'
  },
  compreenderData: {
    tipoRetorno: 'generico',
    funcao: compreenderData,
    argumentos: [{ nome: 'str', tipo: 'texto' }],
    documentacao:
      '# `dados.compreenderData(str)`\n\n' +
      'Converte uma string em um objeto de data, detectando automaticamente o formato.\n\n' +
      '## Parâmetros\n\n' +
      '- `str`: String representando a data. Aceita diversos formatos:\n' +
      '  - ISO 8601: "2024-01-15", "2024-01-15T10:30:00"\n' +
      '  - Brasileiro: "15/01/2024"\n' +
      '  - Com hora: "2024-01-15 10:30:00"\n' +
      '  - Timestamp Unix (número como string)\n\n' +
      '## Retorno\n\n' +
      'Retorna um objeto Date do JavaScript ou nulo se não conseguir analisar.\n\n' +
      '## Exemplo de Código\n\n' +
      '```delegua\n' +
      'importar tudo como dados de \'dados\'\n\n' +
      '// Diferentes formatos de data\n' +
      'var data1 = dados.compreenderData("2024-01-15")\n' +
      'var data2 = dados.compreenderData("15/01/2024")\n' +
      'var data3 = dados.compreenderData("2024-01-15T10:30:00")\n\n' +
      '// Usar com formatarData\n' +
      'var data = dados.compreenderData("2024-01-15")\n' +
      'var formatada = dados.formatarData(data, "DD/MM/YYYY")\n' +
      'escreva(formatada) // "15/01/2024"\n' +
      '```'
  },
  formatarData: {
    tipoRetorno: 'texto',
    funcao: formatarData,
    argumentos: [
      { nome: 'data', tipo: 'generico' },
      { nome: 'formato', tipo: 'texto' },
    ],
    documentacao:
      '# `dados.formatarData(data, formato)`\n\n' +
      'Formata um objeto de data em uma string de acordo com o formato especificado.\n\n' +
      '## Parâmetros\n\n' +
      '- `data`: Objeto Date ou string de data a ser formatada.\n' +
      '- `formato`: String de formato usando os seguintes tokens:\n' +
      '  - `YYYY`: Ano com 4 dígitos\n' +
      '  - `YY`: Ano com 2 dígitos\n' +
      '  - `MM`: Mês com 2 dígitos (01-12)\n' +
      '  - `M`: Mês sem zero à esquerda (1-12)\n' +
      '  - `DD`: Dia com 2 dígitos (01-31)\n' +
      '  - `D`: Dia sem zero à esquerda (1-31)\n' +
      '  - `HH`: Hora com 2 dígitos (00-23)\n' +
      '  - `mm`: Minuto com 2 dígitos (00-59)\n' +
      '  - `ss`: Segundo com 2 dígitos (00-59)\n\n' +
      '## Retorno\n\n' +
      'Retorna a data formatada como string.\n\n' +
      '## Exemplo de Código\n\n' +
      '```delegua\n' +
      'importar tudo como dados de \'dados\'\n\n' +
      'var data = dados.compreenderData("2024-01-15T10:30:45")\n\n' +
      '// Diferentes formatos\n' +
      'escreva(dados.formatarData(data, "DD/MM/YYYY")) // "15/01/2024"\n' +
      'escreva(dados.formatarData(data, "YYYY-MM-DD")) // "2024-01-15"\n' +
      'escreva(dados.formatarData(data, "DD/MM/YYYY HH:mm:ss")) // "15/01/2024 10:30:45"\n' +
      'escreva(dados.formatarData(data, "D/M/YY")) // "15/1/24"\n' +
      '```'
  },
  diferencaDias: {
    tipoRetorno: 'numero',
    funcao: diferencaDias,
    argumentos: [
      { nome: 'd1', tipo: 'generico' },
      { nome: 'd2', tipo: 'generico' },
    ],
    documentacao:
      '# `dados.diferencaDias(d1, d2)`\n\n' +
      'Calcula a diferença em dias entre duas datas.\n\n' +
      '## Parâmetros\n\n' +
      '- `d1`: Primeira data (objeto Date ou string).\n' +
      '- `d2`: Segunda data (objeto Date ou string).\n\n' +
      '## Retorno\n\n' +
      'Retorna o número de dias entre d1 e d2. Positivo se d2 for posterior a d1, negativo caso contrário.\n\n' +
      '## Exemplo de Código\n\n' +
      '```delegua\n' +
      'importar tudo como dados de \'dados\'\n\n' +
      'var data1 = dados.compreenderData("2024-01-01")\n' +
      'var data2 = dados.compreenderData("2024-01-15")\n\n' +
      'var dias = dados.diferencaDias(data1, data2)\n' +
      'escreva(dias) // 14\n\n' +
      '// Também funciona com strings diretamente\n' +
      'var diferenca = dados.diferencaDias("2024-01-01", "2024-02-01")\n' +
      'escreva(diferenca) // 31\n' +
      '```'
  },
  diferencaHoras: {
    tipoRetorno: 'numero',
    funcao: diferencaHoras,
    argumentos: [
      { nome: 'd1', tipo: 'generico' },
      { nome: 'd2', tipo: 'generico' },
    ],
    documentacao:
      '# `dados.diferencaHoras(d1, d2)`\n\n' +
      'Calcula a diferença em horas entre duas datas.\n\n' +
      '## Parâmetros\n\n' +
      '- `d1`: Primeira data/hora (objeto Date ou string).\n' +
      '- `d2`: Segunda data/hora (objeto Date ou string).\n\n' +
      '## Retorno\n\n' +
      'Retorna o número de horas entre d1 e d2. Positivo se d2 for posterior a d1, negativo caso contrário.\n\n' +
      '## Exemplo de Código\n\n' +
      '```delegua\n' +
      'importar tudo como dados de \'dados\'\n\n' +
      'var data1 = dados.compreenderData("2024-01-01 08:00:00")\n' +
      'var data2 = dados.compreenderData("2024-01-01 17:30:00")\n\n' +
      'var horas = dados.diferencaHoras(data1, data2)\n' +
      'escreva(horas) // 9.5\n\n' +
      '// Diferença em dias convertida para horas\n' +
      'var diferenca = dados.diferencaHoras("2024-01-01", "2024-01-02")\n' +
      'escreva(diferenca) // 24\n' +
      '```'
  },

  // Funções de Reamostragem
  reamostrar: {
    tipoRetorno: 'RecorteDados',
    funcao: reamostrar,
    argumentos: [
      { nome: 'dados', tipo: 'RecorteDados' },
      { nome: 'indice', tipo: 'IndiceTemporal' },
      { nome: 'frequencia', tipo: 'texto' },
      { nome: 'operacao', tipo: 'texto' },
      { nome: 'agregacao', tipo: 'texto' },
    ],
    documentacao:
      '# `dados.reamostrar(dados, indice, frequencia, operacao, agregacao)`\n\n' +
      'Reamostra dados de séries temporais para uma nova frequência.\n\n' +
      '## Parâmetros\n\n' +
      '- `dados`: RecorteDados contendo os dados a reamostrar.\n' +
      '- `indice`: IndiceTemporal usado para agrupar os dados.\n' +
      '- `frequencia`: Nova frequência desejada ("D", "W", "M", "Y", "H", etc).\n' +
      '- `operacao`: Tipo de operação de reamostragem:\n' +
      '  - `"downsampling"`: Redução de frequência (ex: diário para mensal)\n' +
      '  - `"upsampling"`: Aumento de frequência (ex: mensal para diário)\n' +
      '- `agregacao`: Função de agregação ou preenchimento:\n' +
      '  - Para downsampling: "soma", "media", "minimo", "maximo", "primeiro", "ultimo"\n' +
      '  - Para upsampling: "propagarFrente", "propagarTras", "interpolacao"\n\n' +
      '## Retorno\n\n' +
      'Retorna um novo RecorteDados com o índice temporal reamostrado.\n\n' +
      '## Exemplo de Código\n\n' +
      '```delegua\n' +
      'importar tudo como dados de \'dados\'\n\n' +
      '// Ler dados diários\n' +
      'var df = dados.lerCSV("vendas_diarias.csv")\n' +
      'var indice = df.indice() // Assumindo índice temporal\n\n' +
      '// Reamostrar para mensal com soma\n' +
      'var mensal = dados.reamostrar(df, indice, "M", "downsampling", "soma")\n\n' +
      '// Reamostrar para média semanal\n' +
      'var semanal = dados.reamostrar(df, indice, "W", "downsampling", "media")\n\n' +
      '// Aumentar frequência de mensal para diário\n' +
      'var diario = dados.reamostrar(mensal, indice, "D", "upsampling", "propagarFrente")\n' +
      '```'
  },
};
