/**
 * Testes de Integração: Workflow de CSV (Agnóstico à Plataforma)
 * 
 * Verifica fluxos completos de leitura, manipulação e conversão de CSV
 * usando APIs agnósticas à plataforma (funciona em Node.js e navegador)
 */

import { analisarCSV, paraCSV } from '../../fontes/entrada-saida/csv';
import { RecorteDados } from '../../fontes/recorte-dados';

describe('Integração: Workflow de CSV (Agnóstico à Plataforma)', () => {
    describe('Workflow Completo: Vendas', () => {
        const csvVendas = `produto,vendas_2023,lucro_2023,vendas_2024
Produto A,1000,200,1200
Produto B,800,150,950
Produto C,1500,300,1800
Produto D,600,100,720`;

        it('deve analisar CSV e criar RecorteDados', () => {
            const rd = analisarCSV(csvVendas);

            expect(rd.forma).toEqual([4, 4]);
            expect(rd.nomeColunas.sort()).toEqual(['lucro_2023', 'produto', 'vendas_2023', 'vendas_2024']);
        });

        it('deve converter tipos de dados automaticamente', () => {
            const rd = analisarCSV(csvVendas);

            const colunaProduto = rd.selecionarColuna('produto');
            expect(colunaProduto.tipoDado).toBe('texto');
            expect(colunaProduto.dados[0]).toBe('Produto A');

            const colunaVendas = rd.selecionarColuna('vendas_2023');
            expect(colunaVendas.tipoDado).toBe('numero');
            expect(colunaVendas.dados[0]).toBe(1000);
        });

        it('deve filtrar produtos com alto desempenho (vendas_2024 > 1000)', () => {
            const rd = analisarCSV(csvVendas);
            const colunaVendas2024 = rd.selecionarColuna('vendas_2024').dados as number[];
            const mascara = colunaVendas2024.map(v => v > 1000);
            const rdAltoDesempenho = rd.filtrar(mascara);

            expect(rdAltoDesempenho.forma[0]).toBe(2);
            expect((rdAltoDesempenho.selecionarColuna('produto').dados)).toEqual(['Produto A', 'Produto C']);
        });

        it('deve adicionar coluna calculada (crescimento percentual)', () => {
            const rd = analisarCSV(csvVendas);
            const vendas2023 = rd.selecionarColuna('vendas_2023').dados as number[];
            const vendas2024 = rd.selecionarColuna('vendas_2024').dados as number[];
            const crescimento = vendas2024.map((v, i) => 
                parseFloat((((v - vendas2023[i]) / vendas2023[i]) * 100).toFixed(2))
            );

            rd.adicionarColuna('crescimento_percent', crescimento);

            expect(rd.nomeColunas).toContain('crescimento_percent');
            expect(rd.forma[1]).toBe(5);
            
            const colunaCrescimento = rd.selecionarColuna('crescimento_percent').dados as number[];
            expect(colunaCrescimento[0]).toBeCloseTo(20, 1); // Produto A: 20%
            expect(colunaCrescimento[1]).toBeCloseTo(18.75, 1); // Produto B: 18.75%
        });

        it('deve gerar estatísticas descritivas', () => {
            const rd = analisarCSV(csvVendas);
            const stats = rd.descrever();

            expect(stats.nomeColunas).toContain('vendas_2023');
            expect(stats.nomeColunas).toContain('vendas_2024');
            expect(stats.forma[0]).toBeGreaterThan(0);
        });

        it('deve fazer roundtrip: analisar -> modificar -> converter -> analisar', () => {
            // Analisar
            const rd1 = analisarCSV(csvVendas);
            const linhasOriginais = rd1.forma[0];

            // Modificar
            rd1.adicionarColuna('nova_coluna', [1, 2, 3, 4]);

            // Converter para CSV
            const csvModificado = paraCSV(rd1);
            
            // Analisar novamente
            const rd2 = analisarCSV(csvModificado);

            expect(rd2.forma[0]).toBe(linhasOriginais);
            expect(rd2.nomeColunas).toContain('nova_coluna');
            expect((rd2.selecionarColuna('nova_coluna').dados as number[])).toEqual([1, 2, 3, 4]);
        });

        it('deve preservar dados ao converter para CSV com índice', () => {
            const rd1 = analisarCSV(csvVendas);
            rd1.adicionarColuna('crescimento_percent', [20, 18.75, 20, 20]);

            const csvComIndice = paraCSV(rd1, { indice: true });
            const rd2 = analisarCSV(csvComIndice);

            expect(rd2.nomeColunas).toContain('crescimento_percent');
            expect((rd2.selecionarColuna('crescimento_percent').dados as number[])).toEqual([20, 18.75, 20, 20]);
        });
    });

    describe('Casos de Uso Avançados', () => {
        it('deve processar pipeline completo de análise de dados', () => {
            // 1. Definir dados
            const csvConteudo = `produto,vendas,lucro
A,1000,200
B,800,150
C,1500,300`;

            // 2. Analisar
            const rd = analisarCSV(csvConteudo);
            expect(rd.forma[0]).toBe(3);

            // 3. Filtrar (vendas > 900)
            const mascara = (rd.selecionarColuna('vendas').dados as number[]).map(v => v > 900);
            const rdFiltrado = rd.filtrar(mascara);
            expect(rdFiltrado.forma[0]).toBe(2);

            // 4. Adicionar coluna
            const vendas = rdFiltrado.selecionarColuna('vendas').dados as number[];
            const lucro = rdFiltrado.selecionarColuna('lucro').dados as number[];
            const margem = vendas.map((v, i) => parseFloat(((lucro[i] / v) * 100).toFixed(2)));
            rdFiltrado.adicionarColuna('margem_percent', margem);

            // 5. Converter para CSV
            const csvSaida = paraCSV(rdFiltrado);
            
            // 6. Verificar resultado
            const rdFinal = analisarCSV(csvSaida);
            expect(rdFinal.forma[0]).toBe(2);
            expect(rdFinal.nomeColunas).toContain('margem_percent');
        });

        it('deve suportar diferentes delimitadores em pipeline', () => {
            // Dados com ponto-vírgula
            const csvSemicolon = `produto;valor;quantidade
A;100;5
B;200;3
C;150;7`;

            // Analisar com delimitador customizado
            const rd1 = analisarCSV(csvSemicolon, { delimitador: ';' });
            expect(rd1.forma[0]).toBe(3);
            expect(rd1.nomeColunas).toContain('produto');

            // Modificar
            const valores = rd1.selecionarColuna('valor').dados as number[];
            const quantidades = rd1.selecionarColuna('quantidade').dados as number[];
            const total = valores.map((v, i) => v * quantidades[i]);
            rd1.adicionarColuna('total', total);

            // Converter com diferente delimitador
            const csvComVirgula = paraCSV(rd1, { delimitador: ',' });
            
            // Analisar novamente
            const rd2 = analisarCSV(csvComVirgula);
            expect(rd2.nomeColunas).toContain('total');
            expect((rd2.selecionarColuna('total').dados as number[])).toEqual([500, 600, 1050]);
        });

        it('deve lidar com dados complexos: análise de séries temporais', () => {
            const csvDados = `data,temperatura,umidade,pressao
2024-01-01,15.5,60,1013
2024-01-02,16.2,58,1012
2024-01-03,14.8,65,1014
2024-01-04,17.1,55,1011
2024-01-05,18.3,50,1010`;

            const rd = analisarCSV(csvDados);
            
            // Calcular média de temperatura
            const temperaturas = rd.selecionarColuna('temperatura').dados as number[];
            const mediaTemperatura = temperaturas.reduce((a, b) => a + b) / temperaturas.length;
            
            // Criar máscara para dias acima da média
            const acimaMedia = temperaturas.map(t => t > mediaTemperatura);
            const rdAcimaMedia = rd.filtrar(acimaMedia);
            
            // Verificar resultado
            expect(rdAcimaMedia.forma[0]).toBeGreaterThan(0);
            expect(rdAcimaMedia.forma[0]).toBeLessThan(5);
            
            // Converter resultado para CSV
            const csvResultado = paraCSV(rdAcimaMedia);
            expect(csvResultado).toContain('temperatura');
            expect(csvResultado).toContain('2024');
        });
    });

    describe('Compatibilidade Multi-plataforma', () => {
        it('analisarCSV funciona em qualquer plataforma (sem dependências Node.js)', () => {
            const csv = `a,b,c
1,2,3
4,5,6`;
            
            // Esta função não usa 'fs' - deve funcionar no navegador também
            const rd = analisarCSV(csv);
            expect(rd.forma).toEqual([2, 3]);
        });

        it('paraCSV funciona em qualquer plataforma (sem dependências Node.js)', () => {
            const csv = `x,y,z
10,20,30`;
            
            const rd = analisarCSV(csv);
            // Esta função não usa 'fs' - deve funcionar no navegador também
            const csvGerado = paraCSV(rd);
            expect(csvGerado).toContain('x,y,z');
        });
    });
});
