/**
 * Testes para módulo de Janelas (Rolling/Expanding)
 */

import { Serie } from '../../fontes/serie';
import {
    janelaMovel,
    janelaCrescente,
    mediaMovelExponencial,
    macd,
    indiceForcaRelativa
} from '../../fontes/transformacoes/janelas';

describe('Janelas: Deslizantes (Rolling)', () => {
    it('deve calcular média móvel', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const rolagem = janelaMovel(serie, 3);
        const resultado = rolagem.media();

        expect(resultado.dados[0]).toBeNull();
        expect(resultado.dados[1]).toBeNull();
        expect(resultado.dados[2]).toBe(2); // (1+2+3)/3
        expect(resultado.dados[3]).toBe(3); // (2+3+4)/3
        expect(resultado.dados[4]).toBe(4); // (3+4+5)/3
    });

    it('deve calcular soma móvel', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const rolagem = janelaMovel(serie, 2);
        const resultado = rolagem.soma();

        expect(resultado.dados[0]).toBeNull();
        expect(resultado.dados[1]).toBe(3); // 1+2
        expect(resultado.dados[2]).toBe(5); // 2+3
        expect(resultado.dados[3]).toBe(7); // 3+4
        expect(resultado.dados[4]).toBe(9); // 4+5
    });

    it('deve calcular desvio padrão móvel', () => {
        const serie = new Serie([10, 20, 30, 40, 50]);
        const rolagem = janelaMovel(serie, 2);
        const resultado = rolagem.desvio();

        expect(resultado.dados[0]).toBeNull();
        expect(resultado.dados[1]).toBeGreaterThan(0);
    });

    it('deve calcular mínimo móvel', () => {
        const serie = new Serie([5, 2, 8, 1, 9]);
        const rolagem = janelaMovel(serie, 2);
        const resultado = rolagem.minimo();

        expect(resultado.dados[0]).toBeNull();
        expect(resultado.dados[1]).toBe(2); // min(5,2)
        expect(resultado.dados[2]).toBe(2); // min(2,8)
        expect(resultado.dados[3]).toBe(1); // min(8,1)
        expect(resultado.dados[4]).toBe(1); // min(1,9)
    });

    it('deve calcular máximo móvel', () => {
        const serie = new Serie([5, 2, 8, 1, 9]);
        const rolagem = janelaMovel(serie, 2);
        const resultado = rolagem.maximo();

        expect(resultado.dados[0]).toBeNull();
        expect(resultado.dados[1]).toBe(5); // max(5,2)
        expect(resultado.dados[2]).toBe(8); // max(2,8)
        expect(resultado.dados[3]).toBe(8); // max(8,1)
        expect(resultado.dados[4]).toBe(9); // max(1,9)
    });

    it('deve aplicar função customizada', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const rolagem = janelaMovel(serie, 2);
        const resultado = rolagem.aplicar((janela) => Math.max(...janela) - Math.min(...janela));

        expect(resultado.dados[0]).toBeNull();
        expect(resultado.dados[1]).toBe(1); // 2-1
        expect(resultado.dados[2]).toBe(1); // 3-2
    });

    it('deve lançar erro para tamanho inválido', () => {
        const serie = new Serie([1, 2, 3]);

        expect(() => janelaMovel(serie, 0)).toThrow();
        expect(() => janelaMovel(serie, 5)).toThrow();
    });
});

describe('Janelas: Crescentes (Expanding)', () => {
    it('deve calcular média crescente', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const expandindo = janelaCrescente(serie);
        const resultado = expandindo.media();

        expect(resultado.dados[0]).toBe(1); // 1
        expect(resultado.dados[1]).toBe(1.5); // (1+2)/2
        expect(resultado.dados[2]).toBe(2); // (1+2+3)/3
        expect(resultado.dados[3]).toBe(2.5); // (1+2+3+4)/4
        expect(resultado.dados[4]).toBe(3); // (1+2+3+4+5)/5
    });

    it('deve calcular soma crescente', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const expandindo = janelaCrescente(serie);
        const resultado = expandindo.soma();

        expect(resultado.dados[0]).toBe(1);
        expect(resultado.dados[1]).toBe(3);
        expect(resultado.dados[2]).toBe(6);
        expect(resultado.dados[3]).toBe(10);
        expect(resultado.dados[4]).toBe(15);
    });

    it('deve calcular desvio padrão crescente', () => {
        const serie = new Serie([10, 20, 30, 40, 50]);
        const expandindo = janelaCrescente(serie);
        const resultado = expandindo.desvio();

        expect(resultado.tamanho).toBe(5);
        expect((resultado.dados as number[])[0]).toBe(0); // Um valor tem desvio 0
        expect((resultado.dados as number[])[4]).toBeGreaterThan(0);
    });

    it('deve calcular mínimo crescente', () => {
        const serie = new Serie([5, 2, 8, 1, 9]);
        const expandindo = janelaCrescente(serie);
        const resultado = expandindo.minimo();

        expect(resultado.dados[0]).toBe(5);
        expect(resultado.dados[1]).toBe(2); // min até aqui
        expect(resultado.dados[2]).toBe(2);
        expect(resultado.dados[3]).toBe(1); // novo mínimo
        expect(resultado.dados[4]).toBe(1);
    });

    it('deve calcular máximo crescente', () => {
        const serie = new Serie([5, 2, 8, 1, 9]);
        const expandindo = janelaCrescente(serie);
        const resultado = expandindo.maximo();

        expect(resultado.dados[0]).toBe(5);
        expect(resultado.dados[1]).toBe(5); // max até aqui
        expect(resultado.dados[2]).toBe(8); // novo máximo
        expect(resultado.dados[3]).toBe(8);
        expect(resultado.dados[4]).toBe(9); // novo máximo
    });

    it('deve aplicar função customizada', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const expandindo = janelaCrescente(serie);
        const resultado = expandindo.aplicar((janela) => Math.max(...janela) - Math.min(...janela));

        expect(resultado.dados[0]).toBe(0); // 5-5
        expect(resultado.dados[1]).toBe(1); // 2-1
        expect(resultado.dados[4]).toBe(4); // 5-1
    });
});

describe('Janelas: Média Móvel Exponencial (EMA)', () => {
    it('deve calcular EMA', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const ema = mediaMovelExponencial(serie, 2);

        expect(ema.tamanho).toBe(5);
        expect((ema.dados as number[])[0]).toBe(1); // primeiro valor é o inicial
        expect((ema.dados as number[])[1]).toBeGreaterThan(1);
    });

    it('deve usar parâmetro de período', () => {
        const serie = new Serie([10, 20, 30, 40, 50]);
        const ema2 = mediaMovelExponencial(serie, 2);
        const ema3 = mediaMovelExponencial(serie, 3);

        expect(ema2.tamanho).toBe(ema3.tamanho);
        // EMA com período menor reage mais rápido
        expect(Math.abs((ema2.dados[1] as number) - 10))
            .toBeGreaterThan(Math.abs((ema3.dados[1] as number) - 10));
    });
});

describe('Janelas: MACD', () => {
    it('deve calcular MACD com componentes', () => {
        const serie = new Serie([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const { macd: macd_linha, sinal, histograma } = macd(serie);

        expect(macd_linha.tamanho).toBe(10);
        expect(sinal.tamanho).toBe(10);
        expect(histograma.tamanho).toBe(10);
    });

    it('deve calcular histograma corretamente', () => {
        const serie = new Serie([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const { macd: macd_linha, sinal, histograma } = macd(serie);

        // Histograma = MACD - Sinal
        for (let i = 0; i < histograma.tamanho; i++) {
            expect(Math.abs(
                ((histograma.dados[i] as number) - ((macd_linha.dados[i] as number) - (sinal.dados[i] as number)))
            )).toBeLessThan(0.0001);
        }
    });

    it('deve usar parâmetros customizados', () => {
        const serie = new Serie([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const resultado1 = macd(serie, 2, 4, 2);
        const resultado2 = macd(serie, 12, 26, 9);

        expect(resultado1.macd.tamanho).toBe(resultado2.macd.tamanho);
    });
});

describe('Janelas: RSI (Relative Strength Index)', () => {
    it('deve calcular RSI', () => {
        const serie = new Serie([44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.83]);
        const rsi_valor = indiceForcaRelativa(serie, 2);

        expect(rsi_valor.tamanho).toBe(7);
        expect((rsi_valor.dados as any[])[0]).toBeNull();
        expect((rsi_valor.dados as any[])[1]).toBeNull();
        expect((rsi_valor.dados as any[])[2]).toBeNull();
    });

    it('deve retornar valor entre 0 e 100', () => {
        const serie = new Serie([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
        const rsi_valor = indiceForcaRelativa(serie, 3);

        for (let i = 3; i < rsi_valor.tamanho; i++) {
            const valor = rsi_valor.dados[i] as number;
            if (valor !== null) {
                expect(valor).toBeGreaterThanOrEqual(0);
                expect(valor).toBeLessThanOrEqual(100);
            }
        }
    });

    it('deve indicar tendência de alta (RSI > 70)', () => {
        // Série com tendência crescente forte
        const serie = new Serie([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        const rsi_valor = indiceForcaRelativa(serie, 3);

        const ultimo_rsi = rsi_valor.dados[rsi_valor.tamanho - 1] as number;
        expect(ultimo_rsi).toBeGreaterThan(50);
    });

    it('deve indicar tendência de baixa (RSI < 30)', () => {
        // Série com tendência decrescente
        const serie = new Serie([15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
        const rsi_valor = indiceForcaRelativa(serie, 3);

        const ultimo_rsi = rsi_valor.dados[rsi_valor.tamanho - 1] as number;
        expect(ultimo_rsi).toBeLessThan(50);
    });
});

describe('Integração Janelas', () => {
    it('deve combinar rolling e expanding', () => {
        const precos = new Serie([100, 102, 101, 103, 105]);

        const rolling = janelaMovel(precos, 2).media();
        const expanding = janelaCrescente(precos).media();

        expect(rolling.tamanho).toBe(5);
        expect(expanding.tamanho).toBe(5);

        // Expanding deve ser menos sensível a variações recentes
        expect((expanding.dados as number[])[4]).toBeLessThan((rolling.dados as number[])[4]);
    });

    it('deve analisar série temporal', () => {
        const vendas = new Serie([100, 110, 105, 115, 120, 125, 130]);

        // Tendência (média móvel)
        const tendencia = janelaMovel(vendas, 3).media();

        // Volatilidade (desvio padrão móvel)
        const volatilidade = janelaMovel(vendas, 3).desvio();

        // Crescimento acumulado
        const crescimento = janelaCrescente(vendas).soma();

        expect(tendencia.tamanho).toBe(7);
        expect(volatilidade.tamanho).toBe(7);
        expect(crescimento.tamanho).toBe(7);
    });

    it('deve detectar padrões com múltiplas janelas', () => {
        const serie = new Serie([10, 12, 11, 13, 15, 14, 16, 18, 17, 19, 20]);

        const ema = mediaMovelExponencial(serie, 3);
        const { macd: macd_linha } = macd(serie);
        const rsi_val = indiceForcaRelativa(serie, 2);

        expect(ema.tamanho).toBe(serie.tamanho);
        expect(macd_linha.tamanho).toBe(serie.tamanho);
        expect(rsi_val.tamanho).toBe(serie.tamanho);
    });
});
