/**
 * Módulo de transformações para delegua-dados
 * 
 * Exporta funções para:
 * - Reshape: transpor, pivotar, derreter, empilhar, desempilhar
 * - Concatenação: concatenar, mesclar, juntar
 * - Operações: aritméticas, comparação, lógicas, normalização
 * - GroupBy: Agrupamento e agregação
 * - Estatísticas: Correlação, quantis, outliers
 * - Janelas: Rolling e expanding windows
 */

// Reshape
export {
    transpor,
    derreter,
    pivotar,
    empilhar,
    desempilhar
} from './redesenho';

// Concatenação e Merge
export {
    concatenar,
    mesclar,
    juntar
} from './juncoes';

// Operações Vetorizadas
export {
    operacaoAritmetica,
    operacaoComparacao,
    operacaoLogica,
    operacaoRecorte,
    operacaoRecorteTodas,
    aplicarFuncao,
    aplicarMapaCompleto,
    normalizar,
    padronizar,
    diferenca,
    variacaoPercentual,
    type OperadorAritmetico,
    type OperadorComparacao,
    type OperadorLogico
} from './operacoes';

// GroupBy
export {
    AgruparPor,
    agruparPor
} from './agrupamentos';

// Estatísticas
export {
    correlacao,
    covariancia,
    quantil,
    quantis,
    iqr,
    detectarOutliers,
    matrizCorrelacao,
    assimetria,
    curtose,
    descrever
} from './estatisticas';

// Janelas
export {
    JanelaMovel as JanelaDeslizante,
    JanelaCrescente,
    janelaMovel as janelaDeslizante,
    janelaCrescente as janelaGrowente,
    mediaMovelExponencial,
    macd,
    indiceForcaRelativa as rsi
} from './janelas';

