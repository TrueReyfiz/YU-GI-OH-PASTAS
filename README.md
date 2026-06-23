# Yu-Gi-Oh! — Catálogo de Coleção

Catálogo web pessoal para visualizar, filtrar e avaliar uma coleção física de cartas Yu-Gi-Oh!. As cartas são exibidas com nomes em **português**, imagens buscadas automaticamente na API pública do YGOProDeck, e descrições disponíveis em **português e inglês** com toggle no modal.

---

## Funcionalidades

- **Galeria completa** de 254 cartas em grade responsiva (5+ colunas no desktop)
- **Busca por nome** em tempo real (filtra enquanto digita)
- **Filtros combinados** por Tipo, Raridade, Condição e Idioma
- **Modal de detalhes** ao clicar em qualquer carta:
  - Imagem ampliada da carta
  - **Toggle PT / EN** para alternar a descrição entre português e inglês
  - Estatísticas: ATK, DEF, Nível
  - Detalhes: Coleção, Idioma, Condição, Quantidade, Tipo/Raça, Atributo
  - Valor estimado em BRL
- **Header fixo** com total de cartas e valor total da coleção
- **Indicadores visuais** de quantidade (quando há mais de 1 cópia) e idioma da carta
- Design dark com tema dourado, responsivo (mobile → desktop)

---

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 (App Router) | Framework — Server Components para fetch de dados |
| TypeScript | Tipagem em todo o projeto |
| Tailwind CSS | Estilização |
| YGOProDeck API | Imagens, metadados e descrições das cartas |

---

## Estrutura do projeto

```
yugioh-catalog/
├── app/
│   ├── page.tsx              # Server Component raiz — busca dados e passa para a UI
│   ├── layout.tsx            # Layout global, fonte, meta tags
│   ├── globals.css           # Tema dark, cores gold, scrollbar customizada
│   └── api/
│       └── diagnose/
│           └── route.ts      # Endpoint de diagnóstico de cobertura das cartas
├── components/
│   ├── Header.tsx            # Header fixo com totais (cartas e valor)
│   ├── CardGrid.tsx          # Grade com filtros e busca (Client Component)
│   ├── CardItem.tsx          # Card individual clicável
│   └── CardModal.tsx         # Modal de detalhes com toggle PT/EN
├── lib/
│   ├── getCollection.ts      # Lê collection.json do disco
│   └── enrichCards.ts        # Pipeline de 8 passos para imagens e descrições
├── types/
│   └── card.ts               # Interfaces: CollectionCard, APICard, EnrichedCard
└── public/data/
    ├── collection.json        # 254 cartas da coleção (nome PT, código, preço, etc.)
    ├── image-overrides.json   # Overrides manuais de imagem para tokens/acessórios
    └── desc-overrides.json    # Overrides manuais de descrição PT/EN para cartas ausentes na API
```

---

## Pipeline de enriquecimento (`enrichCards.ts`)

O arquivo `lib/enrichCards.ts` busca imagens e descrições PT+EN para cada carta da coleção em 8 passos:

| Passo | Mecanismo | Finalidade |
|---|---|---|
| 1 — PT name | Match por nome PT normalizado (sem acentos) no set PT da API | Maioria das cartas em português |
| 2 — EN name | Match por nome EN (cartas com `nome` já em inglês na coleção) | Cartas de idioma inglês |
| 3 — Set code | Converte código da carta (PT/FR/KR → EN) e busca no índice de sets | Cartas de sets não-PT |
| 4 — Image override | Lê `image-overrides.json` (tokens e acessórios sem entrada própria na API) | Tokens, fichas, promo |
| 5 — EN name search | Busca direta pelo nome EN na API para sets não indexados | Sets especiais/regionais |
| 6 — Dedup | Reutiliza imagem + descrição de outra cópia do mesmo card já resolvida | Duplicatas entre sets |
| 7 — PT fill by ID | Busca `language=pt` por ID individual para cobrir gaps de PT | Cartas com EN mas sem PT |
| 8 — Desc override | Aplica `desc-overrides.json` (prioridade máxima, chaveado por código da carta) | Cartas ausentes na DB PT |

**Cobertura final: 254/254 cartas com imagem | 250/254 com toggle PT+EN ativo**

Os dados ficam em cache por 24h (`next: { revalidate: 86400 }`) — a API não é chamada a cada visita.

---

## Toggle de idioma da descrição

No modal de cada carta, quando ambas as descrições (PT e EN) estão disponíveis e são diferentes, aparece um par de botões **PT | EN** acima da descrição. O toggle só é exibido quando há de fato conteúdo em ambos os idiomas — cartas com apenas uma língua disponível exibem direto sem o toggle.

A lógica de detecção:
```ts
const hasBothLangs = !!(card.descPt && card.descEn && card.descPt.trim() !== card.descEn.trim())
```

---

## Diagnóstico de cobertura

O endpoint `/api/diagnose` (somente em ambiente de desenvolvimento) executa o pipeline completo e retorna um relatório JSON com as cartas que têm problemas:

```
GET http://localhost:3000/api/diagnose
```

Campos reportados por carta: `noImage`, `noApiId`, `noDescEn`, `noDescPt`, `descSame`, `descEnSnippet`.

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+

```bash
# Clone o repositório
git clone https://github.com/TrueReyfiz/YU-GI-OH-PASTAS.git
cd YU-GI-OH-PASTAS/yugioh-catalog

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

> Na primeira carga o servidor busca dados de todos os sets na API do YGOProDeck (pode levar alguns segundos). As requisições subsequentes usam o cache do Next.js (24h).

---

## Dados da coleção

O arquivo `public/data/collection.json` descreve cada carta:

```json
{
  "nome": "Dragão Branco de Olhos Azuis",
  "tipo": "Monstro",
  "raridade": "Ultra Raro",
  "colecao": "LDK2-PT001",
  "idioma": "Português",
  "condicao": "Near Mint",
  "quantidade": 1,
  "preco": 45.00
}
```

Para adicionar novas cartas, edite esse arquivo. Se a carta não tiver entrada própria na API (tokens, fichas, acessórios), adicione o ID numérico da imagem em `public/data/image-overrides.json`:

```json
{
  "CODIGO-PT000": 12345678
}
```

Se a carta não tiver tradução PT na API do YGOProDeck, adicione manualmente em `public/data/desc-overrides.json`:

```json
{
  "CODIGO-PT000": {
    "pt": "Descrição em português...",
    "en": "English description (opcional)..."
  }
}
```

O ID de imagem é o número na URL `images.ygoprodeck.com/images/cards_small/{id}.jpg`.
