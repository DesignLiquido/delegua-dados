import { Indice } from './indice';
import { RecorteDados } from './recorte-dados';
import { Serie } from './serie';

interface Diferenca {
    esperado: any;
    obtido: any;
    posicao?: number;
}

function valoresIguais(obtido: any, esperado: any): boolean {
    if (Object.is(obtido, esperado)) {
        return true;
    }

    return obtido instanceof Date &&
        esperado instanceof Date &&
        obtido.getTime() === esperado.getTime();
}

function formatarValor(valor: any): string {
    if (typeof valor === 'string') {
        return JSON.stringify(valor);
    }

    if (valor instanceof Date) {
        return valor.toISOString();
    }

    if (typeof valor === 'number' && Number.isNaN(valor)) {
        return 'NaN';
    }

    if (valor === undefined) {
        return 'undefined';
    }

    if (typeof valor === 'object' && valor !== null) {
        try {
            return JSON.stringify(valor);
        } catch {
            return String(valor);
        }
    }

    return String(valor);
}

function primeiraDiferenca(obtidos: any[], esperados: any[]): Diferenca | undefined {
    if (obtidos.length !== esperados.length) {
        return {
            esperado: `tamanho ${esperados.length}`,
            obtido: `tamanho ${obtidos.length}`,
        };
    }

    for (let posicao = 0; posicao < esperados.length; posicao++) {
        if (!valoresIguais(obtidos[posicao], esperados[posicao])) {
            return {
                esperado: esperados[posicao],
                obtido: obtidos[posicao],
                posicao,
            };
        }
    }

    return undefined;
}

function mensagemDiferenca(
    cabecalho: string,
    diferenca: Diferenca,
    localizacao: string[] = []
): string {
    const linhas = [cabecalho, '', ...localizacao];
    if (localizacao.length > 0) {
        linhas.push('');
    }
    linhas.push(
        `Esperado: ${formatarValor(diferenca.esperado)}`,
        `Obtido: ${formatarValor(diferenca.obtido)}`
    );
    return linhas.join('\n');
}

/**
 * Afirma que dois índices têm os mesmos rótulos, na mesma ordem.
 *
 * @throws {Error} Quando os índices forem diferentes.
 */
export function afirmarIndiceIgual(obtido: Indice, esperado: Indice): void {
    const diferenca = primeiraDiferenca(obtido.paraVetor(), esperado.paraVetor());
    if (!diferenca) {
        return;
    }

    const localizacao = diferenca.posicao === undefined
        ? []
        : [`Posição: ${diferenca.posicao}`];
    throw new Error(mensagemDiferenca('Índices diferentes.', diferenca, localizacao));
}

/**
 * Afirma que duas séries têm índices e valores iguais.
 *
 * @throws {Error} Quando as séries forem diferentes.
 */
export function afirmarSerieIgual(obtida: Serie, esperada: Serie): void {
    const diferencaIndice = primeiraDiferenca(
        obtida.indice.paraVetor(),
        esperada.indice.paraVetor()
    );
    if (diferencaIndice) {
        const localizacao = diferencaIndice.posicao === undefined
            ? ['Parte: índice']
            : ['Parte: índice', `Posição: ${diferencaIndice.posicao}`];
        throw new Error(mensagemDiferenca('Séries diferentes.', diferencaIndice, localizacao));
    }

    const diferencaValores = primeiraDiferenca(obtida.paraVetor(), esperada.paraVetor());
    if (!diferencaValores) {
        return;
    }

    const localizacao = diferencaValores.posicao === undefined
        ? ['Parte: valores']
        : [
            `Índice: ${formatarValor(esperada.indice.get(diferencaValores.posicao))}`,
            `Posição: ${diferencaValores.posicao}`,
        ];
    throw new Error(mensagemDiferenca('Séries diferentes.', diferencaValores, localizacao));
}

/**
 * Afirma que dois recortes têm os mesmos índices, colunas e valores.
 *
 * @throws {Error} Quando os recortes forem diferentes.
 */
export function afirmarRecorteDadosIgual(
    obtido: RecorteDados,
    esperado: RecorteDados
): void {
    const diferencaIndice = primeiraDiferenca(
        obtido.indice.paraVetor(),
        esperado.indice.paraVetor()
    );
    if (diferencaIndice) {
        const localizacao = diferencaIndice.posicao === undefined
            ? ['Parte: índice']
            : ['Parte: índice', `Posição: ${diferencaIndice.posicao}`];
        throw new Error(mensagemDiferenca('RecorteDados diferentes.', diferencaIndice, localizacao));
    }

    const diferencaColunas = primeiraDiferenca(obtido.nomeColunas, esperado.nomeColunas);
    if (diferencaColunas) {
        const localizacao = diferencaColunas.posicao === undefined
            ? ['Parte: colunas']
            : ['Parte: colunas', `Posição: ${diferencaColunas.posicao}`];
        throw new Error(mensagemDiferenca('RecorteDados diferentes.', diferencaColunas, localizacao));
    }

    for (let linha = 0; linha < esperado.forma[0]; linha++) {
        for (let coluna = 0; coluna < esperado.forma[1]; coluna++) {
            const valorObtido = obtido.obterPosicao(linha, coluna);
            const valorEsperado = esperado.obterPosicao(linha, coluna);
            if (valoresIguais(valorObtido, valorEsperado)) {
                continue;
            }

            const diferenca = { esperado: valorEsperado, obtido: valorObtido };
            throw new Error(mensagemDiferenca(
                'RecorteDados diferentes.',
                diferenca,
                [
                    `Linha: ${formatarValor(esperado.indice.get(linha))}`,
                    `Coluna: ${esperado.nomeColunas[coluna]}`,
                ]
            ));
        }
    }
}
