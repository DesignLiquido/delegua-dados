import { Indice } from './indice';
import { Serie } from './serie';

/**
 * Tabela 2D com rótulos para linhas e colunas.
 * Similar a pd.DataFrame em Pandas.
 * 
 * @example
 * const recorte = new RecorteDados({
 *   'nome': ['Alice', 'Bob', 'Charlie'],
 *   'idade': [25, 30, 35],
 *   'salario': [3000, 3500, 4000]
 * });
 * 
 * const recorte = new RecorteDados([
 *   {nome: 'Alice', idade: 25},
 *   {nome: 'Bob', idade: 30}
 * ]);
 */
export class RecorteDados {
    private dados: Map<string, Serie>;
    indice!: Indice;
    colunas!: Indice;

    /**
     * Cria uma nova instância de RecorteDados.
     * 
     * @param dados Objeto com colunas ou vetor de objetos
     * @param opcoes Opções para configuração
     */
    constructor(dados: Record<string, any[]> | Record<string, any>[] | RecorteDados, opcoes?: {
        indice?: any[];
    }) {
        this.dados = new Map();

        if (dados instanceof RecorteDados) {
            // Copiar de outro RecorteDados
            dados.dados.forEach((serie, nome) => {
                this.dados.set(nome, serie.copia());
            });
            this.indice = dados.indice.copia();
            this.colunas = dados.colunas.copia();
        } else if (Array.isArray(dados) && dados.length > 0 && typeof dados[0] === 'object') {
            // Array de objetos
            this.inicializarDeArray(dados as Record<string, any>[], opcoes?.indice);
        } else {
            // Objeto com colunas
            this.inicializarDeObjeto(dados as Record<string, any[]>, opcoes?.indice);
        }
    }

    /**
     * Inicializa a partir de um objeto com colunas
     */
    private inicializarDeObjeto(dados: Record<string, any[]>, indiceCustomizado?: any[]): void {
        const colunas = Object.keys(dados);
        const tamanho = colunas.length > 0 ? dados[colunas[0]].length : 0;

        // Validar que todas as colunas têm o mesmo tamanho
        for (const coluna of colunas) {
            if (dados[coluna].length !== tamanho) {
                throw new Error(`Todas as colunas devem ter o mesmo tamanho. Coluna '${coluna}' tem tamanho ${dados[coluna].length}, esperado ${tamanho}`);
            }
        }

        // Criar índice de linhas
        this.indice = new Indice(indiceCustomizado || Array.from({ length: tamanho }, (_, i) => i));

        // Criar Series para cada coluna
        for (const coluna of colunas) {
            this.dados.set(coluna, new Serie(dados[coluna], {
                indice: this.indice.paraArray(),
                nome: coluna
            }));
        }

        // Criar índice de colunas
        this.colunas = new Indice(colunas);
    }

    /**
     * Inicializa a partir de um array de objetos
     */
    private inicializarDeArray(dados: Record<string, any>[], indiceCustomizado?: any[]): void {
        if (dados.length === 0) {
            this.indice = new Indice([]);
            this.colunas = new Indice([]);
            return;
        }

        // Obter nomes de colunas do primeiro objeto
        const colunas = Object.keys(dados[0]);
        const tamanho = dados.length;

        // Criar índice de linhas
        this.indice = new Indice(indiceCustomizado || Array.from({ length: tamanho }, (_, i) => i));

        // Criar Series para cada coluna
        for (const coluna of colunas) {
            const valores = dados.map(obj => obj[coluna] ?? null);
            this.dados.set(coluna, new Serie(valores, {
                indice: this.indice.paraArray(),
                nome: coluna
            }));
        }

        // Criar índice de colunas
        this.colunas = new Indice(colunas);
    }

    /**
     * Retorna a forma do DataFrame como tupla [linhas, colunas]
     */
    get forma(): [number, number] {
        return [this.indice.tamanho, this.colunas.tamanho];
    }

    /**
     * Retorna os nomes das colunas
     */
    get nomeColunas(): string[] {
        return this.colunas.paraArray();
    }

    /**
     * Retorna os primeiros n registros
     * 
     * @param n Número de registros a retornar (padrão: 5)
     * @returns Novo DadosTabela com os primeiros n registros
     */
    cabeca(n: number = 5): RecorteDados {
        const quantidade = Math.min(n, this.indice.tamanho);
        const novosDados: Record<string, any[]> = {};

        for (const [coluna, serie] of this.dados.entries()) {
            novosDados[coluna] = serie.paraArray().slice(0, quantidade);
        }

        return new RecorteDados(novosDados, {
            indice: this.indice.paraArray().slice(0, quantidade)
        });
    }

    /**
     * Retorna os últimos n registros
     * 
     * @param n Número de registros a retornar (padrão: 5)
     * @returns Novo DadosTabela com os últimos n registros
     */
    cauda(n: number = 5): RecorteDados {
        const quantidade = Math.min(n, this.indice.tamanho);
        const inicio = this.indice.tamanho - quantidade;
        const novosDados: Record<string, any[]> = {};

        for (const [coluna, serie] of this.dados.entries()) {
            novosDados[coluna] = serie.paraArray().slice(inicio);
        }

        return new RecorteDados(novosDados, {
            indice: this.indice.paraArray().slice(inicio)
        });
    }

    /**
     * Exibe informações sobre as colunas
     */
    info(): string {
        let resultado = `DadosTabela com ${this.indice.tamanho} registros e ${this.colunas.tamanho} colunas\n`;
        resultado += '\nInformações das colunas:\n';
        
        for (const coluna of this.nomeColunas) {
            const serie = this.dados.get(coluna)!;
            const naoNulos = serie.dados.filter((v: any) => v !== null && v !== undefined).length;
            resultado += `${coluna}: ${naoNulos} valores não-nulos, tipo ${serie.tipoDado}\n`;
        }
        
        return resultado;
    }

    /**
     * Retorna estatísticas descritivas para as colunas numéricas
     */
    descrever(): RecorteDados {
        const descricoes: Record<string, any[]> = {};

        for (const coluna of this.nomeColunas) {
            const serie = this.dados.get(coluna)!;
            
            // Tentar calcular estatísticas numéricas
            const numeros = serie.dados.filter((v): v is number => typeof v === 'number');
            
            if (numeros.length > 0) {
                const sorted = [...numeros].sort((a, b) => a - b);
                const media = numeros.reduce((a, b) => a + b, 0) / numeros.length;
                const minimo = sorted[0];
                const maximo = sorted[sorted.length - 1];
                const mediana = sorted.length % 2 === 0 
                    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                    : sorted[Math.floor(sorted.length / 2)];

                descricoes[coluna] = [
                    numeros.length,
                    media,
                    minimo,
                    mediana,
                    maximo
                ];
            }
        }

        return new RecorteDados(descricoes, {
            indice: ['contagem', 'média', 'mínimo', 'mediana', 'máximo']
        });
    }

    /**
     * Seleciona uma coluna e retorna como Serie
     * 
     * @param coluna Nome da coluna
     * @returns Serie com os dados da coluna
     */
    selecionarColuna(coluna: string): Serie {
        if (!this.dados.has(coluna)) {
            throw new Error(`Coluna '${coluna}' não encontrada`);
        }
        return this.dados.get(coluna)!.copia();
    }

    /**
     * Seleciona múltiplas colunas
     * 
     * @param colunas Array de nomes de colunas
     * @returns Novo DadosTabela com apenas as colunas selecionadas
     */
    selecionarColunas(colunas: string[]): RecorteDados {
        const novosDados: Record<string, any[]> = {};

        for (const coluna of colunas) {
            if (!this.dados.has(coluna)) {
                throw new Error(`Coluna '${coluna}' não encontrada`);
            }
            novosDados[coluna] = this.dados.get(coluna)!.paraArray();
        }

        return new RecorteDados(novosDados, {
            indice: this.indice.paraArray()
        });
    }

    /**
     * Adiciona uma nova coluna ao DataFrame
     * 
     * @param nome Nome da coluna
     * @param valores Valores para a coluna
     * @returns Este DadosTabela (modificado)
     */
    adicionarColuna(nome: string, valores: any[]): RecorteDados {
        if (valores.length !== this.indice.tamanho) {
            throw new Error(`A coluna deve ter ${this.indice.tamanho} elementos, recebido ${valores.length}`);
        }

        this.dados.set(nome, new Serie(valores, {
            indice: this.indice.paraArray(),
            nome: nome
        }));

        // Atualizar índice de colunas
        this.colunas = new Indice(Array.from(this.dados.keys()));

        return this;
    }

    /**
     * Remove colunas do DataFrame
     * 
     * @param colunas Array de nomes de colunas a remover
     * @returns Novo DadosTabela sem as colunas removidas
     */
    remover(colunas: string[]): RecorteDados {
        const novosDados: Record<string, any[]> = {};

        for (const [coluna, serie] of this.dados.entries()) {
            if (!colunas.includes(coluna)) {
                novosDados[coluna] = serie.paraArray();
            }
        }

        return new RecorteDados(novosDados, {
            indice: this.indice.paraArray()
        });
    }

    /**
     * Renomeia colunas
     * 
     * @param mapeamento Objeto com mapeamento de nomes antigos para novos
     * @returns Novo DadosTabela com colunas renomeadas
     */
    renomear(mapeamento: Record<string, string>): RecorteDados {
        const novosDados: Record<string, any[]> = {};

        for (const [coluna, serie] of this.dados.entries()) {
            const novoNome = mapeamento[coluna] || coluna;
            novosDados[novoNome] = serie.paraArray();
        }

        return new RecorteDados(novosDados, {
            indice: this.indice.paraArray()
        });
    }

    /**
     * Remove valores nulos
     * 
     * @returns Novo DadosTabela sem linhas com valores nulos
     */
    removerNulo(): RecorteDados {
        const mascara = Array.from({ length: this.indice.tamanho }, (_, i) => {
            for (const serie of this.dados.values()) {
                if (serie.get(i) === null || serie.get(i) === undefined) {
                    return false;
                }
            }
            return true;
        });

        return this.filtrar(mascara);
    }

    /**
     * Preenche valores nulos com um valor específico
     * 
     * @param valor Valor para preencher
     * @returns Novo DadosTabela com valores nulos preenchidos
     */
    preencherNulo(valor: any): RecorteDados {
        const novosDados: Record<string, any[]> = {};

        for (const [coluna, serie] of this.dados.entries()) {
            novosDados[coluna] = serie.dados.map(v => (v === null || v === undefined) ? valor : v);
        }

        return new RecorteDados(novosDados, {
            indice: this.indice.paraArray()
        });
    }

    /**
     * Remove linhas duplicadas
     * 
     * @param subconjunto Colunas a considerar (padrão: todas)
     * @returns Novo DadosTabela sem duplicatas
     */
    removerDuplicatas(subconjunto?: string[]): RecorteDados {
        const colunas = subconjunto || this.nomeColunas;
        const colunasVerificacao = new Set(colunas);
        const linhasVistas = new Set<string>();
        const mascara = Array.from({ length: this.indice.tamanho }, (_, i) => {
            const chave = colunas.map(c => {
                const serie = this.dados.get(c);
                return serie ? String(serie.get(i)) : '';
            }).join('|');

            if (linhasVistas.has(chave)) {
                return false;
            }
            linhasVistas.add(chave);
            return true;
        });

        return this.filtrar(mascara);
    }

    /**
     * Filtra o DataFrame baseado em uma máscara booleana
     * 
     * @param mascara Array de booleanos indicando quais linhas manter
     * @returns Novo DadosTabela filtrado
     */
    filtrar(mascara: boolean[]): RecorteDados {
        if (mascara.length !== this.indice.tamanho) {
            throw new Error(`A máscara deve ter ${this.indice.tamanho} elementos`);
        }

        const novosDados: Record<string, any[]> = {};
        const novoIndice: any[] = [];

        for (const [coluna, serie] of this.dados.entries()) {
            novosDados[coluna] = [];
        }

        this.indice.paraArray().forEach((rotulo, i) => {
            if (mascara[i]) {
                novoIndice.push(rotulo);
                for (const [coluna, serie] of this.dados.entries()) {
                    novosDados[coluna].push(serie.get(i));
                }
            }
        });

        return new RecorteDados(novosDados, { indice: novoIndice });
    }

    /**
     * Cria uma cópia profunda do DataFrame
     */
    copia(): RecorteDados {
        return new RecorteDados(this);
    }

    /**
     * Obtém um valor específico pela posição
     * 
     * @param linha Índice da linha
     * @param coluna Índice da coluna
     * @returns O valor na posição
     */
    obterPosicao(linha: number, coluna: number): any {
        const nomeColuna = this.nomeColunas[coluna];
        if (!nomeColuna) {
            throw new Error(`Coluna ${coluna} não existe`);
        }
        const serie = this.dados.get(nomeColuna)!;
        return serie.get(linha);
    }

    /**
     * Obtém um valor específico pelo rótulo
     * 
     * @param linhaRotulo Rótulo da linha
     * @param colunaRotulo Rótulo da coluna
     * @returns O valor associado aos rótulos
     */
    obterRotulo(linhaRotulo: any, colunaRotulo: string): any {
        const serie = this.dados.get(colunaRotulo);
        if (!serie) {
            throw new Error(`Coluna '${colunaRotulo}' não encontrada`);
        }
        return serie.obterPorRotulo(linhaRotulo);
    }

    /**
     * Aplica uma função a cada coluna
     * 
     * @param funcao Função a aplicar
     * @returns Novo DadosTabela com resultados
     */
    aplicar(funcao: (serie: Serie) => any): Record<string, any> {
        const resultado: Record<string, any> = {};
        for (const [coluna, serie] of this.dados.entries()) {
            resultado[coluna] = funcao(serie);
        }
        return resultado;
    }

    /**
     * Converte o DataFrame em array de objetos
     */
    paraArrayObjetos(): Record<string, any>[] {
        const resultado: Record<string, any>[] = [];

        for (let i = 0; i < this.indice.tamanho; i++) {
            const objeto: Record<string, any> = {};
            for (const coluna of this.nomeColunas) {
                const serie = this.dados.get(coluna)!;
                objeto[coluna] = serie.get(i);
            }
            resultado.push(objeto);
        }

        return resultado;
    }

    /**
     * Retorna uma representação em string do DataFrame
     */
    paraTexto(): string {
        const cabecalho = this.nomeColunas.join('\t');
        const linhas: string[] = [];

        for (let i = 0; i < Math.min(5, this.indice.tamanho); i++) {
            const valores = this.nomeColunas.map(col => {
                const serie = this.dados.get(col)!;
                return String(serie.get(i));
            });
            linhas.push(valores.join('\t'));
        }

        if (this.indice.tamanho > 5) {
            linhas.push('...');
        }

        return `${cabecalho}\n${linhas.join('\n')}`;
    }
}
