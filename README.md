# Raspagem Resultados Eleição 2024

Projeto dedicado a baixar os dados das eleições municipais de 2024.

Projeto iniciado logo depois do final do 1o turno.

A raspagem dos dados é feita diretamente do servidor do TSE.

Não há certeza se após o segundo turno este código irá funcionar da mesma maneira.

Instale as dependências:

```bash
bun install
```

Para fazer o download e a formatação dos dados:

```bash
bun run index.ts --candidatura "prefeito/vereador" --formato "csv/json"
```

Mas o modo mais recomendado é fazer o download dos JSONs diretamente da fonte:

```bash
bun run ./download-fonte/index.ts
```
