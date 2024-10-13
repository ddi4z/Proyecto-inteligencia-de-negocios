
"use client";
import Image from "next/image";
import * as XLSX from 'xlsx';
import ReactWordcloud from 'react-wordcloud';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { resultadoEntrenamiento } from "../types/tipos";
import { useState } from "react";
import { entrenarModelo } from "../services/fetcher";
import Spinner from '@/app/components/spinner'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export default function EntrenarModelo() {
  const [resultadoConsulta, setResultadoConsulta] = useState<resultadoEntrenamiento | null>(null);
  const [cargando, setCargando] = useState(false);
  return (
    <div className="flex flex-col w-full">
      <div className="w-full h-[350px] bg-cover bg-center" style={{ backgroundImage: "url('entrenamiento.png')" }}></div>
      {!cargando && <CargarArchivo setResultadoConsulta={setResultadoConsulta} setCargando={setCargando}/>}
      {cargando && <Spinner mensajeDeCarga="Reentrenando el modelo" mensajeAuxiliar="Esto puede tardar unos minutos"/>}
      {resultadoConsulta && <ResumenMetricas resultadoConsulta={resultadoConsulta} />}
      {resultadoConsulta && <PalabrasMasComunes resultadoConsulta={resultadoConsulta} />}
    </div>
  );
}

function procesarArchivo(archivo: File): Promise<{ Textos_espanol: string[], sdg: number[] }> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        try {
          const textosEspanol = convertirArchivoAJSON(data);
          resolve(textosEspanol);
        } catch (error) {
          alert(`Error procesando el archivo: ${error}`);
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

function convertirArchivoAJSON(data: any): { Textos_espanol: string[], sdg: number[] } {
  const cadenaBinaria = new Uint8Array(data as ArrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), "");
  const libroXLSX = XLSX.read(cadenaBinaria, { type: 'binary' });
  const nombreHoja = libroXLSX.SheetNames[0];
  const hojaXLSX = libroXLSX.Sheets[nombreHoja];  
  const jsonDeHoja = XLSX.utils.sheet_to_json(hojaXLSX);
  const filasValidas = jsonDeHoja.filter((row: any) => row["Textos_espanol"] !== undefined && row["sdg"] !== undefined);
  const textosEspanol = filasValidas.map((row: any) => row["Textos_espanol"]);
  const clasificacion = filasValidas.map((row: any) => row["sdg"]);
  if (textosEspanol.length === 0 || clasificacion.length === 0) {
    throw new Error("No se encontraron textos y/o etiquetas en el archivo.");
  }
  return { Textos_espanol: textosEspanol, sdg: clasificacion }
}

interface cargarArchivoProps {
  setResultadoConsulta: (data: any) => void;
  setCargando: (cargando: boolean) => void;
}
function CargarArchivo({setResultadoConsulta, setCargando}: cargarArchivoProps) {

  const manejarCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCargando(true);
    setResultadoConsulta(null);
    const archivo = e.target.files?.[0] || null;
    if (archivo) {
      procesarArchivo(archivo)
        .then(async (resultado) => {
          setResultadoConsulta(await entrenarModelo(resultado.Textos_espanol, resultado.sdg));
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setCargando(false);
        });
    } else {
      setCargando(false);
    }
    e.target.value = '';
  };

  return (
    <div className='p-5'>
      <h2 className='font-bold text-xl'>Archivo de entrenamiento</h2>
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

function ResumenMetricas({resultadoConsulta}: {resultadoConsulta: resultadoEntrenamiento}) {
  const metricas = [
    {metrica: "Precision", valor: 100 *  resultadoConsulta.precision, color: {r: 34, g: 197, b: 94}},
    {metrica: 'Recall', valor: 100 *  resultadoConsulta.recall, color: {r: 59, g: 130, b: 246}},
    {metrica: 'F1', valor: 100 * resultadoConsulta.f1, color: {r: 244, g: 63, b: 94}},
    {metrica: 'Exactitud', valor: 100 * resultadoConsulta.accuracy, color: {r: 234, g: 179, b: 8}},
  ]
  return (
    <div className='p-5'>
      <h2 className="font-bold text-xl text-black">Resumen de métricas</h2>
      <div className="lg:flex  border-2 rounded border-orange-300">
        {metricas.map((metrica, index) => (
          <GraficoMetrica key={index} nombre={metrica.metrica} valor={metrica.valor} color={metrica.color} />
        ))}
      </div>
    </div>
  )
}

function PalabrasMasComunes({resultadoConsulta}: {resultadoConsulta: resultadoEntrenamiento}) {
  const palabrasODS3 = resultadoConsulta.words[0].map((palabra) => ({text: palabra[0], value: palabra[1]}))
  const palabrasODS4 = resultadoConsulta.words[1].map((palabra) => ({text: palabra[0], value: palabra[1]}))
  const palabrasODS5 = resultadoConsulta.words[2].map((palabra) => ({text: palabra[0], value: palabra[1]}))
  return (
    <div className='p-5'>
      <h2 className="font-bold text-xl text-black">Palabras más relevantes</h2>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 border-2 rounded border-orange-300  ">
        <PalabrasPorODS palabras={palabrasODS3} numeroOds={3} />
        <PalabrasPorODS palabras={palabrasODS4} numeroOds={4} />
        <PalabrasPorODS palabras={palabrasODS5} numeroOds={5} />
      </div>
    </div>
  )
}

interface palabra {
  text: string;
  value: number;
}
function PalabrasPorODS({palabras, numeroOds}: {palabras: palabra[], numeroOds: number}) {
  return (
    <div>
      <h2 className="text-center font-semibold text-lg">ODS {numeroOds}</h2>
      <div className="">
        <ReactWordcloud words={palabras} options={{
          colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
          enableTooltip: true, deterministic: false, fontFamily: "impact",
          fontSizes: [5, 60], fontStyle: "normal", fontWeight: "normal", padding: 1, rotations: 3,
          rotationAngles: [0, 90], scale: "sqrt", spiral: "archimedean", transitionDuration: 1000,
        }} />
      </div>
    </div>
  )
}

interface colorRGB {
  r: number;
  g: number;
  b: number;
}
interface metrica {
  nombre: string;
  valor: number;
  color: colorRGB;
}
function GraficoMetrica({nombre, valor, color}: metrica) {
  const data = {
    datasets: [{
      data: [valor, 100 - valor],
      backgroundColor: [`rgba(${color.r},${color.g},${color.b}, 1)`, 'rgba(255, 255, 255, 1)'],
      borderColor: [`rgba(${color.r},${color.g},${color.b}, 1)`, `rgba(${color.r},${color.g},${color.b}, 0.5)`],
      borderWidth: 1,
    }],
  };
  const options = {
    plugins: {tooltip: {enabled: false}},
    maintainAspectRatio: true,
    aspectRatio: 2,
  };
  return (
    <div className='mx-auto p-5'>
      <h2 className='text-center text-black font-semibold text-lg'>{nombre}</h2>
      <Pie data={data} options={options}/>
      <p className="text-gray-500 text-md text-center">{valor} %</p>
    </div>
  );
}

