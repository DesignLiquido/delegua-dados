/**
 * Testes para módulo de Concatenação e Merge
 */

import { RecorteDados } from '../../fontes/recorte-dados';
import {
    concatenar,
    mesclar,
    juntar
} from '../../fontes/transformacoes/juncoes';

describe('Concat: Concatenar Vertical', () => {
    it('deve concatenar verticalmente (axis=0)', () => {
        const rd1 = new RecorteDados({
            A: [1, 2],
            B: [3, 4]
        });
        const rd2 = new RecorteDados({
            A: [5, 6],
            B: [7, 8]
        });

        const resultado = concatenar([rd1, rd2], { eixo: 0 });

        expect(resultado.forma[0]).toBe(4);
        expect(resultado.forma[1]).toBe(2);
        expect((resultado.selecionarColuna('A').dados as number[])).toEqual([1, 2, 5, 6]);
    });

    it('deve resetar índice ao concatenar verticalmente', () => {
        const rd1 = new RecorteDados({
            X: [1, 2]
        }, { indice: ['a', 'b'] });
        const rd2 = new RecorteDados({
            X: [3, 4]
        }, { indice: ['c', 'd'] });

        const resultado = concatenar([rd1, rd2], { eixo: 0, ignorarIndice: true });

        expect(resultado.forma[0]).toBe(4);
        expect(resultado.indice.dados).toEqual([0, 1, 2, 3]);
    });

    it('deve lançar erro se colunas incompatíveis', () => {
        const rd1 = new RecorteDados({ A: [1, 2] });
        const rd2 = new RecorteDados({ B: [3, 4] });

        expect(() => {
            concatenar([rd1, rd2], { eixo: 0 });
        }).toThrow();
    });

    it('deve concatenar múltiplos RecorteDados', () => {
        const rd1 = new RecorteDados({ X: [1] });
        const rd2 = new RecorteDados({ X: [2] });
        const rd3 = new RecorteDados({ X: [3] });

        const resultado = concatenar([rd1, rd2, rd3], { eixo: 0 });

        expect(resultado.forma[0]).toBe(3);
        expect((resultado.selecionarColuna('X').dados as number[])).toEqual([1, 2, 3]);
    });
});

describe('Concat: Concatenar Horizontal', () => {
    it('deve concatenar horizontalmente (axis=1)', () => {
        const rd1 = new RecorteDados({
            A: [1, 2],
            B: [3, 4]
        });
        const rd2 = new RecorteDados({
            C: [5, 6],
            D: [7, 8]
        });

        const resultado = concatenar([rd1, rd2], { eixo: 1 });

        expect(resultado.forma[0]).toBe(2);
        expect(resultado.forma[1]).toBe(4);
        expect(resultado.nomeColunas.sort()).toEqual(['A', 'B', 'C', 'D']);
    });

    it('deve renomear automaticamente colunas duplicadas', () => {
        const rd1 = new RecorteDados({ A: [1, 2], B: [3, 4] });
        const rd2 = new RecorteDados({ A: [5, 6], C: [7, 8] });

        const resultado = concatenar([rd1, rd2], { eixo: 1 });

        // Deve renomear coluna duplicada automaticamente
        expect(resultado.nomeColunas).toContain('A');
        expect(resultado.nomeColunas).toContain('A_1');
        expect(resultado.nomeColunas).toContain('B');
        expect(resultado.nomeColunas).toContain('C');
    });

    it('deve lançar erro se tamanhos incompatíveis', () => {
        const rd1 = new RecorteDados({ A: [1, 2] });
        const rd2 = new RecorteDados({ B: [3, 4, 5] });

        expect(() => {
            concatenar([rd1, rd2], { eixo: 1 });
        }).toThrow();
    });
});

describe('Merge: Inner Join', () => {
    it('deve fazer inner join básico', () => {
        const esq = new RecorteDados({
            chave: ['A', 'B', 'C'],
            val1: [1, 2, 3]
        });
        const dir = new RecorteDados({
            chave: ['A', 'B', 'D'],
            val2: [4, 5, 6]
        });

        const resultado = mesclar(esq, dir, {
            em: 'chave',
            como: 'inner'
        });

        expect(resultado.forma[0]).toBe(2); // A e B
        expect(resultado.nomeColunas).toContain('chave');
        expect(resultado.nomeColunas).toContain('val1');
        expect(resultado.nomeColunas).toContain('val2');
    });

    it('deve fazer inner join com múltiplas chaves', () => {
        const esq = new RecorteDados({
            k1: ['A', 'A', 'B'],
            k2: [1, 2, 1],
            v1: [10, 20, 30]
        });
        const dir = new RecorteDados({
            k1: ['A', 'B'],
            k2: [1, 1],
            v2: [100, 200]
        });

        const resultado = mesclar(esq, dir, {
            em: ['k1', 'k2'],
            como: 'inner'
        });

        expect(resultado.forma[0]).toBe(2); // A,1 e B,1
    });
});

describe('Merge: Left Join', () => {
    it('deve fazer left join mantendo todas linhas da esquerda', () => {
        const esq = new RecorteDados({
            id: ['A', 'B', 'C'],
            val: [1, 2, 3]
        });
        const dir = new RecorteDados({
            id: ['A', 'B'],
            info: ['x', 'y']
        });

        const resultado = mesclar(esq, dir, {
            em: 'id',
            como: 'left'
        });

        expect(resultado.forma[0]).toBe(3);
        const infoColuna = resultado.selecionarColuna('info').dados;
        expect(infoColuna).toContain('x');
        expect(infoColuna).toContain('y');
        expect(infoColuna).toContain(null);
    });

    it('deve preencher com null quando não há correspondência', () => {
        const esq = new RecorteDados({
            chave: [1, 2, 3],
            a: [10, 20, 30]
        });
        const dir = new RecorteDados({
            chave: [1],
            b: [100]
        });

        const resultado = mesclar(esq, dir, {
            em: 'chave',
            como: 'left'
        });

        const colB = resultado.selecionarColuna('b').dados;
        expect(colB[0]).toBe(100);
        expect(colB[1]).toBeNull();
        expect(colB[2]).toBeNull();
    });
});

describe('Merge: Right Join', () => {
    it('deve fazer right join mantendo todas linhas da direita', () => {
        const esq = new RecorteDados({
            id: ['A', 'B'],
            val: [1, 2]
        });
        const dir = new RecorteDados({
            id: ['A', 'B', 'C'],
            info: ['x', 'y', 'z']
        });

        const resultado = mesclar(esq, dir, {
            em: 'id',
            como: 'right'
        });

        expect(resultado.forma[0]).toBe(3);
        const valColuna = resultado.selecionarColuna('val').dados;
        expect(valColuna).toContain(null);
    });
});

describe('Merge: Outer Join', () => {
    it('deve fazer outer join mantendo todas linhas', () => {
        const esq = new RecorteDados({
            id: ['A', 'B', 'C'],
            val1: [1, 2, 3]
        });
        const dir = new RecorteDados({
            id: ['B', 'C', 'D'],
            val2: [20, 30, 40]
        });

        const resultado = mesclar(esq, dir, {
            em: 'id',
            como: 'outer'
        });

        expect(resultado.forma[0]).toBe(4); // A, B, C, D
        expect(resultado.selecionarColuna('id').dados).toContain('A');
        expect(resultado.selecionarColuna('id').dados).toContain('D');
    });

    it('deve preencher ambos lados com null quando necessário', () => {
        const esq = new RecorteDados({
            k: [1, 2],
            x: [10, 20]
        });
        const dir = new RecorteDados({
            k: [2, 3],
            y: [200, 300]
        });

        const resultado = mesclar(esq, dir, {
            em: 'k',
            como: 'outer'
        });

        expect(resultado.forma[0]).toBe(3); // 1, 2, 3
    });
});

describe('Merge: Sufixos', () => {
    it('deve adicionar sufixos para colunas duplicadas', () => {
        const esq = new RecorteDados({
            chave: ['A', 'B'],
            valor: [1, 2]
        });
        const dir = new RecorteDados({
            chave: ['A', 'B'],
            valor: [10, 20]
        });

        const resultado = mesclar(esq, dir, {
            em: 'chave',
            como: 'inner',
            sufixos: ['_x', '_y']
        });

        expect(resultado.nomeColunas).toContain('valor_x');
        expect(resultado.nomeColunas).toContain('valor_y');
    });
});

describe('Join: Por Índice', () => {
    it('deve juntar por índice', () => {
        const esq = new RecorteDados(
            { A: [1, 2] },
            { indice: ['X', 'Y'] }
        );
        const dir = new RecorteDados(
            { B: [3, 4] },
            { indice: ['X', 'Y'] }
        );

        const resultado = juntar(esq, dir, { como: 'inner' });

        expect(resultado.forma[0]).toBe(2);
        expect(resultado.nomeColunas).toContain('A');
        expect(resultado.nomeColunas).toContain('B');
    });

    it('deve fazer left join por índice', () => {
        const esq = new RecorteDados(
            { A: [1, 2, 3] },
            { indice: ['X', 'Y', 'Z'] }
        );
        const dir = new RecorteDados(
            { B: [10, 20] },
            { indice: ['X', 'Y'] }
        );

        const resultado = juntar(esq, dir, { como: 'left' });

        expect(resultado.forma[0]).toBe(3);
        const colB = resultado.selecionarColuna('B').dados;
        expect(colB[2]).toBeNull();
    });
});

describe('Integração Concat/Merge', () => {
    it('deve combinar concatenar e mesclar', () => {
        const rd1 = new RecorteDados({
            id: ['A', 'B'],
            val1: [1, 2]
        });
        const rd2 = new RecorteDados({
            id: ['C', 'D'],
            val1: [3, 4]
        });
        const rd3 = new RecorteDados({
            id: ['A', 'B', 'C', 'D'],
            val2: [10, 20, 30, 40]
        });

        // Concatenar rd1 e rd2
        const concatenado = concatenar([rd1, rd2], { eixo: 0 });

        // Mesclar com rd3
        const resultado = mesclar(concatenado, rd3, {
            em: 'id',
            como: 'inner'
        });

        expect(resultado.forma[0]).toBe(4);
        expect(resultado.nomeColunas.sort()).toEqual(['id', 'val1', 'val2']);
    });

    it('deve lidar com pipeline complexo', () => {
        const vendas_q1 = new RecorteDados({
            produto: ['A', 'B'],
            vendas: [100, 200]
        });
        const vendas_q2 = new RecorteDados({
            produto: ['A', 'B'],
            vendas: [150, 250]
        });
        const custos = new RecorteDados({
            produto: ['A', 'B', 'C'],
            custo: [50, 100, 75]
        });

        // Concatenar vendas
        const vendasTotal = concatenar([vendas_q1, vendas_q2], { eixo: 0 });

        // Adicionar informação de período manualmente
        const comPeriodo = new RecorteDados({
            produto: (vendasTotal.selecionarColuna('produto').dados as any[]),
            vendas: (vendasTotal.selecionarColuna('vendas').dados as any[]),
            periodo: ['Q1', 'Q1', 'Q2', 'Q2']
        });

        // Mesclar com custos
        const resultado = mesclar(comPeriodo, custos, {
            em: 'produto',
            como: 'left'
        });

        expect(resultado.forma[0]).toBe(4);
        expect(resultado.nomeColunas).toContain('periodo');
        expect(resultado.nomeColunas).toContain('custo');
    });
});
