/**
 * Testes para módulo resample
 * 
 * @module testes/resample
 */

import { Reamostrador, reamostrar, type Frequencia } from '../fontes/reamostrador';
import { IndiceTemporal, criarRangeDatas } from '../fontes/indice-temporal';
import { RecorteDados } from '../fontes/recorte-dados';

describe('Resampler', () => {
    describe('Construção', () => {
        it('deve criar Resampler com dados e índice válidos', () => {
            const datas = criarRangeDatas('2024-01-01', '2024-01-05', 'D');
            const rd = new RecorteDados({
                valor: [10, 20, 30, 40, 50],
                categoria: ['A', 'B', 'A', 'B', 'A']
            });

            const resampler = new Reamostrador(rd, datas, 'M');
            expect(resampler).toBeTruthy();
        });

        it('deve lançar erro se comprimentos não correspondem', () => {
            const datas = criarRangeDatas('2024-01-01', '2024-01-05', 'D');
            const rd = new RecorteDados({
                valor: [10, 20, 30] // Comprimento 3, mas datas têm 5
            });

            expect(() => new Reamostrador(rd, datas, 'D')).toThrow();
        });
    });

    describe('Downsampling - Agregação', () => {
        let datas: IndiceTemporal;
        let rd: RecorteDados;

        beforeEach(() => {
            // Criar 10 dias de dados
            datas = criarRangeDatas('2024-01-01', '2024-01-10', 'D');
            rd = new RecorteDados({
                valor: [10, 20, 15, 25, 30, 35, 40, 45, 50, 55],
                quantidade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                categoria: ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']
            });
        });

        it('deve fazer downsampling diário para mensal com média', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('media');

            expect(resultado.dados.forma[0]).toBeLessThanOrEqual(rd.forma[0]);
            expect(resultado.indice instanceof IndiceTemporal).toBe(true);
        });

        it('deve fazer downsampling com soma', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('soma');

            const soma_valores = resultado.dados.selecionarColuna('valor');
            expect(soma_valores.dados.length).toBeGreaterThan(0);
            expect(soma_valores.dados.some(v => typeof v === 'number')).toBe(true);
        });

        it('deve fazer downsampling com mínimo', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('minimo');

            expect(resultado.dados.forma[0]).toBeGreaterThan(0);
        });

        it('deve fazer downsampling com máximo', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('maximo');

            expect(resultado.dados.forma[0]).toBeGreaterThan(0);
        });

        it('deve fazer downsampling com contagem', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('contar');

            const contar = resultado.dados.selecionarColuna('valor');
            expect(contar.dados.every(v => typeof v === 'number')).toBe(true);
        });

        it('deve fazer downsampling com primeiro valor', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('primeiro');

            expect(resultado.dados.forma[0]).toBeGreaterThan(0);
        });

        it('deve fazer downsampling com último valor', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('ultimo');

            expect(resultado.dados.forma[0]).toBeGreaterThan(0);
        });

        it('deve preservar colunas não-numéricas usando primeiro valor', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('media');

            const categoria = resultado.dados.selecionarColuna('categoria');
            expect(categoria.dados.every(v => typeof v === 'string')).toBe(true);
        });

        it('deve agregar apenas colunas numéricas especificadas', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('media', ['valor']);

            expect(resultado.dados.nomeColunas).toContain('valor');
            expect(resultado.dados.nomeColunas).toContain('categoria');
        });

        it('deve preservar nome das colunas após downsampling', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('media');

            expect(resultado.dados.nomeColunas).toEqual(rd.nomeColunas);
        });

        it('deve manter forma de dados válida', () => {
            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('media');

            expect(resultado.dados.forma[1]).toBe(3); // 3 colunas
            expect(resultado.dados.forma[0]).toBeGreaterThan(0);
        });
    });

    describe('Downsampling - Diferentes Frequências', () => {
        it('deve fazer downsampling de frequência D (diária) para H (horária)', () => {
            // Esta frequência aumenta em vez de diminuir, mas testa a lógica
            const datas = criarRangeDatas('2024-01-01T00:00:00', '2024-01-01T23:00:00', 'H');
            const rd = new RecorteDados({
                temperatura: Array.from({ length: 24 }, (_, i) => 20 + i * 0.5)
            });

            const resampler = new Reamostrador(rd, datas, 'D');
            const resultado = resampler.degradar('media');

            expect(resultado.dados.forma[0]).toBeGreaterThanOrEqual(1);
            expect(resultado.dados.forma[0]).toBeLessThanOrEqual(2);
        });

        it('deve fazer downsampling para frequência semanal (S)', () => {
            const datas = criarRangeDatas('2024-01-01', '2024-02-28', 'D');
            const rd = new RecorteDados({
                valor: Array.from({ length: datas.comprimento }, (_, i) => i + 1)
            });

            const resampler = new Reamostrador(rd, datas, 'S');
            const resultado = resampler.degradar('media');

            expect(resultado.dados.forma[0]).toBeGreaterThan(1);
            expect(resultado.dados.forma[0]).toBeLessThan(datas.comprimento);
        });

        it('deve fazer downsampling para frequência anual (Y)', () => {
            const datas = new IndiceTemporal([
                '2020-06-01',
                '2021-03-15',
                '2022-12-31',
                '2023-01-01',
                '2024-11-11'
            ]);
            const rd = new RecorteDados({
                valor: [100, 200, 300, 400, 500]
            });

            const resampler = new Reamostrador(rd, datas, 'Y');
            const resultado = resampler.degradar('media');

            expect(resultado.dados.forma[0]).toBeGreaterThan(0);
            expect(resultado.dados.forma[0]).toBeLessThanOrEqual(5);
        });
    });

    describe('Upsampling', () => {
        let datas: IndiceTemporal;
        let rd: RecorteDados;

        beforeEach(() => {
            // Criar 3 dias de dados
            datas = criarRangeDatas('2024-01-01', '2024-01-03', 'D');
            rd = new RecorteDados({
                valor: [10, 20, 30],
                categoria: ['A', 'B', 'C']
            });
        });

        it('deve fazer upsampling com forward fill', () => {
            const resampler = new Reamostrador(rd, datas, 'H');
            const resultado = resampler.enriquecer('ffill');

            expect(resultado.dados.forma[0]).toBeGreaterThan(rd.forma[0]);
        });

        it('deve fazer upsampling com backward fill', () => {
            const resampler = new Reamostrador(rd, datas, 'H');
            const resultado = resampler.enriquecer('bfill');

            expect(resultado.dados.forma[0]).toBeGreaterThan(rd.forma[0]);
        });

        it('deve fazer upsampling com interpolação', () => {
            const resampler = new Reamostrador(rd, datas, 'H');
            const resultado = resampler.enriquecer('interpolacao');

            expect(resultado.dados.forma[0]).toBeGreaterThan(rd.forma[0]);
            const valores = resultado.dados.selecionarColuna('valor');
            expect(valores.dados.some(v => v !== null && v !== undefined)).toBe(true);
        });

        it('deve criar índice upsampling válido', () => {
            const resampler = new Reamostrador(rd, datas, 'H');
            const resultado = resampler.enriquecer('ffill');

            expect(resultado.indice instanceof IndiceTemporal).toBe(true);
            expect(resultado.indice.estaOrdenado()).toBe(true);
        });

        it('deve preservar dados originais em pontos de upsampling', () => {
            const datas_simples = new IndiceTemporal(['2024-01-01', '2024-01-02']);
            const rd_simples = new RecorteDados({
                valor: [100, 200]
            });

            const resampler = new Reamostrador(rd_simples, datas_simples, 'H');
            const resultado = resampler.enriquecer('ffill');

            expect(resultado.dados.forma[0]).toBeGreaterThan(2);
        });

        it('deve usar forward fill como padrão', () => {
            const resampler = new Reamostrador(rd, datas, 'H');
            const resultado_padrao = resampler.enriquecer();
            const resultado_ffill = resampler.enriquecer('ffill');

            expect(resultado_padrao.dados.forma).toEqual(resultado_ffill.dados.forma);
        });
    });

    describe('Casos de Uso Realistas', () => {
        it('deve resample série temporal de vendas diárias para mensal', () => {
            const datas = criarRangeDatas('2024-01-01', '2024-03-31', 'D');
            const rd = new RecorteDados({
                vendas: Array.from({ length: datas.comprimento }, () => 
                    Math.floor(Math.random() * 1000)
                ),
                lucro: Array.from({ length: datas.comprimento }, () =>
                    Math.floor(Math.random() * 500)
                )
            });

            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('soma');

            expect(resultado.dados.forma[0]).toBeGreaterThanOrEqual(2);
            expect(resultado.dados.forma[0]).toBeLessThanOrEqual(4);
        });

        it('deve resample série temporal de temperatura por hora para diária', () => {
            const datas = criarRangeDatas('2024-01-01T00:00:00', '2024-01-02T23:00:00', 'H');
            const rd = new RecorteDados({
                temperatura: Array.from({ length: datas.comprimento }, (_, i) =>
                    20 + 10 * Math.sin(i * Math.PI / 12)
                )
            });

            const resampler = new Reamostrador(rd, datas, 'D');
            const resultado = resampler.degradar('media');

            expect(resultado.dados.forma[0]).toBeGreaterThanOrEqual(1);
            expect(resultado.dados.forma[0]).toBeLessThanOrEqual(3);
        });

        it('deve resample série temporal de clicks por minuto para horário', () => {
            const datas = new IndiceTemporal(
                Array.from({ length: 120 }, (_, i) => {
                    const date = new Date('2024-01-01T00:00:00');
                    date.setMinutes(i);
                    return date;
                })
            );
            const rd = new RecorteDados({
                clicks: Array.from({ length: 120 }, () =>
                    Math.floor(Math.random() * 100)
                )
            });

            const resampler = new Reamostrador(rd, datas, 'H');
            const resultado = resampler.degradar('soma');

            expect(resultado.dados.forma[0]).toBe(2); // 2 horas
        });
    });

    describe('Validação e Erros', () => {
        it('deve lançar erro para agregação desconhecida', () => {
            const datas = criarRangeDatas('2024-01-01', '2024-01-05', 'D');
            const rd = new RecorteDados({ valor: [1, 2, 3, 4, 5] });
            const resampler = new Reamostrador(rd, datas, 'M');

            expect(() => {
                resampler.degradar('unknown' as any);
            }).toThrow();
        });

        it('deve lidar com dados vazios', () => {
            const datas = new IndiceTemporal(['2024-01-01']);
            const rd = new RecorteDados({ valor: [10] });
            const resampler = new Reamostrador(rd, datas, 'M');

            const resultado = resampler.degradar('media');
            expect(resultado.dados.forma[0]).toBe(1);
        });

        it('deve lidar com NULL values', () => {
            const datas = criarRangeDatas('2024-01-01', '2024-01-05', 'D');
            const rd = new RecorteDados({
                valor: [10, null, 30, null, 50]
            });

            const resampler = new Reamostrador(rd, datas, 'M');
            const resultado = resampler.degradar('media');

            expect(resultado.dados.forma[0]).toBeGreaterThan(0);
        });
    });
});

describe('Função resample', () => {
    let datas: IndiceTemporal;
    let rd: RecorteDados;

    beforeEach(() => {
        datas = criarRangeDatas('2024-01-01', '2024-01-10', 'D');
        rd = new RecorteDados({
            valor: [10, 20, 15, 25, 30, 35, 40, 45, 50, 55],
            categoria: ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']
        });
    });

    it('deve fazer downsampling como padrão', () => {
        const resultado = reamostrar(rd, datas, 'M');

        expect(resultado.dados.forma[0]).toBeLessThanOrEqual(rd.forma[0]);
    });

    it('deve fazer downsampling com operação explícita', () => {
        const resultado = reamostrar(rd, datas, 'M', 'degradar', 'media');

        expect(resultado.dados.forma[0]).toBeGreaterThan(0);
    });

    it('deve fazer upsampling com operação explícita', () => {
        const resultado = reamostrar(rd, datas, 'H', 'enriquecer');

        expect(resultado.dados.forma[0]).toBeGreaterThan(rd.forma[0]);
    });

    it('deve usar agregação media como padrão', () => {
        const resultado1 = reamostrar(rd, datas, 'M', 'degradar');
        const resultado2 = reamostrar(rd, datas, 'M', 'degradar', 'media');

        expect(resultado1.dados.forma).toEqual(resultado2.dados.forma);
    });

    it('deve retornar estrutura { indice, dados }', () => {
        const resultado = reamostrar(rd, datas, 'M');

        expect(resultado).toHaveProperty('indice');
        expect(resultado).toHaveProperty('dados');
        expect(resultado.indice instanceof IndiceTemporal).toBe(true);
        expect(resultado.dados instanceof RecorteDados).toBe(true);
    });
});

describe('Interpolação', () => {
    it('deve interpolar valores em upsampling', () => {
        const datas = new IndiceTemporal(['2024-01-01', '2024-01-03']);
        const rd = new RecorteDados({
            valor: [10, 30]
        });

        const resampler = new Reamostrador(rd, datas, 'D');
        const resultado = resampler.enriquecer('interpolacao');

        const valores = resultado.dados.selecionarColuna('valor');
        expect(valores.dados[1]).toBe(20); // Interpolado entre 10 e 30
    });

    it('deve interpolar múltiplas colunas', () => {
        const datas = new IndiceTemporal(['2024-01-01', '2024-01-03', '2024-01-05']);
        const rd = new RecorteDados({
            temp: [10, 20, 30],
            umidade: [50, 60, 70]
        });

        const resampler = new Reamostrador(rd, datas, 'D');
        const resultado = resampler.enriquecer('interpolacao');

        expect(resultado.dados.forma[0]).toBe(5); // 5 dias
        expect(resultado.dados.nomeColunas).toEqual(['temp', 'umidade']);
    });

    it('deve lidar com valores nulos nas extremidades', () => {
        const datas = new IndiceTemporal(['2024-01-02', '2024-01-05']);
        const rd = new RecorteDados({
            valor: [20, 50]
        });

        const resampler = new Reamostrador(rd, datas, 'D');
        const resultado = resampler.enriquecer('interpolacao');

        expect(resultado.dados.forma[0]).toBeGreaterThan(0);
    });
});

describe('Performance e Escalabilidade', () => {
    it('deve processar grande volume de dados', () => {
        const datas = criarRangeDatas('2020-01-01', '2024-12-31', 'D');
        const rd = new RecorteDados({
            valor: Array.from({ length: datas.comprimento }, (_, i) => i * 1.5)
        });

        const resampler = new Reamostrador(rd, datas, 'M');
        const resultado = resampler.degradar('media');

        expect(resultado.dados.forma[0]).toBeGreaterThan(0);
        expect(resultado.dados.forma[0]).toBeLessThan(datas.comprimento);
    });

    it('deve resampling com muitas colunas', () => {
        const datas = criarRangeDatas('2024-01-01', '2024-01-31', 'D');
        const dados_obj: Record<string, number[]> = {};
        
        for (let i = 0; i < 20; i++) {
            dados_obj[`coluna_${i}`] = Array.from(
                { length: datas.comprimento },
                () => Math.random() * 100
            );
        }

        const rd = new RecorteDados(dados_obj);
        const resampler = new Reamostrador(rd, datas, 'M');
        const resultado = resampler.degradar('media');

        expect(resultado.dados.forma[1]).toBe(20);
    });
});
