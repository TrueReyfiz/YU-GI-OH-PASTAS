# Yu-Gi-Oh! — Catálogo de Coleção

Catálogo web pessoal para visualizar, filtrar e avaliar uma coleção física de cartas Yu-Gi-Oh!. Todas as cartas são exibidas com nome e dados em **português**, com imagens buscadas automaticamente na API pública do YGOProDeck.

---

## Funcionalidades

- **Galeria completa** de 254 cartas com imagem real de cada carta
- **Busca por nome** em tempo real
- **Filtros combinados** por Tipo, Raridade, Condição e Idioma
- **Modal de detalhes** ao clicar em qualquer carta — exibe imagem ampliada, descrição, ATK/DEF, nível, raça, atributo, condição e valor estimado
- **Header fixo** com total de cartas e valor total da coleção em BRL
- **Indicadores visuais** de quantidade (quando há mais de 1 cópia) e idioma da carta
- Design dark com tema dourado, totalmente responsivo (mobile → desktop)

---

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 (App Router) | Framework — Server Components para fetch de dados |
| TypeScript | Tipagem em todo o projeto |
| Tailwind CSS | Estilização |
| YGOProDeck API | Imagens e metadados das cartas |

---

## Estrutura do projeto

```
yugioh-catalog/
├── app/
│   ├── page.tsx          # Server Component raiz — busca dados e passa para a UI
│   ├── layout.tsx        # Layout global, fonte, meta tags
│   └── globals.css       # Tema dark, cores gold, scrollbar customizada
├── components/
│   ├── Header.tsx        # Header fixo com totais
│   ├── CardGrid.tsx      # Grade com filtros e busca (Client Component)
│   ├── CardItem.tsx      # Card individual clicável
│   └── CardModal.tsx     # Modal de detalhes
├── lib/
│   ├── getCollection.ts  # Lê collection.json do disco
│   └── enrichCards.ts    # Pipeline de 6 passos para buscar imagens na API
├── types/
│   └── card.ts           # Interfaces: CollectionCard, APICard, EnrichedCard
└── public/data/
    ├── collection.json       # 254 cartas da coleção (nome PT, código, preço, etc.)
    └── image-overrides.json  # Overrides manuais para tokens/acessórios sem API
```

---

## Como as imagens são encontradas

As cartas da coleção têm nomes em português, mas a API do YGOProDeck usa nomes em inglês. O arquivo `lib/enrichCards.ts` resolve isso com um pipeline de 6 passos executado no servidor a cada build:

| Passo | Mecanismo | Cartas resolvidas |
|---|---|---|
| 1 — PT name | Match por nome PT normalizado (sem acentos) | 151 |
| 2 — EN name | Match por nome EN (cartas já em inglês na coleção) | 51 |
| 3 — Set code | Converte código da carta (PT/FR/KR → EN) e busca no índice de sets | 46 |
| 4 — Override | Lê `image-overrides.json` (tokens e acessórios sem entrada própria na API) | 2 |
| 5 — EN name search | Busca direta pelo nome EN na API para sets não indexados | 2 |
| 6 — Dedup | Reutiliza imagem de outra cópia do mesmo card já resolvida | 2 |
| **Total** | | **254 / 254** |

Os dados ficam em cache por 24h (`next: { revalidate: 86400 }`) — a API não é chamada a cada visita.

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

> Na primeira carga o servidor busca dados de todos os sets na API do YGOProDeck (pode levar alguns segundos). As requisições subsequentes usam o cache do Next.js.

---

## Dados da coleção

O arquivo `public/data/collection.json` descreve cada carta com os campos:

```json
{
  "nome": "Dragão Branco de Olhos Azuis",
  "tipo": "Monstro",
  "raridade": "Ultra Rare",
  "colecao": "LDK2-PT001",
  "idioma": "Português",
  "condicao": "Near Mint",
  "quantidade": 1,
  "preco": 45.00
}
```

Para adicionar novas cartas, basta editar esse arquivo. Se a carta não tiver entrada própria na API (tokens, fichas, acessórios promocionais), adicione o ID numérico da imagem substituta em `public/data/image-overrides.json`:

```json
{
  "CODIGO-PT000": 12345678
}
```

O ID é o número que aparece na URL das imagens do YGOProDeck (`images.ygoprodeck.com/images/cards_small/{id}.jpg`).
