import he from "he";

const nomes = [
  "FATIMA BOTELHO);",
  "IRMÃO, MARISVALDO, O, AMÉM",
  "ALMIRA LOPES;",
  "AGAIR NETO&#09;&#09;&#09;&#09;&#09;",
  "DONIZETE LOBÃO&#09;&#09;&#09;&#09;&#09;",
];

const final = nomes.map((nome) => {
  const str = nome.replace(/[,);]/g, "").replace(/&#09;/g, "");
  return he.decode(str).trim();
});

console.log("final", final);
