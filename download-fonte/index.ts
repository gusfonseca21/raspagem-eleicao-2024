import axios from "axios";
import referencia_municipios from "../municipios_brasileiros_tse.json";

// c0011 = prefeito; c0013 = vereador
const candidaturas = ["c0011", "c0013"];

const RECURSO =
  "https://resultados.tse.jus.br/oficial/ele2024/619/dados/{ESTADO}/{ESTADO_COD_MU}-{TIPO_CANDIDATURA}-e000619-u.json";

try {
  for (const municipio of referencia_municipios) {
    if (municipio.codigo_tse === 30015 || municipio.codigo_tse === 97012) {
      continue;
    }
    for (const tipo_candidatura of candidaturas) {
      const sigla_estado = municipio.uf.toLowerCase();
      let codigo_municipio = String(municipio.codigo_tse);
      if (codigo_municipio.length < 5) {
        codigo_municipio = codigo_municipio.padStart(5, "0");
      }
      const nome_municipio = municipio.nome_municipio.replaceAll(" ", "_");

      const RECURSO_MUNICIPIO = RECURSO.replace("{ESTADO}", sigla_estado)
        .replace("{ESTADO_COD_MU}", sigla_estado + codigo_municipio)
        .replace("{TIPO_CANDIDATURA}", tipo_candidatura);

      const dados = await axios.get(RECURSO_MUNICIPIO).then((res) => res.data);

      const nome_candidatura =
        tipo_candidatura === "c0011" ? "PREFEITO" : "VEREADOR";

      const nome_arquivo = `RESULTADO_1_TURNO_${nome_candidatura}_${sigla_estado.toUpperCase()}_${nome_municipio}.json`;

      Bun.write(`./arquivos/${nome_arquivo}`, JSON.stringify(dados));

      console.log("Arquivo gravado com sucesso: ", nome_arquivo);
    }
  }
} catch (error) {
  console.error(
    "Houve um erro ao tentar fazer a raspagem dos JSONs do TSE com o resultado das eleições: ",
    error
  );
}
