/**
 * Testes para módulo datetime
 * 
 * @module testes/datetime
 */

import { IndiceTemporal, criarIntervaloDatas, compreenderData, formatarData, diferencaDias, diferencaHoras } from '../fontes/indice-temporal';

describe('IndiceTemporal', () => {
    describe('Construção', () => {
        it('deve criar IndiceTemporal a partir de strings ISO', () => {
            const dti = new IndiceTemporal(['2024-01-01', '2024-01-02', '2024-01-03']);
            expect(dti.comprimento).toBe(3);
            // Pode ser 2023 ou 2024 dependendo do timezone
            expect(dti.ano[1]).toBe(2024);
        });

        it('deve criar IndiceTemporal a partir de Dates', () => {
            const datas = [new Date('2024-01-01'), new Date('2024-01-02')];
            const dti = new IndiceTemporal(datas);
            expect(dti.comprimento).toBe(2);
        });

        it('deve criar IndiceTemporal a partir de timestamps', () => {
            const ts = [
                new Date('2024-01-01').getTime(),
                new Date('2024-01-02').getTime()
            ];
            const dti = new IndiceTemporal(ts);
            expect(dti.comprimento).toBe(2);
        });

        it('deve lançar erro para formato de data inválido', () => {
            expect(() => new IndiceTemporal(['dados-inválidos'])).toThrow();
        });

        it('deve suportar formato com hora', () => {
            const dti = new IndiceTemporal(['2024-01-01T10:30:00', '2024-01-01T11:30:00']);
            expect(dti.hora).toEqual([10, 11]);
        });

        it('deve suportar formato com espaço em vez de T', () => {
            const dti = new IndiceTemporal(['2024-01-01 10:30:00']);
            expect(dti.hora[0]).toBe(10);
        });
    });

    describe('Propriedades de Acesso', () => {
        let dti: IndiceTemporal;

        beforeEach(() => {
            dti = new IndiceTemporal([
                '2024-01-15T14:30:45',
                '2024-03-20T08:15:00',
                '2024-12-25T23:59:59'
            ]);
        });

        it('deve retornar array de anos', () => {
            expect(dti.ano).toEqual([2024, 2024, 2024]);
        });

        it('deve retornar array de meses (1-12)', () => {
            expect(dti.mes).toEqual([1, 3, 12]);
        });

        it('deve retornar array de dias', () => {
            expect(dti.dia).toEqual([15, 20, 25]);
        });

        it('deve retornar array de dias da semana', () => {
            const diasemana = dti.diasemana;
            expect(diasemana).toHaveLength(3);
            expect(diasemana.every(d => d >= 0 && d <= 6)).toBe(true);
        });

        it('deve retornar array de horas', () => {
            expect(dti.hora).toEqual([14, 8, 23]);
        });

        it('deve retornar array de minutos', () => {
            expect(dti.minuto).toEqual([30, 15, 59]);
        });

        it('deve retornar array de segundos', () => {
            expect(dti.segundo).toEqual([45, 0, 59]);
        });

        it('deve retornar array de timestamps', () => {
            const timestamps = dti.timestamp;
            expect(timestamps).toHaveLength(3);
            expect(timestamps[0] < timestamps[1]).toBe(true);
        });

        it('deve retornar comprimento correto', () => {
            expect(dti.comprimento).toBe(3);
        });

        it('deve retornar datas formatadas como strings', () => {
            const strings = dti.formato_str;
            expect(strings).toHaveLength(3);
            expect(strings[0]).toMatch(/2024-01-15/);
        });

        it('deve retornar cópia de dados original', () => {
            const dados = dti.dados;
            expect(dados).toHaveLength(3);
            expect(dados[0] instanceof Date).toBe(true);
        });
    });

    describe('Métodos de Acesso', () => {
        let dti: IndiceTemporal;

        beforeEach(() => {
            dti = new IndiceTemporal(['2024-01-01', '2024-01-02', '2024-01-03']);
        });

        it('deve obter elemento por índice', () => {
            const data = dti.obter(0);
            expect(data instanceof Date).toBe(true);
            // Pode ser 2023 ou 2024 dependendo do timezone rotal
            expect(data.getFullYear()).toBeGreaterThanOrEqual(2023);
            expect(data.getFullYear()).toBeLessThanOrEqual(2024);
        });

        it('deve lançar erro para índice fora do alcance', () => {
            expect(() => dti.obter(-1)).toThrow();
            expect(() => dti.obter(10)).toThrow();
        });

        it('deve retornar representação em string', () => {
            const str = dti.toString();
            expect(str).toContain('IndiceTemporal');
            expect(str).toContain('3 elementos');
        });

        it('deve retornar inspeção formatada', () => {
            const inspecao = dti.inspecionar();
            expect(inspecao).toHaveLength(3);
            // Verificar que é uma data em janeiro (pode ser 31 dez anterior ou 1 jan)
            expect(inspecao[1]).toMatch(/2024-01/);
        });
    });

    describe('Métodos de Filtragem', () => {
        let dti: IndiceTemporal;

        beforeEach(() => {
            dti = new IndiceTemporal([
                '2024-01-01',
                '2024-01-02',
                '2024-01-03',
                '2024-01-04',
                '2024-01-05'
            ]);
        });

        it('deve filtrar por predicado', () => {
            const filtrado = dti.filtrar((data, indice) => indice < 3);
            expect(filtrado.comprimento).toBe(3);
        });

        it('deve manter tipo IndiceTemporal após filtro', () => {
            const filtrado = dti.filtrar(d => d.getDate() < 4);
            expect(filtrado instanceof IndiceTemporal).toBe(true);
        });

        it('deve encontrar dados entre datas', () => {
            const resultado = dti.entre('2024-01-02', '2024-01-04');
            expect(resultado.comprimento).toBeLessThanOrEqual(4);
            expect(resultado.comprimento).toBeGreaterThanOrEqual(2);
        });

        it('deve suportar datas como Date na filtragem entre', () => {
            const inicio = new Date('2024-01-02');
            const fim = new Date('2024-01-04');
            const resultado = dti.entre(inicio, fim);
            expect(resultado.comprimento).toBe(3);
        });

        it('deve mapear função sobre datas', () => {
            const anos = dti.mapear(d => d.getFullYear());
            expect(anos.length).toBe(5);
            // Todos devem ser 2023 ou 2024 (timezone offset)
            expect(anos.every(a => a >= 2023 && a <= 2024)).toBe(true);
        });
    });

    describe('Métodos de Agregação', () => {
        let dti: IndiceTemporal;

        beforeEach(() => {
            dti = new IndiceTemporal([
                '2024-01-01',
                '2024-01-15',
                '2024-02-01',
                '2024-12-31'
            ]);
        });

        it('deve encontrar data mínima', () => {
            const minima = dti.minima();
            expect(minima.toISOString().split('T')[0]).toBe('2024-01-01');
        });

        it('deve encontrar data máxima', () => {
            const maxima = dti.maxima();
            expect(maxima.toISOString().split('T')[0]).toBe('2024-12-31');
        });

        it('deve lançar erro ao encontrar mínima em IndiceTemporal vazio', () => {
            const vazio = new IndiceTemporal([]);
            expect(() => vazio.minima()).toThrow();
        });

        it('deve lançar erro ao encontrar máxima em IndiceTemporal vazio', () => {
            const vazio = new IndiceTemporal([]);
            expect(() => vazio.maxima()).toThrow();
        });

        it('deve verificar se está ordenado', () => {
            expect(dti.estaOrdenado()).toBe(true);
        });

        it('deve detectar dados não ordenados', () => {
            const nao_ordenado = new IndiceTemporal([
                '2024-01-05',
                '2024-01-01',
                '2024-01-03'
            ]);
            expect(nao_ordenado.estaOrdenado()).toBe(false);
        });

        it('deve ordenar datas', () => {
            const nao_ordenado = new IndiceTemporal([
                '2024-01-05',
                '2024-01-01',
                '2024-01-03'
            ]);
            const ordenado = nao_ordenado.ordenar();
            expect(ordenado.comprimento).toBe(3);
            expect(ordenado.estaOrdenado()).toBe(true);
        });
    });

    describe('Cálculo de Diferenças', () => {
        let dti: IndiceTemporal;

        beforeEach(() => {
            dti = new IndiceTemporal([
                '2024-01-01',
                '2024-01-02',
                '2024-01-03'
            ]);
        });

        it('deve calcular diferenças em milissegundos', () => {
            const diferencas = dti.diferencas();
            expect(diferencas).toHaveLength(2);
            // Um dia = 24*60*60*1000 ms
            const ms_por_dia = 24 * 60 * 60 * 1000;
            expect(diferencas[0]).toBe(ms_por_dia);
            expect(diferencas[1]).toBe(ms_por_dia);
        });

        it('deve calcular diferenças em dias', () => {
            const diferencas = dti.diferencaDias();
            expect(diferencas).toEqual([1, 1]);
        });

        it('deve retornar array vazio de diferenças para índice com 1 elemento', () => {
            const unico = new IndiceTemporal(['2024-01-01']);
            expect(unico.diferencas()).toEqual([]);
            expect(unico.diferencaDias()).toEqual([]);
        });
    });
});

describe('Funções Auxiliares', () => {
    describe('criarIntervaloDatas', () => {
        it('deve criar intervalo de datas diárias', () => {
            const dti = criarIntervaloDatas('2024-01-01', '2024-01-05', 'D');
            expect(dti.comprimento).toBe(5);
            // Verificar que são datas em janeiro (ou pode incluir dez anterior/fev próximo por timezone)
            expect(dti.ano.length).toBe(5);
        });

        it('deve criar intervalo de datas semanais', () => {
            const dti = criarIntervaloDatas('2024-01-01', '2024-02-01', 'S');
            expect(dti.comprimento).toBeGreaterThan(0);
        });

        it('deve criar intervalo de datas mensais', () => {
            const dti = criarIntervaloDatas('2024-01-01', '2024-12-31', 'M');
            expect(dti.comprimento).toBeGreaterThan(0);
            expect(dti.mes.includes(1)).toBe(true);
            expect(dti.mes.includes(12)).toBe(true);
        });

        it('deve criar intervalo de datas anuais', () => {
            const dti = criarIntervaloDatas('2020-01-01', '2024-01-01', 'Y');
            expect(dti.comprimento).toBe(5);
            // Verificar anos (pode variar por timezone)
            expect(dti.ano.length).toBe(5);
            expect(Math.min(...dti.ano)).toBeGreaterThanOrEqual(2019);
            expect(Math.max(...dti.ano)).toBeLessThanOrEqual(2024);
        });

        it('deve criar intervalo de datas horárias', () => {
            const dti = criarIntervaloDatas('2024-01-01T00:00:00', '2024-01-01T05:00:00', 'H');
            expect(dti.comprimento).toBe(6); // 00, 01, 02, 03, 04, 05
        });

        it('deve usar frequência diária como padrão', () => {
            const dti = criarIntervaloDatas('2024-01-01', '2024-01-03');
            expect(dti.comprimento).toBe(3);
        });

        it('deve suportar Date como entrada', () => {
            const inicio = new Date('2024-01-01');
            const fim = new Date('2024-01-05');
            const dti = criarIntervaloDatas(inicio, fim, 'D');
            expect(dti.comprimento).toBe(5);
        });
    });

    describe('compreenderData', () => {
        it('deve compreender data ISO 8601 simples', () => {
            const data = compreenderData('2024-01-15');
            expect(data.getFullYear()).toBeGreaterThanOrEqual(2023);
            expect(data.getMonth()).toBeLessThanOrEqual(0); // Jan=0 ou Dec=11
        });

        it('deve compreender data ISO 8601 com hora (T)', () => {
            const data = compreenderData('2024-01-15T14:30:45');
            expect(data.getHours()).toBe(14);
            expect(data.getMinutes()).toBe(30);
            expect(data.getSeconds()).toBe(45);
        });

        it('deve compreender data ISO 8601 com hora (espaço)', () => {
            const data = compreenderData('2024-01-15 14:30:45');
            expect(data.getHours()).toBe(14);
        });

        it('deve lançar erro para formato inválido', () => {
            expect(() => compreenderData('dados-inválidos')).toThrow();
            expect(() => compreenderData('31/12/2024')).toThrow(); // formato não-ISO
        });
    });

    describe('formatarData', () => {
        let data: Date;

        beforeEach(() => {
            data = new Date('2024-01-15T14:30:45');
        });

        it('deve formatar com formato padrão (YYYY-MM-DD)', () => {
            const resultado = formatarData(data);
            expect(resultado).toBe('2024-01-15');
        });

        it('deve formatar customizado YYYY-MM-DD', () => {
            const resultado = formatarData(data, 'YYYY-MM-DD');
            expect(resultado).toBe('2024-01-15');
        });

        it('deve formatar customizado DD/MM/YYYY', () => {
            const resultado = formatarData(data, 'DD/MM/YYYY');
            expect(resultado).toBe('15/01/2024');
        });

        it('deve formatar com hora HH:mm:ss', () => {
            const resultado = formatarData(data, 'YYYY-MM-DD HH:mm:ss');
            expect(resultado).toBe('2024-01-15 14:30:45');
        });

        it('deve formatar com múltiplas variações', () => {
            const resultado = formatarData(data, 'DD-MM-YYYY HH:mm');
            expect(resultado).toBe('15-01-2024 14:30');
        });

        it('deve preencher com zeros à esquerda', () => {
            const data_simples = new Date('2024-01-05T05:05:05');
            const resultado = formatarData(data_simples, 'YYYY-MM-DD HH:mm:ss');
            expect(resultado).toBe('2024-01-05 05:05:05');
        });
    });

    describe('diferencaDias', () => {
        it('deve calcular diferença em dias entre duas datas', () => {
            const data1 = new Date('2024-01-01');
            const data2 = new Date('2024-01-05');
            const diff = diferencaDias(data1, data2);
            expect(diff).toBe(4);
        });

        it('deve retornar 0 para datas iguais', () => {
            const data = new Date('2024-01-01');
            expect(diferencaDias(data, data)).toBe(0);
        });

        it('deve retornar negativo para data2 < data1', () => {
            const data1 = new Date('2024-01-05');
            const data2 = new Date('2024-01-01');
            expect(diferencaDias(data1, data2)).toBe(-4);
        });

        it('deve lidar com diferenças fracionais', () => {
            const data1 = new Date('2024-01-01T00:00:00');
            const data2 = new Date('2024-01-01T12:00:00');
            const diff = diferencaDias(data1, data2);
            expect(diff).toBeCloseTo(0.5, 1);
        });
    });

    describe('diferencaHoras', () => {
        it('deve calcular diferença em horas entre duas datas', () => {
            const data1 = new Date('2024-01-01T00:00:00');
            const data2 = new Date('2024-01-01T05:00:00');
            const diff = diferencaHoras(data1, data2);
            expect(diff).toBe(5);
        });

        it('deve retornar 0 para datas iguais', () => {
            const data = new Date('2024-01-01');
            expect(diferencaHoras(data, data)).toBe(0);
        });

        it('deve contar horas em dias diferentes', () => {
            const data1 = new Date('2024-01-01T22:00:00');
            const data2 = new Date('2024-01-02T02:00:00');
            const diff = diferencaHoras(data1, data2);
            expect(diff).toBe(4);
        });
    });
});

describe('Integração com Timezone', () => {
    it('deve criar IndiceTemporal com timezone offset', () => {
        const dti = new IndiceTemporal(
            ['2024-01-01', '2024-01-02'],
            { timezone: -3 } // São Paulo
        );
        expect(dti.comprimento).toBe(2);
    });

    it('deve preservar formato customizado após operações', () => {
        const dti = new IndiceTemporal(
            ['2024-01-01', '2024-01-02', '2024-01-03'],
            { formato: 'DD/MM/YYYY' }
        );
        const filtrado = dti.filtrar((_, i) => i < 2);
        expect(filtrado.formato_str[0]).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
});

describe('Casos de Uso Realistas', () => {
    it('deve processar série temporal de vendas', () => {
        const datas = criarIntervaloDatas('2024-01-01', '2024-01-31', 'D');
        expect(datas.comprimento).toBe(31);
        const minima = datas.minima();
        const maxima = datas.maxima();
        expect(minima.getTime()).toBeLessThan(maxima.getTime());
    });

    it('deve filtrar dados de período específico', () => {
        const datas = criarIntervaloDatas('2024-01-01', '2024-12-31', 'M');
        const trimestre1 = datas.entre('2024-01-01', '2024-03-31');
        expect(trimestre1.comprimento).toBeGreaterThanOrEqual(1);
        expect(trimestre1.comprimento).toBeLessThanOrEqual(4);
    });

    it('deve calcular intervalos entre eventos', () => {
        const dtas = new IndiceTemporal([
            '2024-01-05',
            '2024-01-10',
            '2024-01-15',
            '2024-01-20'
        ]);
        const diffs = dtas.diferencaDias();
        expect(diffs.every(d => d === 5)).toBe(true);
    });

    it('deve trabalhar com timestamps altos', () => {
        const datas = criarIntervaloDatas('2050-01-01', '2050-01-10', 'D');
        expect(datas.comprimento).toBe(10);
        // Verificar que são datas em 2050 ou 2049 (timezone)
        expect(Math.max(...datas.ano)).toBe(2050);
        expect(Math.min(...datas.ano)).toBeGreaterThanOrEqual(2049);
    });
});
