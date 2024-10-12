"use client";
import { useState } from 'react';
import * as XLSX from 'xlsx';
import Image from 'next/image';
import { Bar, Pie } from 'react-chartjs-2';
import { conteoPorOds, promedioPorOds, resultadoConsulta } from '@/app/types/tipos';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { consultarOpiniones } from '../services/fetcher';
import Spinner from '../components/spinner';

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

export default function ClasificarArchivo() {
  const [resultadoConsulta, setResultadoConsulta] = useState<resultadoConsulta | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null); 
  const [textosOriginales, setTextosOriginales] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <div className="w-full h-[350px] bg-cover bg-center" style={{ backgroundImage: "url('/archivo.png')" }}></div>
      {!cargando && <CargarArchivo setResultadoConsulta={setResultadoConsulta} setNombreArchivo={setNombreArchivo} setTextosOriginales={setTextosOriginales} setCargando={setCargando} />}
      {cargando && <Spinner mensajeDeCarga="Clasificando opiniones"  mensajeAuxiliar="Esto puede tardar unos segundos"/> }
      {resultadoConsulta && nombreArchivo && ( <Resultados resultadoConsulta={resultadoConsulta} nombreArchivo={nombreArchivo} textos={textosOriginales} />)}
      {resultadoConsulta && nombreArchivo && ( <VisualizarPromedio probabilidades = {resultadoConsulta.probabilidades} />)}
    </div>
  );
}

function Resultados({ textos, resultadoConsulta, nombreArchivo }: {textos: string[], resultadoConsulta: resultadoConsulta, nombreArchivo: string }) {
  return (
    <div className='p-5'>
      <h2 className='font-bold text-xl'>Resumen de clasificación</h2>
      <div className='grid md:grid-cols-3 border-2 rounded border-orange-300  text-center'>
        <div className="flex flex-col justify-center h-full">
          <h2 className="font-semibold text-lg text-black mt-4">Archivo seleccionado</h2>
          <p className="text-gray-800 my-auto">{nombreArchivo}</p>
        </div>
        <VisualizacionTorta resultadoConsulta={resultadoConsulta} />
        <ExportarResultados resultadoConsulta={resultadoConsulta} nombreArchivo={nombreArchivo} textos={textos} />
      </div>
    </div>
  );
}

function ExportarResultados({ textos, resultadoConsulta, nombreArchivo }: { textos: string[], resultadoConsulta: resultadoConsulta, nombreArchivo: string }) {
  const textosOriginales = resultadoConsulta.predicciones;

  const handleExportar = () => {
    const wb = XLSX.utils.book_new();
    const data = textosOriginales.map((texto, index) => ({
      'Textos_espanol': textos[index],
      'sdg': resultadoConsulta.predicciones[index],
      'Probabilidades': resultadoConsulta.probabilidades[index].join(", ")
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
    const nuevoNombreArchivo = obtenerNombreArchivoClasificado(nombreArchivo);
    XLSX.writeFile(wb, nuevoNombreArchivo);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="font-semibold text-lg text-black mb-4 mt-4">Descargar archivo</h2>
      <div className='flex items-center h-full justify-center'>
        <button onClick={handleExportar} className="md:flex rounded hover:bg-gray-200 transition-colors duration-300 ease-in-out border border-gray-400 p-4 items-center ">
          <Image src="bajarArchivo.svg" alt="Exportar resultados" width={20} height={20} className="mx-auto" />
          <p className="md:mx-2">{obtenerNombreArchivoClasificado(nombreArchivo)}</p>
        </button>
      </div>
    </div>
  );
}

function obtenerNombreArchivoClasificado(nombreArchivo: string) {
  const nuevoNombreArchivo = nombreArchivo.replace(/\.[^/.]+$/, "") + "_resultados.xlsx";
  return nuevoNombreArchivo;
}

function VisualizacionTorta({ resultadoConsulta }: { resultadoConsulta: resultadoConsulta }) {
  const conteo: conteoPorOds = hacerConteo(resultadoConsulta.predicciones);
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
  const options = {
    maintainAspectRatio: true,
    aspectRatio: 2,
  };
  return (
    <div>
      <h2 className="font-semibold text-lg text-black mt-4">Clasificación</h2>
        <div className="mx-auto p-5">
          <Pie data={data} width={250} height={250} options={options} />
        </div>
    </div>
  );
}

function VisualizarPromedio({ probabilidades }: { probabilidades: number[][] }) {
  const promedios = promedioProbabilidades(probabilidades);
  const data = {
    labels: ['ODS 3', 'ODS 4', 'ODS 5'],
    datasets: [
      {
        label: 'Promedio de probabilidad (%)',
        data: [100 * promedios.promedio3, 100 * promedios.promedio4, 100 * promedios.promedio5],
        backgroundColor: '#F8981D',
      }
    ],
  };

  return (
    <div className='p-5'>
      <h2 className='font-bold text-xl'>Promedio de probabilidad por ODS</h2>
      <div className='h-96 flex items-center justify-center border-2 rounded border-orange-300 p-6'>
        <Bar data={data} options={{responsive: true}}/>
      </div>
    </div>


  );
}


function promedioProbabilidades(probabilidades: number[][]) {
  const promedios:promedioPorOds = { promedio3: 0, promedio4: 0, promedio5: 0 };
  probabilidades.forEach((probabilidad) => {
    promedios.promedio3 += probabilidad[0];
    promedios.promedio4 += probabilidad[1];
    promedios.promedio5 += probabilidad[2];
  });
  promedios.promedio3 /= probabilidades.length;
  promedios.promedio4 /= probabilidades.length;
  promedios.promedio5 /= probabilidades.length;
  return promedios;
}


function hacerConteo(predicciones: number[]) {
  const prediccionesPorODS: conteoPorOds = { conteo3: 0, conteo4: 0, conteo5: 0 };

  predicciones.forEach(prediccion => {
    if (prediccion === 3) prediccionesPorODS.conteo3++;
    else if (prediccion === 4) prediccionesPorODS.conteo4++;
    else if (prediccion === 5) prediccionesPorODS.conteo5++;
  });

  return prediccionesPorODS;
}



function procesarArchivo(archivo: File): Promise<{ Textos_espanol: string[] }> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        try {
          const textosEspanol = convertirArchivoAJSON(data);
          resolve(textosEspanol);
        } catch (error) {
          reject(`Error procesando el archivo: ${error}`);
        }
      }
    };
    lector.onerror = () => {
      reject("Error leyendo el archivo.");
    };
    lector.readAsArrayBuffer(archivo);
  });
}

function convertirArchivoAJSON(data: any) {
  const cadenaBinaria = new Uint8Array(data as ArrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), "");
  const libroXLSX = XLSX.read(cadenaBinaria, { type: 'binary' });
  const nombreHoja = libroXLSX.SheetNames[0];
  const hojaXLSX = libroXLSX.Sheets[nombreHoja];  
  const jsonDeHoja = XLSX.utils.sheet_to_json(hojaXLSX);
  const textosEspanol = jsonDeHoja.map((row: any) => row["Textos_espanol"]);
  return { Textos_espanol: textosEspanol }
}


interface cargarArchivoProps {
  setResultadoConsulta: (data: any) => void;
  setNombreArchivo: (nombre: string) => void;
  setTextosOriginales: (textos: string[]) => void;
  setCargando: (cargando: boolean) => void;
}

function CargarArchivo({ setResultadoConsulta, setNombreArchivo, setTextosOriginales, setCargando }: cargarArchivoProps) {
  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivoSeleccionado = e.target.files?.[0] || null;
    if (archivoSeleccionado) {
      setCargando(true);
      setResultadoConsulta(null);
      setNombreArchivo(archivoSeleccionado.name);
      procesarArchivo(archivoSeleccionado)
        .then(async (resultado) => {
          setTextosOriginales(resultado.Textos_espanol); 
          setResultadoConsulta(await consultarOpiniones(resultado.Textos_espanol));

        })
        .catch((error) => {
          console.error(error);
        }).finally(() => {
          setCargando(false);
        });
    }
  };

  return (
    <div className='p-5 '>
      <h2 className='font-bold text-xl'>Clasificar archivo de opiniones</h2>
      <label htmlFor="archivo" className="text-xl text-gray-800 text-center">
        <div className="flex flex-col items-center justify-center w-full h-64 cursor-pointer border border-gray-300 hover:border-orange-300 transition-colors duration-300 ease-in-out rounded">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Image src="/subirArchivo.svg" alt="Subir archivo" width={50} height={50} />
            <p className="my-2 mb-2 text-sm text-white text-center py-auto bg-orange-500 rounded hover:bg-orange-600 transition-colors duration-300 ease-in-out w-40 h-10 border radius-4 flex items-center justify-center">
              Selecciona archivos
            </p>
          </div>
          <input id="archivo" type="file" className="hidden" onChange={manejarCambioArchivo} />
        </div>
      </label>
    </div>
  );
}

