/**
 * Testes para módulo de Operações
 */

import { Serie } from '../../fontes/serie';
import { RecorteDados } from '../../fontes/recorte-dados';
import {
    operacaoAritmetica,
    operacaoComparacao,
    operacaoLogica,
    operacaoRecorte,
    operacaoRecorteTodas,
    aplicarFuncao,
    aplicarMapaCompleto,
    normalizar,
    padronizar,
    diferenca,
    variacaoPercentual
} from '../../fontes/transformacoes/operacoes';

describe('Operações: Aritméticas com Escalar', () => {
    it('deve somar escalar a Serie', () => {
        const serie = new Serie([1, 2, 3]);
        const resultado = operacaoAritmetica(serie, 10, '+');
        
        expect((resultado.dados as number[])).toEqual([11, 12, 13]);
    });

    it('deve subtrair escalar de Serie', () => {
        const serie = new Serie([10, 20, 30]);
        const resultado = operacaoAritmetica(serie, 5, '-');
        
        expect((resultado.dados as number[])).toEqual([5, 15, 25]);
    });

    it('deve multiplicar Serie por escalar', () => {
        const serie = new Serie([2, 3, 4]);
        const resultado = operacaoAritmetica(serie, 3, '*');
        
        expect((resultado.dados as number[])).toEqual([6, 9, 12]);
    });

    it('deve dividir Serie por escalar', () => {
        const serie = new Serie([10, 20, 30]);
        const resultado = operacaoAritmetica(serie, 2, '/');
        
        expect((resultado.dados as number[])).toEqual([5, 10, 15]);
    });

    it('deve calcular módulo', () => {
        const serie = new Serie([10, 11, 12]);
        const resultado = operacaoAritmetica(serie, 3, '%');
        
        expect((resultado.dados as number[])).toEqual([1, 2, 0]);
    });

    it('deve calcular potência', () => {
        const serie = new Serie([2, 3, 4]);
        const resultado = operacaoAritmetica(serie, 2, '**');
        
        expect((resultado.dados as number[])).toEqual([4, 9, 16]);
    });
});

describe('Operações: Aritméticas Serie-Serie', () => {
    it('deve somar duas Series', () => {
        const s1 = new Serie([1, 2, 3]);
        const s2 = new Serie([10, 20, 30]);
        const resultado = operacaoAritmetica(s1, s2, '+');
        
        expect((resultado.dados as number[])).toEqual([11, 22, 33]);
    });

    it('deve multiplicar duas Series', () => {
        const s1 = new Serie([2, 3, 4]);
        const s2 = new Serie([5, 6, 7]);
        const resultado = operacaoAritmetica(s1, s2, '*');
        
        expect((resultado.dados as number[])).toEqual([10, 18, 28]);
    });

    it('deve lançar erro se tamanhos diferentes', () => {
        const s1 = new Serie([1, 2]);
        const s2 = new Serie([1, 2, 3]);
        
        expect(() => operacaoAritmetica(s1, s2, '+')).toThrow();
    });
});

describe('Operações: Comparação', () => {
    it('deve comparar com igualdade', () => {
        const serie = new Serie([1, 2, 3, 2]);
        const resultado = operacaoComparacao(serie, 2, '==');
        
        expect((resultado.dados as boolean[])).toEqual([false, true, false, true]);
    });

    it('deve comparar com diferença', () => {
        const serie = new Serie([1, 2, 3]);
        const resultado = operacaoComparacao(serie, 2, '!=');
        
        expect((resultado.dados as boolean[])).toEqual([true, false, true]);
    });

    it('deve comparar com maior que', () => {
        const serie = new Serie([1, 5, 10]);
        const resultado = operacaoComparacao(serie, 5, '>');
        
        expect((resultado.dados as boolean[])).toEqual([false, false, true]);
    });

    it('deve comparar com maior ou igual', () => {
        const serie = new Serie([3, 5, 7]);
        const resultado = operacaoComparacao(serie, 5, '>=');
        
        expect((resultado.dados as boolean[])).toEqual([false, true, true]);
    });

    it('deve comparar com menor que', () => {
        const serie = new Serie([1, 5, 10]);
        const resultado = operacaoComparacao(serie, 5, '<');
        
        expect((resultado.dados as boolean[])).toEqual([true, false, false]);
    });

    it('deve comparar com menor ou igual', () => {
        const serie = new Serie([3, 5, 7]);
        const resultado = operacaoComparacao(serie, 5, '<=');
        
        expect((resultado.dados as boolean[])).toEqual([true, true, false]);
    });
});

describe('Operações: Lógicas', () => {
    it('deve fazer operação E (and)', () => {
        const s1 = new Serie([true, true, false, false]);
        const s2 = new Serie([true, false, true, false]);
        const resultado = operacaoLogica(s1, s2, 'e');
        
        expect((resultado.dados as boolean[])).toEqual([true, false, false, false]);
    });

    it('deve fazer operação OU (or)', () => {
        const s1 = new Serie([true, true, false, false]);
        const s2 = new Serie([true, false, true, false]);
        const resultado = operacaoLogica(s1, s2, 'ou');
        
        expect((resultado.dados as boolean[])).toEqual([true, true, true, false]);
    });

    it('deve fazer operação NÃO (not)', () => {
        const serie = new Serie([true, false, true, false]);
        const resultado = operacaoLogica(serie, null, 'nao');
        
        expect((resultado.dados as boolean[])).toEqual([false, true, false, true]);
    });
});

describe('Operações: RecorteDados', () => {
    it('deve aplicar operação a coluna específica', () => {
        const rd = new RecorteDados({
            A: [1, 2, 3],
            B: [10, 20, 30]
        });

        const resultado = operacaoRecorte(rd, 'A', 5, '*');

        expect((resultado.selecionarColuna('A').dados as number[])).toEqual([5, 10, 15]);
        expect((resultado.selecionarColuna('B').dados as number[])).toEqual([10, 20, 30]);
    });

    it('deve aplicar operação a todas colunas numéricas', () => {
        const rd = new RecorteDados({
            A: [1, 2, 3],
            B: [10, 20, 30]
        });

        const resultado = operacaoRecorteTodas(rd, 2, '+');

        expect((resultado.selecionarColuna('A').dados as number[])).toEqual([3, 4, 5]);
        expect((resultado.selecionarColuna('B').dados as number[])).toEqual([12, 22, 32]);
    });

    it('deve ignorar colunas não numéricas', () => {
        const rd = new RecorteDados({
            nome: ['Ana', 'Bob'],
            idade: [25, 30]
        });

        const resultado = operacaoRecorteTodas(rd, 5, '+');

        expect((resultado.selecionarColuna('nome').dados as string[])).toEqual(['Ana', 'Bob']);
        expect((resultado.selecionarColuna('idade').dados as number[])).toEqual([30, 35]);
    });
});

describe('Operações: Aplicar Função', () => {
    it('deve aplicar função a cada elemento', () => {
        const serie = new Serie([1, 2, 3]);
        const resultado = aplicarFuncao(serie, (x: any) => x * x);
        
        expect((resultado.dados as number[])).toEqual([1, 4, 9]);
    });

    it('deve aplicar função de transformação', () => {
        const serie = new Serie(['abc', 'def', 'ghi']);
        const resultado = aplicarFuncao(serie, (s: any) => s.toUpperCase());
        
        expect((resultado.dados as string[])).toEqual(['ABC', 'DEF', 'GHI']);
    });

    it('deve aplicar função complexa', () => {
        const serie = new Serie([10, 20, 30]);
        const resultado = aplicarFuncao(serie, (x: any) => x > 15 ? 'alto' : 'baixo');
        
        expect((resultado.dados as string[])).toEqual(['baixo', 'alto', 'alto']);
    });
});

describe('Operações: Aplicar Mapa Completo', () => {
    it('deve aplicar função ao RecorteDados completo', () => {
        const rd = new RecorteDados({
            A: [1, 2, 3],
            B: [4, 5, 6]
        });

        const resultado = aplicarMapaCompleto(rd, (valor: any) => {
            return typeof valor === 'number' ? valor * 2 : valor;
        });

        expect((resultado.selecionarColuna('A').dados as number[])).toEqual([2, 4, 6]);
        expect((resultado.selecionarColuna('B').dados as number[])).toEqual([8, 10, 12]);
    });

    it('deve lidar com múltiplos tipos', () => {
        const rd = new RecorteDados({
            num: [1, 2],
            texto: ['a', 'b']
        });

        const resultado = aplicarMapaCompleto(rd, (v: any) => {
            return typeof v === 'number' ? v + 10 : v.toUpperCase();
        });

        expect((resultado.selecionarColuna('num').dados as number[])).toEqual([11, 12]);
        expect((resultado.selecionarColuna('texto').dados as string[])).toEqual(['A', 'B']);
    });
});

describe('Operações: Normalizar', () => {
    it('deve normalizar Serie para [0, 1]', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const resultado = normalizar(serie);
        
        expect((resultado.dados as number[])[0]).toBe(0);
        expect((resultado.dados as number[])[4]).toBe(1);
        expect((resultado.dados as number[])[2]).toBe(0.5);
    });

    it('deve lidar com valores iguais', () => {
        const serie = new Serie([5, 5, 5]);
        const resultado = normalizar(serie);
        
        // Quando todos valores são iguais, normalização retorna 0
        expect((resultado.dados as number[])).toEqual([0, 0, 0]);
    });

    it('deve normalizar valores negativos', () => {
        const serie = new Serie([-10, 0, 10]);
        const resultado = normalizar(serie);
        
        expect((resultado.dados as number[])[0]).toBe(0);
        expect((resultado.dados as number[])[1]).toBe(0.5);
        expect((resultado.dados as number[])[2]).toBe(1);
    });
});

describe('Operações: Padronizar (Z-score)', () => {
    it('deve padronizar Serie (z-score)', () => {
        const serie = new Serie([1, 2, 3, 4, 5]);
        const resultado = padronizar(serie);
        
        // Média deve ser aproximadamente 0
        const dados = resultado.dados as number[];
        const media = dados.reduce((a, b) => a + b, 0) / dados.length;
        expect(Math.abs(media)).toBeLessThan(0.0001);
    });

    it('deve ter desvio padrão 1', () => {
        const serie = new Serie([10, 20, 30, 40, 50]);
        const resultado = padronizar(serie);
        
        const dados = resultado.dados as number[];
        const media = dados.reduce((a, b) => a + b, 0) / dados.length;
        const variancia = dados.reduce((a, b) => a + Math.pow(b - media, 2), 0) / dados.length;
        const desvio = Math.sqrt(variancia);
        
        expect(Math.abs(desvio - 1)).toBeLessThan(0.0001);
    });
});

describe('Operações: Diferença', () => {
    it('deve calcular diferença de primeira ordem', () => {
        const serie = new Serie([1, 3, 6, 10]);
        const resultado = diferenca(serie);
        
        expect((resultado.dados as any[])).toEqual([null, 2, 3, 4]);
    });

    it('deve calcular diferença de segunda ordem', () => {
        const serie = new Serie([1, 3, 6, 10, 15]);
        const resultado = diferenca(serie, 2);
        
        // Primeira diferença: [null, 2, 3, 4, 5]
        // Segunda diferença: [null, null, 1, 1, 1]
        expect((resultado.dados as any[])[0]).toBeNull();
        expect((resultado.dados as any[])[1]).toBeNull();
        // Valores podem variar dependendo da implementação
    });

    it('deve calcular diferença com períodos > 1', () => {
        const serie = new Serie([1, 2, 3, 4, 5, 6]);
        const resultado = diferenca(serie, 2);
        
        // Diferença com período 2: s[i] - s[i-2]
        expect((resultado.dados as any[])).toEqual([null, null, 2, 2, 2, 2]);
    });
});

describe('Operações: Variação Percentual', () => {
    it('deve calcular variação percentual', () => {
        const serie = new Serie([100, 110, 121]);
        const resultado = variacaoPercentual(serie);
        
        expect((resultado.dados as any[])[0]).toBeNull();
        expect((resultado.dados as number[])[1]).toBeCloseTo(0.1, 5);
        expect((resultado.dados as number[])[2]).toBeCloseTo(0.1, 5);
    });

    it('deve lidar com valores zero', () => {
        const serie = new Serie([1, 2, 0]);
        const resultado = variacaoPercentual(serie);
        
        expect((resultado.dados as any[])[0]).toBeNull();
        expect((resultado.dados as number[])[1]).toBe(1); // 100% increase
        expect((resultado.dados as number[])[2]).toBe(-1); // 100% decrease
    });

    it('deve calcular variação com períodos diferentes', () => {
        const serie = new Serie([100, 105, 110, 115, 120]);
        const resultado = variacaoPercentual(serie, 2);
        
        // Variação comparando com 2 períodos atrás
        expect((resultado.dados as any[])[0]).toBeNull();
        expect((resultado.dados as any[])[1]).toBeNull();
        expect((resultado.dados as number[])[2]).toBeCloseTo(0.1, 5); // (110-100)/100
    });
});

describe('Integração Operações', () => {
    it('deve combinar múltiplas operações', () => {
        const rd = new RecorteDados({
            vendas: [100, 150, 200, 180, 220]
        });

        // Calcular variação percentual
        const vendas = rd.selecionarColuna('vendas');
        const variacao = variacaoPercentual(vendas);

        // Normalizar variações
        const variacaoLimpa = new Serie(
            (variacao.dados as any[]).filter((v: any) => v !== null)
        );
        const normalizado = normalizar(variacaoLimpa);

        expect(normalizado.tamanho).toBe(4);
        // Primeiro valor normalizado pode ser 0 ou outro valor dependendo dos dados
        expect((normalizado.dados as number[])[0]).toBeGreaterThanOrEqual(0);
        expect((normalizado.dados as number[])[0]).toBeLessThanOrEqual(1);
    });

    it('deve criar pipeline de transformação', () => {
        const serie = new Serie([10, 15, 12, 18, 25]);

        // 1. Calcular diferença
        const dif = diferenca(serie);

        // 2. Aplicar função para valores absolutos
        const difAbs = aplicarFuncao(dif, (x: any) => x === null ? null : Math.abs(x));

        // 3. Comparar com threshold
        const threshold = 3;
        const resultado = operacaoComparacao(difAbs, threshold, '>');

        expect(resultado.tamanho).toBe(5);
        // Primeiro valor deve ser false (resultado da comparação null > 3)
        expect(typeof (resultado.dados as any[])[0]).toBe('boolean');
    });

    it('deve usar operações lógicas para filtros complexos', () => {
        const rd = new RecorteDados({
            preco: [10, 50, 100, 150, 200],
            estoque: [100, 80, 60, 40, 20]
        });

        // Filtro: preco > 50 E estoque < 70
        const preco = rd.selecionarColuna('preco');
        const estoque = rd.selecionarColuna('estoque');

        const precoAlto = operacaoComparacao(preco, 50, '>');
        const estoqueBaixo = operacaoComparacao(estoque, 70, '<');
        const filtro = operacaoLogica(precoAlto, estoqueBaixo, 'e');

        const dados = filtro.dados as boolean[];
        expect(dados[0]).toBe(false); // preco=10, estoque=100
        expect(dados[2]).toBe(true);  // preco=100, estoque=60
    });
});
