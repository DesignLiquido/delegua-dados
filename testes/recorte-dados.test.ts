import { RecorteDados } from '../fontes/recorte-dados';

describe('DadosTabela', () => {
    describe('Construtor com Objeto', () => {
        it('deve criar DadosTabela a partir de objeto com colunas', () => {
            const dados = {
                'nome': ['Alice', 'Bob', 'Charlie'],
                'idade': [25, 30, 35],
                'salario': [3000, 3500, 4000]
            };
            const rd = new RecorteDados(dados);
            expect(rd.forma).toEqual([3, 3]);
            expect(rd.nomeColunas).toEqual(['nome', 'idade', 'salario']);
        });

        it('deve lançar erro se colunas tiverem tamanhos diferentes', () => {
            const dados = {
                'col1': [1, 2, 3],
                'col2': [1, 2]
            };
            expect(() => new RecorteDados(dados)).toThrow();
        });
    });

    describe('Construtor com Array de Objetos', () => {
        it('deve criar DadosTabela a partir de array de objetos', () => {
            const dados = [
                { nome: 'Alice', idade: 25 },
                { nome: 'Bob', idade: 30 },
                { nome: 'Charlie', idade: 35 }
            ];
            const rd = new RecorteDados(dados);
            expect(rd.forma).toEqual([3, 2]);
            expect(rd.nomeColunas.sort()).toEqual(['idade', 'nome']);
        });

        it('deve preencher com null valores faltantes em objetos', () => {
            const dados = [
                { nome: 'Alice', idade: 25 },
                { nome: 'Bob' },
                { idade: 35 }
            ];
            const rd = new RecorteDados(dados);
            expect(rd.forma[0]).toBe(3);
        });
    });

    describe('Construtor por Cópia', () => {
        it('deve copiar outro DadosTabela', () => {
            const rd1 = new RecorteDados({
                'a': [1, 2, 3],
                'b': [4, 5, 6]
            });
            const rd2 = new RecorteDados(rd1);
            expect(rd2.forma).toEqual(rd1.forma);
            expect(rd2.nomeColunas).toEqual(rd1.nomeColunas);
        });
    });

    describe('Propriedades', () => {
        let rd: RecorteDados;

        beforeEach(() => {
            rd = new RecorteDados({
                'nome': ['Alice', 'Bob', 'Charlie'],
                'idade': [25, 30, 35]
            });
        });

        it('deve retornar forma como tupla [linhas, colunas]', () => {
            expect(rd.forma).toEqual([3, 2]);
        });

        it('deve retornar nomes das colunas', () => {
            expect(rd.nomeColunas.sort()).toEqual(['idade', 'nome']);
        });
    });

    describe('Visualização', () => {
        let rd: RecorteDados;

        beforeEach(() => {
            rd = new RecorteDados({
                'a': [1, 2, 3, 4, 5, 6, 7, 8],
                'b': [10, 20, 30, 40, 50, 60, 70, 80]
            });
        });

        it('cabeca(n) deve retornar primeiras n linhas', () => {
            const resultado = rd.cabeca(3);
            expect(resultado.forma[0]).toBe(3);
            expect(resultado.selecionarColuna('a').dados).toEqual([1, 2, 3]);
        });

        it('cauda(n) deve retornar últimas n linhas', () => {
            const resultado = rd.cauda(2);
            expect(resultado.forma[0]).toBe(2);
            expect(resultado.selecionarColuna('a').dados).toEqual([7, 8]);
        });

        it('descrever() deve retornar estatísticas', () => {
            const resultado = rd.descrever();
            expect(resultado.nomeColunas.sort()).toEqual(['a', 'b']);
        });
    });

    describe('Seleção', () => {
        let df: RecorteDados;

        beforeEach(() => {
            df = new RecorteDados({
                'nome': ['Alice', 'Bob', 'Charlie'],
                'idade': [25, 30, 35],
                'salario': [3000, 3500, 4000]
            });
        });

        it('selecionarColuna() deve retornar Serie', () => {
            const serie = df.selecionarColuna('nome');
            expect(serie.tamanho).toBe(3);
            expect(serie.dados).toEqual(['Alice', 'Bob', 'Charlie']);
        });

        it('selecionarColuna() deve lançar erro se coluna não existir', () => {
            expect(() => df.selecionarColuna('inexistente')).toThrow();
        });

        it('selecionarColunas() deve retornar novo DadosTabela', () => {
            const resultado = df.selecionarColunas(['nome', 'idade']);
            expect(resultado.forma[1]).toBe(2);
            expect(resultado.nomeColunas.sort()).toEqual(['idade', 'nome']);
        });

        it('obterPosicao() deve retornar valor na posição', () => {
            const valor = df.obterPosicao(0, 0);
            expect(typeof valor).toBe('string');
        });

        it('obterRotulo() deve retornar valor pelo rótulo', () => {
            const valor = df.obterRotulo(0, 'nome');
            expect(valor).toBe('Alice');
        });
    });

    describe('Modificação', () => {
        let df: RecorteDados;

        beforeEach(() => {
            df = new RecorteDados({
                'nome': ['Alice', 'Bob'],
                'idade': [25, 30]
            });
        });

        it('adicionarColuna() deve adicionar nova coluna', () => {
            df.adicionarColuna('salario', [3000, 3500]);
            expect(df.nomeColunas.length).toBe(3);
            expect(df.selecionarColuna('salario').dados).toEqual([3000, 3500]);
        });

        it('adicionarColuna() deve lançar erro se tamanho diferente', () => {
            expect(() => df.adicionarColuna('col', [1, 2, 3])).toThrow();
        });

        it('remover() deve remover colunas', () => {
            const resultado = df.remover(['idade']);
            expect(resultado.nomeColunas).toEqual(['nome']);
            expect(resultado.forma[1]).toBe(1);
        });

        it('renomear() deve renomear colunas', () => {
            const resultado = df.renomear({
                'nome': 'name',
                'idade': 'age'
            });
            expect(resultado.nomeColunas.sort()).toEqual(['age', 'name']);
        });
    });

    describe('Limpeza', () => {
        let df: RecorteDados;

        beforeEach(() => {
            df = new RecorteDados({
                'a': [1, null, 3],
                'b': [4, 5, 6]
            });
        });

        it('removerNulo() deve remover linhas com nulos', () => {
            const resultado = df.removerNulo();
            expect(resultado.forma[0]).toBe(2);
        });

        it('preencherNulo() deve preencher valores nulos', () => {
            const resultado = df.preencherNulo(0);
            expect(resultado.selecionarColuna('a').dados).toEqual([1, 0, 3]);
        });

        it('removerDuplicatas() deve remover linhas duplicadas', () => {
            const rd2 = new RecorteDados({
                'a': [1, 2, 1],
                'b': [4, 5, 4]
            });
            const resultado = rd2.removerDuplicatas();
            expect(resultado.forma[0]).toBe(2);
        });
    });

    describe('Filtro', () => {
        let rd: RecorteDados;

        beforeEach(() => {
            rd = new RecorteDados({
                'a': [1, 2, 3, 4, 5],
                'b': [10, 20, 30, 40, 50]
            });
        });

        it('filtrar() com máscara booleana', () => {
            const mascara = [true, false, true, false, true];
            const resultado = rd.filtrar(mascara);
            expect(resultado.forma[0]).toBe(3);
            expect(resultado.selecionarColuna('a').dados).toEqual([1, 3, 5]);
        });

        it('filtrar() deve lançar erro se tamanho diferente', () => {
            const mascara = [true, false];
            expect(() => rd.filtrar(mascara)).toThrow();
        });
    });

    describe('Conversão', () => {
        let rd: RecorteDados;

        beforeEach(() => {
            rd = new RecorteDados({
                'nome': ['Alice', 'Bob'],
                'idade': [25, 30]
            });
        });

        it('copia() deve criar cópia profunda', () => {
            const copia = rd.copia();
            expect(copia.forma).toEqual(rd.forma);
            copia.adicionarColuna('col', [1, 2]);
            expect(rd.nomeColunas.length).toBe(2);
        });

        it('paraVetorObjetos() deve converter para array de objetos', () => {
            const resultado = rd.paraVetorObjetos();
            expect(Array.isArray(resultado)).toBe(true);
            expect(resultado.length).toBe(2);
            expect(resultado[0]['nome']).toBe('Alice');
            expect(resultado[1]['idade']).toBe(30);
        });

        it('paraTexto() deve retornar representação em string', () => {
            const texto = rd.paraTexto();
            expect(typeof texto).toBe('string');
        });
    });

    describe('Aplicação de Funções', () => {
        let rd: RecorteDados;

        beforeEach(() => {
            rd = new RecorteDados({
                'a': [1, 2, 3],
                'b': [4, 5, 6]
            });
        });

        it('aplicar() deve aplicar função a cada coluna', () => {
            const resultado = rd.aplicar(serie => serie.tamanho);
            expect(resultado['a']).toBe(3);
            expect(resultado['b']).toBe(3);
        });
    });
});
