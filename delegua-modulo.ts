/**
 * delegua-dados: Módulo de Integração com Intérprete Delégua
 *
 * Este módulo expõe todas as classes e funções da biblioteca delegua-dados
 * para integração com o intérprete Delégua, seguindo os padrões de integração
 * estabelecidos em delegua-arquivos.
 * 
 * Nota: JSON, Excel e SQL I/O estão em pacotes separados opcionais:
 * - delegua-dados-json
 * - delegua-dados-excel
 * - delegua-dados-sql
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
    metodos: recorteDadosMetodos,
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
  },
  escreverCSV: {
    tipoRetorno: 'vazio',
    funcao: escreverCSV,
    argumentos: [
      { nome: 'df', tipo: 'RecorteDados' },
      { nome: 'caminhoArquivo', tipo: 'texto' },
      { nome: 'opcoes', tipo: 'objeto' },
    ],
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
  },
  compreenderData: {
    tipoRetorno: 'generico',
    funcao: compreenderData,
    argumentos: [{ nome: 'str', tipo: 'texto' }],
  },
  formatarData: {
    tipoRetorno: 'texto',
    funcao: formatarData,
    argumentos: [
      { nome: 'data', tipo: 'generico' },
      { nome: 'formato', tipo: 'texto' },
    ],
  },
  diferencaDias: {
    tipoRetorno: 'numero',
    funcao: diferencaDias,
    argumentos: [
      { nome: 'd1', tipo: 'generico' },
      { nome: 'd2', tipo: 'generico' },
    ],
  },
  diferencaHoras: {
    tipoRetorno: 'numero',
    funcao: diferencaHoras,
    argumentos: [
      { nome: 'd1', tipo: 'generico' },
      { nome: 'd2', tipo: 'generico' },
    ],
  },

  // Funções de Resampling
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
  },
};
