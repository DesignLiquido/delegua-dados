/**
 * Módulo de Operações de Janelas (Windows/Rolling)
 * 
 * Implementa janelas deslizantes (rolling) e crescentes (expanding).
 */

import { Serie } from '../serie';

/**
 * Classe para operações de janela deslizante (rolling window).
 */
export class JanelaMovel {
    private serie: Serie;
    private tamanhoJanela: number;

    /**
     * Cria uma instância de JanelaDeslizante.
     * @param serie - Serie para aplicar janelas
     * @param tamanho - Tamanho da janela
     */
    constructor(serie: Serie, tamanho: number) {
        if (tamanho <= 0 || tamanho > serie.tamanho) {
            throw new Error('Tamanho da janela deve ser positivo e menor que o tamanho da série');
        }
        this.serie = serie;
        this.tamanhoJanela = tamanho;
    }

    /**
     * Média móvel.
     */
    media(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: any[] = [];

        for (let i = 0; i < dados.length; i++) {
            if (i < this.tamanhoJanela - 1) {
                resultado.push(null);
            } else {
                const janela = dados.slice(i - this.tamanhoJanela + 1, i + 1);
                const media = janela.reduce((a, b) => a + b, 0) / janela.length;
                resultado.push(media);
            }
        }

        return new Serie(resultado);
    }

    /**
     * Soma móvel.
     */
    soma(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: any[] = [];

        for (let i = 0; i < dados.length; i++) {
            if (i < this.tamanhoJanela - 1) {
                resultado.push(null);
            } else {
                const janela = dados.slice(i - this.tamanhoJanela + 1, i + 1);
                const soma = janela.reduce((a, b) => a + b, 0);
                resultado.push(soma);
            }
        }

        return new Serie(resultado);
    }

    /**
     * Desvio padrão móvel.
     */
    desvio(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: any[] = [];

        for (let i = 0; i < dados.length; i++) {
            if (i < this.tamanhoJanela - 1) {
                resultado.push(null);
            } else {
                const janela = dados.slice(i - this.tamanhoJanela + 1, i + 1);
                const media = janela.reduce((a, b) => a + b, 0) / janela.length;
                const variancia = janela.reduce((a, b) => a + Math.pow(b - media, 2), 0) / janela.length;
                const desvio = Math.sqrt(variancia);
                resultado.push(desvio);
            }
        }

        return new Serie(resultado);
    }

    /**
     * Mínimo móvel.
     */
    minimo(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: any[] = [];

        for (let i = 0; i < dados.length; i++) {
            if (i < this.tamanhoJanela - 1) {
                resultado.push(null);
            } else {
                const janela = dados.slice(i - this.tamanhoJanela + 1, i + 1);
                resultado.push(Math.min(...janela));
            }
        }

        return new Serie(resultado);
    }

    /**
     * Máximo móvel.
     */
    maximo(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: any[] = [];

        for (let i = 0; i < dados.length; i++) {
            if (i < this.tamanhoJanela - 1) {
                resultado.push(null);
            } else {
                const janela = dados.slice(i - this.tamanhoJanela + 1, i + 1);
                resultado.push(Math.max(...janela));
            }
        }

        return new Serie(resultado);
    }

    /**
     * Aplicar função customizada a cada janela.
     */
    aplicar(funcao: (janela: number[]) => number): Serie {
        const dados = this.serie.dados as number[];
        const resultado: any[] = [];

        for (let i = 0; i < dados.length; i++) {
            if (i < this.tamanhoJanela - 1) {
                resultado.push(null);
            } else {
                const janela = dados.slice(i - this.tamanhoJanela + 1, i + 1);
                resultado.push(funcao(janela));
            }
        }

        return new Serie(resultado);
    }
}

/**
 * Classe para operações de janela crescente (expanding window).
 */
export class JanelaCrescente {
    private serie: Serie;

    /**
     * Cria uma instância de JanelaCrescente.
     * @param serie - Serie para aplicar janelas
     */
    constructor(serie: Serie) {
        this.serie = serie;
    }

    /**
     * Média crescente.
     */
    media(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: number[] = [];
        let soma = 0;

        for (let i = 0; i < dados.length; i++) {
            soma += dados[i];
            resultado.push(soma / (i + 1));
        }

        return new Serie(resultado);
    }

    /**
     * Soma crescente.
     */
    soma(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: number[] = [];
        let soma = 0;

        for (let i = 0; i < dados.length; i++) {
            soma += dados[i];
            resultado.push(soma);
        }

        return new Serie(resultado);
    }

    /**
     * Desvio padrão crescente.
     */
    desvio(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: number[] = [];

        for (let i = 0; i < dados.length; i++) {
            const subconjunto = dados.slice(0, i + 1);
            const media = subconjunto.reduce((a, b) => a + b, 0) / subconjunto.length;
            const variancia = subconjunto.reduce((a, b) => a + Math.pow(b - media, 2), 0) / subconjunto.length;
            resultado.push(Math.sqrt(variancia));
        }

        return new Serie(resultado);
    }

    /**
     * Mínimo crescente.
     */
    minimo(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: number[] = [];
        let minAtual = Infinity;

        for (let i = 0; i < dados.length; i++) {
            minAtual = Math.min(minAtual, dados[i]);
            resultado.push(minAtual);
        }

        return new Serie(resultado);
    }

    /**
     * Máximo crescente.
     */
    maximo(): Serie {
        const dados = this.serie.dados as number[];
        const resultado: number[] = [];
        let maxAtual = -Infinity;

        for (let i = 0; i < dados.length; i++) {
            maxAtual = Math.max(maxAtual, dados[i]);
            resultado.push(maxAtual);
        }

        return new Serie(resultado);
    }

    /**
     * Aplicar função customizada a cada janela crescente.
     */
    aplicar(funcao: (janela: number[]) => number): Serie {
        const dados = this.serie.dados as number[];
        const resultado: number[] = [];

        for (let i = 0; i < dados.length; i++) {
            const subconjunto = dados.slice(0, i + 1);
            resultado.push(funcao(subconjunto));
        }

        return new Serie(resultado);
    }
}

/**
 * Criar uma janela deslizante (rolling window).
 */
export function janelaMovel(serie: Serie, tamanho: number): JanelaMovel {
    return new JanelaMovel(serie, tamanho);
}

/**
 * Criar uma janela crescente (expanding window).
 */
export function janelaCrescente(serie: Serie): JanelaCrescente {
    return new JanelaCrescente(serie);
}

/**
 * Média móvel exponencial (EMA).
 */
export function mediaMovelExponencial(serie: Serie, periodo: number): Serie {
    const dados = serie.dados as number[];
    const resultado: number[] = [];
    const alpha = 2 / (periodo + 1);

    let ema = dados[0];
    resultado.push(ema);

    for (let i = 1; i < dados.length; i++) {
        ema = alpha * dados[i] + (1 - alpha) * ema;
        resultado.push(ema);
    }

    return new Serie(resultado);
}

/**
 * Convergência/Divergência de Médias Móveis (MACD).
 */
export function macd(
    serie: Serie,
    periodo_rapido: number = 12,
    periodo_lento: number = 26,
    periodo_sinal: number = 9
): { macd: Serie; sinal: Serie; histograma: Serie } {
    const ema_rapida = mediaMovelExponencial(serie, periodo_rapido);
    const ema_lenta = mediaMovelExponencial(serie, periodo_lento);

    // Calcular MACD (diferença entre EMAs)
    const dados_macd: number[] = [];
    for (let i = 0; i < ema_rapida.tamanho; i++) {
        dados_macd.push((ema_rapida.dados[i] as number) - (ema_lenta.dados[i] as number));
    }

    const serie_macd = new Serie(dados_macd);
    const sinal = mediaMovelExponencial(serie_macd, periodo_sinal);

    // Calcular histograma
    const dados_histograma: number[] = [];
    for (let i = 0; i < serie_macd.tamanho; i++) {
        dados_histograma.push((dados_macd[i] as number) - (sinal.dados[i] as number));
    }

    return {
        macd: serie_macd,
        sinal,
        histograma: new Serie(dados_histograma)
    };
}

/**
 * Índice de Força Relativa (RSI, Relative Strength Index).
 */
export function indiceForcaRelativa(serie: Serie, periodo: number = 14): Serie {
    const dados = serie.dados as number[];
    const resultado: any[] = [];

    if (dados.length < periodo + 1) {
        return new Serie(dados.map(() => null));
    }

    // Calcular ganhos e perdas
    const ganhos: number[] = [];
    const perdas: number[] = [];

    for (let i = 1; i < dados.length; i++) {
        const mudanca = dados[i] - dados[i - 1];
        ganhos.push(mudanca > 0 ? mudanca : 0);
        perdas.push(mudanca < 0 ? -mudanca : 0);
    }

    // Calcular RSI
    // Precisamos de período+1 valores para calcular (1 valor inicial + período de mudanças)
    for (let i = 0; i <= periodo; i++) {
        resultado.push(null);
    }

    for (let i = periodo; i < ganhos.length; i++) {
        const ganho_medio = ganhos.slice(i - periodo, i).reduce((a, b) => a + b, 0) / periodo;
        const perda_media = perdas.slice(i - periodo, i).reduce((a, b) => a + b, 0) / periodo;

        if (perda_media === 0) {
            resultado.push(100);
        } else {
            const rs = ganho_medio / perda_media;
            const rsi_valor = 100 - (100 / (1 + rs));
            resultado.push(rsi_valor);
        }
    }

    return new Serie(resultado);
}
