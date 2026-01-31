/**
 * Módulo de Reamostragem para séries temporais
 * 
 * Fornece funcionalidades de upsampling (enriquecimento) e downsampling (degradação)
 * para diferentes frequências temporais.
 * 
 * @module reamostrador
 */

import { IndiceTemporal } from './indice-temporal';
import { RecorteDados } from './recorte-dados';

/**
 * Tipo de frequência suportada
 */
export type Frequencia = 'D' | 'H' | 'M' | 'Y' | 'S';

/**
 * Função de agregação para degradação (downsampling)
 */
export type FuncaoAgregacao = 'media' | 'soma' | 'minimo' | 'maximo' | 'contar' | 'primeiro' | 'ultimo';

/**
 * Classe Reamostrador
 * 
 * Responsável por fazer reamostragem (enriquecimento e degradação) de séries temporais.
 * Trabalha em conjunto com um RecorteDados que possui um IndiceTemporal.
 */
export class Reamostrador {
    private dados: RecorteDados;
    private indiceTemporal: IndiceTemporal;
    private frequencia: Frequencia;

    /**
     * Cria um novo Reamostrador
     * 
     * @param dados - RecorteDados com índice de datas
     * @param indiceTemporal - IndiceTemporal para reamostragem
     * @param frequencia - Frequência alvo ('D', 'H', 'M', 'Y', 'S')
     */
    constructor(
        dados: RecorteDados,
        indiceTemporal: IndiceTemporal,
        frequencia: Frequencia
    ) {
        if (indiceTemporal.comprimento !== dados.forma[0]) {
            throw new Error(
                `IndiceTemporal (${indiceTemporal.comprimento}) e RecorteDados (${dados.forma[0]}) têm comprimentos diferentes`
            );
        }

        this.dados = dados;
        this.indiceTemporal = indiceTemporal;
        this.frequencia = frequencia;
    }

    /**
     * Faz downsampling aplicando uma função de agregação
     * 
     * @param agregacao - Função de agregação ('media', 'soma', etc)
     * @param colunasNumero - Colunas a agregar (padrão: todas numéricas)
     * @returns Novo RecorteDados com frequência reduzida
     * 
     * @example
     * const resampler = new Reamostrador(rd, indice_data, 'M');
     * const mensal = resampler.degradar('media');
     */
    degradar(
        agregacao: FuncaoAgregacao,
        colunasNumero?: string[]
    ): { indice: IndiceTemporal; dados: RecorteDados } {
        const grupos = this.agruparPorFrequencia();
        
        // Identificar colunas numéricas se não especificadas
        if (!colunasNumero) {
            colunasNumero = this.identificarColunasNumericas();
        }

        const novasLinhas: Record<string, any[]> = {};
        const novoIndice: Date[] = [];

        // Inicializar arrays para cada coluna
        for (const coluna of this.dados.nomeColunas) {
            novasLinhas[coluna] = [];
        }

        for (const [dataGrupo, indices] of grupos) {
            novoIndice.push(new Date(dataGrupo));

            // Para cada coluna, aplicar agregação
            for (const coluna of this.dados.nomeColunas) {
                if (colunasNumero.includes(coluna)) {
                    const valores = indices
                        .map(i => this.dados.obterRotulo(i, coluna))
                        .filter(v => v !== null && v !== undefined && !isNaN(v));

                    const valor = this.aplicarAgregacao(agregacao, valores);
                    novasLinhas[coluna].push(valor);
                } else {
                    // Para colunas não-numéricas, pegar o primeiro valor
                    const valor = this.dados.obterRotulo(indices[0], coluna);
                    novasLinhas[coluna].push(valor);
                }
            }
        }

        const novosDados = new RecorteDados(novasLinhas);
        const novaIndice = new IndiceTemporal(novoIndice);

        return {
            indice: novaIndice,
            dados: novosDados
        };
    }

    /**
     * Faz enriquecimento (upsampling, aumenta frequência), preenchendo valores com NaN
     * 
     * @param metodoPreenchimento - 'ffill' (forward fill), 'bfill' (backward fill), 'interpolacao'
     * @returns Novo RecorteDados com frequência aumentada
     * 
     * @example
     * const resampler = new Reamostrador(rd, indice_data, 'H');
     * const horario = resampler.enriquecer('ffill');
     */
    enriquecer(
        metodoPreenchimento: 'ffill' | 'bfill' | 'interpolacao' = 'ffill'
    ): { indice: IndiceTemporal; dados: RecorteDados } {
        const novaIndice = this.criarIndiceEnriquecimento();
        const novasLinhas: Record<string, any[]> = {};

        // Inicializar arrays
        for (const coluna of this.dados.nomeColunas) {
            novasLinhas[coluna] = [];
        }

        const datasOriginais = this.indiceTemporal.dados;
        let indiceDadosAtual = 0;

        for (const novaData of novaIndice.dados) {
            for (const coluna of this.dados.nomeColunas) {
                let valor = null;

                // Encontrar o índice correspondente
                if (indiceDadosAtual < datasOriginais.length &&
                    datasOriginais[indiceDadosAtual].getTime() === novaData.getTime()) {
                    valor = this.dados.obterRotulo(indiceDadosAtual, coluna);
                    indiceDadosAtual++;
                } else {
                    // Usar método de preenchimento
                    if (metodoPreenchimento === 'ffill') {
                        valor = indiceDadosAtual > 0
                            ? this.dados.obterRotulo(indiceDadosAtual - 1, coluna)
                            : null;
                    } else if (metodoPreenchimento === 'bfill') {
                        valor = indiceDadosAtual < datasOriginais.length
                            ? this.dados.obterRotulo(indiceDadosAtual, coluna)
                            : null;
                    } else if (metodoPreenchimento === 'interpolacao') {
                        valor = null; // Será interpolado
                    }
                }

                novasLinhas[coluna].push(valor);
            }
        }

        // Fazer interpolação se solicitado
        if (metodoPreenchimento === 'interpolacao') {
            this.interpolarColunas(novasLinhas);
        }

        const novosDados = new RecorteDados(novasLinhas);
        return {
            indice: novaIndice,
            dados: novosDados
        };
    }

    /**
     * Agrupa índices por período da frequência
     */
    private agruparPorFrequencia(): Map<number, number[]> {
        const grupos = new Map<number, number[]>();
        const datas = this.indiceTemporal.dados;

        for (let i = 0; i < datas.length; i++) {
            const chave = this.obterChaveFrequencia(datas[i]);
            if (!grupos.has(chave)) {
                grupos.set(chave, []);
            }
            grupos.get(chave)!.push(i);
        }

        return grupos;
    }

    /**
     * Obtém a chave de agrupamento baseada na frequência
     */
    private obterChaveFrequencia(data: Date): number {
        switch (this.frequencia) {
            case 'D':
                return Math.floor(data.getTime() / (24 * 60 * 60 * 1000));
            case 'H':
                return Math.floor(data.getTime() / (60 * 60 * 1000));
            case 'M': {
                return data.getFullYear() * 100 + (data.getMonth() + 1);
            }
            case 'Y':
                return data.getFullYear();
            case 'S': {
                const semana = this.obterNumeroSemana(data);
                return data.getFullYear() * 100 + semana;
            }
            default:
                throw new Error(`Frequência desconhecida: ${this.frequencia}`);
        }
    }

    /**
     * Calcula número da semana (ISO 8601)
     */
    private obterNumeroSemana(data: Date): number {
        const primeiroDia = new Date(data.getFullYear(), 0, 1);
        const diasPassados = (data.getTime() - primeiroDia.getTime()) / (24 * 60 * 60 * 1000);
        return Math.ceil((diasPassados + primeiroDia.getDay() + 1) / 7);
    }

    /**
     * Identifica colunas com valores numéricos
     */
    private identificarColunasNumericas(): string[] {
        const colunas: string[] = [];

        for (const coluna of this.dados.nomeColunas) {
            const serie = this.dados.selecionarColuna(coluna);
            const temNumero = serie.dados.some(v => typeof v === 'number');
            if (temNumero) {
                colunas.push(coluna);
            }
        }

        return colunas;
    }

    /**
     * Aplica função de agregação a um vetor de valores
     */
    private aplicarAgregacao(agregacao: FuncaoAgregacao, valores: any[]): any {
        if (valores.length === 0) {
            return null;
        }

        switch (agregacao) {
            case 'media':
                return valores.reduce((a, b) => a + b, 0) / valores.length;
            case 'soma':
                return valores.reduce((a, b) => a + b, 0);
            case 'minimo':
                return Math.min(...valores);
            case 'maximo':
                return Math.max(...valores);
            case 'contar':
                return valores.length;
            case 'primeiro':
                return valores[0];
            case 'ultimo':
                return valores[valores.length - 1];
            default:
                throw new Error(`Agregação desconhecida: ${agregacao}`);
        }
    }

    /**
     * Cria índice de datas aumentado para upsampling
     */
    private criarIndiceEnriquecimento(): IndiceTemporal {
        const datas = this.indiceTemporal.dados;
        if (datas.length < 2) {
            return this.indiceTemporal;
        }

        const novasDatas: Date[] = [];
        const incrementoMs = this.calcularIncremento();

        let atual = new Date(datas[0]);
        const fim = new Date(datas[datas.length - 1]);

        while (atual.getTime() <= fim.getTime()) {
            novasDatas.push(new Date(atual));
            atual.setTime(atual.getTime() + incrementoMs);
        }

        return new IndiceTemporal(novasDatas);
    }

    /**
     * Calcula incremento em milissegundos baseado na frequência
     */
    private calcularIncremento(): number {
        switch (this.frequencia) {
            case 'D': return 24 * 60 * 60 * 1000;
            case 'H': return 60 * 60 * 1000;
            case 'M': return 30 * 24 * 60 * 60 * 1000; // aproximado
            case 'Y': return 365 * 24 * 60 * 60 * 1000; // aproximado
            case 'S': return 7 * 24 * 60 * 60 * 1000;
            default: return 24 * 60 * 60 * 1000;
        }
    }

    /**
     * Interpola valores nulos em colunas numéricas
     */
    private interpolarColunas(linhas: Record<string, any[]>): void {
        const colunas = this.identificarColunasNumericas();

        for (const coluna of colunas) {
            const valores = linhas[coluna];

            // Interpolação linear simples
            for (let i = 0; i < valores.length; i++) {
                if (valores[i] === null || valores[i] === undefined) {
                    // Encontrar próximo e anterior valores válidos
                    let anterior = null;
                    let proxima = null;
                    let distAnt = 0;
                    let distProx = 0;

                    for (let j = i - 1; j >= 0; j--) {
                        if (valores[j] !== null && valores[j] !== undefined) {
                            anterior = valores[j];
                            distAnt = i - j;
                            break;
                        }
                    }

                    for (let j = i + 1; j < valores.length; j++) {
                        if (valores[j] !== null && valores[j] !== undefined) {
                            proxima = valores[j];
                            distProx = j - i;
                            break;
                        }
                    }

                    // Interpolar
                    if (anterior !== null && proxima !== null) {
                        const peso = distAnt / (distAnt + distProx);
                        valores[i] = anterior * (1 - peso) + proxima * peso;
                    } else if (anterior !== null) {
                        valores[i] = anterior;
                    } else if (proxima !== null) {
                        valores[i] = proxima;
                    }
                }
            }
        }
    }
}

/**
 * Função auxiliar para fazer reamostragem
 * 
 * @param dados - RecorteDados com índice de datas
 * @param indiceDatatime - IndiceTemporal
 * @param frequencia - Frequência alvo
 * @param operacao - 'degradar' para downsampling ou 'enriquecer' para upsampling
 * @param agregacao - Função de agregação (para downsampling)
 * @returns { indice, dados }
 */
export function reamostrar(
    dados: RecorteDados,
    indiceDatatime: IndiceTemporal,
    frequencia: Frequencia,
    operacao: 'degradar' | 'enriquecer' = 'degradar',
    agregacao: FuncaoAgregacao = 'media'
): { indice: IndiceTemporal; dados: RecorteDados } {
    const reamostrador = new Reamostrador(dados, indiceDatatime, frequencia);

    if (operacao === 'degradar') {
        return reamostrador.degradar(agregacao);
    } 
        
    return reamostrador.enriquecer('ffill');
}
