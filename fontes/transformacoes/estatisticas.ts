/**
 * Módulo de Estatísticas
 * 
 * Funções estatísticas para Series e RecorteDados.
 */

import { Serie } from '../serie';
import { RecorteDados } from '../recorte-dados';

/**
 * Calcula a correlação de Pearson entre duas Series.
 */
export function correlacao(s1: Serie, s2: Serie): number {
    if (s1.tamanho !== s2.tamanho) {
        throw new Error('Series devem ter o mesmo tamanho');
    }

    const dados1 = s1.dados as number[];
    const dados2 = s2.dados as number[];

    const n = dados1.length;
    const media1 = dados1.reduce((a, b) => a + b, 0) / n;
    const media2 = dados2.reduce((a, b) => a + b, 0) / n;

    let numerador = 0;
    let denominador1 = 0;
    let denominador2 = 0;

    for (let i = 0; i < n; i++) {
        const dif1 = dados1[i] - media1;
        const dif2 = dados2[i] - media2;
        numerador += dif1 * dif2;
        denominador1 += dif1 * dif1;
        denominador2 += dif2 * dif2;
    }

    const correlacao = numerador / Math.sqrt(denominador1 * denominador2);
    return isNaN(correlacao) ? 0 : correlacao;
}

/**
 * Calcula a covariância entre duas Series.
 */
export function covariancia(s1: Serie, s2: Serie): number {
    if (s1.tamanho !== s2.tamanho) {
        throw new Error('Series devem ter o mesmo tamanho');
    }

    const dados1 = s1.dados as number[];
    const dados2 = s2.dados as number[];

    const n = dados1.length;
    const media1 = dados1.reduce((a, b) => a + b, 0) / n;
    const media2 = dados2.reduce((a, b) => a + b, 0) / n;

    let somaProdutos = 0;
    for (let i = 0; i < n; i++) {
        somaProdutos += (dados1[i] - media1) * (dados2[i] - media2);
    }

    return somaProdutos / n;
}

/**
 * Calcula quantil (percentil) de uma Serie.
 */
export function quantil(serie: Serie, q: number): number {
    if (q < 0 || q > 1) {
        throw new Error('Quantil deve estar entre 0 e 1');
    }

    const dados = [...(serie.dados as number[])].sort((a, b) => a - b);
    const n = dados.length;
    const indice = q * (n - 1);
    const indiceInferior = Math.floor(indice);
    const indiceSuperior = Math.ceil(indice);
    const fracao = indice % 1;

    if (indiceInferior === indiceSuperior) {
        return dados[indiceInferior];
    }

    return dados[indiceInferior] * (1 - fracao) + dados[indiceSuperior] * fracao;
}

/**
 * Calcula múltiplos quantis.
 */
export function quantis(serie: Serie, qs: number[]): number[] {
    return qs.map(q => quantil(serie, q));
}

/**
 * Calcula o intervalo interquartil (IQR).
 */
export function iqr(serie: Serie): number {
    const q1 = quantil(serie, 0.25);
    const q3 = quantil(serie, 0.75);
    return q3 - q1;
}

/**
 * Detecta outliers usando método IQR.
 */
export function detectarOutliers(serie: Serie): boolean[] {
    const q1 = quantil(serie, 0.25);
    const q3 = quantil(serie, 0.75);
    const iqr_valor = q3 - q1;
    const limite_inferior = q1 - 1.5 * iqr_valor;
    const limite_superior = q3 + 1.5 * iqr_valor;

    return (serie.dados as number[]).map(valor =>
        valor < limite_inferior || valor > limite_superior
    );
}

/**
 * Calcula matriz de correlação para um RecorteDados.
 */
export function matrizCorrelacao(recorte: RecorteDados): Record<string, Record<string, number>> {
    const resultado: Record<string, Record<string, number>> = {};

    // Obter apenas colunas numéricas
    const colunasNuméricas = recorte.nomeColunas.filter(col => {
        const serie = recorte.selecionarColuna(col);
        return typeof serie.dados[0] === 'number';
    });

    for (const col1 of colunasNuméricas) {
        resultado[col1] = {};
        const serie1 = recorte.selecionarColuna(col1);

        for (const col2 of colunasNuméricas) {
            const serie2 = recorte.selecionarColuna(col2);
            resultado[col1][col2] = correlacao(serie1, serie2);
        }
    }

    return resultado;
}

/**
 * Calcula assimetria (skewness) de uma Serie.
 */
export function assimetria(serie: Serie): number {
    const dados = serie.dados as number[];
    const n = dados.length;
    const media = dados.reduce((a, b) => a + b, 0) / n;
    const desvio = Math.sqrt(dados.reduce((a, b) => a + Math.pow(b - media, 2), 0) / n);

    if (desvio === 0) return 0;

    const somaCubos = dados.reduce((a, b) => a + Math.pow((b - media) / desvio, 3), 0);
    return somaCubos / n;
}

/**
 * Calcula curtose (kurtosis) de uma Serie.
 */
export function curtose(serie: Serie): number {
    const dados = serie.dados as number[];
    const n = dados.length;
    const media = dados.reduce((a, b) => a + b, 0) / n;
    const desvio = Math.sqrt(dados.reduce((a, b) => a + Math.pow(b - media, 2), 0) / n);

    if (desvio === 0) return 0;

    const somaQuartas = dados.reduce((a, b) => a + Math.pow((b - media) / desvio, 4), 0);
    return somaQuartas / n - 3; // Excess kurtosis
}

/**
 * Retorna estatísticas descritivas de uma Serie.
 */
export function descrever(serie: Serie): Record<string, number> {
    const dados = (serie.dados as number[]).filter(v => !isNaN(v));
    const n = dados.length;

    if (n === 0) {
        return {
            count: 0,
            mean: NaN,
            std: NaN,
            min: NaN,
            '25%': NaN,
            '50%': NaN,
            '75%': NaN,
            max: NaN
        };
    }

    const media = dados.reduce((a, b) => a + b, 0) / n;
    const desvio = Math.sqrt(dados.reduce((a, b) => a + Math.pow(b - media, 2), 0) / n);
    const minimo = Math.min(...dados);
    const maximo = Math.max(...dados);
    const q1 = quantil(serie, 0.25);
    const mediana = quantil(serie, 0.5);
    const q3 = quantil(serie, 0.75);

    return {
        count: n,
        mean: media,
        std: desvio,
        min: minimo,
        '25%': q1,
        '50%': mediana,
        '75%': q3,
        max: maximo
    };
}
