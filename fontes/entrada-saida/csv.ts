import {
    textoParaObjetoCsv,
    objetoCsvParaTexto,
    OpcoesCsvInterface
} from '@designliquido/delegua-csv/fontes';
import { RecorteDados } from '../recorte-dados';

/**
 * Opções para operações de CSV
 */
export interface OpcoesCSV {
    delimitador?: string;
    temCabecalho?: boolean;
    temInicio?: number;
    colunas?: string[];
    indice?: boolean;
}

function mapearOpcoesCSV(opcoes?: OpcoesCSV, temCabecalho?: boolean): OpcoesCsvInterface {
    return {
        delimitador: opcoes?.delimitador,
        cabecalho: temCabecalho ?? false,
        ignorarLinhasVazias: true
    };
}

function normalizarTextoCSV(conteudoCSV: string, temInicio = 0): string {
    if (!conteudoCSV) {
        return '';
    }

    if (!temInicio || temInicio <= 0) {
        return conteudoCSV;
    }

    const linhas = conteudoCSV.split(/\r?\n/);
    return linhas.slice(temInicio).join('\n');
}

/**
 * Interface para abstração de sistema de arquivos.
 * Permite injetar diferentes implementações (Node.js fs, browser APIs, etc.)
 */
export interface SistemaArquivosAbstrato {
    lerArquivo(caminho: string): Promise<string>;
    escreverArquivo(caminho: string, conteudo: string): Promise<void>;
    existeArquivo(caminho: string): Promise<boolean>;
}

/**
 * Variante síncrona de `SistemaArquivosAbstrato`, usada internamente por `lerCSV`/`escreverCSV`
 * para manter a assinatura síncrona já publicada dessas duas funções. Implementações assíncronas
 * (fetch, localStorage, IndexedDB etc.) devem usar `SistemaArquivosAbstrato` com
 * `lerCSVComSistema`/`escreverCSVComSistema` em vez desta.
 */
interface SistemaArquivosSincronoAbstrato {
    lerArquivoTexto(caminho: string): string;
    escreverArquivoTexto(caminho: string, conteudo: string): void;
    existeArquivo(caminho: string): boolean;
}

let sistemaArquivosSincronoNodeJS: SistemaArquivosSincronoAbstrato | null = null;

function obterSistemaArquivosSincronoNodeJS(): SistemaArquivosSincronoAbstrato {
    if (sistemaArquivosSincronoNodeJS) {
        return sistemaArquivosSincronoNodeJS;
    }

    const fs = require('fs');
    const path = require('path');

    sistemaArquivosSincronoNodeJS = {
        lerArquivoTexto(caminho: string): string {
            return fs.readFileSync(caminho, 'utf-8');
        },
        escreverArquivoTexto(caminho: string, conteudo: string): void {
            const diretorio = path.dirname(caminho);
            if (!fs.existsSync(diretorio)) {
                fs.mkdirSync(diretorio, { recursive: true });
            }
            fs.writeFileSync(caminho, conteudo, 'utf-8');
        },
        existeArquivo(caminho: string): boolean {
            return fs.existsSync(caminho);
        }
    };

    return sistemaArquivosSincronoNodeJS;
}

// Implementação padrão (Node.js) - carregada dinamicamente apenas se disponível
let sistemaArquivosNodeJS: SistemaArquivosAbstrato | null = null;

function obterSistemaArquivosNodeJS(): SistemaArquivosAbstrato {
    if (sistemaArquivosNodeJS) {
        return sistemaArquivosNodeJS;
    }

    try {
        // Importar fs apenas se em ambiente Node.js
        const fs = require('fs');
        const path = require('path');

        sistemaArquivosNodeJS = {
            async lerArquivo(caminho: string): Promise<string> {
                return fs.readFileSync(caminho, 'utf-8');
            },
            async escreverArquivo(caminho: string, conteudo: string): Promise<void> {
                const diretorio = path.dirname(caminho);
                if (!fs.existsSync(diretorio)) {
                    fs.mkdirSync(diretorio, { recursive: true });
                }
                fs.writeFileSync(caminho, conteudo, 'utf-8');
            },
            async existeArquivo(caminho: string): Promise<boolean> {
                return fs.existsSync(caminho);
            }
        };

        return sistemaArquivosNodeJS;
    } catch (erro) {
        throw new Error(
            'Sistema de arquivos Node.js não disponível. ' +
            'Use as funções analisarCSV/paraCSV para trabalhar com strings, ' +
            'ou configure um sistema de arquivos customizado com lerCSVComSistema.'
        );
    }
}

/**
 * Analisa conteúdo CSV (string) e retorna um RecorteDados.
 * Esta função é AGNÓSTICA À PLATAFORMA - funciona em Node.js e navegador.
 * 
 * @param conteudoCSV String contendo os dados CSV
 * @param opcoes Opções para leitura
 * @returns RecorteDados com os dados
 * 
 * @example
 * const csv = "nome,idade\nAlice,25\nBob,30";
 * const rd = analisarCSV(csv);
 */
export function analisarCSV(conteudoCSV: string, opcoes?: OpcoesCSV): RecorteDados {
    const opcoesPadrao: OpcoesCSV = {
        delimitador: ',',
        temCabecalho: true,
        temInicio: 0,
        ...opcoes
    };

    const textoNormalizado = normalizarTextoCSV(conteudoCSV, opcoesPadrao.temInicio);
    const linhas = textoParaObjetoCsv({}, textoNormalizado, mapearOpcoesCSV(opcoesPadrao, false));

    if (!Array.isArray(linhas) || linhas.length === 0) {
        return new RecorteDados({});
    }

    // Extrair cabeçalho
    let nomeColunas: string[];
    let dadosLinhas: string[][];

    if (opcoesPadrao.temCabecalho && linhas.length > 0) {
        nomeColunas = (Array.isArray(linhas[0]) ? linhas[0] : [linhas[0]]).map((c: any) => c.trim());
        dadosLinhas = linhas.slice(1).map((linha) => (Array.isArray(linha) ? linha : [linha]).map((v: any) => v.trim()));
    } else {
        // Se não houver cabeçalho, criar automaticamente
        const primeiraLinha = (linhas[0] ?? []) as string[];
        nomeColunas = primeiraLinha.map((_: string, i: number) => `coluna_${i}`);
        dadosLinhas = linhas.map((linha) => (Array.isArray(linha) ? linha : [linha]).map((v: any) => v.trim()));
    }

    // Filtrar colunas se especificado
    if (opcoesPadrao.colunas) {
        const indicesPermitidos = opcoesPadrao.colunas.map(c => nomeColunas.indexOf(c));
        if (indicesPermitidos.includes(-1)) {
            throw new Error(`Uma ou mais colunas especificadas não foram encontradas`);
        }
        nomeColunas = nomeColunas.filter((_, i) => indicesPermitidos.includes(i));
        dadosLinhas = dadosLinhas.map(linha =>
            indicesPermitidos.map(i => linha[i])
        );
    }

    // Converter dados para objeto com colunas
    const dados: Record<string, any[]> = {};
    for (const coluna of nomeColunas) {
        dados[coluna] = [];
    }

    for (const linha of dadosLinhas) {
        for (let i = 0; i < nomeColunas.length; i++) {
            const valor = linha[i];
            // Tentar converter para número
            const numeroConvertido = Number(valor);
            dados[nomeColunas[i]].push(isNaN(numeroConvertido) ? valor : numeroConvertido);
        }
    }

    return new RecorteDados(dados);
}

/**
 * Converte um RecorteDados para string CSV.
 * Esta função é AGNÓSTICA À PLATAFORMA - funciona em Node.js e navegador.
 * 
 * @param df RecorteDados a converter
 * @param opcoes Opções para escrita
 * @returns String com conteúdo CSV
 * 
 * @example
 * const csv = paraCSV(rd);
 * const csv = paraCSV(rd, { delimitador: ';', indice: true });
 */
export function paraCSV(df: RecorteDados, opcoes?: OpcoesCSV): string {
    const opcoesPadrao: OpcoesCSV = {
        delimitador: ',',
        indice: false,
        ...opcoes
    };

    const tabela: string[][] = [];

    // Escrever cabeçalho
    const cabecalho: string[] = [];
    if (opcoesPadrao.indice) {
        cabecalho.push('indice');
    }
    cabecalho.push(...df.nomeColunas);
    tabela.push(cabecalho);

    // Escrever dados
    const dados = df.paraVetorObjetos();
    const indice = df.indice.paraVetor();

    dados.forEach((linha, i) => {
        const valores: string[] = [];
        if (opcoesPadrao.indice) {
            valores.push(String(indice[i]));
        }
        for (const coluna of df.nomeColunas) {
            let valor = linha[coluna];
            if (valor === null || valor === undefined) {
                valor = '';
            }
            valores.push(String(valor));
        }
        tabela.push(valores);
    });

    return objetoCsvParaTexto({}, tabela, mapearOpcoesCSV(opcoesPadrao, false));
}

/**
 * Lê um arquivo CSV usando o sistema de arquivos Node.js.
 * NOTA: Esta função só funciona em ambiente Node.js.
 * Para ambiente agnóstico, use analisarCSV() com conteúdo direto.
 * 
 * @param caminhoArquivo Caminho para o arquivo CSV
 * @param opcoes Opções para leitura
 * @returns RecorteDados com os dados do arquivo
 * 
 * @example
 * const rd = lerCSV('dados.csv');
 * const rd = lerCSV('dados.csv', { delimitador: ';', temCabecalho: true });
 */
export function lerCSV(caminhoArquivo: string, opcoes?: OpcoesCSV): RecorteDados {
    try {
        const sistemaArquivos = obterSistemaArquivosSincronoNodeJS();

        if (!sistemaArquivos.existeArquivo(caminhoArquivo)) {
            throw new Error(`Arquivo '${caminhoArquivo}' não encontrado`);
        }

        const conteudo = sistemaArquivos.lerArquivoTexto(caminhoArquivo);

        // Usar função agnóstica para análise
        return analisarCSV(conteudo, opcoes);
    } catch (erro: any) {
        if (erro.message?.includes('Cannot find module')) {
            throw new Error(
                'Sistema de arquivos Node.js não disponível. ' +
                'Use analisarCSV() com conteúdo direto, ou ' +
                'use lerCSVComSistema() com um sistema de arquivos customizado.'
            );
        }
        throw erro;
    }
}

/**
 * Escreve um RecorteDados em um arquivo CSV usando o sistema de arquivos Node.js.
 * NOTA: Esta função só funciona em ambiente Node.js.
 * Para ambiente agnóstico, use paraCSV() para obter a string CSV.
 * 
 * @param df RecorteDados a escrever
 * @param caminhoArquivo Caminho para salvar o arquivo
 * @param opcoes Opções para escrita
 * 
 * @example
 * escreverCSV(rd, 'saida.csv');
 * escreverCSV(rd, 'saida.csv', { delimitador: ';', indice: true });
 */
export function escreverCSV(df: RecorteDados, caminhoArquivo: string, opcoes?: OpcoesCSV): void {
    try {
        const sistemaArquivos = obterSistemaArquivosSincronoNodeJS();

        // Usar função agnóstica para conversão
        const conteudoCSV = paraCSV(df, opcoes);

        sistemaArquivos.escreverArquivoTexto(caminhoArquivo, conteudoCSV);
    } catch (erro: any) {
        if (erro.message?.includes('Cannot find module')) {
            throw new Error(
                'Sistema de arquivos Node.js não disponível. ' +
                'Use paraCSV() para obter a string CSV, ou ' +
                'use escreverCSVComSistema() com um sistema de arquivos customizado.'
            );
        }
        throw erro;
    }
}

/**
 * Lê um arquivo CSV usando um sistema de arquivos customizado.
 * Permite usar diferentes implementações (Node.js fs, fetch de URL, IndexedDB, etc.)
 * 
 * @param caminhoArquivo Caminho/identificador do arquivo
 * @param sistemaArquivos Sistema de arquivos customizado
 * @param opcoes Opções para leitura
 * @returns Promessa que resolve para RecorteDados
 * 
 * @example
 * // Com fetch de URL
 * const sistemaArquivos = {
 *   async lerArquivo(url) {
 *     const resp = await fetch(url);
 *     return resp.text();
 *   },
 *   async existeArquivo() { return true; },
 *   async escreverArquivo() {}
 * };
 * const rd = await lerCSVComSistema('dados.csv', sistemaArquivos);
 */
export async function lerCSVComSistema(
    caminhoArquivo: string,
    sistemaArquivos: SistemaArquivosAbstrato,
    opcoes?: OpcoesCSV
): Promise<RecorteDados> {
    const existe = await sistemaArquivos.existeArquivo(caminhoArquivo);
    if (!existe) {
        throw new Error(`Arquivo '${caminhoArquivo}' não encontrado`);
    }

    const conteudo = await sistemaArquivos.lerArquivo(caminhoArquivo);
    return analisarCSV(conteudo, opcoes);
}

/**
 * Escreve um RecorteDados em um arquivo CSV usando um sistema de arquivos customizado.
 * Permite usar diferentes implementações (Node.js fs, localStorage, IndexedDB, etc.)
 * 
 * @param df RecorteDados a escrever
 * @param caminhoArquivo Caminho/identificador do arquivo
 * @param sistemaArquivos Sistema de arquivos customizado
 * @param opcoes Opções para escrita
 * @returns Promessa que resolve quando a escrita é concluída
 * 
 * @example
 * const sistemaArquivos = {
 *   async escreverArquivo(path, conteudo) {
 *     localStorage.setItem(path, conteudo);
 *   },
 *   async lerArquivo() { return ''; },
 *   async existeArquivo() { return true; }
 * };
 * await escreverCSVComSistema(rd, 'dados.csv', sistemaArquivos);
 */
export async function escreverCSVComSistema(
    df: RecorteDados,
    caminhoArquivo: string,
    sistemaArquivos: SistemaArquivosAbstrato,
    opcoes?: OpcoesCSV
): Promise<void> {
    const conteudoCSV = paraCSV(df, opcoes);
    await sistemaArquivos.escreverArquivo(caminhoArquivo, conteudoCSV);
}

