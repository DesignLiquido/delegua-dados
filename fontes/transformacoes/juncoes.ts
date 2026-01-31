import { RecorteDados } from '../recorte-dados';

/**
 * Concatena múltiplos RecorteDados ao longo de um eixo.
 * 
 * @param recortes Array de RecorteDados a serem concatenados
 * @param opcoes Opções de concatenação
 * @returns Novo RecorteDados concatenado
 * 
 * @example
 * const rd1 = new RecorteDados({ A: [1, 2], B: [3, 4] });
 * const rd2 = new RecorteDados({ A: [5, 6], B: [7, 8] });
 * const resultado = concatenar([df1, df2], { eixo: 0 });
 * // Resultado: 4 linhas, 2 colunas
 */
export function concatenar(
    recortes: RecorteDados[],
    opcoes: {
        eixo?: 0 | 1;
        ignorarIndice?: boolean;
        verificarIntegridade?: boolean;
    } = {}
): RecorteDados {
    if (recortes.length === 0) {
        throw new Error('Pelo menos um RecorteDados deve ser fornecido');
    }

    const eixo = opcoes.eixo ?? 0;
    const ignorarIndice = opcoes.ignorarIndice ?? false;
    const verificarIntegridade = opcoes.verificarIntegridade ?? true;

    if (eixo === 0) {
        // Concatenar verticalmente (adicionar linhas)
        return concatenarVertical(recortes, ignorarIndice, verificarIntegridade);
    } else {
        // Concatenar horizontalmente (adicionar colunas)
        return concatenarHorizontal(recortes, ignorarIndice, verificarIntegridade);
    }
}

/**
 * Concatena RecorteDados verticalmente (adiciona linhas).
 */
function concatenarVertical(
    recortes: RecorteDados[],
    ignorarIndice: boolean,
    verificarIntegridade: boolean
): RecorteDados {
    // Verificar que todas têm as mesmas colunas
    const colunasBase = recortes[0].nomeColunas.sort();
    
    if (verificarIntegridade) {
        for (let i = 1; i < recortes.length; i++) {
            const colunas = recortes[i].nomeColunas.sort();
            if (JSON.stringify(colunas) !== JSON.stringify(colunasBase)) {
                throw new Error('Todos os RecorteDados devem ter as mesmas colunas para concatenação vertical');
            }
        }
    }

    // Concatenar dados
    const dadosConcatenados: Record<string, any[]> = {};
    for (const coluna of colunasBase) {
        dadosConcatenados[coluna] = [];
    }

    const indicesConcatenados: any[] = [];

    for (let i = 0; i < recortes.length; i++) {
        const recorte = recortes[i];
        
        for (const coluna of colunasBase) {
            const serie = recorte.selecionarColuna(coluna);
            dadosConcatenados[coluna].push(...serie.dados);
        }

        if (!ignorarIndice) {
            indicesConcatenados.push(...recorte.indice.dados);
        }
    }

    if (ignorarIndice) {
        return new RecorteDados(dadosConcatenados);
    } else {
        return new RecorteDados(dadosConcatenados, { indice: indicesConcatenados });
    }
}

/**
 * Concatena RecorteDados horizontalmente (adiciona colunas).
 */
function concatenarHorizontal(
    recortes: RecorteDados[],
    ignorarIndice: boolean,
    verificarIntegridade: boolean
): RecorteDados {
    // Verificar que todas têm o mesmo número de linhas
    const numLinhas = recortes[0].forma[0];
    
    if (verificarIntegridade) {
        for (let i = 1; i < recortes.length; i++) {
            if (recortes[i].forma[0] !== numLinhas) {
                throw new Error('Todos os RecorteDados devem ter o mesmo número de linhas para concatenação horizontal');
            }
        }
    }

    // Concatenar dados
    const dadosConcatenados: Record<string, any[]> = {};

    for (const recorte of recortes) {
        for (const coluna of recorte.nomeColunas) {
            // Se coluna já existe, adicionar sufixo
            let nomeColuna = coluna;
            let contador = 1;
            while (dadosConcatenados[nomeColuna] !== undefined) {
                nomeColuna = `${coluna}_${contador}`;
                contador++;
            }

            const serie = recorte.selecionarColuna(coluna);
            dadosConcatenados[nomeColuna] = [...serie.dados];
        }
    }

    // Usar índice do primeiro RecorteDados
    if (!ignorarIndice) {
        return new RecorteDados(dadosConcatenados, { indice: recortes[0].indice.dados });
    } else {
        return new RecorteDados(dadosConcatenados);
    }
}

/**
 * Realiza merge (junção) de dois RecorteDados, similar a SQL JOIN.
 * 
 * @param esquerda RecorteDados da esquerda
 * @param direita RecorteDados da direita
 * @param opcoes Opções de merge
 * @returns Novo RecorteDados com dados mesclados
 * 
 * @example
 * const rd1 = new RecorteDados({
 *   id: ['A', 'B', 'C'],
 *   valor1: [1, 2, 3]
 * });
 * const rd2 = new RecorteDados({
 *   id: ['A', 'B', 'D'],
 *   valor2: [10, 20, 30]
 * });
 * const resultado = mesclar(df1, df2, {
 *   em: 'id',
 *   como: 'inner'
 * });
 * // Resultado: apenas linhas com id 'A' e 'B'
 */
export function mesclar(
    esquerda: RecorteDados,
    direita: RecorteDados,
    opcoes: {
        em?: string | string[];
        emEsquerda?: string | string[];
        emDireita?: string | string[];
        como?: 'inner' | 'left' | 'right' | 'outer';
        sufixos?: [string, string];
    } = {}
): RecorteDados {
    const como = opcoes.como ?? 'inner';
    const sufixos = opcoes.sufixos ?? ['_esq', '_dir'];

    // Determinar colunas de junção
    let colunasJuncaoEsq: string[];
    let colunasJuncaoDir: string[];

    if (opcoes.em) {
        const em = Array.isArray(opcoes.em) ? opcoes.em : [opcoes.em];
        colunasJuncaoEsq = em;
        colunasJuncaoDir = em;
    } else if (opcoes.emEsquerda && opcoes.emDireita) {
        colunasJuncaoEsq = Array.isArray(opcoes.emEsquerda) ? opcoes.emEsquerda : [opcoes.emEsquerda];
        colunasJuncaoDir = Array.isArray(opcoes.emDireita) ? opcoes.emDireita : [opcoes.emDireita];
    } else {
        throw new Error('Deve especificar "em" ou "emEsquerda" e "emDireita"');
    }

    // Criar mapa de valores da direita
    const mapaDir = new Map<string, number[]>();
    for (let i = 0; i < direita.forma[0]; i++) {
        const chave = colunasJuncaoDir.map(col => String(direita.selecionarColuna(col).dados[i])).join('|');
        if (!mapaDir.has(chave)) {
            mapaDir.set(chave, []);
        }
        mapaDir.get(chave)!.push(i);
    }

    // Preparar estrutura de resultado
    const resultado: Record<string, any[]> = {};
    
    // Adicionar todas as colunas da esquerda
    for (const col of esquerda.nomeColunas) {
        resultado[col] = [];
    }

    // Adicionar colunas da direita (exceto colunas de junção)
    for (const col of direita.nomeColunas) {
        if (!colunasJuncaoDir.includes(col)) {
            let nomeCol = col;
            // Se coluna já existe na esquerda, adicionar sufixo
            if (esquerda.nomeColunas.includes(col)) {
                resultado[col + sufixos[0]] = resultado[col];
                delete resultado[col];
                nomeCol = col + sufixos[1];
            }
            resultado[nomeCol] = [];
        }
    }

    // Processar merge baseado no tipo
    const linhasProcessadas = new Set<number>();

    // Processar linhas da esquerda
    for (let i = 0; i < esquerda.forma[0]; i++) {
        const chave = colunasJuncaoEsq.map(col => String(esquerda.selecionarColuna(col).dados[i])).join('|');
        const indicesDireita = mapaDir.get(chave) || [];

        if (indicesDireita.length > 0) {
            // Match encontrado
            for (const indDir of indicesDireita) {
                linhasProcessadas.add(indDir);
                
                // Adicionar valores da esquerda
                for (const col of esquerda.nomeColunas) {
                    const nomeCol = direita.nomeColunas.includes(col) && !colunasJuncaoDir.includes(col) 
                        ? col + sufixos[0] 
                        : col;
                    resultado[nomeCol].push(esquerda.selecionarColuna(col).dados[i]);
                }

                // Adicionar valores da direita
                for (const col of direita.nomeColunas) {
                    if (!colunasJuncaoDir.includes(col)) {
                        const nomeCol = esquerda.nomeColunas.includes(col) 
                            ? col + sufixos[1] 
                            : col;
                        resultado[nomeCol].push(direita.selecionarColuna(col).dados[indDir]);
                    }
                }
            }
        } else if (como === 'left' || como === 'outer') {
            // Sem match, mas incluir na left join ou outer join
            for (const col of esquerda.nomeColunas) {
                const nomeCol = direita.nomeColunas.includes(col) && !colunasJuncaoDir.includes(col) 
                    ? col + sufixos[0] 
                    : col;
                resultado[nomeCol].push(esquerda.selecionarColuna(col).dados[i]);
            }

            for (const col of direita.nomeColunas) {
                if (!colunasJuncaoDir.includes(col)) {
                    const nomeCol = esquerda.nomeColunas.includes(col) 
                        ? col + sufixos[1] 
                        : col;
                    resultado[nomeCol].push(null);
                }
            }
        }
    }

    // Processar linhas da direita não processadas (para right e outer join)
    if (como === 'right' || como === 'outer') {
        for (let i = 0; i < direita.forma[0]; i++) {
            if (!linhasProcessadas.has(i)) {
                // Adicionar colunas de junção
                for (const col of colunasJuncaoDir) {
                    // Usar nome da coluna de junção da esquerda (se houver diferença)
                    const nomeCol = colunasJuncaoEsq[colunasJuncaoDir.indexOf(col)];
                    resultado[nomeCol].push(direita.selecionarColuna(col).dados[i]);
                }

                // Adicionar valores da esquerda como null
                for (const col of esquerda.nomeColunas) {
                    if (!colunasJuncaoEsq.includes(col)) {
                        const nomeCol = direita.nomeColunas.includes(col) && !colunasJuncaoDir.includes(col) 
                            ? col + sufixos[0] 
                            : col;
                        resultado[nomeCol].push(null);
                    }
                }

                // Adicionar valores da direita
                for (const col of direita.nomeColunas) {
                    if (!colunasJuncaoDir.includes(col)) {
                        const nomeCol = esquerda.nomeColunas.includes(col) 
                            ? col + sufixos[1] 
                            : col;
                        resultado[nomeCol].push(direita.selecionarColuna(col).dados[i]);
                    }
                }
            }
        }
    }

    return new RecorteDados(resultado);
}

/**
 * Junta RecorteDados pelos índices (operação simplificada de merge).
 * 
 * @param esquerda RecorteDados da esquerda
 * @param direita RecorteDados da direita
 * @param opcoes Opções de junção
 * @returns Novo RecorteDados com dados unidos
 * 
 * @example
 * const rd1 = new RecorteDados({ A: [1, 2] }, { indice: ['X', 'Y'] });
 * const rd2 = new RecorteDados({ B: [3, 4] }, { indice: ['X', 'Y'] });
 * const resultado = juntar(df1, df2);
 * // Resultado: combina colunas de ambos os RecorteDados
 */
export function juntar(
    esquerda: RecorteDados,
    direita: RecorteDados,
    opcoes: {
        como?: 'inner' | 'left' | 'right' | 'outer';
        sufixoEsquerda?: string;
        sufixoDireita?: string;
    } = {}
): RecorteDados {
    const como = opcoes.como ?? 'left';
    const sufixoEsq = opcoes.sufixoEsquerda ?? '_esq';
    const sufixoDir = opcoes.sufixoDireita ?? '_dir';

    // Criar mapa de índices da direita
    const mapaDir = new Map<any, number>();
    for (let i = 0; i < direita.forma[0]; i++) {
        mapaDir.set(direita.indice.dados[i], i);
    }

    // Preparar estrutura de resultado
    const resultado: Record<string, any[]> = {};
    const indicesResultado: any[] = [];

    // Adicionar todas as colunas
    for (const col of esquerda.nomeColunas) {
        resultado[col] = [];
    }
    for (const col of direita.nomeColunas) {
        const nomeCol = esquerda.nomeColunas.includes(col) ? col + sufixoDir : col;
        if (esquerda.nomeColunas.includes(col)) {
            resultado[esquerda.nomeColunas[esquerda.nomeColunas.indexOf(col)] + sufixoEsq] = resultado[col];
            delete resultado[col];
        }
        resultado[nomeCol] = [];
    }

    // Processar junção
    for (let i = 0; i < esquerda.forma[0]; i++) {
        const indiceEsq = esquerda.indice.dados[i];
        const indiceDir = mapaDir.get(indiceEsq);

        if (indiceDir !== undefined || como === 'left' || como === 'outer') {
            indicesResultado.push(indiceEsq);

            // Adicionar valores da esquerda
            for (const col of esquerda.nomeColunas) {
                const nomeCol = direita.nomeColunas.includes(col) ? col + sufixoEsq : col;
                resultado[nomeCol].push(esquerda.selecionarColuna(col).dados[i]);
            }

            // Adicionar valores da direita
            if (indiceDir !== undefined) {
                for (const col of direita.nomeColunas) {
                    const nomeCol = esquerda.nomeColunas.includes(col) ? col + sufixoDir : col;
                    resultado[nomeCol].push(direita.selecionarColuna(col).dados[indiceDir]);
                }
            } else {
                for (const col of direita.nomeColunas) {
                    const nomeCol = esquerda.nomeColunas.includes(col) ? col + sufixoDir : col;
                    resultado[nomeCol].push(null);
                }
            }
        }
    }

    return new RecorteDados(resultado, { indice: indicesResultado });
}
