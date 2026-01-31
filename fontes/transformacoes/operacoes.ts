import { RecorteDados } from '../recorte-dados';
import { Serie } from '../serie';

/**
 * Operações aritméticas e de comparação vetorizadas para RecorteDados e Series.
 */

/**
 * Operadores aritméticos suportados
 */
export type OperadorAritmetico = '+' | '-' | '*' | '/' | '%' | '**';

/**
 * Operadores de comparação suportados
 */
export type OperadorComparacao = '==' | '!=' | '<' | '<=' | '>' | '>=';

/**
 * Operadores lógicos suportados
 */
export type OperadorLogico = 'e' | 'ou' | 'nao';

/**
 * Aplica operação aritmética entre Serie e número ou entre duas Series.
 * 
 * @param serie Serie base
 * @param operando Número ou outra Serie
 * @param operador Operador aritmético
 * @returns Nova Serie com resultado
 * 
 * @example
 * const s = new Serie([1, 2, 3]);
 * const resultado = operacaoAritmetica(s, 2, '*'); // [2, 4, 6]
 */
export function operacaoAritmetica(
    serie: Serie,
    operando: number | Serie,
    operador: OperadorAritmetico
): Serie {
    const dados = serie.dados as number[];
    let resultado: number[];

    if (typeof operando === 'number') {
        // Operação com escalar
        resultado = dados.map(v => aplicarOperador(v, operando, operador));
    } else {
        // Operação entre Series
        if (serie.tamanho !== operando.tamanho) {
            throw new Error('Series devem ter o mesmo tamanho para operações aritméticas');
        }
        
        const dadosOperando = operando.dados as number[];
        resultado = dados.map((v, i) => aplicarOperador(v, dadosOperando[i], operador));
    }

    return new Serie(resultado, {
        indice: serie.indice.dados,
        nome: serie.nome ? `${serie.nome}_${operador}` : undefined
    });
}

/**
 * Aplica operador aritmético a dois números.
 */
function aplicarOperador(a: number, b: number, operador: OperadorAritmetico): number {
    switch (operador) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : NaN;
        case '%': return a % b;
        case '**': return Math.pow(a, b);
        default: throw new Error(`Operador desconhecido: ${operador}`);
    }
}

/**
 * Aplica operação de comparação a uma Serie.
 * 
 * @param serie Serie base
 * @param operando Valor ou Serie para comparar
 * @param operador Operador de comparação
 * @returns Nova Serie booleana com resultado
 * 
 * @example
 * const s = new Serie([1, 2, 3]);
 * const resultado = operacaoComparacao(s, 2, '>'); // [false, false, true]
 */
export function operacaoComparacao(
    serie: Serie,
    operando: any | Serie,
    operador: OperadorComparacao
): Serie {
    const dados = serie.dados;
    let resultado: boolean[];

    if (!(operando instanceof Serie)) {
        // Comparação com escalar
        resultado = dados.map(v => aplicarComparacao(v, operando, operador));
    } else {
        // Comparação entre Series
        if (serie.tamanho !== operando.tamanho) {
            throw new Error('Series devem ter o mesmo tamanho para operações de comparação');
        }
        
        resultado = dados.map((v, i) => aplicarComparacao(v, operando.dados[i], operador));
    }

    return new Serie(resultado, {
        indice: serie.indice.dados,
        nome: serie.nome ? `${serie.nome}_${operador}` : undefined
    });
}

/**
 * Aplica operador de comparação a dois valores.
 */
function aplicarComparacao(a: any, b: any, operador: OperadorComparacao): boolean {
    switch (operador) {
        case '==': return a === b;
        case '!=': return a !== b;
        case '<': return a < b;
        case '<=': return a <= b;
        case '>': return a > b;
        case '>=': return a >= b;
        default: throw new Error(`Operador desconhecido: ${operador}`);
    }
}

/**
 * Aplica operação lógica a Series booleanas.
 * 
 * @param serie1 Primeira Serie booleana
 * @param serie2 Segunda Serie booleana (não necessária para 'nao')
 * @param operador Operador lógico
 * @returns Nova Serie booleana com resultado
 * 
 * @example
 * const s1 = new Serie([true, false, true]);
 * const s2 = new Serie([true, true, false]);
 * const resultado = operacaoLogica(s1, s2, 'e'); // [true, false, false]
 */
export function operacaoLogica(
    serie1: Serie,
    serie2: Serie | null,
    operador: OperadorLogico
): Serie {
    const dados1 = serie1.dados as boolean[];
    let resultado: boolean[];

    switch (operador) {
        case 'e':
            if (!serie2) throw new Error('Operador "e" requer duas Series');
            if (serie1.tamanho !== serie2.tamanho) {
                throw new Error('Series devem ter o mesmo tamanho para operações lógicas');
            }
            resultado = dados1.map((v, i) => v && (serie2.dados[i] as boolean));
            break;
        
        case 'ou':
            if (!serie2) throw new Error('Operador "ou" requer duas Series');
            if (serie1.tamanho !== serie2.tamanho) {
                throw new Error('Series devem ter o mesmo tamanho para operações lógicas');
            }
            resultado = dados1.map((v, i) => v || (serie2.dados[i] as boolean));
            break;
        
        case 'nao':
            resultado = dados1.map(v => !v);
            break;
        
        default:
            throw new Error(`Operador desconhecido: ${operador}`);
    }

    return new Serie(resultado, {
        indice: serie1.indice.dados,
        nome: serie1.nome ? `${serie1.nome}_${operador}` : undefined
    });
}

/**
 * Aplica operação aritmética a uma coluna específica de RecorteDados.
 * 
 * @param recorte RecorteDados base
 * @param coluna Nome da coluna
 * @param operando Número ou Serie
 * @param operador Operador aritmético
 * @returns Novo RecorteDados com coluna modificada
 * 
 * @example
 * const rd = new RecorteDados({ A: [1, 2, 3], B: [4, 5, 6] });
 * const resultado = operacaoRecorte(rd, 'A', 2, '*');
 * // Resultado: coluna A será [2, 4, 6]
 */
export function operacaoRecorte(
    recorte: RecorteDados,
    coluna: string,
    operando: number | Serie,
    operador: OperadorAritmetico
): RecorteDados {
    const serie = recorte.selecionarColuna(coluna);
    const serieResultado = operacaoAritmetica(serie, operando, operador);
    
    const novoRecorte = recorte.copia();
    novoRecorte.adicionarColuna(coluna, serieResultado.dados);
    
    return novoRecorte;
}

/**
 * Aplica operação aritmética a todas as colunas numéricas de um RecorteDados.
 * 
 * @param recorte RecorteDados base
 * @param operando Número a aplicar
 * @param operador Operador aritmético
 * @returns Novo RecorteDados com todas colunas numéricas modificadas
 * 
 * @example
 * const rd = new RecorteDados({ A: [1, 2], B: [3, 4] });
 * const resultado = operacaoRecorteTodas(rd, 10, '+');
 * // Resultado: A=[11, 12], B=[13, 14]
 */
export function operacaoRecorteTodas(
    recorte: RecorteDados,
    operando: number,
    operador: OperadorAritmetico
): RecorteDados {
    const novosDados: Record<string, any[]> = {};

    for (const nomeColuna of recorte.nomeColunas) {
        const serie = recorte.selecionarColuna(nomeColuna);
        
        // Verificar se é coluna numérica
        if (serie.tipoDado === 'numero') {
            const serieResultado = operacaoAritmetica(serie, operando, operador);
            novosDados[nomeColuna] = serieResultado.dados;
        } else {
            novosDados[nomeColuna] = serie.dados;
        }
    }

    return new RecorteDados(novosDados, { indice: recorte.indice.dados });
}

/**
 * Aplica função customizada a cada elemento de uma Serie.
 * 
 * @param serie Serie base
 * @param funcao Função a aplicar
 * @returns Nova Serie com resultado
 * 
 * @example
 * const s = new Serie([1, 2, 3]);
 * const resultado = aplicarFuncao(s, x => x * x); // [1, 4, 9]
 */
export function aplicarFuncao<T, U>(serie: Serie, funcao: (valor: T) => U): Serie {
    const resultado = (serie.dados as T[]).map(funcao);
    
    return new Serie(resultado, {
        indice: serie.indice.dados,
        nome: serie.nome
    });
}

/**
 * Aplica função a cada elemento de todas as colunas de um RecorteDados.
 * 
 * @param recorte RecorteDados base
 * @param funcao Função a aplicar
 * @returns Novo RecorteDados com resultado
 * 
 * @example
 * const rd = new RecorteDados({ A: [1, 2], B: [3, 4] });
 * const resultado = aplicarMapaCompleto(rd, x => x * 2);
 * // Resultado: A=[2, 4], B=[6, 8]
 */
export function aplicarMapaCompleto<T, U>(
    recorte: RecorteDados,
    funcao: (valor: T) => U
): RecorteDados {
    const novosDados: Record<string, any[]> = {};

    for (const nomeColuna of recorte.nomeColunas) {
        const serie = recorte.selecionarColuna(nomeColuna);
        const serieResultado = aplicarFuncao(serie, funcao);
        novosDados[nomeColuna] = serieResultado.dados;
    }

    return new RecorteDados(novosDados, { indice: recorte.indice.dados });
}

/**
 * Normaliza valores de uma Serie (min-max scaling).
 * 
 * @param serie Serie a ser normalizada
 * @returns Nova Serie normalizada entre 0 e 1
 * 
 * @example
 * const s = new Serie([10, 20, 30]);
 * const resultado = normalizar(s); // [0, 0.5, 1]
 */
export function normalizar(serie: Serie): Serie {
    const dados = serie.dados as number[];
    const min = Math.min(...dados);
    const max = Math.max(...dados);
    const range = max - min;

    if (range === 0) {
        return new Serie(dados.map(() => 0), {
            indice: serie.indice.dados,
            nome: serie.nome ? `${serie.nome}_norm` : 'normalizado'
        });
    }

    const resultado = dados.map(v => (v - min) / range);
    
    return new Serie(resultado, {
        indice: serie.indice.dados,
        nome: serie.nome ? `${serie.nome}_norm` : 'normalizado'
    });
}

/**
 * Padroniza valores de uma Serie (z-score).
 * 
 * @param serie Serie a ser padronizada
 * @returns Nova Serie padronizada (média=0, desvio padrão=1)
 * 
 * @example
 * const s = new Serie([10, 20, 30]);
 * const resultado = padronizar(s);
 */
export function padronizar(serie: Serie): Serie {
    const dados = serie.dados as number[];
    const n = dados.length;
    const media = dados.reduce((a, b) => a + b, 0) / n;
    const variancia = dados.reduce((a, b) => a + Math.pow(b - media, 2), 0) / n;
    const desvioPadrao = Math.sqrt(variancia);

    if (desvioPadrao === 0) {
        return new Serie(dados.map(() => 0), {
            indice: serie.indice.dados,
            nome: serie.nome ? `${serie.nome}_std` : 'padronizado'
        });
    }

    const resultado = dados.map(v => (v - media) / desvioPadrao);
    
    return new Serie(resultado, {
        indice: serie.indice.dados,
        nome: serie.nome ? `${serie.nome}_std` : 'padronizado'
    });
}

/**
 * Calcula diferença entre valores consecutivos em uma Serie.
 * 
 * @param serie Serie base
 * @param periodos Número de períodos para calcular diferença
 * @returns Nova Serie com diferenças
 * 
 * @example
 * const s = new Serie([10, 15, 18, 20]);
 * const resultado = diferenca(s, 1); // [NaN, 5, 3, 2]
 */
export function diferenca(serie: Serie, periodos: number = 1): Serie {
    const dados = serie.dados as number[];
    const resultado: (number | null)[] = [];

    for (let i = 0; i < dados.length; i++) {
        if (i < periodos) {
            resultado.push(null);
        } else {
            resultado.push(dados[i] - dados[i - periodos]);
        }
    }

    return new Serie(resultado, {
        indice: serie.indice.dados,
        nome: serie.nome ? `${serie.nome}_diff` : 'diferenca'
    });
}

/**
 * Calcula variação percentual entre valores consecutivos.
 * 
 * @param serie Serie base
 * @param periodos Número de períodos
 * @returns Nova Serie com variações percentuais
 * 
 * @example
 * const s = new Serie([100, 110, 121]);
 * const resultado = variacaoPercentual(s, 1); // [NaN, 0.1, 0.1]
 */
export function variacaoPercentual(serie: Serie, periodos: number = 1): Serie {
    const dados = serie.dados as number[];
    const resultado: (number | null)[] = [];

    for (let i = 0; i < dados.length; i++) {
        if (i < periodos || dados[i - periodos] === 0) {
            resultado.push(null);
        } else {
            resultado.push((dados[i] - dados[i - periodos]) / dados[i - periodos]);
        }
    }

    return new Serie(resultado, {
        indice: serie.indice.dados,
        nome: serie.nome ? `${serie.nome}_pct` : 'variacao_pct'
    });
}
