import parse from "csv-simple-parser";
import json from "./resultado_vereador_1-turno_2024.json";

console.log(json.length);

// const file_scrape = Bun.file(
//   "../resultado_prefeitura_1-turno_2024-filtrado-ac.csv"
// );
// const file_tse = Bun.file("../consulta_cand_2024_AC-filtro.csv");
// const csv_scrape = parse(await file_scrape.text());
// const csv_tse = parse(await file_tse.text());

// const nomes_candidatos_scrape = [];
// const nomes_candidatos_tse = [];

// const nomes_nao_presentes = [];

// for (const row of csv_scrape) {
//   nomes_candidatos_scrape.push(row[0]);
// }

// for (const row of csv_tse) {
//   console.log("row", row[18]);
//   nomes_candidatos_tse.push(row[18]);
// }

// for (const candidato of nomes_candidatos_scrape) {
//   if (!nomes_candidatos_tse.includes(candidato)) {
//     nomes_nao_presentes.push(candidato);
//   }
// }

// console.log(
//   "Nº candidatos prefeitura AC raspados: ",
//   nomes_candidatos_scrape.length
// );
// console.log("Nº candidatos prefeitura AC TSE", nomes_candidatos_tse.length);
// console.log(
//   "Candidatos presentes na lista do TSE e não presentes nos dados de raspagem: ",
//   nomes_nao_presentes
// );
