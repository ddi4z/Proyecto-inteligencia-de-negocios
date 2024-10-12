"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); 
  const links = [
    { href: '/entrenar-modelo', label: 'Entrenar modelo' },
    { href: '/clasificar-archivo', label: 'Clasificar archivo' },
    { href: '/clasificar-opinion', label: 'Clasificar opinión' },
  ];

  const toggleMenu = () => {setIsOpen(!isOpen);};

  return (
    <nav className="bg-[#F8981D] shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image src="/logo.jpg" alt="UNFPA Logo" width={60} height={60} />
          </Link>

          <div className="hidden md:flex space-x-8 text-white text-sm">
            <Enlaces links={links} pathname={pathname} />
          </div>
            <BotonResponsive isOpen={isOpen} toggleMenu={toggleMenu} />
        </div>
      </div>
      <OpcionesMenu isOpen={isOpen} links={links} pathname = {pathname} />
    </nav>
  );
}

function OpcionesMenu({ isOpen, links, pathname }: { isOpen: boolean; links: { href: string; label: string }[]; pathname: string }) {
  return (
    <div className={`md:hidden bg-[#f2921d] px-4 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0' } overflow-hidden`} >
      <div className="flex flex-col space-y-2 py-2 text-white text-sm">
        <Enlaces links={links} pathname={pathname} />
      </div>
    </div>
  )
}

function Enlaces({ links, pathname }: { links: { href: string; label: string }[]; pathname: string }) {
  return (
    <>
      {links.map((link: { href: string; label: string }) => (
        <Link key={link.href} href={link.href} className={`${pathname === link.href ? 'font-bold' : ''}`}>
          {link.label}
        </Link>
    ))}
    </>
  )
}

function BotonResponsive({ isOpen, toggleMenu }: { isOpen: boolean; toggleMenu: () => void }) {
    return (
      <div className="md:hidden">
        <button onClick={toggleMenu} className="text-white focus:outline-none" aria-label="Toggle menu">
          <IconoResponsive isOpen={isOpen} />
        </button>
      </div>
    )
}

function IconoResponsive({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
    className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {isOpen ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    )}
  </svg>
  )
}
