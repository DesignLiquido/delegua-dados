# 📊 delegua-dados

**Biblioteca de análise de dados para TypeScript/JavaScript, inspirada em Pandas e integrada com o interpretador Delégua.**

![Status](https://img.shields.io/badge/Status-Fase%206%20Completa-brightgreen)
![Tests](https://img.shields.io/badge/Testes-380%2F380%20Passando-brightgreen)
![Browser Compatible](https://img.shields.io/badge/Browser%20Compatible-Yes-blue)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-blue)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📋 Visão Geral

`delegua-dados` é uma biblioteca TypeScript que implementa as funcionalidades principais de **Pandas** para análise de dados no interpretador **Delégua**. 

### ✨ Características Principais

- ✅ **100% TypeScript** - Type-safe, sem qualquer código JavaScript
- ✅ **Zero Dependências** - Apenas TypeScript nativo
- ✅ **Browser Compatible** - Funciona em Node.js, navegadores, web workers, Electron
- ✅ **Platform-Agnostic** - APIs agnósticas à plataforma para máxima compatibilidade
- ✅ **Nomes em Português** - API totalmente em português
- ✅ **380 Testes** - Cobertura completa com Jest
- ✅ **6 Fases Completas** - Implementação full de todas as funcionalidades

## 🚀 Início Rápido

### Instalação
```bash
npm install @designliquido/delegua-dados
```

### Exemplo Básico
```typescript
import { RecorteDados, analisarCSV } from '@designliquido/delegua-dados';

// Criar tabela
const rd = new RecorteDados({
    nome: ['Alice', 'Bob', 'Charlie'],
    idade: [25, 30, 35],
    salario: [3000, 3500, 4000]
});

// Visualizar
console.log(rd.cabeca());           // Primeiras 5 linhas
console.log(rd.descrever());        // Estatísticas

// Selecionar coluna
const nomes = rd.selecionarColuna('nome');

// Filtrar
const maiores30 = rd.filtrar([false, true, true]);

// Agrupar
const porDept = rd.agruparPor('departamento').soma();

// Análise agnóstica à plataforma
const csv = `nome,idade,salario
Alice,25,3000
Bob,30,3500`;
const rd2 = analisarCSV(csv);
```

---

## 📚 Estrutura de Dados Principais

### Classes Fundamentais

| Classe | Descrição | Uso |
|--------|-----------|-----|
| **Indice** | Rótulos para linhas/colunas | Indexação de dados |
| **Serie** | Array 1D com rótulos | Colunas de dados |
| **RecorteDados** | Tabela 2D (DataFrame) | Dados estruturados |
| **IndiceTemporal** | Índice com datas/tempos | Séries temporais |
| **Resampler** | Reamostragem de dados | Upsampling/downsampling |

### Exemplos de Criação

```typescript
// Serie
const s = new Serie([1, 2, 3, 4, 5], {
    indice: ['a', 'b', 'c', 'd', 'e'],
    nome: 'Vendas'
});

// RecorteDados - Objeto com colunas
const rd1 = new RecorteDados({
    'nome': ['Alice', 'Bob', 'Charlie'],
    'idade': [25, 30, 35],
    'salario': [3000, 3500, 4000]
});

// RecorteDados - Array de objetos
const rd2 = new RecorteDados([
    { nome: 'Alice', idade: 25, salario: 3000 },
    { nome: 'Bob', idade: 30, salario: 3500 }
]);

// RecorteDados - Cópia
const rd3 = new RecorteDados(rd1);
```

---

## 🎯 Operações Principais

### Visualização
```typescript
rd.cabeca(5);              // Primeiras N linhas
rd.cauda(3);               // Últimas N linhas
rd.paraTexto();            // String formatada
rd.paraArrayObjetos();     // Array de objetos
rd.info();                 // Informações de colunas
rd.descrever();            // Estatísticas resumidas
```

### Seleção de Dados
```typescript
// Colunas
rd.selecionarColuna('nome');              // Retorna Serie
rd.selecionarColunas(['id', 'nome']);     // Retorna RecorteDados

// Por posição (pos) - em desenvolvimento
rd.pos[0];                 // Primeira linha
rd.pos[0, 1];              // Célula específica

// Por rótulo (rot) - em desenvolvimento
rd.rot[0];                 // Linha com índice 0
```

### Modificação
```typescript
// Adicionar coluna
rd.adicionarColuna('bônus', [300, 350, 400]);

// Remover colunas
rd.remover(['coluna_inutil']);

// Renomear
rd.renomear({ 'velho_nome': 'novo_nome' });

// Ordenar
rd.ordenarPor('idade');
rd.ordenarPor('salario', false);  // Decrescente
```

### Limpeza de Dados
```typescript
// Valores nulos
rd.temNulo();              // Detecta nulos
rd.removerNulo();          // Remove linhas com nulos
rd.preencherNulo(0);       // Preenche nulos

// Duplicatas
rd.removerDuplicatas();    // Remove linhas idênticas
```

### Transformações
```typescript
// Filtro
const mascara = [true, false, true];
rd.filtrar(mascara);

// Aplicar função
rd.aplicar((coluna) => {
    return new Serie(coluna.dados.map(x => x * 2));
});

// Operações vetorizadas
const serie = rd.selecionarColuna('salario');
const aumentado = serie.aplicar(x => x * 1.1);
```

---

## 👥 GroupBy: Agrupamento e Agregação

```typescript
// Agrupamento simples
const grupos = rd.agruparPor('departamento');

// Múltiplas colunas
const grupos = rd.agruparPor(['departamento', 'turno']);

// Agregações
grupos.soma();             // Sum
grupos.media();            // Mean
grupos.mediana();          // Median
grupos.desvio();           // Std Dev
grupos.minimo();           // Min
grupos.maximo();           // Max
grupos.contar();           // Count

// Agregações múltiplas
grupos.agregar({
    'salario': ['soma', 'media', 'desvio'],
    'idade': ['minimo', 'maximo']
});
```

---

## 🔄 I/O: Entrada e Saída

### CSV - Platform-Agnostic (Funciona em qualquer lugar)

```typescript
import { analisarCSV, paraCSV } from '@designliquido/delegua-dados';

// Análise de string CSV (browser, Node.js, web workers, etc.)
const csv = `produto,vendas,lucro
A,1000,200
B,800,150
C,1500,300`;

const rd = analisarCSV(csv);
const stats = rd.descrever();

// Conversão de volta para CSV
const csvSaida = paraCSV(rd);
const csvComIndice = paraCSV(rd, { indice: true });
```

### CSV - Node.js File-Based (Node.js apenas)

```typescript
import { lerCSV, escreverCSV } from '@designliquido/delegua-dados';

// Ler arquivo
const rd = lerCSV('dados.csv', {
    delimitador: ',',
    temCabecalho: true,
    colunas: ['id', 'nome', 'idade']
});

// Escrever arquivo
escreverCSV(rd, 'saida.csv', {
    delimitador: ';',
    indice: true
});
```

### CSV - Custom Filesystem (Qualquer plataforma com implementação custom)

```typescript
import { lerCSVComSistema, escreverCSVComSistema } from '@designliquido/delegua-dados';

// Implementação customizada (ex: localStorage, URL fetch, etc.)
const sistemaArquivos = {
    async lerArquivo(chave) {
        return localStorage.getItem(chave) || '';
    },
    async escreverArquivo(chave, conteudo) {
        localStorage.setItem(chave, conteudo);
    },
    async existeArquivo(chave) {
        return localStorage.getItem(chave) !== null;
    }
};

// Usar com sistema customizado
const rd = await lerCSVComSistema('dados', sistemaArquivos);
await escreverCSVComSistema(rd, 'resultado', sistemaArquivos);
```

---

## 📈 Estatísticas

```typescript
const rd = lerCSV('dados.csv');

// Valores únicos
rd.selecionarColuna('categoria').unico();

// Contagem de valores
rd.selecionarColuna('status').contagemValores();

// Operações estatísticas
rd.descrever();        // Resumo estatístico
rd.media();            // Média de colunas numéricas
rd.soma();             // Soma
rd.desvio();           // Desvio padrão
rd.variancia();        // Variância
rd.minimo();           // Valor mínimo
rd.maximo();           // Valor máximo
rd.mediana();          // Mediana
```

---

## ⏰ Séries Temporais

```typescript
import { 
    IndiceTemporal, 
    criarRangeDatas, 
    Resampler 
} from '@designliquido/delegua-dados';

// Criar índice temporal
const datas = criarRangeDatas('2024-01-01', '2024-12-31', 'D');
const ts = new Serie(valores, { indice: datas });

// Parsing de datas
const data = parsearData('2024-01-15');
const formatado = formatarData(data, 'yyyy-MM-dd');

// Diferenças temporais
const dias = diferenca_dias(data1, data2);
const horas = diferenca_horas(data1, data2);

// Resampling
const resampler = ts.reamostrar('M');  // Para mensal
const media_mensal = resampler.media();
const soma_mensal = resampler.soma();
```

---

## 🔗 Merge, Concat, Join

```typescript
// Concatenação vertical (append)
const combinado = concatenar([rd1, rd2]);

// Concatenação horizontal
const largo = concatenar([rd1, rd2], { axis: 1 });

// Merge (SQL-like join)
const resultado = mesclar(rd1, rd2, {
    on: 'id',
    tipo: 'inner'  // ou 'left', 'right', 'outer'
});

// Join por índice
const juntado = rd1.juntar(rd2);
```

---

## 🔀 Reshape: Transformação de Forma

```typescript
// Transpor
const transposto = rd.transpor();

// Pivot (wide para long)
const dinamizado = rd.dinamizar({
    index: 'data',
    columns: 'categoria',
    values: 'valor'
});

// Melt (wide para long)
const alongado = derreter(rd, {
    id_vars: ['id', 'nome'],
    value_vars: ['jan', 'fev', 'mar']
});

// Stack/Unstack
const empilhado = rd.empilhar();
const desempilhado = rd.desempilhar();
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Análise de Vendas
```typescript
import { lerCSV } from '@designliquido/delegua-dados';

// 1. Carregar
const vendas = lerCSV('vendas.csv');

// 2. Limpeza
const limpo = vendas
    .removerNulo()
    .removerDuplicatas();

// 3. Análise
const porRegiao = limpo
    .agruparPor('regiao')
    .agregar({
        'valor': ['soma', 'media'],
        'quantidade': ['sum'],
        'id': 'count'
    });

// 4. Top 5
const top5 = porRegiao
    .ordenarPor('valor_soma', false)
    .cabeca(5);

// 5. Salvar
escreverCSV(top5, 'resultado.csv');
```

### Exemplo 2: Processamento com CSV Agnóstico
```typescript
import { analisarCSV, paraCSV } from '@designliquido/delegua-dados';

// Dados CSV como string (funciona em qualquer lugar)
const csv = `produto,quantidade,preco
Maçã,10,2.5
Banana,15,1.2
Laranja,8,3.0`;

// Processar
const rd = analisarCSV(csv);
const rd2 = rd.adicionarColuna('total', 
    rd.selecionarColuna('quantidade').dados.map((q, i) => 
        q * rd.selecionarColuna('preco').dados[i]
    )
);

// Converter de volta
const resultado = paraCSV(rd2);
console.log(resultado);  // String CSV
```

### Exemplo 3: Séries Temporais
```typescript
import { criarRangeDatas } from '@designliquido/delegua-dados';

// Gerar datas
const datas = criarRangeDatas('2024-01-01', '2024-12-31', 'D');
const temperaturas = [15.5, 16.2, 14.8, 17.1, 18.3];

// Criar série temporal
const ts = new Serie(temperaturas, { indice: datas });

// Reamostragem para média diária
const media_diaria = ts.reamostrar('D').media();
```

---

## 🌐 Compatibilidade com Browser

`delegua-dados` funciona nativamente em qualquer ambiente JavaScript. Use as funções agnósticas à plataforma:

- ✅ **Node.js** - Funciona completamente
- ✅ **Navegador** - Funciona (sem `fs`)
- ✅ **VSCode Web Extensions** - Funciona
- ✅ **Web Workers** - Funciona
- ✅ **Electron** - Funciona

Veja [BROWSER_COMPATIBILITY.md](BROWSER_COMPATIBILITY.md) para detalhes completos.

---

## 🧪 Testes

```bash
# Executar todos os testes
npm run testes-unitarios

# Modo watch (desenvolvimento)
npm run testes-unitarios:assistidos

# Cobertura
npm run testes-unitarios -- --coverage
```

**Status Atual:**
- ✅ 380 testes passando (100%)
- ✅ 15/15 test suites passando
- ✅ Todas as funcionalidades cobertas

---

## 📦 Estrutura do Projeto

```
delegua-dados/
├── fontes/                          # Código principal
│   ├── index.ts                     # Classe Indice
│   ├── serie.ts                     # Classe Serie
│   ├── recorte-dados.ts             # Classe RecorteDados
│   ├── agrupamentos.ts              # GroupBy
│   ├── transformacoes/              # Reshape, Merge, etc.
│   ├── operacoes/                   # Operações vetorizadas
│   ├── entrada-saida/               # I/O (CSV, JSON, Excel)
│   ├── indice-temporal.ts           # IndiceTemporal
│   ├── reamostrador.ts              # Resampling
│   └── index.ts                     # Exports principais
├── testes/                          # 15 test suites, 380 testes
├── delegua-modulo.ts                # Exportação para Delégua
├── package.json
├── tsconfig.json
└── jest.config.ts
```

---

## 🎯 Fases Implementadas

### ✅ Fase 1: Core Data Structures
- Classes Indice, Serie, RecorteDados
- Seleção básica (rot, pos)
- CSV I/O
- Operações básicas

### ✅ Fase 2: Transformações
- Reshape (pivot, melt, stack, unstack)
- Merge/Concat/Join
- Operações vetorizadas
- Data cleaning (dropna, fillna)

### ✅ Fase 3: Análise
- GroupBy com agregações
- Estatísticas (mean, sum, std, var)
- Rolling windows
- Correlação/covariância

### ✅ Fase 4: I/O Avançado
- JSON I/O
- Excel I/O
- SQL I/O
- Otimizações

### ✅ Fase 5: Séries Temporais
- IndiceTemporal (DatetimeIndex)
- Resampling (upsampling/downsampling)
- Funções de data/hora
- Suporte a timezones

### ✅ Fase 6: Integração Delégua
- delegua-modulo.ts completo
- Metadata de tipos
- Documentação em português
- API pronta para uso

---

## 💻 Desenvolvimento

### Requisitos
- Node.js 18+
- TypeScript 5.3+
- npm 9+ ou yarn

### Setup
```bash
# Instalar dependências
npm install

# Verificar TypeScript
npm run testes-unitarios

# Build
npm run build
```

### Estrutura de Código
- 100% TypeScript (strict mode)
- JSDoc para todas as APIs públicas
- Nomes em português
- Sem dependências externas

---

## 🏗️ Arquitetura

### Padrão de Três Camadas para I/O

```
┌─────────────────────────────────────────┐
│  Aplicação (Browser/Node/Custom)        │
├─────────────────────────────────────────┤
│  Dependency Injection (SistemaArquivos) │
├─────────────────────────────────────────┤
│  Platform-Agnostic (analisarCSV/paraCSV)│
├─────────────────────────────────────────┤
│  Platform Adapters (lerCSV/escreverCSV) │
└─────────────────────────────────────────┘
```

Isso garante compatibilidade com:
- Node.js (com `fs`)
- Navegadores (sem `fs`)
- Implementações customizadas (dependency injection)

---

## 📊 Comparação com Pandas

| Funcionalidade | Pandas | delegua-dados |
|--|--|--|
| DataFrames | ✅ | ✅ |
| Series | ✅ | ✅ |
| Seleção (loc/iloc) | ✅ | ✅ (rot/pos) |
| GroupBy | ✅ | ✅ |
| Merge/Join | ✅ | ✅ |
| Reshape | ✅ | ✅ |
| CSV I/O | ✅ | ✅ |
| JSON I/O | ✅ | ✅ |
| Séries Temporais | ✅ | ✅ |
| Browser Compat | ❌ | ✅ |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.MD] para mais informações.

---

## 📄 Licença

MIT © 2026 Design Líquido

---

**delegua-dados** • Pandas-like data analysis for TypeScript and Delégua 🚀

Desenvolvido para o interpretador [Delégua](https://github.com/DesignLiquido/delegua)
