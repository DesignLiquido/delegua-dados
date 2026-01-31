import { RecorteDados } from '../recorte-dados';
import { Serie } from '../serie';
import { Indice } from '../indice';

/**
 * Transpõe um RecorteDados (inverte linhas e colunas).
 * 
 * @param recorte RecorteDados a ser transposto
 * @returns Novo RecorteDados transposto
 * 
 * @example
 * const rd = new RecorteDados({ A: [1, 2], B: [3, 4] });
 * const transposto = transpor(df);
 * // Resultado: linhas se tornam colunas e vice-versa
 */
export function transpor(recorte: RecorteDados): RecorteDados {
    const novosDados: Record<string, any[]> = {};
    const indiceOriginal = recorte.indice.dados;
    const colunasOriginais = recorte.nomeColunas;

    // Cada linha original vira uma coluna
    for (let i = 0; i < indiceOriginal.length; i++) {
        const nomeColuna = String(indiceOriginal[i]);
        novosDados[nomeColuna] = [];
        
        for (const coluna of colunasOriginais) {
            const serie = recorte.selecionarColuna(coluna);
            novosDados[nomeColuna].push(serie.dados[i]);
        }
    }

    return new RecorteDados(novosDados, { indice: colunasOriginais });
}

/**
 * Transforma RecorteDados de formato wide (largo) para long (longo).
 * 
 * @param recorte RecorteDados a ser transformado
 * @param opcoes Opções de transformação
 * @returns Novo RecorteDados em formato long
 * 
 * @example
 * const rd = new RecorteDados({
 *   id: ['A', 'B'],
 *   vendas_2023: [100, 200],
 *   vendas_2024: [150, 250]
 * });
 * const rdLong = derreter(rd, {
 *   colunasId: ['id'],
 *   colunasValor: ['vendas_2023', 'vendas_2024'],
 *   nomeVariavel: 'ano',
 *   nomeValor: 'vendas'
 * });
 * // Resultado:
 * // id    ano            vendas
 * // A     vendas_2023    100
 * // A     vendas_2024    150
 * // B     vendas_2023    200
 * // B     vendas_2024    250
 */
export function derreter(
    recorte: RecorteDados,
    opcoes: {
        colunasId?: string[];
        colunasValor?: string[];
        nomeVariavel?: string;
        nomeValor?: string;
    } = {}
): RecorteDados {
    const opcoesCompletas = {
        colunasId: opcoes.colunasId || [],
        colunasValor: opcoes.colunasValor || recorte.nomeColunas.filter(c => !opcoes.colunasId?.includes(c)),
        nomeVariavel: opcoes.nomeVariavel || 'variavel',
        nomeValor: opcoes.nomeValor || 'valor'
    };

    const resultado: Record<string, any[]> = {};
    
    // Inicializar arrays para colunas ID
    for (const colId of opcoesCompletas.colunasId) {
        resultado[colId] = [];
    }
    
    // Inicializar arrays para variável e valor
    resultado[opcoesCompletas.nomeVariavel] = [];
    resultado[opcoesCompletas.nomeValor] = [];

    // Processar cada linha
    for (let i = 0; i < recorte.forma[0]; i++) {
        // Para cada coluna de valor, criar uma linha no resultado
        for (const colunaValor of opcoesCompletas.colunasValor) {
            // Copiar valores das colunas ID
            for (const colId of opcoesCompletas.colunasId) {
                const serie = recorte.selecionarColuna(colId);
                resultado[colId].push(serie.dados[i]);
            }
            
            // Adicionar nome da variável e seu valor
            resultado[opcoesCompletas.nomeVariavel].push(colunaValor);
            const serie = recorte.selecionarColuna(colunaValor);
            resultado[opcoesCompletas.nomeValor].push(serie.dados[i]);
        }
    }

    return new RecorteDados(resultado);
}

/**
 * Cria uma tabela pivot (reestrutura dados com agregação).
 * 
 * @param recorte RecorteDados a ser pivotado
 * @param opcoes Opções de pivot
 * @returns Novo RecorteDados pivotado
 * 
 * @example
 * const rd = new RecorteDados({
 *   categoria: ['A', 'A', 'B', 'B'],
 *   mes: ['Jan', 'Fev', 'Jan', 'Fev'],
 *   vendas: [100, 150, 200, 250]
 * });
 * const pivot = pivotar(rd, {
 *   indice: 'categoria',
 *   colunas: 'mes',
 *   valores: 'vendas',
 *   agregacao: 'sum'
 * });
 * // Resultado:
 * //           Jan    Fev
 * // A        100    150
 * // B        200    250
 */
export function pivotar(
    recorte: RecorteDados,
    opcoes: {
        indice: string | string[];
        colunas: string;
        valores: string;
        agregacao?: 'sum' | 'mean' | 'min' | 'max' | 'count';
    }
): RecorteDados {
    const agregacao = opcoes.agregacao || 'sum';
    const colunasIndice = Array.isArray(opcoes.indice) ? opcoes.indice : [opcoes.indice];

    // Obter valores únicos para índice e colunas
    const serieIndice = recorte.selecionarColuna(colunasIndice[0]);
    const valoresIndiceUnicos = [...new Set(serieIndice.dados)];
    
    const serieColunas = recorte.selecionarColuna(opcoes.colunas);
    const valoresColunasUnicos = [...new Set(serieColunas.dados)];

    // Criar estrutura de dados para o pivot
    const dadosPivot: Record<string, any[]> = {};
    
    // Inicializar com valores de índice
    for (const colInd of colunasIndice) {
        dadosPivot[colInd] = valoresIndiceUnicos;
    }

    // Criar colunas para cada valor único
    for (const valorColuna of valoresColunasUnicos) {
        dadosPivot[String(valorColuna)] = [];
    }

    // Preencher dados com agregação
    for (const valorIndice of valoresIndiceUnicos) {
        for (const valorColuna of valoresColunasUnicos) {
            // Encontrar valores que correspondem a esta combinação
            const valores: number[] = [];
            
            for (let i = 0; i < recorte.forma[0]; i++) {
                const serieInd = recorte.selecionarColuna(colunasIndice[0]);
                const serieCol = recorte.selecionarColuna(opcoes.colunas);
                const serieVal = recorte.selecionarColuna(opcoes.valores);
                
                if (serieInd.dados[i] === valorIndice && serieCol.dados[i] === valorColuna) {
                    const valor = serieVal.dados[i];
                    if (typeof valor === 'number') {
                        valores.push(valor);
                    }
                }
            }

            // Aplicar agregação
            let resultado: number | null = null;
            if (valores.length > 0) {
                switch (agregacao) {
                    case 'sum':
                        resultado = valores.reduce((a, b) => a + b, 0);
                        break;
                    case 'mean':
                        resultado = valores.reduce((a, b) => a + b, 0) / valores.length;
                        break;
                    case 'min':
                        resultado = Math.min(...valores);
                        break;
                    case 'max':
                        resultado = Math.max(...valores);
                        break;
                    case 'count':
                        resultado = valores.length;
                        break;
                }
            }

            dadosPivot[String(valorColuna)].push(resultado);
        }
    }

    return new RecorteDados(dadosPivot);
}

/**
 * Empilha níveis de um RecorteDados (transforma colunas em índice hierárquico).
 * 
 * @param recorte RecorteDados a ser empilhado
 * @returns Nova Serie com índice hierárquico
 * 
 * @example
 * const rd = new RecorteDados({
 *   A: [1, 2],
 *   B: [3, 4]
 * }, { indice: ['X', 'Y'] });
 * const empilhado = empilhar(df);
 * // Resultado: Serie com índice (X, A), (X, B), (Y, A), (Y, B)
 */
export function empilhar(recorte: RecorteDados): Serie {
    const valores: any[] = [];
    const rotulos: string[] = [];

    for (let i = 0; i < recorte.forma[0]; i++) {
        const indiceOriginal = recorte.indice.dados[i];
        
        for (const coluna of recorte.nomeColunas) {
            const serie = recorte.selecionarColuna(coluna);
            valores.push(serie.dados[i]);
            rotulos.push(`${indiceOriginal}_${coluna}`);
        }
    }

    return new Serie(valores, { indice: rotulos, nome: 'empilhado' });
}

/**
 * Desempilha uma Serie em um RecorteDados (operação inversa de empilhar).
 * 
 * @param serie Serie a ser desempilhada
 * @param niveis Número de níveis no índice
 * @returns Novo RecorteDados
 * 
 * @example
 * const serie = new Serie([1, 2, 3, 4], {
 *   indice: ['X_A', 'X_B', 'Y_A', 'Y_B']
 * });
 * const rd = desempilhar(serie, 2);
 * // Resultado: RecorteDados com índice [X, Y] e colunas [A, B]
 */
export function desempilhar(serie: Serie, niveis: number = 2): RecorteDados {
    const indiceOriginal = serie.indice.dados;
    const valores = serie.dados;

    // Mapear valores por índice e coluna
    const mapa = new Map<string, Map<string, any>>();

    for (let i = 0; i < indiceOriginal.length; i++) {
        const rotulo = String(indiceOriginal[i]);
        const partes = rotulo.split('_');
        
        if (partes.length >= niveis) {
            const indiceNovo = partes.slice(0, niveis - 1).join('_');
            const coluna = partes.slice(niveis - 1).join('_');

            if (!mapa.has(indiceNovo)) {
                mapa.set(indiceNovo, new Map());
            }
            
            mapa.get(indiceNovo)!.set(coluna, valores[i]);
        }
    }

    // Converter mapa em RecorteDados
    const colunas = new Set<string>();
    mapa.forEach(linha => {
        linha.forEach((_, coluna) => colunas.add(coluna));
    });

    const dados: Record<string, any[]> = {};
    const colunasArray = Array.from(colunas);
    
    for (const coluna of colunasArray) {
        dados[coluna] = [];
    }

    const indicesArray: string[] = [];
    mapa.forEach((linha, indice) => {
        indicesArray.push(indice);
        for (const coluna of colunasArray) {
            dados[coluna].push(linha.get(coluna) ?? null);
        }
    });

    return new RecorteDados(dados, { indice: indicesArray });
}
