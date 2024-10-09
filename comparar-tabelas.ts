import Decimal from "decimal.js";

const porcentagem_total_municipio = new Decimal(100.000000002);

const amigo = porcentagem_total_municipio.toString();

if (amigo !== "100.000000001" && amigo !== "99.999999999" && amigo !== "100") {
  console.log("");
}

// const tolerancia = new Decimal(0.000001);

// if (
//   porcentagem_total_municipio
//     .minus(new Decimal(100))
//     .abs()
//     .greaterThan(tolerancia)
// ) {
//   console.log("PORRA");
// }
