export async function consultarOpiniones( opiniones: string[] ) {
  const cuerpoPeticion = { Textos_espanol: opiniones };
  return await consultar(cuerpoPeticion);
}

export async function consultarOpinion( opinion: string ) {
  const cuerpoPeticion = { Textos_espanol: [opinion] };
  return await consultar(cuerpoPeticion);
}

interface cuerpoPeticionConsulta {
  Textos_espanol: string[];
}
async function consultar(cuerpo:cuerpoPeticionConsulta){
  const respuesta = await fetch('http://127.0.0.1:8000/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cuerpo),
  });
  const datos = await respuesta.json();
  return datos;
}


  export async function entrenarModelo(textos: string[], sdg: number[]) {
    const cuerpo = { Textos_espanol: textos, sdg };
    const respuesta = await fetch('http://127.0.0.1:8000/retrain', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(cuerpo),
    });
    const datos = await respuesta.json();
    return datos;
  }
  