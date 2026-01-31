import { Serie } from '../fontes/serie';

describe('Serie', () => {
    describe('Construtor', () => {
        it('deve criar uma série com dados numéricos', () => {
            const s = new Serie([10, 20, 30, 40, 50]);
            expect(s.tamanho).toBe(5);
            expect(s.dados).toEqual([10, 20, 30, 40, 50]);
        });

        it('deve criar uma série com dados textuais', () => {
            const s = new Serie(['a', 'b', 'c']);
            expect(s.tamanho).toBe(3);
            expect(s.tipoDado).toBe('texto');
        });

        it('deve aceitar índice customizado', () => {
            const s = new Serie([1, 2, 3], { indice: ['x', 'y', 'z'] });
            expect(s.indice.obter('x')).toBe(0);
            expect(s.indice.obter('y')).toBe(1);
        });

        it('deve aceitar nome', () => {
            const s = new Serie([1, 2, 3], { nome: 'minhaserie' });
            expect(s.nome).toBe('minhaserie');
        });

        it('deve inferir tipo como número', () => {
            const s = new Serie([1, 2, 3]);
            expect(s.tipoDado).toBe('numero');
        });

        it('deve inferir tipo como booleano', () => {
            const s = new Serie([true, false, true]);
            expect(s.tipoDado).toBe('booleano');
        });
    });

    describe('Propriedades', () => {
        let s: Serie;

        beforeEach(() => {
            s = new Serie([10, 20, 30, 40, 50]);
        });

        it('deve retornar tamanho correto', () => {
            expect(s.tamanho).toBe(5);
        });

        it('deve retornar forma correta', () => {
            expect(s.forma).toEqual([5]);
        });
    });

    describe('Visualização', () => {
        let s: Serie;

        beforeEach(() => {
            s = new Serie([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });

        it('cabeca(n) deve retornar primeiros n elementos', () => {
            const resultado = s.cabeca(3);
            expect(resultado.tamanho).toBe(3);
            expect(resultado.dados).toEqual([1, 2, 3]);
        });

        it('cabeca() sem argumentos retorna 5 primeiros', () => {
            const resultado = s.cabeca();
            expect(resultado.tamanho).toBe(5);
        });

        it('cauda(n) deve retornar últimos n elementos', () => {
            const resultado = s.cauda(3);
            expect(resultado.tamanho).toBe(3);
            expect(resultado.dados).toEqual([8, 9, 10]);
        });

        it('unico() deve retornar valores únicos', () => {
            const s2 = new Serie([1, 2, 2, 3, 3, 3]);
            const unicos = s2.unico();
            expect(unicos.length).toBe(3);
        });

        it('contagemValores() deve contar frequência', () => {
            const s2 = new Serie(['a', 'b', 'a', 'c', 'a']);
            const contagem = s2.contagemValores();
            expect(contagem['a']).toBe(3);
            expect(contagem['b']).toBe(1);
            expect(contagem['c']).toBe(1);
        });
    });

    describe('Dados Faltantes', () => {
        let s: Serie;

        beforeEach(() => {
            s = new Serie([1, null, 3, undefined, 5]);
        });

        it('temNulo() deve identificar valores nulos', () => {
            const resultado = s.temNulo();
            expect(resultado.dados).toEqual([false, true, false, true, false]);
        });

        it('naoTemNulo() deve identificar valores não-nulos', () => {
            const resultado = s.naoTemNulo();
            expect(resultado.dados).toEqual([true, false, true, false, true]);
        });

        it('removerNulo() deve remover valores nulos', () => {
            const resultado = s.removerNulo();
            expect(resultado.tamanho).toBe(3);
            expect(resultado.dados).toEqual([1, 3, 5]);
        });

        it('preencherNulo(valor) deve preencher valores nulos', () => {
            const resultado = s.preencherNulo(0);
            expect(resultado.dados).toEqual([1, 0, 3, 0, 5]);
        });
    });

    describe('Ordenação', () => {
        let s: Serie;

        beforeEach(() => {
            s = new Serie([3, 1, 4, 1, 5, 9, 2, 6]);
        });

        it('ordenarValores() deve ordenar crescente por padrão', () => {
            const resultado = s.ordenarValores();
            expect(resultado.dados).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
        });

        it('ordenarValores(false) deve ordenar decrescente', () => {
            const resultado = s.ordenarValores(false);
            expect(resultado.dados).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
        });

        it('ordenarIndice() deve ordenar por índice', () => {
            const s2 = new Serie([10, 20, 30], { indice: ['c', 'a', 'b'] });
            const resultado = s2.ordenarIndice();
            expect(resultado.dados).toEqual([20, 30, 10]);
            expect(resultado.indice.paraArray()).toEqual(['a', 'b', 'c']);
        });
    });

    describe('Acesso', () => {
        let s: Serie;

        beforeEach(() => {
            s = new Serie([10, 20, 30], { indice: ['a', 'b', 'c'] });
        });

        it('get(posicao) deve retornar valor na posição', () => {
            expect(s.get(0)).toBe(10);
            expect(s.get(2)).toBe(30);
        });

        it('get() deve lançar erro para posição inválida', () => {
            expect(() => s.get(10)).toThrow();
        });

        it('obterPorRotulo() deve retornar valor pelo rótulo', () => {
            expect(s.obterPorRotulo('a')).toBe(10);
            expect(s.obterPorRotulo('c')).toBe(30);
            expect(s.obterPorRotulo('d')).toBeUndefined();
        });
    });

    describe('Transformações', () => {
        let s: Serie;

        beforeEach(() => {
            s = new Serie([1, 2, 3, 4, 5]);
        });

        it('aplicar() deve aplicar função a cada elemento', () => {
            const resultado = s.aplicar(x => x * 2);
            expect(resultado.dados).toEqual([2, 4, 6, 8, 10]);
        });

        it('filtrar() com máscara booleana', () => {
            const mascara = [true, false, true, false, true];
            const resultado = s.filtrar(mascara);
            expect(resultado.dados).toEqual([1, 3, 5]);
            expect(resultado.tamanho).toBe(3);
        });

        it('filtrar() com Serie booleana', () => {
            const mascara = new Serie([true, false, true, false, true]);
            const resultado = s.filtrar(mascara);
            expect(resultado.dados).toEqual([1, 3, 5]);
        });

        it('filtrar() deve lançar erro se tamanho diferente', () => {
            const mascara = [true, false];
            expect(() => s.filtrar(mascara)).toThrow();
        });
    });

    describe('Conversão', () => {
        let s: Serie;

        beforeEach(() => {
            s = new Serie([1, 2, 3], { nome: 'test' });
        });

        it('copia() deve criar cópia profunda', () => {
            const copia = s.copia();
            expect(copia.dados).toEqual(s.dados);
            expect(copia.nome).toBe(s.nome);
            copia.dados.push(4);
            expect(s.tamanho).toBe(3);
        });

        it('paraArray() deve retornar array de valores', () => {
            const array = s.paraArray();
            expect(array).toEqual([1, 2, 3]);
        });

        it('paraTexto() deve retornar representação em string', () => {
            const texto = s.paraTexto();
            expect(texto).toContain('test');
        });
    });
});
