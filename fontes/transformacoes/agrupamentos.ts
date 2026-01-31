/**
 * Módulo de Agrupamento (GroupBy)
 * 
 * Implementa operações de agrupamento e agregação estilo Pandas.
 */

import { RecorteDados } from '../recorte-dados';
import { Serie } from '../serie';
import { Indice } from '../indice';

/**
 * Classe GroupBy para operações de agrupamento e agregação.
 */
export class AgruparPor {
    private recorte: RecorteDados;
    private colunasAgrupamento: string[];
    private grupos: Map<string, number[]> = new Map();

    /**
     * Cria uma instância de AgruparPor.
     * @param recorte - RecorteDados a ser agrupado
     * @param colunas - Coluna ou colunas para agrupamento
     */
    constructor(recorte: RecorteDados, colunas: string | string[]) {
        this.recorte = recorte;
        this.colunasAgrupamento = Array.isArray(colunas) ? colunas : [colunas];
        this.criarGrupos();
    }

    /**
     * Cria mapa de grupos internamente.
     */
    private criarGrupos(): void {
        const numLinhas = this.recorte.forma[0];

        for (let i = 0; i < numLinhas; i++) {
            // Criar chave baseada nos valores das colunas de agrupamento
            const valores: any[] = [];
            for (const coluna of this.colunasAgrupamento) {
                valores.push(this.recorte.obterRotulo(i, coluna));
            }
            const chave = valores.join('__');

            if (!this.grupos.has(chave)) {
                this.grupos.set(chave, []);
            }
            this.grupos.get(chave)!.push(i);
        }
    }

    /**
     * Retorna os nomes dos grupos.
     */
    get nomesGrupos(): string[] {
        return Array.from(this.grupos.keys());
    }

    /**
     * Retorna número de grupos.
     */
    get tamanho(): number {
        return this.grupos.size;
    }

    /**
     * Soma dos valores em cada grupo para coluna especificada.
     */
    soma(coluna: string): RecorteDados {
        return this.agregacao(coluna, 'sum');
    }

    /**
     * Média dos valores em cada grupo para coluna especificada.
     */
    media(coluna: string): RecorteDados {
        return this.agregacao(coluna, 'mean');
    }

    /**
     * Mínimo dos valores em cada grupo para coluna especificada.
     */
    minimo(coluna: string): RecorteDados {
        return this.agregacao(coluna, 'min');
    }

    /**
     * Máximo dos valores em cada grupo para coluna especificada.
     */
    maximo(coluna: string): RecorteDados {
        return this.agregacao(coluna, 'max');
    }

    /**
     * Contagem de valores em cada grupo para coluna especificada.
     */
    contar(coluna: string): RecorteDados {
        return this.agregacao(coluna, 'count');
    }

    /**
     * Desvio padrão dos valores em cada grupo para coluna especificada.
     */
    desvio(coluna: string): RecorteDados {
        return this.agregacao(coluna, 'std');
    }

    /**
     * Variância dos valores em cada grupo para coluna especificada.
     */
    variancia(coluna: string): RecorteDados {
        return this.agregacao(coluna, 'var');
    }

    /**
     * Mediana dos valores em cada grupo para coluna especificada.
     */
    mediana(coluna: string): RecorteDados {
        return this.agregacao(coluna, 'median');
    }

    /**
     * Agregação genérica.
     */
    agregacao(coluna: string, funcao: 'sum' | 'mean' | 'min' | 'max' | 'count' | 'std' | 'var' | 'median'): RecorteDados {
        const resultado: Record<string, any[]> = {};

        // Inicializar colunas de agrupamento
        for (const colAgrup of this.colunasAgrupamento) {
            resultado[colAgrup] = [];
        }
        resultado[coluna] = [];

        // Processar cada grupo
        for (const [chaveGrupo, indices] of this.grupos) {
            // Adicionar valores das colunas de agrupamento
            const valores = chaveGrupo.split('__');
            for (let i = 0; i < this.colunasAgrupamento.length; i++) {
                // Tentar converter para número se possível
                const valor = isNaN(Number(valores[i])) ? valores[i] : Number(valores[i]);
                resultado[this.colunasAgrupamento[i]].push(valor);
            }

            // Extrair valores do grupo para a coluna
            const valoresGrupo = indices
                .map(idx => this.recorte.obterRotulo(idx, coluna))
                .filter(v => v !== null && v !== undefined && !Number.isNaN(v));

            // Calcular agregação
            let valor_agregado: any;

            if (funcao === 'sum') {
                valor_agregado = (valoresGrupo as number[]).reduce((a, b) => a + b, 0);
            } else if (funcao === 'mean') {
                const soma = (valoresGrupo as number[]).reduce((a, b) => a + b, 0);
                valor_agregado = valoresGrupo.length > 0 ? soma / valoresGrupo.length : null;
            } else if (funcao === 'min') {
                valor_agregado = Math.min(...(valoresGrupo as number[]));
            } else if (funcao === 'max') {
                valor_agregado = Math.max(...(valoresGrupo as number[]));
            } else if (funcao === 'count') {
                valor_agregado = valoresGrupo.length;
            } else if (funcao === 'std') {
                valor_agregado = this.calcularDesvio(valoresGrupo as number[]);
            } else if (funcao === 'var') {
                valor_agregado = this.calcularVariancia(valoresGrupo as number[]);
            } else if (funcao === 'median') {
                valor_agregado = this.calcularMediana(valoresGrupo as number[]);
            }

            resultado[coluna].push(valor_agregado);
        }

        return new RecorteDados(resultado);
    }

    /**
     * Agregar múltiplas colunas com funções diferentes.
     */
    agrupar(especificacao: Record<string, string | string[]>): RecorteDados {
        const resultados: Record<string, any> = {};

        // Adicionar colunas de agrupamento
        for (const colAgrup of this.colunasAgrupamento) {
            resultados[colAgrup] = [];
        }

        for (const [chaveGrupo, indices] of this.grupos) {
            // Adicionar valores das colunas de agrupamento
            const valores = chaveGrupo.split('__');
            for (let i = 0; i < this.colunasAgrupamento.length; i++) {
                const valor = isNaN(Number(valores[i])) ? valores[i] : Number(valores[i]);
                resultados[this.colunasAgrupamento[i]].push(valor);
            }

            // Processar cada coluna com suas funções
            for (const [coluna, funcoes] of Object.entries(especificacao)) {
                const funcoesArray = Array.isArray(funcoes) ? funcoes : [funcoes];

                for (const funcao of funcoesArray) {
                    const nomeColuna = funcoesArray.length > 1 
                        ? `${coluna}_${funcao}`
                        : coluna;

                    if (!resultados[nomeColuna]) {
                        resultados[nomeColuna] = [];
                    }

                    const valoresGrupo = indices
                        .map(idx => this.recorte.obterRotulo(idx, coluna))
                        .filter(v => v !== null && v !== undefined && !Number.isNaN(v));

                    let valor_agregado: any;

                    if (funcao === 'sum') {
                        valor_agregado = (valoresGrupo as number[]).reduce((a, b) => a + b, 0);
                    } else if (funcao === 'mean') {
                        const soma = (valoresGrupo as number[]).reduce((a, b) => a + b, 0);
                        valor_agregado = valoresGrupo.length > 0 ? soma / valoresGrupo.length : null;
                    } else if (funcao === 'min') {
                        valor_agregado = Math.min(...(valoresGrupo as number[]));
                    } else if (funcao === 'max') {
                        valor_agregado = Math.max(...(valoresGrupo as number[]));
                    } else if (funcao === 'count') {
                        valor_agregado = valoresGrupo.length;
                    } else if (funcao === 'std') {
                        valor_agregado = this.calcularDesvio(valoresGrupo as number[]);
                    } else if (funcao === 'var') {
                        valor_agregado = this.calcularVariancia(valoresGrupo as number[]);
                    } else if (funcao === 'median') {
                        valor_agregado = this.calcularMediana(valoresGrupo as number[]);
                    }

                    resultados[nomeColuna].push(valor_agregado);
                }
            }
        }

        return new RecorteDados(resultados);
    }

    /**
     * Transformar: aplicar função a cada grupo e retornar com mesmo tamanho original.
     */
    transformar(coluna: string, funcao: (valores: any[]) => number): RecorteDados {
        const resultado = this.recorte.copia();
        const dados = resultado.paraArrayObjetos();

        for (const [chaveGrupo, indices] of this.grupos) {
            const valoresGrupo = indices.map(idx => this.recorte.obterRotulo(idx, coluna));
            const valor_transformado = funcao(valoresGrupo);

            for (const idx of indices) {
                dados[idx][coluna] = valor_transformado;
            }
        }

        return new RecorteDados(dados);
    }

    /**
     * Aplicar função customizada a cada grupo.
     */
    aplicar(coluna: string, funcao: (grupo: RecorteDados) => any): any[] {
        const resultados: any[] = [];

        for (const [_chaveGrupo, indices] of this.grupos) {
            // Extrair dados do grupo
            const dados_grupo: Record<string, any[]> = {};
            const nomeColunas = this.recorte.nomeColunas;

            for (const col of nomeColunas) {
                dados_grupo[col] = indices.map(idx => this.recorte.obterRotulo(idx, col));
            }

            const grupo = new RecorteDados(dados_grupo);
            const resultado = funcao(grupo);
            resultados.push(resultado);
        }

        return resultados;
    }

    /**
     * Filtrar grupos que satisfazem condição.
     */
    filtrar(funcao: (grupo: RecorteDados) => boolean): RecorteDados {
        const grupos_filtrados: Record<string, any[]> = {};
        const nomeColunas = this.recorte.nomeColunas;

        // Inicializar com arrays vazios
        for (const col of nomeColunas) {
            grupos_filtrados[col] = [];
        }

        for (const [_chaveGrupo, indices] of this.grupos) {
            // Extrair dados do grupo
            const dados_grupo: Record<string, any[]> = {};

            for (const col of nomeColunas) {
                dados_grupo[col] = indices.map(idx => this.recorte.obterRotulo(idx, col));
            }

            const grupo = new RecorteDados(dados_grupo);

            // Se grupo passa no filtro, adicionar seus dados
            if (funcao(grupo)) {
                for (const col of nomeColunas) {
                    grupos_filtrados[col].push(...dados_grupo[col]);
                }
            }
        }

        return new RecorteDados(grupos_filtrados);
    }

    /**
     * Calcular desvio padrão.
     */
    private calcularDesvio(valores: number[]): number {
        if (valores.length === 0) return 0;
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const variancia = valores.reduce((a, b) => a + Math.pow(b - media, 2), 0) / valores.length;
        return Math.sqrt(variancia);
    }

    /**
     * Calcular variância.
     */
    private calcularVariancia(valores: number[]): number {
        if (valores.length === 0) return 0;
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        return valores.reduce((a, b) => a + Math.pow(b - media, 2), 0) / valores.length;
    }

    /**
     * Calcular mediana.
     */
    private calcularMediana(valores: number[]): number {
        if (valores.length === 0) return 0;
        const ordenados = [...valores].sort((a, b) => a - b);
        const meio = Math.floor(ordenados.length / 2);
        if (ordenados.length % 2 === 0) {
            return (ordenados[meio - 1] + ordenados[meio]) / 2;
        }
        return ordenados[meio];
    }
}

/**
 * Agrupar RecorteDados por uma ou mais colunas.
 */
export function agruparPor(recorte: RecorteDados, colunas: string | string[]): AgruparPor {
    return new AgruparPor(recorte, colunas);
}
