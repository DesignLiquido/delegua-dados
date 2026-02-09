import { TipoDado } from './tipos';

/**
 * Representa os rótulos (_labels_) para dados em Series ou Recortes de Dados.
 * Similar a pd.Index em Pandas.
 * 
 * @example
 * const indice = new Indice([0, 1, 2, 3, 4]);
 * const indice = new Indice(['a', 'b', 'c'], { nome: 'letras' });
 */
export class Indice {
    private valores: any[];
    nome?: string;
    tipoDado?: TipoDado;

    /**
     * Cria uma nova instância de Índice.
     * 
     * @param dados Array de valores para o índice
     * @param opcoes Opções para configuração do índice
     */
    constructor(dados: any[], opcoes?: { nome?: string; tipoDado?: TipoDado }) {
        this.valores = Array.isArray(dados) ? [...dados] : [dados];
        this.nome = opcoes?.nome;
        this.tipoDado = opcoes?.tipoDado || this.inferirTipo();
    }

    /**
     * Infere o tipo de dado do índice
     */
    private inferirTipo(): TipoDado {
        if (this.valores.length === 0) return 'desconhecido';
        const primeiro = this.valores[0];
        
        if (typeof primeiro === 'number') return 'numero';
        if (typeof primeiro === 'string') return 'texto';
        if (typeof primeiro === 'boolean') return 'booleano';
        if (primeiro instanceof Date) return 'data';
        
        return 'desconhecido';
    }

    /**
     * Retorna o tamanho do índice
     */
    get tamanho(): number {
        return this.valores.length;
    }

    /**
     * Retorna a forma do índice como tupla [tamanho]
     */
    get forma(): [number] {
        return [this.valores.length];
    }

    /**
     * Retorna uma cópia dos valores
     */
    get dados(): any[] {
        return [...this.valores];
    }

    /**
     * Obtém a posição de um rótulo no índice
     * 
     * @param rotulo O rótulo a procurar
     * @returns A posição do rótulo, ou -1 se não encontrado
     */
    obter(rotulo: any): number {
        return this.valores.indexOf(rotulo);
    }

    /**
     * Verifica se um rótulo existe no índice
     * 
     * @param rotulo O rótulo a verificar
     * @returns true se o rótulo existe, false caso contrário
     */
    contem(rotulo: any): boolean {
        return this.valores.includes(rotulo);
    }

    /**
     * Retorna os valores únicos do índice
     */
    unico(): any[] {
        return [...new Set(this.valores)];
    }

    /**
     * Detecta valores duplicados no índice
     * 
     * @returns Array de booleanos indicando duplicatas
     */
    duplicadas(): boolean[] {
        return this.valores.map((valor, indice) => 
            this.valores.indexOf(valor) !== indice
        );
    }

    /**
     * Retorna o índice em formato de array
     */
    paraVetor(): any[] {
        return [...this.valores];
    }

    /**
     * Retorna uma representação em string do índice
     */
    paraTexto(): string {
        return `Indice(${this.tamanho} elementos${this.nome ? `, nome='${this.nome}'` : ''})`;
    }

    /**
     * Cria uma cópia do índice
     */
    copia(): Indice {
        return new Indice(this.valores, { 
            nome: this.nome, 
            tipoDado: this.tipoDado 
        });
    }

    /**
     * Obtém um valor específico pelo índice
     */
    get(posicao: number): any {
        if (posicao < 0 || posicao >= this.valores.length) {
            throw new Error(`Posição ${posicao} fora dos limites do índice (tamanho: ${this.valores.length})`);
        }
        return this.valores[posicao];
    }
}
