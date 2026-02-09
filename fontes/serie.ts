import { Indice } from './indice';
import { TipoDado } from './tipos';

/**
 * Vetor unidimensional com rótulos (índice).
 * Similar a pd.Series em Pandas.
 * 
 * @example
 * const s = new Serie([10, 20, 30, 40, 50]);
 * const s = new Serie([1, 2, 3], { indice: ['a', 'b', 'c'], nome: 'valores' });
 */
export class Serie<T = any> {
    dados: T[];
    indice: Indice;
    nome?: string;
    tipoDado?: TipoDado;

    /**
     * Cria uma nova instância de Serie.
     * 
     * @param dados Array de valores para a série
     * @param opcoes Opções para configuração da série
     */
    constructor(dados: T[], opcoes?: {
        indice?: any[];
        nome?: string;
        tipoDado?: TipoDado;
    }) {
        this.dados = Array.isArray(dados) ? [...dados] : [dados];
        this.indice = new Indice(
            opcoes?.indice || this.dados.map((_, i) => i),
            { nome: opcoes?.nome }
        );
        this.nome = opcoes?.nome;
        this.tipoDado = opcoes?.tipoDado || this.inferirTipo();
    }

    /**
     * Infere o tipo de dado da série
     */
    private inferirTipo(): TipoDado {
        if (this.dados.length === 0) return 'desconhecido';
        const primeiro = this.dados[0];
        
        if (typeof primeiro === 'number') return 'numero';
        if (typeof primeiro === 'string') return 'texto';
        if (typeof primeiro === 'boolean') return 'booleano';
        if (primeiro instanceof Date) return 'data';
        if (typeof primeiro === 'object') return 'objeto';
        
        return 'desconhecido';
    }

    /**
     * Retorna a forma da série como tupla [tamanho]
     */
    get forma(): [number] {
        return [this.dados.length];
    }

    /**
     * Retorna o tamanho (número de elementos) da série
     */
    get tamanho(): number {
        return this.dados.length;
    }

    /**
     * Retorna os primeiros n elementos da série
     * 
     * @param n Número de elementos a retornar (padrão: 5)
     * @returns Nova Serie com os primeiros n elementos
     */
    cabeca(n: number = 5): Serie<T> {
        const quantidade = Math.min(n, this.dados.length);
        return new Serie(
            this.dados.slice(0, quantidade),
            {
                indice: this.indice.paraVetor().slice(0, quantidade),
                nome: this.nome,
                tipoDado: this.tipoDado
            }
        );
    }

    /**
     * Retorna os últimos n elementos da série
     * 
     * @param n Número de elementos a retornar (padrão: 5)
     * @returns Nova Serie com os últimos n elementos
     */
    cauda(n: number = 5): Serie<T> {
        const quantidade = Math.min(n, this.dados.length);
        const inicio = this.dados.length - quantidade;
        return new Serie(
            this.dados.slice(inicio),
            {
                indice: this.indice.paraVetor().slice(inicio),
                nome: this.nome,
                tipoDado: this.tipoDado
            }
        );
    }

    /**
     * Retorna valores únicos na série
     */
    unico(): T[] {
        return [...new Set(this.dados)];
    }

    /**
     * Conta a frequência de cada valor na série
     * 
     * @returns Objeto com contagens de valores
     */
    contagemValores(): Record<string, number> {
        const contagem: Record<string, number> = {};
        for (const valor of this.dados) {
            const chave = String(valor);
            contagem[chave] = (contagem[chave] || 0) + 1;
        }
        return contagem;
    }

    /**
     * Verifica se cada elemento é nulo (null ou undefined)
     * 
     * @returns Nova Serie com booleanos indicando valores nulos
     */
    temNulo(): Serie<boolean> {
        return new Serie(
            this.dados.map(v => v === null || v === undefined),
            { indice: this.indice.paraVetor(), nome: `${this.nome}_nulo` }
        );
    }

    /**
     * Verifica se cada elemento NÃO é nulo
     * 
     * @returns Nova Serie com booleanos indicando valores não-nulos
     */
    naoTemNulo(): Serie<boolean> {
        return new Serie(
            this.dados.map(v => v !== null && v !== undefined),
            { indice: this.indice.paraVetor(), nome: `${this.nome}_nao_nulo` }
        );
    }

    /**
     * Remove valores nulos da série
     * 
     * @returns Nova Serie sem valores nulos
     */
    removerNulo(): Serie<T> {
        const dadosLimpos: T[] = [];
        const indicesLimpos: any[] = [];

        this.dados.forEach((valor, i) => {
            if (valor !== null && valor !== undefined) {
                dadosLimpos.push(valor);
                indicesLimpos.push(this.indice.get(i));
            }
        });

        return new Serie(dadosLimpos, {
            indice: indicesLimpos,
            nome: this.nome,
            tipoDado: this.tipoDado
        });
    }

    /**
     * Preenche valores nulos com um valor específico
     * 
     * @param valor Valor para preencher NaN
     * @returns Nova Serie com valores nulos preenchidos
     */
    preencherNulo(valor: T): Serie<T> {
        return new Serie(
            this.dados.map(v => (v === null || v === undefined) ? valor : v),
            {
                indice: this.indice.paraVetor(),
                nome: this.nome,
                tipoDado: this.tipoDado
            }
        );
    }

    /**
     * Ordena a série por valores
     * 
     * @param crescente Se true, ordem crescente; se false, decrescente
     * @returns Nova Serie ordenada
     */
    ordenarValores(crescente: boolean = true): Serie<T> {
        const indicesFinal = Array.from({ length: this.dados.length }, (_, i) => i)
            .sort((a, b) => {
                const comparacao = this.dados[a] < this.dados[b] ? -1 : this.dados[a] > this.dados[b] ? 1 : 0;
                return crescente ? comparacao : -comparacao;
            });

        const dadosOrdenados = indicesFinal.map(i => this.dados[i]);
        const indiceOrdenado = indicesFinal.map(i => this.indice.get(i));

        return new Serie(dadosOrdenados, {
            indice: indiceOrdenado,
            nome: this.nome,
            tipoDado: this.tipoDado
        });
    }

    /**
     * Ordena a série por índice
     * 
     * @param crescente Se true, ordem crescente; se false, decrescente
     * @returns Nova Serie ordenada por índice
     */
    ordenarIndice(crescente: boolean = true): Serie<T> {
        const indicesFinal = Array.from({ length: this.dados.length }, (_, i) => i)
            .sort((a, b) => {
                const valA = this.indice.get(a);
                const valB = this.indice.get(b);
                const comparacao = valA < valB ? -1 : valA > valB ? 1 : 0;
                return crescente ? comparacao : -comparacao;
            });

        const dadosOrdenados = indicesFinal.map(i => this.dados[i]);
        const indiceOrdenado = indicesFinal.map(i => this.indice.get(i));

        return new Serie(dadosOrdenados, {
            indice: indiceOrdenado,
            nome: this.nome,
            tipoDado: this.tipoDado
        });
    }

    /**
     * Obtém um valor pela posição (baseado em 0)
     * 
     * @param posicao Posição do valor
     * @returns O valor na posição
     */
    get(posicao: number): T {
        if (posicao < 0 || posicao >= this.dados.length) {
            throw new Error(`Posição ${posicao} fora dos limites da série (tamanho: ${this.dados.length})`);
        }
        return this.dados[posicao];
    }

    /**
     * Obtém um valor pelo rótulo (índice)
     * 
     * @param rotulo O rótulo a buscar
     * @returns O valor associado ao rótulo
     */
    obterPorRotulo(rotulo: any): T | undefined {
        const posicao = this.indice.obter(rotulo);
        if (posicao === -1) return undefined;
        return this.dados[posicao];
    }

    /**
     * Aplica uma função a cada elemento da série
     * 
     * @param funcao Função a aplicar
     * @returns Nova Serie com resultados
     */
    aplicar<U>(funcao: (valor: T, indice?: any) => U): Serie<U> {
        return new Serie(
            this.dados.map((v, i) => funcao(v, this.indice.get(i))),
            { indice: this.indice.paraVetor(), nome: this.nome }
        );
    }

    /**
     * Filtra a série baseado em uma condição booleana
     * 
     * @param mascara Array de booleanos indicando quais elementos manter
     * @returns Nova Serie filtrada
     */
    filtrar(mascara: boolean[] | Serie<boolean>): Serie<T> {
        const booleanos = mascara instanceof Serie ? mascara.dados : mascara;
        
        if (booleanos.length !== this.dados.length) {
            throw new Error('A máscara deve ter o mesmo tamanho da série');
        }

        const dadosFiltrados: T[] = [];
        const indicesFiltrados: any[] = [];

        this.dados.forEach((valor, i) => {
            if (booleanos[i]) {
                dadosFiltrados.push(valor);
                indicesFiltrados.push(this.indice.get(i));
            }
        });

        return new Serie(dadosFiltrados, {
            indice: indicesFiltrados,
            nome: this.nome,
            tipoDado: this.tipoDado
        });
    }

    /**
     * Retorna uma cópia da série
     */
    copia(): Serie<T> {
        return new Serie(this.dados, {
            indice: this.indice.paraVetor(),
            nome: this.nome,
            tipoDado: this.tipoDado
        });
    }

    /**
     * Converte a série em vetor
     */
    paraVetor(): T[] {
        return [...this.dados];
    }

    /**
     * Retorna uma representação em string da série
     */
    paraTexto(): string {
        const primeiros = this.dados.slice(0, 5);
        const linhas = primeiros.map((v, i) => `${this.indice.get(i)}\t${v}`);
        
        if (this.dados.length > 5) {
            linhas.push(`...\t...`);
            for (let i = this.dados.length - 2; i < this.dados.length; i++) {
                linhas.push(`${this.indice.get(i)}\t${this.dados[i]}`);
            }
        }

        return `${this.nome || 'Serie'}\n${linhas.join('\n')}\nNome: ${this.nome || 'None'}, dtype: ${this.tipoDado}`;
    }
}
