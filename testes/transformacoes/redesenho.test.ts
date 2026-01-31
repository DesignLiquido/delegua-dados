/**
 * Testes para módulo de Reshape
 */

import { RecorteDados } from '../../fontes/recorte-dados';
import { Serie } from '../../fontes/serie';
import {
    transpor,
    derreter,
    pivotar,
    empilhar,
    desempilhar
} from '../../fontes/transformacoes/redesenho';

describe('Reshape: Transpor', () => {
    it('deve transpor RecorteDados simples', () => {
        const rd = new RecorteDados({
            A: [1, 2],
            B: [3, 4]
        }, { indice: ['X', 'Y'] });

        const transposto = transpor(rd);

        expect(transposto.forma).toEqual([2, 2]);
        expect(transposto.nomeColunas.sort()).toEqual(['X', 'Y']);
        expect((transposto.selecionarColuna('X').dados as number[])).toEqual([1, 3]);
        expect((transposto.selecionarColuna('Y').dados as number[])).toEqual([2, 4]);
    });

    it('deve transpor RecorteDados retangular', () => {
        const rd = new RecorteDados({
            A: [1, 2, 3],
            B: [4, 5, 6]
        });

        const transposto = transpor(rd);

        expect(transposto.forma[0]).toBe(2);
        expect(transposto.forma[1]).toBe(3);
    });
});

describe('Reshape: Derreter (Melt)', () => {
    it('deve derreter RecorteDados de wide para long', () => {
        const rd = new RecorteDados({
            id: ['A', 'B'],
            vendas_2023: [100, 200],
            vendas_2024: [150, 250]
        });

        const resultado = derreter(rd, {
            colunasId: ['id'],
            colunasValor: ['vendas_2023', 'vendas_2024'],
            nomeVariavel: 'ano',
            nomeValor: 'vendas'
        });

        expect(resultado.forma[0]).toBe(4);
        expect(resultado.nomeColunas.sort()).toEqual(['ano', 'id', 'vendas']);
        expect((resultado.selecionarColuna('vendas').dados as number[])).toEqual([100, 150, 200, 250]);
    });

    it('deve usar valores padrão quando opções não fornecidas', () => {
        const rd = new RecorteDados({
            A: [1, 2],
            B: [3, 4]
        });

        const resultado = derreter(rd);

        expect(resultado.nomeColunas).toContain('variavel');
        expect(resultado.nomeColunas).toContain('valor');
        expect(resultado.forma[0]).toBe(4);
    });

    it('deve derreter com múltiplas colunas ID', () => {
        const rd = new RecorteDados({
            pais: ['Brasil', 'Brasil', 'EUA', 'EUA'],
            cidade: ['SP', 'RJ', 'NY', 'LA'],
            pop_2020: [12, 7, 8, 4],
            pop_2021: [12.5, 7.2, 8.1, 4.1]
        });

        const resultado = derreter(rd, {
            colunasId: ['pais', 'cidade'],
            colunasValor: ['pop_2020', 'pop_2021']
        });

        expect(resultado.forma[0]).toBe(8);
        expect(resultado.nomeColunas).toContain('pais');
        expect(resultado.nomeColunas).toContain('cidade');
    });
});

describe('Reshape: Pivotar (Pivot)', () => {
    it('deve pivotar RecorteDados com agregação sum', () => {
        const rd = new RecorteDados({
            categoria: ['A', 'A', 'B', 'B'],
            mes: ['Jan', 'Fev', 'Jan', 'Fev'],
            vendas: [100, 150, 200, 250]
        });

        const pivot = pivotar(rd, {
            indice: 'categoria',
            colunas: 'mes',
            valores: 'vendas',
            agregacao: 'sum'
        });

        expect(pivot.forma[0]).toBe(2);
        expect(pivot.nomeColunas).toContain('Fev');
        expect(pivot.nomeColunas).toContain('Jan');
    });

    it('deve pivotar com agregação mean', () => {
        const rd = new RecorteDados({
            grupo: ['X', 'X', 'Y', 'Y'],
            tipo: ['A', 'B', 'A', 'B'],
            valor: [10, 20, 30, 40]
        });

        const pivot = pivotar(rd, {
            indice: 'grupo',
            colunas: 'tipo',
            valores: 'valor',
            agregacao: 'mean'
        });

        expect(pivot.forma[0]).toBe(2);
        expect((pivot.selecionarColuna('A').dados as number[])[0]).toBe(10);
    });

    it('deve pivotar com agregação max', () => {
        const rd = new RecorteDados({
            id: ['1', '1', '2', '2'],
            cat: ['X', 'Y', 'X', 'Y'],
            val: [5, 10, 15, 20]
        });

        const pivot = pivotar(rd, {
            indice: 'id',
            colunas: 'cat',
            valores: 'val',
            agregacao: 'max'
        });

        expect((pivot.selecionarColuna('Y').dados as number[])).toContain(10);
        expect((pivot.selecionarColuna('Y').dados as number[])).toContain(20);
    });
});

describe('Reshape: Empilhar (Stack)', () => {
    it('deve empilhar RecorteDados em Serie', () => {
        const rd = new RecorteDados({
            A: [1, 2],
            B: [3, 4]
        }, { indice: ['X', 'Y'] });

        const empilhado = empilhar(rd);

        expect(empilhado).toBeInstanceOf(Serie);
        expect(empilhado.tamanho).toBe(4);
        expect(empilhado.dados).toEqual([1, 3, 2, 4]);
    });

    it('deve criar índice hierárquico ao empilhar', () => {
        const rd = new RecorteDados({
            col1: [10, 20],
            col2: [30, 40]
        }, { indice: ['linha1', 'linha2'] });

        const empilhado = empilhar(rd);

        expect(empilhado.indice.dados).toContain('linha1_col1');
        expect(empilhado.indice.dados).toContain('linha2_col2');
    });
});

describe('Reshape: Desempilhar (Unstack)', () => {
    it('deve desempilhar Serie em RecorteDados', () => {
        const serie = new Serie([1, 2, 3, 4], {
            indice: ['X_A', 'X_B', 'Y_A', 'Y_B']
        });

        const rd = desempilhar(serie, 2);

        expect(rd).toBeInstanceOf(RecorteDados);
        expect(rd.forma[0]).toBe(2);
        expect(rd.nomeColunas.sort()).toEqual(['A', 'B']);
    });

    it('deve preservar valores ao desempilhar', () => {
        const serie = new Serie([10, 20, 30, 40], {
            indice: ['linha1_col1', 'linha1_col2', 'linha2_col1', 'linha2_col2']
        });

        const rd = desempilhar(serie, 2);

        expect((rd.selecionarColuna('col1').dados as number[])).toContain(10);
        expect((rd.selecionarColuna('col2').dados as number[])).toContain(20);
    });

    it('deve lidar com índices complexos', () => {
        const serie = new Serie([1, 2, 3], {
            indice: ['A_B_X', 'A_B_Y', 'C_D_X']
        });

        const rd = desempilhar(serie, 3);

        expect(rd.forma[0]).toBeGreaterThan(0);
        expect(rd.nomeColunas.length).toBeGreaterThan(0);
    });
});

describe('Integração Reshape', () => {
    it('deve fazer roundtrip: empilhar -> desempilhar', () => {
        const rdOriginal = new RecorteDados({
            A: [1, 2],
            B: [3, 4]
        }, { indice: ['X', 'Y'] });

        const empilhado = empilhar(rdOriginal);
        const desempilhado = desempilhar(empilhado, 2);

        expect(desempilhado.forma[0]).toBe(2);
        expect(desempilhado.forma[1]).toBe(2);
    });

    it('deve combinar derreter e pivotar', () => {
        const rd = new RecorteDados({
            id: ['A', 'B'],
            val1: [1, 2],
            val2: [3, 4]
        });

        // Derreter
        const derretido = derreter(rd, {
            colunasId: ['id'],
            colunasValor: ['val1', 'val2']
        });

        // Pivotar de volta
        const pivot = pivotar(derretido, {
            indice: 'id',
            colunas: 'variavel',
            valores: 'valor'
        });

        expect(pivot.forma[0]).toBe(2);
    });
});
