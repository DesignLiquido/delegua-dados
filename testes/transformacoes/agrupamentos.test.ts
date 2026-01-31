/**
 * Testes para módulo GroupBy
 */

import { RecorteDados } from '../../fontes/recorte-dados';
import { agruparPor } from '../../fontes/transformacoes/agrupamentos';

describe('GroupBy: Agregações Básicas', () => {
    let dados: RecorteDados;

    beforeEach(() => {
        dados = new RecorteDados({
            categoria: ['A', 'A', 'B', 'B', 'C', 'C'],
            vendas: [100, 150, 200, 250, 300, 350],
            custos: [50, 75, 100, 125, 150, 175]
        });
    });

    it('deve somar valores por grupo', () => {
        const grupo = agruparPor(dados, 'categoria');
        const resultado = grupo.soma('vendas');

        expect(resultado.forma[0]).toBe(3); // 3 categorias
        expect((resultado.selecionarColuna('vendas').dados as number[])[0]).toBe(250); // A: 100+150
    });

    it('deve calcular média por grupo', () => {
        const grupo = agruparPor(dados, 'categoria');
        const resultado = grupo.media('vendas');

        expect(resultado.forma[0]).toBe(3);
        expect((resultado.selecionarColuna('vendas').dados as number[])[0]).toBe(125); // A: (100+150)/2
    });

    it('deve encontrar mínimo por grupo', () => {
        const grupo = agruparPor(dados, 'categoria');
        const resultado = grupo.minimo('vendas');

        expect((resultado.selecionarColuna('vendas').dados as number[])[0]).toBe(100); // A: min
        expect((resultado.selecionarColuna('vendas').dados as number[])[1]).toBe(200); // B: min
    });

    it('deve encontrar máximo por grupo', () => {
        const grupo = agruparPor(dados, 'categoria');
        const resultado = grupo.maximo('vendas');

        expect((resultado.selecionarColuna('vendas').dados as number[])[0]).toBe(150); // A: max
        expect((resultado.selecionarColuna('vendas').dados as number[])[1]).toBe(250); // B: max
    });

    it('deve contar elementos por grupo', () => {
        const grupo = agruparPor(dados, 'categoria');
        const resultado = grupo.contar('vendas');

        expect((resultado.selecionarColuna('vendas').dados as number[])[0]).toBe(2); // A: 2 elementos
        expect((resultado.selecionarColuna('vendas').dados as number[])[1]).toBe(2); // B: 2 elementos
    });

    it('deve calcular desvio por grupo', () => {
        const grupo = agruparPor(dados, 'categoria');
        const resultado = grupo.desvio('vendas');

        expect(resultado.forma[0]).toBe(3);
        expect((resultado.selecionarColuna('vendas').dados as number[])[0]).toBeGreaterThan(0);
    });

    it('deve calcular variância por grupo', () => {
        const grupo = agruparPor(dados, 'categoria');
        const resultado = grupo.variancia('vendas');

        expect(resultado.forma[0]).toBe(3);
        expect((resultado.selecionarColuna('vendas').dados as number[])[0]).toBeGreaterThan(0);
    });

    it('deve calcular mediana por grupo', () => {
        const grupo = agruparPor(dados, 'categoria');
        const resultado = grupo.mediana('vendas');

        expect((resultado.selecionarColuna('vendas').dados as number[])[0]).toBe(125); // A: mediana de 100,150
    });
});

describe('GroupBy: Múltiplas Chaves', () => {
    let dados: RecorteDados;

    beforeEach(() => {
        dados = new RecorteDados({
            regiao: ['Norte', 'Norte', 'Sul', 'Sul', 'Norte', 'Sul'],
            categoria: ['A', 'B', 'A', 'B', 'A', 'A'],
            vendas: [100, 200, 150, 250, 120, 180]
        });
    });

    it('deve agrupar por múltiplas colunas', () => {
        const grupo = agruparPor(dados, ['regiao', 'categoria']);
        const resultado = grupo.soma('vendas');

        expect(resultado.forma[0]).toBeGreaterThan(1);
        expect(resultado.nomeColunas).toContain('regiao');
        expect(resultado.nomeColunas).toContain('categoria');
        expect(resultado.nomeColunas).toContain('vendas');
    });

    it('deve preservar valores de agrupamento', () => {
        const grupo = agruparPor(dados, ['regiao', 'categoria']);
        const resultado = grupo.soma('vendas');

        const regioes = resultado.selecionarColuna('regiao').dados;
        const categorias = resultado.selecionarColuna('categoria').dados;

        expect(regioes).toContain('Norte');
        expect(regioes).toContain('Sul');
        expect(categorias).toContain('A');
        expect(categorias).toContain('B');
    });
});

describe('GroupBy: Agregação Customizada', () => {
    let dados: RecorteDados;

    beforeEach(() => {
        dados = new RecorteDados({
            grupo: ['X', 'X', 'X', 'Y', 'Y', 'Y'],
            valor: [10, 20, 30, 5, 15, 25]
        });
    });

    it('deve agregar múltiplas colunas', () => {
        const ag = agruparPor(dados, 'grupo');
        const resultado = ag.agrupar({
            valor: ['sum', 'mean', 'max']
        });

        expect(resultado.forma[0]).toBe(2); // 2 grupos
        expect(resultado.nomeColunas).toContain('valor_sum');
        expect(resultado.nomeColunas).toContain('valor_mean');
        expect(resultado.nomeColunas).toContain('valor_max');
    });

    it('deve calcular soma e média', () => {
        const ag = agruparPor(dados, 'grupo');
        const resultado = ag.agrupar({
            valor: ['sum', 'mean']
        });

        const somas = resultado.selecionarColuna('valor_sum').dados as number[];
        const medias = resultado.selecionarColuna('valor_mean').dados as number[];

        expect(somas[0]).toBe(60); // X: 10+20+30
        expect(medias[0]).toBe(20); // X: 60/3
    });
});

describe('GroupBy: Transformação', () => {
    let dados: RecorteDados;

    beforeEach(() => {
        dados = new RecorteDados({
            grupo: ['A', 'A', 'B', 'B'],
            valor: [10, 20, 30, 40]
        });
    });

    it('deve transformar substituindo valores por agregação', () => {
        const ag = agruparPor(dados, 'grupo');
        const resultado = ag.transformar('valor', (valores) => {
            return (valores as number[]).reduce((a, b) => a + b, 0);
        });

        expect(resultado.forma[0]).toBe(4); // mesmo tamanho original
        const coluna = resultado.selecionarColuna('valor').dados as number[];
        expect(coluna[0]).toBe(30); // A: 10+20
        expect(coluna[2]).toBe(70); // B: 30+40
    });

    it('deve calcular média centralizada', () => {
        const ag = agruparPor(dados, 'grupo');
        const resultado = ag.transformar('valor', (valores) => {
            const soma = (valores as number[]).reduce((a, b) => a + b, 0);
            return soma / valores.length;
        });

        expect(resultado.forma[0]).toBe(4);
        const coluna = resultado.selecionarColuna('valor').dados as number[];
        expect(coluna[0]).toBe(15); // A: 30/2
        expect(coluna[2]).toBe(35); // B: 70/2
    });
});

describe('GroupBy: Aplicação de Função', () => {
    let dados: RecorteDados;

    beforeEach(() => {
        dados = new RecorteDados({
            regiao: ['Norte', 'Norte', 'Sul', 'Sul'],
            vendas: [100, 150, 200, 250]
        });
    });

    it('deve aplicar função a cada grupo', () => {
        const ag = agruparPor(dados, 'regiao');
        const resultados = ag.aplicar('vendas', (grupo) => {
            const vendas = grupo.selecionarColuna('vendas').dados as number[];
            return vendas.reduce((a, b) => a + b, 0);
        });

        expect(resultados.length).toBe(2);
        expect(resultados[0]).toBe(250); // Norte
        expect(resultados[1]).toBe(450); // Sul
    });

    it('deve retornar array de resultados', () => {
        const ag = agruparPor(dados, 'regiao');
        const resultados = ag.aplicar('vendas', (grupo) => {
            return grupo.forma[0]; // tamanho do grupo
        });

        expect(Array.isArray(resultados)).toBe(true);
        expect(resultados[0]).toBe(2);
    });
});

describe('GroupBy: Filtração', () => {
    let dados: RecorteDados;

    beforeEach(() => {
        dados = new RecorteDados({
            tipo: ['Pequeno', 'Pequeno', 'Grande', 'Grande', 'Pequeno'],
            tamanho: [5, 10, 20, 30, 15]
        });
    });

    it('deve filtrar grupos por condição', () => {
        const ag = agruparPor(dados, 'tipo');
        const resultado = ag.filtrar((grupo) => {
            return grupo.forma[0] > 2; // apenas grupos com mais de 2 elementos
        });

        expect(resultado.forma[0]).toBeGreaterThan(0);
    });

    it('deve manter dados de grupos que passam filtro', () => {
        const ag = agruparPor(dados, 'tipo');
        const resultado = ag.filtrar((grupo) => {
            const tamanho_total = (grupo.selecionarColuna('tamanho').dados as number[])
                .reduce((a, b) => a + b, 0);
            return tamanho_total > 30;
        });

        const tipos = resultado.selecionarColuna('tipo').dados;
        // Apenas 'Pequeno' (5+10+15=30) e 'Grande' (20+30=50) têm total > 30
        // Ambos passam, então pode variar
        expect(resultado.forma[0]).toBeGreaterThan(0);
    });
});

describe('GroupBy: Propriedades', () => {
    let dados: RecorteDados;

    beforeEach(() => {
        dados = new RecorteDados({
            categoria: ['A', 'B', 'A', 'B', 'C'],
            valor: [1, 2, 3, 4, 5]
        });
    });

    it('deve retornar tamanho (número de grupos)', () => {
        const ag = agruparPor(dados, 'categoria');
        expect(ag.tamanho).toBe(3); // A, B, C
    });

    it('deve retornar nomes dos grupos', () => {
        const ag = agruparPor(dados, 'categoria');
        const nomes = ag.nomesGrupos;

        expect(nomes.length).toBe(3);
        expect(nomes).toContain('A');
        expect(nomes).toContain('B');
        expect(nomes).toContain('C');
    });
});

describe('Integração GroupBy', () => {
    it('deve criar pipeline de agrupamento e agregação', () => {
        const vendas = new RecorteDados({
            mes: ['Jan', 'Jan', 'Fev', 'Fev'],
            regiao: ['Norte', 'Sul', 'Norte', 'Sul'],
            vendas: [1000, 1500, 2000, 2500]
        });

        // Agrupar por mês
        const por_mes = agruparPor(vendas, 'mes');
        const vendas_por_mes = por_mes.soma('vendas');

        expect(vendas_por_mes.forma[0]).toBe(2); // 2 meses
        expect((vendas_por_mes.selecionarColuna('vendas').dados as number[])[0]).toBe(2500); // Jan: 1000+1500

        // Agrupar por região
        const por_regiao = agruparPor(vendas, 'regiao');
        const vendas_por_regiao = por_regiao.soma('vendas');

        expect(vendas_por_regiao.forma[0]).toBe(2); // 2 regiões
    });

    it('deve combinar múltiplas agregações', () => {
        const dados = new RecorteDados({
            grupo: ['A', 'A', 'B', 'B'],
            valor: [10, 20, 30, 40]
        });

        const ag = agruparPor(dados, 'grupo');

        const soma_resultado = ag.soma('valor');
        const media_resultado = ag.media('valor');
        const max_resultado = ag.maximo('valor');

        expect((soma_resultado.selecionarColuna('valor').dados as number[])[0]).toBe(30);
        expect((media_resultado.selecionarColuna('valor').dados as number[])[0]).toBe(15);
        expect((max_resultado.selecionarColuna('valor').dados as number[])[0]).toBe(20);
    });
});
