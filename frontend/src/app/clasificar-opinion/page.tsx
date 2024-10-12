"use client";
import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { conteoPorOds, resultadoConsulta } from '../types/tipos';
import { consultarOpinion } from '../services/fetcher';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);


interface resultado {
  prediccion: number;
  probabilidad3: number;
  probabilidad4: number;
  probabilidad5: number;
}
export default function ClasificarOpinion() {
  const [conteo, setConteo] = useState<conteoPorOds>({ conteo3: 0, conteo4: 0, conteo5: 0 });
  const [resultadoActual, setResultadoActual] = useState<resultado | null>(null);
  const [opinion, setOpinion] = useState<string>('');

  const clasificarOpinion = async () => {
    try {
      const respuestaPeticion = await consultarOpinion(opinion);
      const resultado: resultado = convertirRespuesta(respuestaPeticion);
      setConteo((conteo) => actualizarConteo(resultado, conteo));
      setResultadoActual(resultado);
    } catch (error) {
      console.error('Error al clasificar la opinión:', error);
    }
  };
  return (
    <div className="flex flex-col w-full">
      <div className="w-full h-[350px] bg-cover bg-center" style={{ backgroundImage: "url('opinion.png')" }}></div>
      <div className="grid md:grid-cols-2">
        <PanelUsuario resultadoActual={resultadoActual} clasificarOpinion={clasificarOpinion} opinion={opinion} setOpinion={setOpinion} />
        {resultadoActual && <VisualizacionTorta conteo={conteo} />}
      </div>
    </div>
  );
}

function convertirRespuesta( respuestaPeticion: resultadoConsulta ){
  const resultado: resultado = {
    prediccion: respuestaPeticion.predicciones[0],
    probabilidad3: respuestaPeticion.probabilidades[0][0],
    probabilidad4: respuestaPeticion.probabilidades[0][1],
    probabilidad5: respuestaPeticion.probabilidades[0][2],
  };
  return resultado;
}

function actualizarConteo( resultado: resultado, conteo: conteoPorOds ){
  if (resultado.prediccion === 3) {
    conteo.conteo3 += 1;
  } else if (resultado.prediccion === 4) {
    conteo.conteo4 += 1;
  } else {
    conteo.conteo5 += 1;
  }
  return conteo;
}


interface panelUsuarioProps {
  resultadoActual: resultado | null;
  clasificarOpinion: () => void;
  opinion: string;
  setOpinion: (value: string) => void;
}
function PanelUsuario({ resultadoActual, clasificarOpinion, opinion, setOpinion }: panelUsuarioProps) {
  return (
    <div className="p-5 mx-auto w-full">
      <InputDeTexto clasificarOpinion={clasificarOpinion} opinion={opinion} setOpinion={setOpinion} />
      {resultadoActual && <h2 className="text-black"><b>Resultado obtenido:</b> ODS{resultadoActual.prediccion}</h2>}
      {resultadoActual && <h2 className="text-black"><b>Probabilidad ODS 3:</b> {resultadoActual.probabilidad3}</h2>}
      {resultadoActual && <h2 className="text-black"><b>Probabilidad ODS 4:</b> {resultadoActual.probabilidad4}</h2>}
      {resultadoActual && <h2 className="text-black"><b>Probabilidad ODS 5:</b> {resultadoActual.probabilidad5}</h2>}
    </div>
  );
}




interface inputDeTextoProps {
  clasificarOpinion: () => void;
  opinion: string;
  setOpinion: (value: string) => void;
}
function InputDeTexto({clasificarOpinion, opinion, setOpinion}: inputDeTextoProps) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-xl font-semibold text-gray-800" htmlFor="opinion"> Ingresa tu opinión </label>
      <textarea className="w-full h-32 p-2 mt-2 border border-gray-300 rounded text-black" id="opinion" placeholder="Ingresa tu opinión" value={opinion} onChange={(e) => setOpinion(e.target.value)}></textarea>
      <button className="w-40 h-10 mt-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-300 ease-in-out mx-auto" onClick={clasificarOpinion}> Clasificar </button>
    </div>
  );
}

function VisualizacionTorta({ conteo }: { conteo: conteoPorOds }) {
  const data = {
    labels: ['ODS 3', 'ODS 4', 'ODS 5'],
    datasets: [
      {
        label: 'Cantidad de opiniones',
        data: [conteo.conteo3, conteo.conteo4, conteo.conteo5],
        backgroundColor: ['rgba(44,191,173, 1)', 'rgba(245,200,99, 1)', 'rgba(239,83,97, 1)'],
        borderColor: ['rgba(44,191,173, 1)', 'rgba(245,200,99, 1)', 'rgba(239,83,97, 1)'],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="mx-auto p-5">
      <Pie data={data} />
    </div>
  );
}
