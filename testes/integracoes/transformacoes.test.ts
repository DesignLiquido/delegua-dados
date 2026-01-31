/**
 * Testes de Integração: Transformações e Limpeza
 * 
 * Baseado em exemplos/3_transformacoes.ts
 * Verifica fluxos completos de limpeza e transformação de dados
 */

import { Serie } from '../../fontes/serie';
import { RecorteDados } from '../../fontes/recorte-dados';

describe('Integração: Transformações e Limpeza', () => {
    describe('Workflow com Valores Faltantes em Serie', () => {
        let temperaturasOriginal: Serie;

        beforeEach(() => {
            temperaturasOriginal = new Serie(
                [25.5, null, 26.0, 24.8, null, 25.2, 26.5],
                {
                    indice: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
                    nome: 'Temperatura'
                }
            );
        });

        it('deve identificar valores faltantes', () => {
            const serieNulos = temperaturasOriginal.temNulo();
            
            expect(serieNulos.tamanho).toBe(7);
            expect((serieNulos.dados as boolean[])).toEqual([false, true, false, false, true, false, false]);
        });

        it('deve retornar posições com valores nulos', () => {
            const temNulo = temperaturasOriginal.temNulo().dados as boolean[];
            const posicoesComNulo = temNulo
                .map((v, i) => v ? i : null)
                .filter(v => v !== null);

            expect(posicoesComNulo).toEqual([1, 4]);
        });

        it('deve remover valores nulos', () => {
            const temperaturasSemNulos = temperaturasOriginal.removerNulo();

            expect(temperaturasSemNulos.tamanho).toBe(5);
            expect(temperaturasSemNulos.dados).not.toContain(null);
            expect((temperaturasSemNulos.dados as number[]).every(v => typeof v === 'number')).toBe(true);
        });

        it('deve preencher valores nulos com média', () => {
            const valores = temperaturasOriginal.dados as (number | null)[];
            const valoresNaoNulos = valores.filter(v => v !== null) as number[];
            const media = valoresNaoNulos.reduce((a, b) => a + b, 0) / valoresNaoNulos.length;
            const mediaArredondada = parseFloat(media.toFixed(2));

            const temperaturasPreenchidas = temperaturasOriginal.preencherNulo(mediaArredondada);

            expect(temperaturasPreenchidas.tamanho).toBe(7);
            expect(temperaturasPreenchidas.dados).not.toContain(null);
            expect(temperaturasPreenchidas.dados[1]).toBe(mediaArredondada);
            expect(temperaturasPreenchidas.dados[4]).toBe(mediaArredondada);
        });
    });

    describe('Workflow com Valores Faltantes em RecorteDados', () => {
        let rdSujo: RecorteDados;

        beforeEach(() => {
            rdSujo = new RecorteDados({
                id: [1, 2, 3, 4, 5, 6],
                nome: ['Alice', 'Bob', 'Charlie', null, 'Eve', 'Frank'],
                idade: [25, 30, null, 28, 35, null],
                salario: [3000, 3500, 4000, 3200, null, 3800]
            });
        });

        it('deve criar RecorteDados com valores faltantes', () => {
            expect(rdSujo.forma).toEqual([6, 4]);
            
            const colunaNome = rdSujo.selecionarColuna('nome');
            expect(colunaNome.dados).toContain(null);
        });

        it('deve remover linhas com valores nulos', () => {
            const rdLimpo = rdSujo.removerNulo();

            expect(rdLimpo.forma[0]).toBeLessThan(rdSujo.forma[0]);
            expect(rdLimpo.forma[0]).toBe(2); // Apenas Alice e Bob não têm nulos
            
            // Verificar que não há nulos
            for (const coluna of rdLimpo.nomeColunas) {
                const serie = rdLimpo.selecionarColuna(coluna);
                expect(serie.dados).not.toContain(null);
            }
        });

        it('deve preencher valores nulos com valor padrão', () => {
            const rdPreenchido = rdSujo.preencherNulo(0);

            expect(rdPreenchido.forma[0]).toBe(rdSujo.forma[0]);
            
            // Verificar que nulos foram preenchidos
            const colunaNome = rdPreenchido.selecionarColuna('nome');
            expect(colunaNome.dados[3]).toBe(0);
            
            const colunaIdade = rdPreenchido.selecionarColuna('idade');
            expect(colunaIdade.dados[2]).toBe(0);
            expect(colunaIdade.dados[5]).toBe(0);
        });

        it('deve medir impacto da remoção de nulos', () => {
            const linhasOriginais = rdSujo.forma[0];
            const rdLimpo = rdSujo.removerNulo();
            const linhasLimpas = rdLimpo.forma[0];
            const reducao = linhasOriginais - linhasLimpas;

            expect(reducao).toBe(4); // 4 linhas tinham nulos
            expect(linhasLimpas / linhasOriginais).toBeCloseTo(0.33, 1);
        });
    });

    describe('Workflow de Remoção de Duplicatas', () => {
        let rdComDuplicatas: RecorteDados;

        beforeEach(() => {
            rdComDuplicatas = new RecorteDados({
                produto: ['A', 'B', 'A', 'C', 'B', 'A'],
                quantidade: [10, 20, 10, 30, 20, 10]
            });
        });

        it('deve criar RecorteDados com linhas duplicadas', () => {
            expect(rdComDuplicatas.forma[0]).toBe(6);
        });

        it('deve remover linhas duplicadas', () => {
            const rdSemDuplicatas = rdComDuplicatas.removerDuplicatas();

            expect(rdSemDuplicatas.forma[0]).toBeLessThan(rdComDuplicatas.forma[0]);
            expect(rdSemDuplicatas.forma[0]).toBe(3);
            
            const produtos = rdSemDuplicatas.selecionarColuna('produto').dados;
            expect(produtos).toEqual(['A', 'B', 'C']);
        });

        it('deve medir impacto da remoção de duplicatas', () => {
            const linhasOriginais = rdComDuplicatas.forma[0];
            const rdSemDuplicatas = rdComDuplicatas.removerDuplicatas();
            const linhasFinais = rdSemDuplicatas.forma[0];
            const reducao = linhasOriginais - linhasFinais;

            expect(reducao).toBe(3);
            expect(linhasFinais / linhasOriginais).toBe(0.5);
        });
    });

    describe('Workflow de Renomeação de Colunas', () => {
        let rd: RecorteDados;

        beforeEach(() => {
            rd = new RecorteDados({
                id: [1, 2],
                nome: ['Alice', 'Bob'],
                idade: [25, 30],
                salario: [3000, 3500]
            });
        });

        it('deve renomear múltiplas colunas', () => {
            const rdRenomeado = rd.renomear({
                'nome': 'nomeFunc',
                'idade': 'idadeFunc',
                'salario': 'salarioFunc'
            });

            expect(rdRenomeado.nomeColunas.sort()).toEqual(['id', 'idadeFunc', 'nomeFunc', 'salarioFunc']);
            expect(rdRenomeado.nomeColunas).not.toContain('nome');
            expect(rdRenomeado.nomeColunas).not.toContain('idade');
            expect(rdRenomeado.nomeColunas).not.toContain('salario');
        });

        it('deve preservar dados após renomeação', () => {
            const rdRenomeado = rd.renomear({ 'nome': 'nomeFunc' });
            const colunaRenomeada = rdRenomeado.selecionarColuna('nomeFunc');

            expect(colunaRenomeada.dados).toEqual(['Alice', 'Bob']);
        });
    });

    describe('Workflow de Remoção de Colunas', () => {
        let rd: RecorteDados;

        beforeEach(() => {
            rd = new RecorteDados({
                id: [1, 2],
                nome: ['Alice', 'Bob'],
                idade: [25, 30],
                salario: [3000, 3500]
            });
        });

        it('deve remover colunas específicas', () => {
            const rdReduzido = rd.remover(['idade']);

            expect(rdReduzido.forma[1]).toBe(3);
            expect(rdReduzido.nomeColunas).not.toContain('idade');
            expect(rdReduzido.nomeColunas.sort()).toEqual(['id', 'nome', 'salario']);
        });

        it('deve remover múltiplas colunas', () => {
            const rdReduzido = rd.remover(['idade', 'salario']);

            expect(rdReduzido.forma[1]).toBe(2);
            expect(rdReduzido.nomeColunas.sort()).toEqual(['id', 'nome']);
        });
    });

    describe('Pipeline Completo de Limpeza', () => {
        it('deve executar pipeline: criar -> limpar nulos -> remover duplicatas -> renomear -> remover colunas', () => {
            // 1. Criar com dados sujos
            const rdOriginal = new RecorteDados({
                id: [1, 2, 3, 3, 4, 5],
                nome: ['Alice', 'Bob', null, 'Charlie', 'Bob', 'Eve'],
                idade: [25, 30, 28, 28, 30, 35],
                score: [100, null, 90, 85, 95, 88]
            });

            expect(rdOriginal.forma[0]).toBe(6);

            // 2. Remover nulos
            const rdSemNulos = rdOriginal.removerNulo();
            expect(rdSemNulos.forma[0]).toBeLessThan(rdOriginal.forma[0]);
            // 3. Remover duplicatas
            const rdLimpo = rdSemNulos.removerDuplicatas();
            expect(rdLimpo.forma[0]).toBeLessThanOrEqual(rdSemNulos.forma[0]);

            // 4. Renomear
            const rdRenomeado = rdLimpo.renomear({
                'nome': 'nome_completo',
                'idade': 'anos'
            });
            expect(rdRenomeado.nomeColunas).toContain('nome_completo');
            expect(rdRenomeado.nomeColunas).toContain('anos');

            // 5. Remover coluna desnecessária
            const rdFinal = rdRenomeado.remover(['id']);
            expect(rdFinal.nomeColunas).not.toContain('id');
            expect(rdFinal.forma[1]).toBe(3);

            // Verificar dados finais
            expect(rdFinal.forma[0]).toBeGreaterThan(0);
            for (const coluna of rdFinal.nomeColunas) {
                const serie = rdFinal.selecionarColuna(coluna);
                expect(serie.dados).not.toContain(null);
            }
        });
    });

    describe('Transformações com Estatísticas', () => {
        it('deve calcular e preencher com média', () => {
            const serie = new Serie([10, null, 30, null, 50]);
            
            const valores = serie.dados as (number | null)[];
            const valoresNaoNulos = valores.filter(v => v !== null) as number[];
            const media = valoresNaoNulos.reduce((a, b) => a + b, 0) / valoresNaoNulos.length;

            const seriePreenchida = serie.preencherNulo(media);

            expect(seriePreenchida.dados).not.toContain(null);
            expect(seriePreenchida.dados[1]).toBe(30);
            expect(seriePreenchida.dados[3]).toBe(30);
        });
    });
});
