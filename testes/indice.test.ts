import { Indice } from '../fontes/indice';

describe('Indice', () => {
    describe('Construtor', () => {
        it('deve criar um índice com dados numéricos', () => {
            const indice = new Indice([0, 1, 2, 3, 4]);
            expect(indice.tamanho).toBe(5);
            expect(indice.dados).toEqual([0, 1, 2, 3, 4]);
        });

        it('deve criar um índice com dados textuais', () => {
            const indice = new Indice(['a', 'b', 'c']);
            expect(indice.tamanho).toBe(3);
            expect(indice.tipoDado).toBe('texto');
        });

        it('deve aceitar opções de nome', () => {
            const indice = new Indice([1, 2, 3], { nome: 'meuIndice' });
            expect(indice.nome).toBe('meuIndice');
        });

        it('deve inferir tipo como número', () => {
            const indice = new Indice([1, 2, 3]);
            expect(indice.tipoDado).toBe('numero');
        });

        it('deve inferir tipo como texto', () => {
            const indice = new Indice(['x', 'y', 'z']);
            expect(indice.tipoDado).toBe('texto');
        });
    });

    describe('Propriedades', () => {
        let indice: Indice;

        beforeEach(() => {
            indice = new Indice([10, 20, 30, 40, 50]);
        });

        it('deve retornar tamanho correto', () => {
            expect(indice.tamanho).toBe(5);
        });

        it('deve retornar forma correta', () => {
            expect(indice.forma).toEqual([5]);
        });

        it('deve retornar dados como cópia', () => {
            const dados = indice.dados;
            dados.push(60);
            expect(indice.tamanho).toBe(5);
        });
    });

    describe('Métodos', () => {
        let indice: Indice;

        beforeEach(() => {
            indice = new Indice(['a', 'b', 'c', 'a', 'b']);
        });

        it('obter() deve retornar posição correta', () => {
            expect(indice.obter('a')).toBe(0);
            expect(indice.obter('b')).toBe(1);
            expect(indice.obter('d')).toBe(-1);
        });

        it('contem() deve verificar existência', () => {
            expect(indice.contem('a')).toBe(true);
            expect(indice.contem('d')).toBe(false);
        });

        it('unico() deve retornar valores únicos', () => {
            const unicos = indice.unico();
            expect(unicos.length).toBe(3);
            expect(unicos).toContain('a');
            expect(unicos).toContain('b');
            expect(unicos).toContain('c');
        });

        it('duplicadas() deve detectar duplicatas', () => {
            const dup = indice.duplicadas();
            expect(dup[0]).toBe(false); // primeira 'a'
            expect(dup[1]).toBe(false); // primeira 'b'
            expect(dup[3]).toBe(true);  // segunda 'a'
            expect(dup[4]).toBe(true);  // segunda 'b'
        });

        it('get() deve retornar valor na posição', () => {
            expect(indice.get(0)).toBe('a');
            expect(indice.get(2)).toBe('c');
        });

        it('get() deve lançar erro para posição inválida', () => {
            expect(() => indice.get(10)).toThrow();
            expect(() => indice.get(-1)).toThrow();
        });

        it('copia() deve criar cópia profunda', () => {
            const copia = indice.copia();
            expect(copia.dados).toEqual(indice.dados);
            expect(copia.nome).toBe(indice.nome);
        });

        it('paraVetor() deve retornar array de valores', () => {
            const array = indice.paraVetor();
            expect(array).toEqual(['a', 'b', 'c', 'a', 'b']);
        });

        it('paraTexto() deve retornar representação em string', () => {
            const texto = indice.paraTexto();
            expect(texto).toContain('Indice');
            expect(texto).toContain('5 elementos');
        });
    });
});
