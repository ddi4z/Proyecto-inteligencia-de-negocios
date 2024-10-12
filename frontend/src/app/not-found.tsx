import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#f2921d]">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-black">Página no encontrada</h2>
        <p className="mt-2 text-gray-600"> Lo sentimos, la página que buscas no existe.</p>
        <div className="mt-6">
          <Link href="/" className="inline-block px-4 py-2 bg-[#f2921d] text-white rounded hover:bg-[#d58015] transition duration-300">
            Regresar a Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
