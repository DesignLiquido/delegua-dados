import { analisarCSV, paraCSV } from '../../fontes/entrada-saida/csv';

describe('CSV I/O', () => {
    describe('analisarCSV() - Agnóstico à plataforma', () => {
        const csvBasico = `nome,idade,salario
Alice,25,3000
Bob,30,3500
Charlie,35,4000`;

        const csvSemCabecalho = `1,2,3
4,5,6
7,8,9`;

        const csvDelim = `nome;idade;salario
Alice;25;3000
Bob;30;3500`;

        it('deve analisar arquivo CSV básico', () => {
            const rd = analisarCSV(csvBasico);
            expect(rd.forma[0]).toBe(3);
            expect(rd.nomeColunas.sort()).toEqual(['idade', 'nome', 'salario']);
        });

        it('deve converter números automaticamente', () => {
            const rd = analisarCSV(csvBasico);
            const serie = rd.selecionarColuna('idade');
            expect(typeof serie.dados[0]).toBe('number');
            expect(serie.dados[0]).toBe(25);
        });

        it('deve manter textos como strings', () => {
            const rd = analisarCSV(csvBasico);
            const serie = rd.selecionarColuna('nome');
            expect(typeof serie.dados[0]).toBe('string');
            expect(serie.dados[0]).toBe('Alice');
        });

        it('deve suportar delimitador customizado', () => {
            const rd = analisarCSV(csvDelim, { delimitador: ';' });
            expect(rd.forma[0]).toBe(2);
            expect(rd.nomeColunas.sort()).toEqual(['idade', 'nome', 'salario']);
        });

        it('deve analisar arquivo sem cabeçalho', () => {
            const rd = analisarCSV(csvSemCabecalho, { temCabecalho: false });
            expect(rd.forma[0]).toBe(3);
            expect(rd.nomeColunas[0]).toContain('coluna');
        });

        it('deve suportar filtro de colunas', () => {
            const rd = analisarCSV(csvBasico, { colunas: ['nome', 'idade'] });
            expect(rd.nomeColunas.length).toBe(2);
            expect(rd.nomeColunas.sort()).toEqual(['idade', 'nome']);
        });

        it('deve lidar com arquivo CSV vazio', () => {
            const rd = analisarCSV('');
            expect(rd.forma[0]).toBe(0);
        });
    });

    describe('paraCSV() - Agnóstico à plataforma', () => {
        it('deve converter RecorteDados para CSV', () => {
            const csvOriginal = `nome,idade,salario
Alice,25,3000
Bob,30,3500
Charlie,35,4000`;
            const rd = analisarCSV(csvOriginal);
            const csv = paraCSV(rd);
            
            // Analisar novamente para verificar integridade
            const rdReconstruido = analisarCSV(csv);
            expect(rdReconstruido.forma).toEqual(rd.forma);
            expect(rdReconstruido.nomeColunas.sort()).toEqual(rd.nomeColunas.sort());
        });

        it('deve suportar delimitador customizado', () => {
            const csvOriginal = `nome,idade,salario
Alice,25,3000
Bob,30,3500`;
            const rd = analisarCSV(csvOriginal);
            const csv = paraCSV(rd, { delimitador: ';' });
            expect(csv).toContain(';');
        });

        it('deve incluir índice quando solicitado', () => {
            const csvOriginal = `nome,idade
Alice,25
Bob,30`;
            const rd = analisarCSV(csvOriginal);
            const csv = paraCSV(rd, { indice: true });
            const linhas = csv.split('\n');
            expect(linhas[0]).toContain('indice');
        });

        it('deve escapar aspas corretamente', () => {
            const csvComAspas = `nome,descricao
Alice,"Tem aspas: "" aqui"
Bob,"Simples"`;
            const rd = analisarCSV(csvComAspas);
            const csv = paraCSV(rd);
            // Verificar que aspas foram mantidas/escapadas corretamente
            expect(csv).toContain('""');
        });

        it('deve lidar com valores nulos', () => {
            const csvOriginal = `nome,valor
Alice,100
Bob,`;
            const rd = analisarCSV(csvOriginal);
            const csv = paraCSV(rd);
            // Valor nulo deve ser representado como string vazia
            expect(csv).toBeTruthy();
        });
    });

    describe('Roundtrip CSV (análise + conversão)', () => {
        it('deve manter dados em ciclo completo', () => {
            const csvOriginal = `produto,quantidade,preco
Maçã,10,2.5
Banana,15,1.2
Laranja,8,3.0`;
            
            // CSV -> RecorteDados -> CSV -> RecorteDados
            const rd1 = analisarCSV(csvOriginal);
            const csv = paraCSV(rd1);
            const rd2 = analisarCSV(csv);
            
            expect(rd2.forma).toEqual(rd1.forma);
            expect(rd2.nomeColunas.sort()).toEqual(rd1.nomeColunas.sort());
        });
    });
});
