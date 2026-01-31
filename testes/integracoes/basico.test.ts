/**
 * Testes de Integração: Uso Básico
 * 
 * Baseado em exemplos/1_basico.ts
 * Verifica fluxos de trabalho completos com Indice, Serie e DadosTabela
 */

import { Indice } from '../../fontes/indice';
import { Serie } from '../../fontes/serie';
import { RecorteDados } from '../../fontes/recorte-dados';

describe('Integração: Uso Básico', () => {
    describe('Workflow de Índice', () => {
        it('deve criar e manipular índice com dados de meses', () => {
            const indice = new Indice(['janeiro', 'fevereiro', 'março', 'abril']);
            
            expect(indice.tamanho).toBe(4);
            expect(indice.forma).toEqual([4]);
            expect(indice.paraTexto()).toContain('4 elementos');
            expect(indice.dados).toEqual(['janeiro', 'fevereiro', 'março', 'abril']);
        });
    });

    describe('Workflow de Série', () => {
        let vendas: Serie;

        beforeEach(() => {
            vendas = new Serie(
                [100, 150, 120, 200],
                {
                    indice: ['janeiro', 'fevereiro', 'março', 'abril'],
                    nome: 'Vendas'
                }
            );
        });

        it('deve criar série de vendas com índice personalizado', () => {
            expect(vendas.tamanho).toBe(4);
            expect(vendas.tipoDado).toBe('numero');
            expect(vendas.nome).toBe('Vendas');
            expect(vendas.indice.tamanho).toBe(4);
        });

        it('deve retornar cabeça e cauda corretamente', () => {
            const cabeca = vendas.cabeca(2);
            expect(cabeca.tamanho).toBe(2);
            expect(cabeca.dados).toEqual([100, 150]);

            const cauda = vendas.cauda(2);
            expect(cauda.tamanho).toBe(2);
            expect(cauda.dados).toEqual([120, 200]);
        });

        it('deve calcular estatísticas básicas', () => {
            const valores = vendas.dados as number[];
            const max = Math.max(...valores);
            const min = Math.min(...valores);
            const media = valores.reduce((a, b) => a + b) / vendas.tamanho;

            expect(max).toBe(200);
            expect(min).toBe(100);
            expect(media).toBe(142.5);
        });

        it('deve aplicar função de transformação (multiplicar por 2)', () => {
            const vendas2x = vendas.aplicar((x: number) => x * 2);
            
            expect(vendas2x.dados).toEqual([200, 300, 240, 400]);
            expect(vendas2x.tamanho).toBe(4);
        });

        it('deve ordenar valores em ordem decrescente', () => {
            const vendasOrdenadas = vendas.ordenarValores(false);
            
            expect(vendasOrdenadas.dados).toEqual([200, 150, 120, 100]);
        });
    });

    describe('Workflow de RecorteDados', () => {
        let df: RecorteDados;

        beforeEach(() => {
            df = new RecorteDados({
                mes: ['janeiro', 'fevereiro', 'março', 'abril'],
                vendas: [100, 150, 120, 200],
                lucro: [20, 30, 25, 40]
            });
        });

        it('deve criar RecorteDados com múltiplas colunas', () => {
            expect(df.forma).toEqual([4, 3]);
            expect(df.nomeColunas.sort()).toEqual(['lucro', 'mes', 'vendas']);
        });

        it('deve selecionar coluna específica', () => {
            const colunaMes = df.selecionarColuna('mes');
            
            expect(colunaMes).toBeInstanceOf(Serie);
            expect(colunaMes.tamanho).toBe(4);
            expect(colunaMes.dados).toEqual(['janeiro', 'fevereiro', 'março', 'abril']);
        });

        it('deve filtrar linhas baseado em condição (vendas > 120)', () => {
            const mascara = (df.selecionarColuna('vendas').dados as number[]).map(v => v > 120);
            const rdFiltrado = df.filtrar(mascara);

            expect(rdFiltrado.forma[0]).toBe(2);
            expect((rdFiltrado.selecionarColuna('vendas').dados as number[])).toEqual([150, 200]);
        });

        it('deve converter para texto com formatação adequada', () => {
            const texto = df.paraTexto();
            
            expect(texto).toContain('mes');
            expect(texto).toContain('vendas');
            expect(texto).toContain('lucro');
            expect(texto).toContain('janeiro');
        });
    });

    describe('Workflow Completo', () => {
        it('deve executar pipeline completo: criar -> selecionar -> filtrar -> transformar', () => {
            // Criar
            const rd = new RecorteDados({
                mes: ['janeiro', 'fevereiro', 'março', 'abril'],
                vendas: [100, 150, 120, 200],
                lucro: [20, 30, 25, 40]
            });

            // Selecionar
            const vendas = rd.selecionarColuna('vendas');
            expect(vendas.tamanho).toBe(4);

            // Filtrar
            const mascara = (vendas.dados as number[]).map(v => v > 120);
            const rdFiltrado = rd.filtrar(mascara);
            expect(rdFiltrado.forma[0]).toBe(2);

            // Transformar
            const vendasDobradas = vendas.aplicar((x: number) => x * 2);
            expect(vendasDobradas.dados).toEqual([200, 300, 240, 400]);
        });
    });
});
