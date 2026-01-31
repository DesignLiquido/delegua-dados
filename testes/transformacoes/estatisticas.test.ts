/**
 * Testes para módulo de Estatísticas
 */

import { Serie } from '../../fontes/serie';
import { RecorteDados } from '../../fontes/recorte-dados';
import {
    correlacao,
    covariancia,
    quantil,
    quantis,
    iqr,
    detectarOutliers,
    matrizCorrelacao,
    assimetria,
    curtose,
    descrever
} from '../../fontes/transformacoes/estatisticas';

describe('Estatísticas: Correlação', () => {
    it('deve calcular correlação perfeita positiva', () => {
        const s1 = new Serie([1, 2, 3, 4, 5]);
        const s2 = new Serie([2, 4, 6, 8, 10]);

        const corr = correlacao(s1, s2);
        expect(corr).toBe(1); // Correlação perfeita positiva
    });

    it('deve calcular correlação perfeita negativa', () => {
        const s1 = new Serie([1, 2, 3, 4, 5]);
        const s2 = new Serie([10, 8, 6, 4, 2]);

        const corr = correlacao(s1, s2);
        expect(corr).toBe(-1); // Correlação perfeita negativa
    });

    it('deve calcular correlação nula', () => {
        const s1 = new Serie([1, 1, 1, 2, 2, 2, 3, 3, 3]);
        const s2 = new Serie([1, 2, 3, 1, 2, 3, 1, 2, 3]);

        const corr = correlacao(s1, s2);
        expect(Math.abs(corr)).toBeLessThan(0.1); // Aproximadamente zero
    });

    it('deve lançar erro se tamanhos diferentes', () => {
        const s1 = new Serie([1, 2, 3]);
        const s2 = new Serie([1, 2, 3, 4]);

        expect(() => correlacao(s1, s2)).toThrow();
    });
});

describe('Estatísticas: Covariância', () => {
    it('deve calcular covariância positiva', () => {
        const s1 = new Serie([1, 2, 3, 4, 5]);
        const s2 = new Serie([2, 4, 6, 8, 10]);

        const cov = covariancia(s1, s2);
        expect(cov).toBeGreaterThan(0);
    });

    it('deve calcular covariância negativa', () => {
        const s1 = new Serie([1, 2, 3, 4, 5]);
        const s2 = new Serie([10, 8, 6, 4, 2]);

        const cov = covariancia(s1, s2);
        expect(cov).toBeLessThan(0);
    });

    it('deve retornar zero para independentes', () => {
        const s1 = new Serie([1, 1, 1, 2, 2, 2, 3, 3, 3]);
        const s2 = new Serie([1, 2, 3, 1, 2, 3, 1, 2, 3]);

        const cov = covariancia(s1, s2);
        expect(Math.abs(cov)).toBeLessThan(0.1);
    });
});

describe('Estatísticas: Quantis', () => {
    it('deve calcular quantil 0.5 (mediana)', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const q = quantil(serie, 0.5);

        expect(q).toBe(3);
    });

    it('deve calcular quartis', () => {
        const serie = new Serie([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const q1 = quantil(serie, 0.25);
        const q3 = quantil(serie, 0.75);

        expect(q1).toBeLessThan(q3);
    });

    it('deve calcular múltiplos quantis', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const qs = quantis(serie, [0.25, 0.5, 0.75]);

        expect(qs.length).toBe(3);
        expect(qs[0]).toBeLessThan(qs[1]);
        expect(qs[1]).toBeLessThan(qs[2]);
    });

    it('deve lançar erro para quantil inválido', () => {
        const serie = new Serie([1, 2, 3]);

        expect(() => quantil(serie, 1.5)).toThrow();
        expect(() => quantil(serie, -0.1)).toThrow();
    });
});

describe('Estatísticas: IQR e Outliers', () => {
    it('deve calcular intervalo interquartil', () => {
        const serie = new Serie([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const intervalo = iqr(serie);

        expect(intervalo).toBeGreaterThan(0);
    });

    it('deve detectar outliers', () => {
        const serie = new Serie([1, 2, 3, 4, 5, 100]); // 100 é outlier

        const outliers = detectarOutliers(serie);
        expect(outliers[outliers.length - 1]).toBe(true); // Último é outlier
    });

    it('deve marcar dados normais como não outliers', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const outliers = detectarOutliers(serie);

        expect(outliers.every(v => !v)).toBe(true);
    });
});

describe('Estatísticas: Matriz de Correlação', () => {
    it('deve criar matriz de correlação', () => {
        const rd = new RecorteDados({
            A: [1, 2, 3, 4, 5],
            B: [2, 4, 6, 8, 10],
            C: [5, 4, 3, 2, 1]
        });

        const matriz = matrizCorrelacao(rd);

        expect(Object.keys(matriz)).toContain('A');
        expect(Object.keys(matriz)).toContain('B');
        expect(Object.keys(matriz)).toContain('C');

        // A e B devem ter correlação perfeita
        expect(matriz['A']['B']).toBe(1);
        // A e C devem ter correlação negativa
        expect(matriz['A']['C']).toBe(-1);
    });

    it('deve ter correlação 1 na diagonal', () => {
        const rd = new RecorteDados({
            X: [1, 2, 3],
            Y: [4, 5, 6]
        });

        const matriz = matrizCorrelacao(rd);

        expect(matriz['X']['X']).toBe(1);
        expect(matriz['Y']['Y']).toBe(1);
    });

    it('deve ignorar colunas não numéricas', () => {
        const rd = new RecorteDados({
            nome: ['a', 'b', 'c'],
            valor: [1, 2, 3]
        });

        const matriz = matrizCorrelacao(rd);

        expect(Object.keys(matriz)).not.toContain('nome');
        expect(Object.keys(matriz)).toContain('valor');
    });
});

describe('Estatísticas: Assimetria e Curtose', () => {
    it('deve calcular assimetria', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const asim = assimetria(serie);

        expect(typeof asim).toBe('number');
    });

    it('deve calcular curtose', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const kurt = curtose(serie);

        expect(typeof kurt).toBe('number');
    });

    it('deve retornar zero para distribuição simétrica', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const asim = assimetria(serie);

        expect(Math.abs(asim)).toBeLessThan(0.1);
    });
});

describe('Estatísticas: Descrever', () => {
    it('deve retornar estatísticas descritivas', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const stats = descrever(serie);

        expect(stats.count).toBe(5);
        expect(stats.mean).toBe(3);
        expect(stats.std).toBeGreaterThan(0);
        expect(stats.min).toBe(1);
        expect(stats.max).toBe(5);
    });

    it('deve retornar quantis', () => {
        const serie = new Serie([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const stats = descrever(serie);

        expect(stats['25%']).toBeLessThan(stats['50%']);
        expect(stats['50%']).toBeLessThan(stats['75%']);
    });

    it('deve lidar com série vazia', () => {
        const serie = new Serie([]);
        const stats = descrever(serie);

        expect(stats.count).toBe(0);
        expect(stats.mean).toBeNaN();
    });

    it('deve ter estrutura correta', () => {
        const serie = new Serie([10, 20, 30, 40, 50]);
        const stats = descrever(serie);

        expect(Object.keys(stats)).toContain('count');
        expect(Object.keys(stats)).toContain('mean');
        expect(Object.keys(stats)).toContain('std');
        expect(Object.keys(stats)).toContain('min');
        expect(Object.keys(stats)).toContain('25%');
        expect(Object.keys(stats)).toContain('50%');
        expect(Object.keys(stats)).toContain('75%');
        expect(Object.keys(stats)).toContain('max');
    });
});

describe('Integração Estatísticas', () => {
    it('deve analisar relação entre variáveis', () => {
        const idade = new Serie([20, 25, 30, 35, 40]);
        const salario = new Serie([2000, 2500, 3000, 3500, 4000]);

        const corr = correlacao(idade, salario);
        const cov = covariancia(idade, salario);

        expect(corr).toBeGreaterThan(0);
        expect(cov).toBeGreaterThan(0);
    });

    it('deve detectar anomalias em dados', () => {
        const dados = new Serie([100, 105, 102, 103, 101, 200]); // 200 é anomalia

        const outliers = detectarOutliers(dados);
        const count_outliers = outliers.filter(v => v).length;

        expect(count_outliers).toBeGreaterThan(0);
    });

    it('deve resumir estatísticas de dataset', () => {
        const vendas = new Serie([1000, 1500, 2000, 1800, 2200, 1900, 2100]);
        const stats = descrever(vendas);

        console.log('Vendas - Estatísticas:', stats);

        expect(stats.count).toBe(7);
        expect(stats.mean).toBeGreaterThan(0);
        expect(stats.std).toBeGreaterThan(0);
    });
});
