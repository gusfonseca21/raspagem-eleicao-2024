import axios from "axios";
import referencia_municipios from "./municipios_brasileiros_tse.json";
import { parseArgs } from "util";
import he from "he";
import Decimal from "decimal.js";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    candidatura: {
      type: "string",
    },
    formato: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

if (!values.candidatura) {
  throw new Error(
    "Erro ao iniciar script. Não foi fornecido o tipo de candidatura (--candidatura prefeito OU --candidatura vereador) para a realização da raspagem."
  );
} else if (!values.formato) {
  throw new Error(
    "Erro ao iniciar script. Não foi fornecido o formato do arquivo a ser exportado (--formato csv OU --formato json)."
  );
} else if (
  values.candidatura !== "prefeito" &&
  values.candidatura !== "vereador"
) {
  throw new Error(
    "Erro ao iniciar script. A flag --candidatura precisa ter o valor de 'prefeito' ou 'vereador'"
  );
} else if (values.formato !== "csv" && values.formato !== "json") {
  throw new Error(
    "Erro ao iniciar script. A flag --formato precisa ter o valor de 'csv' ou 'json'"
  );
}

console.info(
  `Raspagem de dados do resultado das eleições municipais de 2024 iniciando. Tipo de candidatura: ${values.candidatura}. Formato de arquivo: ${values.formato}`
);

// Exemplo link JSON para prefeito:
// https://resultados.tse.jus.br/oficial/ele2024/619/dados/al/al27014-c0011-e000619-u.json

const RECURSO =
  "https://resultados.tse.jus.br/oficial/ele2024/619/dados/{ESTADO}/{ESTADO_COD_MU}-c00{TIPO_CANDIDATURA}-e000619-u.json";

const colunas_tabela = [
  "Nome",
  "Partido",
  "Número",
  "Município",
  "Estado",
  "Nascimento",
  "Validade Candidatura",
  "Situação",
  "Total de votos",
  "Porcentagem de votos",
];

if (values.candidatura === "prefeito") {
  colunas_tabela.push("Vice");
}

const tabela = [colunas_tabela];

let num_municipios = 0;

const falha_verificacao_municipios = [];

const tolerancia = 0.01;

try {
  for (const municipio of referencia_municipios) {
    // ! NÃO ESQUECER DE REMOVER
    // if (num_municipios !== 1) break;

    num_municipios++;
    const sigla_estado = municipio.uf.toLowerCase();
    let codigo_municipio = String(municipio.codigo_tse);
    const nome_municipio = municipio.nome_municipio;

    console.info(
      `Número de municípios: ${num_municipios}. Estado: ${sigla_estado.toUpperCase()}. Município: ${nome_municipio}`
    );

    if (sigla_estado === "df") {
      console.info("Ignorando DF em eleições municipais");
      continue;
    }

    if (nome_municipio === "FERNANDO DE NORONHA") {
      console.info("Ignorando Fernando de Noronha em eleição para prefeito");
      continue;
    }

    // MU deve conter 5 dígitos. Caso a referência original de MU tenha menos de 5 dígitos, deverá ser adicionado o char 0 à esquerda para completar os 5 dígitos.
    if (codigo_municipio.length < 5) {
      codigo_municipio = codigo_municipio.padStart(5, "0");
    }

    const RECURSO_MUNICIPIO = RECURSO.replace("{ESTADO}", sigla_estado)
      .replace("{ESTADO_COD_MU}", sigla_estado + codigo_municipio)
      .replace(
        "{TIPO_CANDIDATURA}",
        // Código para prefeito é 11, para vereador é 13
        values.candidatura === "prefeito" ? "11" : "13"
      );

    // TODO await e then na mesma linha?
    const dados = await axios.get(RECURSO_MUNICIPIO).then((res) => res.data);

    const votacao = dados.v.pvnom;

    // Agremiações são as junções de vários partidos. Contém um array com os partidos que fazem parte da agremiação, que contém um array com os candidados do partido
    const agremiacoes = dados?.carg[0]?.agr;

    let porcentagem_total_municipio = 0.0;

    for (const agr of agremiacoes) {
      agr.par.forEach((partido: any) => {
        const sigla_partido = partido.sg;
        partido.cand.forEach((candidato: any) => {
          let nome_candidato = candidato.nmu
            .replaceAll(",", "")
            .replace(";", "")
            .replace(/&#09;/g, "");
          nome_candidato = he.decode(nome_candidato);
          // const nome_candidato = he.decode(
          //   candidato.nmu
          //     .replaceAll(",", "")
          //     .replace(";", "")
          //     .replace(/&#09;/g, "")
          // );
          // Para evitar problemas na hora de criar a tabela, trocamos a vírgula pelo ponto nos números
          const porcentagem_candidato = Number(
            candidato.pvap.replace(",", ".")
          );

          // TODO remover biblioteca Decimal
          porcentagem_total_municipio += porcentagem_candidato;

          // console.log(`Nome Candiadto: ${nome_candidato}`);
          const linha_tabela = [
            nome_candidato,
            sigla_partido,
            candidato.n,
            nome_municipio,
            sigla_estado.toUpperCase(),
            candidato.dt,
            candidato.dvt,
            candidato.st,
            candidato.vap,
            porcentagem_candidato,
          ];

          if (values.candidatura === "prefeito") {
            const nome_vice = he.decode(candidato.vs[0].nmu.replace(",", ""));
            linha_tabela.push(nome_vice);
          }

          tabela.push(linha_tabela);
        });
      });
    }

    console.log(
      "Total de votos válidos município: ",
      porcentagem_total_municipio
    );
    console.log("votacao", votacao);
    const tot_porc_mun = porcentagem_total_municipio.toString();

    // Os resultados 100.000000001 e 99.999999999 para a soma das porcentagens de voto em um município serão ignorados para eliminar a maior parte dos resultados considerados errados mas que estão corretos.
    if (
      tot_porc_mun !== "100" &&
      tot_porc_mun !== "100.000000001" &&
      tot_porc_mun !== "99.999999999"
    ) {
      falha_verificacao_municipios.push({
        [nome_municipio]: porcentagem_total_municipio,
      });
    }
  }

  if (values.formato === "csv") {
    // const csvContent = tabela.map((row) => row.join(",")).join("\n");
    // Bun.write(`resultado_${values.candidatura}_1-turno_2024.csv`, csvContent);

    const arrayLinha: string[] = [];
    tabela.forEach((linha, index) => {
      const line = linha.join(",");
      arrayLinha.push(line);
    });
    const csvContent = arrayLinha.join("\n");
    Bun.write(`resultado_${values.candidatura}_1-turno_2024.csv`, csvContent);
  }

  if (values.formato === "json") {
    const candidatoObj: { [key: string]: any } = {};

    colunas_tabela.forEach((chave) => {
      candidatoObj[chave] = "";
    });

    // Remover o array de nome de colunas do array principal
    tabela.shift();

    // Transforma os arrays em objetos. As chaves serão os nomes das colunas da tabela
    const candidatosJson = tabela.map((candidato) => {
      return colunas_tabela.reduce(
        (obj: { [key: string]: any }, chave, index) => {
          obj[chave] = candidato[index];
          return obj;
        },
        {}
      );
    });

    Bun.write(
      `resultado_${values.candidatura}_1-turno_2024.json`,
      JSON.stringify(candidatosJson)
    );
  }

  console.log("Municípios errados: ", falha_verificacao_municipios);
} catch (error) {
  console.error("Erro ao tentar raspar dados: ", error);
}
