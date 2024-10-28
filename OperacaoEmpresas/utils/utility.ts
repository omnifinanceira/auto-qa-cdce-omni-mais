async function obterCEP(uf, cidade, logradouro) {
  const response = await fetch(
    `https://viacep.com.br/ws/${uf}/${cidade}/${logradouro}/json/`
  );
  const data = await response.json();

  const cepSemTraco = data[0].cep.replace("-", "");

  return cepSemTraco;
}

export const Utility = {
  obterCEP,
};
