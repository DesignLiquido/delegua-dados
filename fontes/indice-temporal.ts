/**
 * Módulo de Data/Hora para séries temporais
 * 
 * Fornece classes e funções para trabalhar com datas e horários,
 * incluindo compreensão, formatação e suporte básico a fusos horários.
 * 
 * @module datetime
 */

/**
 * Classe IndiceTemporal
 * 
 * Representa um índice de datas/horários para séries temporais.
 * Suporta parsing, formatação, aritmética e manipulação de fusos horários.
 * 
 * @class IndiceTemporal
 * @example
 * const dti = new IndiceTemporal(['2024-01-01', '2024-01-02', '2024-01-03']);
 * dti.ano // [2024, 2024, 2024]
 * dti.mes // [1, 1, 1]
 */
export class IndiceTemporal {
    private datas: Date[];
    private timezoneOffset: number; // em minutos
    private formato: string;

    /**
     * Cria um novo IndiceTemporal
     * 
     * @param dados - Vetor de datas (Date, string ISO, ou timestamp number)
     * @param opcoes - Opções de configuração
     * @param opcoes.timezone - Desrotamento do fuso horário em horas (padrão: rotal)
     * @param opcoes.formato - Formato para toString() (padrão: 'YYYY-MM-DD')
     */
    constructor(
        dados: Array<Date | string | number>,
        opcoes?: {
            timezone?: number; // em horas
            formato?: string;
        }
    ) {
        this.timezoneOffset = (opcoes?.timezone ?? 0) * 60; // converter horas para minutos
        this.formato = opcoes?.formato ?? 'YYYY-MM-DD';
        this.datas = this.compreenderDatas(dados);
    }

    /**
     * Parseia array de datas em formato variado para Array<Date>
     */
    private compreenderDatas(dados: Array<Date | string | number>): Date[] {
        return dados.map(d => {
            if (d instanceof Date) {
                return new Date(d);
            } 
            
            if (typeof d === 'string') {
                return this.compreenderString(d);
            } 
            
            if (typeof d === 'number') {
                return new Date(d);
            }

            throw new Error(`Não é possível parsear: ${d}`);
        });
    }

    /**
     * Compreende string ISO 8601 para Date
     * Suporta: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, YYYY-MM-DD HH:mm:ss
     */
    private compreenderString(str: string): Date {
        // Normalizar separadores
        const normalizado = str.replace(' ', 'T');
        const data = new Date(normalizado);
        
        if (isNaN(data.getTime())) {
            throw new Error(`Formato de data inválido: ${str}`);
        }
        
        return data;
    }

    /**
     * Formata uma data usando o formato especificado
     */
    private formatarData(data: Date, formato: string): string {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        const segundo = String(data.getSeconds()).padStart(2, '0');

        let resultado = formato;
        resultado = resultado.replace('YYYY', String(ano));
        resultado = resultado.replace('MM', mes);
        resultado = resultado.replace('DD', dia);
        resultado = resultado.replace('HH', hora);
        resultado = resultado.replace('mm', minuto);
        resultado = resultado.replace('ss', segundo);

        return resultado;
    }

    /**
     * Retorna array de anos
     */
    get ano(): number[] {
        return this.datas.map(d => d.getFullYear());
    }

    /**
     * Retorna array de meses (1-12)
     */
    get mes(): number[] {
        return this.datas.map(d => d.getMonth() + 1);
    }

    /**
     * Retorna array de dias do mês
     */
    get dia(): number[] {
        return this.datas.map(d => d.getDate());
    }

    /**
     * Retorna array de dias da semana (0=domingo, 6=sábado)
     */
    get diasemana(): number[] {
        return this.datas.map(d => d.getDay());
    }

    /**
     * Retorna array de horas
     */
    get hora(): number[] {
        return this.datas.map(d => d.getHours());
    }

    /**
     * Retorna array de minutos
     */
    get minuto(): number[] {
        return this.datas.map(d => d.getMinutes());
    }

    /**
     * Retorna array de segundos
     */
    get segundo(): number[] {
        return this.datas.map(d => d.getSeconds());
    }

    /**
     * Retorna array de timestamps (ms desde epoch)
     */
    get timestamp(): number[] {
        return this.datas.map(d => d.getTime());
    }

    /**
     * Retorna array de datas formatadas como strings
     */
    get formato_str(): string[] {
        return this.datas.map(d => this.formatarData(d, this.formato));
    }

    /**
     * Retorna número de elementos
     */
    get comprimento(): number {
        return this.datas.length;
    }

    /**
     * Retorna as datas brutas
     */
    get dados(): Date[] {
        return [...this.datas];
    }

    /**
     * Retorna elemento em posição específica
     */
    obter(indice: number): Date {
        if (indice < 0 || indice >= this.datas.length) {
            throw new Error(`Índice fora do alcance: ${indice}`);
        }
        return this.datas[indice];
    }

    /**
     * Filtra datas por critério
     * 
     * @param predicado - Função que retorna true para datas a manter
     * @returns Novo IndiceTemporal filtrado
     */
    filtrar(predicado: (data: Date, indice: number) => boolean): IndiceTemporal {
        const filtradas = this.datas.filter(predicado);
        return new IndiceTemporal(filtradas, {
            timezone: this.timezoneOffset / 60,
            formato: this.formato
        });
    }

    /**
     * Mapeia função sobre as datas
     */
    mapear<T>(funcao: (data: Date, indice: number) => T): T[] {
        return this.datas.map(funcao);
    }

    /**
     * Encontra dados entre duas datas (inclusivo)
     */
    entre(dataInicio: Date | string, dataFim: Date | string): IndiceTemporal {
        const inicio = typeof dataInicio === 'string' 
            ? this.compreenderString(dataInicio) 
            : dataInicio;
        const fim = typeof dataFim === 'string' 
            ? this.compreenderString(dataFim) 
            : dataFim;

        const filtradas = this.datas.filter(d => 
            d.getTime() >= inicio.getTime() && d.getTime() <= fim.getTime()
        );

        return new IndiceTemporal(filtradas, {
            timezone: this.timezoneOffset / 60,
            formato: this.formato
        });
    }

    /**
     * Encontra a data mínima
     */
    minima(): Date {
        if (this.datas.length === 0) {
            throw new Error('IndiceTemporal vazio');
        }
        return new Date(Math.min(...this.datas.map(d => d.getTime())));
    }

    /**
     * Encontra a data máxima
     */
    maxima(): Date {
        if (this.datas.length === 0) {
            throw new Error('IndiceTemporal vazio');
        }
        return new Date(Math.max(...this.datas.map(d => d.getTime())));
    }

    /**
     * Verifica se datas estão em ordem crescente
     */
    estaOrdenado(): boolean {
        for (let i = 1; i < this.datas.length; i++) {
            if (this.datas[i].getTime() < this.datas[i - 1].getTime()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Retorna cópia ordenada
     */
    ordenar(): IndiceTemporal {
        const cópia = [...this.datas].sort((a, b) => 
            a.getTime() - b.getTime()
        );
        return new IndiceTemporal(cópia, {
            timezone: this.timezoneOffset / 60,
            formato: this.formato
        });
    }

    /**
     * Calcula diferença entre datas consecutivas em milissegundos
     */
    diferencas(): number[] {
        const resultado: number[] = [];
        for (let i = 1; i < this.datas.length; i++) {
            resultado.push(
                this.datas[i].getTime() - this.datas[i - 1].getTime()
            );
        }
        return resultado;
    }

    /**
     * Calcula diferença entre datas consecutivas em dias
     */
    diferencaDias(): number[] {
        const ms = this.diferencas();
        const MS_POR_DIA = 24 * 60 * 60 * 1000;
        return ms.map(m => m / MS_POR_DIA);
    }

    /**
     * Retorna representação em string
     */
    toString(): string {
        const primeira = this.datas[0]?.toISOString() ?? 'vazio';
        const ultima = this.datas[this.datas.length - 1]?.toISOString() ?? '';
        return `IndiceTemporal(${this.datas.length} elementos, ${primeira} até ${ultima})`;
    }

    /**
     * Retorna representação para debugging
     */
    inspecionar(): string[] {
        return this.datas.map(d => this.formatarData(d, this.formato));
    }
}

/**
 * Cria IndiceTemporal a partir de range de datas
 * 
 * @param dataInicio - Data de início (string ISO ou Date)
 * @param dataFim - Data de fim (string ISO ou Date)
 * @param frequencia - Frequência: 'D' (dia), 'H' (hora), 'S' (semana), 'M' (mês), 'Y' (ano)
 * @returns IndiceTemporal com datas no range e frequência
 * 
 * @example
 * const dti = criarRangeDatas('2024-01-01', '2024-01-10', 'D');
 * // Cria datas de 1 a 10 de janeiro, 1 dia entre cada
 */
export function criarIntervaloDatas(
    dataInicio: Date | string,
    dataFim: Date | string,
    frequencia: 'D' | 'H' | 'S' | 'M' | 'Y' = 'D'
): IndiceTemporal {
    const inicio = typeof dataInicio === 'string'
        ? new IndiceTemporal([dataInicio]).obter(0)
        : dataInicio;
    
    const fim = typeof dataFim === 'string'
        ? new IndiceTemporal([dataFim]).obter(0)
        : dataFim;

    const datas: Date[] = [];
    let atual = new Date(inicio);

    while (atual.getTime() <= fim.getTime()) {
        datas.push(new Date(atual));

        switch (frequencia) {
            case 'D':
                atual.setDate(atual.getDate() + 1);
                break;
            case 'H':
                atual.setHours(atual.getHours() + 1);
                break;
            case 'S':
                atual.setDate(atual.getDate() + 7);
                break;
            case 'M':
                atual.setMonth(atual.getMonth() + 1);
                break;
            case 'Y':
                atual.setFullYear(atual.getFullYear() + 1);
                break;
        }
    }

    return new IndiceTemporal(datas);
}

/**
 * Parseia string de data em formato ISO 8601
 * 
 * @param texto - String ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
 * @returns Date
 */
export function compreenderData(texto: string): Date {
    const normalizado = texto.replace(' ', 'T');
    const data = new Date(normalizado);
    
    if (isNaN(data.getTime())) {
        throw new Error(`Formato de data inválido: ${texto}`);
    }
    
    return data;
}

/**
 * Formata data para string
 * 
 * @param data - Data a formatar
 * @param formato - Formato desejado (padrão: 'YYYY-MM-DD')
 *                 Suporta: YYYY, MM, DD, HH, mm, ss
 * @returns String formatada
 * 
 * @example
 * formatarData(new Date('2024-01-15'), 'DD/MM/YYYY') // '15/01/2024'
 */
export function formatarData(data: Date, formato: string = 'YYYY-MM-DD'): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    const segundo = String(data.getSeconds()).padStart(2, '0');

    let resultado = formato;
    resultado = resultado.replace('YYYY', String(ano));
    resultado = resultado.replace('MM', mes);
    resultado = resultado.replace('DD', dia);
    resultado = resultado.replace('HH', hora);
    resultado = resultado.replace('mm', minuto);
    resultado = resultado.replace('ss', segundo);

    return resultado;
}

/**
 * Calcula diferença entre duas datas em dias
 */
export function diferencaDias(data1: Date, data2: Date): number {
    const MS_POR_DIA = 24 * 60 * 60 * 1000;
    return (data2.getTime() - data1.getTime()) / MS_POR_DIA;
}

/**
 * Calcula diferença entre duas datas em horas
 */
export function diferencaHoras(data1: Date, data2: Date): number {
    const MS_POR_HORA = 60 * 60 * 1000;
    return (data2.getTime() - data1.getTime()) / MS_POR_HORA;
}
