import { Indice } from '../fontes/indice';
import { RecorteDados } from '../fontes/recorte-dados';
import { Serie } from '../fontes/serie';
import {
    afirmarIndiceIgual,
    afirmarRecorteDadosIgual,
    afirmarSerieIgual,
} from '../fontes/testadores';

describe('Testadores', () => {
    describe('afirmarIndiceIgual()', () => {
        it('aceita índices com os mesmos rótulos', () => {
            expect(() => afirmarIndiceIgual(
                new Indice(['a', 'b']),
                new Indice(['a', 'b'])
            )).not.toThrow();
        });

        it('indica a posição de um rótulo diferente', () => {
            expect(() => afirmarIndiceIgual(
                new Indice(['a', 'c']),
                new Indice(['a', 'b'])
            )).toThrow([
                'Índices diferentes.',
                '',
                'Posição: 1',
                '',
                'Esperado: "b"',
                'Obtido: "c"',
            ].join('\n'));
        });
    });

    describe('afirmarSerieIgual()', () => {
        it('aceita séries com índices e valores iguais', () => {
            expect(() => afirmarSerieIgual(
                new Serie([10, NaN], { indice: ['a', 'b'] }),
                new Serie([10, NaN], { indice: ['a', 'b'] })
            )).not.toThrow();
        });

        it('informa o índice e a posição do valor diferente', () => {
            expect(() => afirmarSerieIgual(
                new Serie([10, 21], { indice: ['a', 'b'] }),
                new Serie([10, 20], { indice: ['a', 'b'] })
            )).toThrow([
                'Séries diferentes.',
                '',
                'Índice: "b"',
                'Posição: 1',
                '',
                'Esperado: 20',
                'Obtido: 21',
            ].join('\n'));
        });
    });

    describe('afirmarRecorteDadosIgual()', () => {
        it('aceita recortes com índice, colunas e valores iguais', () => {
            const obtido = new RecorteDados(
                { nome: ['Ana'], salario: [5000] },
                { indice: [12] }
            );
            const esperado = new RecorteDados(
                { nome: ['Ana'], salario: [5000] },
                { indice: [12] }
            );

            expect(() => afirmarRecorteDadosIgual(obtido, esperado)).not.toThrow();
        });

        it('informa a linha, a coluna e os valores diferentes', () => {
            const obtido = new RecorteDados(
                { nome: ['Ana'], salario: [5200] },
                { indice: [12] }
            );
            const esperado = new RecorteDados(
                { nome: ['Ana'], salario: [5000] },
                { indice: [12] }
            );

            expect(() => afirmarRecorteDadosIgual(obtido, esperado)).toThrow([
                'RecorteDados diferentes.',
                '',
                'Linha: 12',
                'Coluna: salario',
                '',
                'Esperado: 5000',
                'Obtido: 5200',
            ].join('\n'));
        });

        it('detecta uma coluna diferente antes de comparar valores', () => {
            const obtido = new RecorteDados({ total: [5000] });
            const esperado = new RecorteDados({ salario: [5000] });

            expect(() => afirmarRecorteDadosIgual(obtido, esperado)).toThrow(
                'Parte: colunas\nPosição: 0'
            );
        });
    });
});
