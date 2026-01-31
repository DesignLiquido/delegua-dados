/**
 * Tipos e interfaces para delegua-dados
 */

/**
 * Tipo de dado suportado
 */
export type TipoDado = 'numero' | 'texto' | 'booleano' | 'data' | 'objeto' | 'desconhecido';

/**
 * Opções para operações de I/O
 */
export interface OpcoesIO {
    delimitador?: string;
    temInicio?: number;
    colunas?: string[];
    indice?: boolean;
}

/**
 * Opções para ordenação
 */
export interface OpcoesOrdenacao {
    crescente?: boolean;
    coluna?: string;
}

/**
 * Opções para GroupBy
 */
export interface OpcoesAgrupamento {
    nomes?: boolean;
    sort?: boolean;
}

/**
 * Resultado de operação estatística
 */
export interface ResultadoEstatistico {
    media?: number;
    mediana?: number;
    minimo?: number;
    maximo?: number;
    desvio?: number;
    variancia?: number;
    contagem?: number;
    soma?: number;
}
