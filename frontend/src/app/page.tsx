import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <div className="w-full h-[350px] bg-cover bg-center" style={{ backgroundImage: "url('banner.png')" }}></div>
      <Presentacion />
      <Resultados />
    </div>
  );
}

function Presentacion() {
  return  (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-4 text-left text-black"> UNFPA en Colombia </h1>
        <h2 className="text-2xl mb-6 text-left   text-[#f2921d]"> Asegurando derechos y opciones para todas las personas </h2>

        <p className="text-gray-700 text-lg mb-8">
          El Fondo de Población de las Naciones Unidas - UNFPA - es la agencia de la ONU para la salud sexual y reproductiva. 
          Apoya a Colombia en la producción y utilización de datos socio-demográficos que sirven de base para la formulación
          de políticas de desarrollo sostenible y programas de reducción de la pobreza y construcción de paz, considerando
          aspectos humanitarios. Nuestro mandato busca garantizar que todo embarazo sea deseado, cada parto sea seguro y
          cada persona joven alcance su pleno desarrollo y cumplir con la promesa de no dejar a nadie atrás. UNFPA promueve
          mayores oportunidades para que mujeres, adolescentes y jóvenes gocen de sus vidas productivas y saludables, al 
          tiempo que incentiva la integración de las dinámicas poblacionales en los ejercicios de planeación nacional y
          territorial, el respeto total de los derechos humanos y la igualdad de género.
        </p>
      </div>
    </div>
  )
}

function Resultados() {
  const resultados = [
    {
      imagen: "/home1.png",
      alt: "Millones de mujeres carecen de servicios esenciales",
      texto: "Millones de mujeres carecen de servicios esenciales",
    },
    {
      imagen: "/home2.png",
      alt: "No se produzcan muertes maternas evitables",
      texto: "No se produzcan muertes maternas evitables",
    },
    {
      imagen: "/home3.png",
      alt: "Que las mujeres y niñas no sean víctimas de violencia",
      texto: "Que las mujeres y las niñas no sean víctimas de violencia",
    },
  ];


  return (
    <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-8 text-black">
            Nuestros tres resultados transformadores
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {resultados.map((resultado) => (
              <Resultado
                key={resultado.texto}
                imagen={resultado.imagen}
                alt={resultado.alt}
                texto={resultado.texto}
              />
            ))}
          </div>
        </div>
      </div>
  )
}

function Resultado({ imagen, alt, texto }: { imagen: string; alt: string; texto: string }) {
  return (
    <div className=" shadow-lg rounded-lg text-center">
    <Image src={imagen} alt={alt} width={200} height={150} objectFit="cover" className="w-full h-64"/>
      <p className="font-bold text-xl text-[#f2921d]">
        {texto}
      </p>
    </div>
  )
}