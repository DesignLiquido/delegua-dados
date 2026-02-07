/**
 * Exportações principais da biblioteca delegua-dados
 * Todas as classes e funções públicas da biblioteca
 */

// Fase 1: Estruturas de Dados Fundamentais
export { Indice } from './indice';
export { Serie } from './serie';
export { RecorteDados } from './recorte-dados';

// Fase 2-4: I/O - CSV (core)
export {
  lerCSV,
  escreverCSV,
  type OpcoesCSV,
} from './entrada-saida/csv';

// Nota: JSON, Excel e SQL I/O estão em pacotes separados:
// - delegua-dados-json
// - delegua-dados-excel
// - delegua-dados-sql

// Fase 5: Séries Temporais
export {
  IndiceTemporal,
  criarIntervaloDatas,
  compreenderData,
  formatarData,
  diferencaDias,
  diferencaHoras,
} from './indice-temporal';

export {
  Reamostrador,
  reamostrar,
  type Frequencia,
  type FuncaoAgregacao,
} from './reamostrador';
