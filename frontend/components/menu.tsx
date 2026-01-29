"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu as MenuIcon } from "lucide-react";

interface LinkItem {
  id: number;
  href: string;
  label: string;
  isExternal: boolean | null;
}

interface MenuProps {
  navigationLinks: LinkItem[];
  isLoggedIn: boolean;
  username?: string;
}

export function Menu({ navigationLinks, isLoggedIn, username }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  let isAdmin = false; // 👈 NUEVO: Variable para determinar si es admin

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  const linkVariants = {
    closed: {
      opacity: 0,
      x: 20,
    },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <>
      {/* Botón Hamburguesa */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-50"
        aria-label="Abrir menú"
      >
        <MenuIcon className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={toggleMenu}
            className="fixed inset-0 bg-black/50 z-[998] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Panel del Menú */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed right-0 top-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-[999] md:hidden overflow-y-auto"
          >
            {/* Header del Menú */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Menú</h2>
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Usuario Info */}
            {isLoggedIn && username && (
              <motion.div
                custom={0}
                variants={linkVariants}
                className="px-6 py-4 bg-blue-50 border-b"
              >
                <p className="text-sm text-gray-600">Hola,</p>
                <p className="text-lg font-semibold text-blue-600">
                  {username}
                </p>
              </motion.div>
            )}

            {/* Links de Navegación */}
            <nav className="py-4">
              {navigationLinks.map((link, index) => {
                const isExternal = link.isExternal === true;

                return (
                  <motion.div
                    key={link.id}
                    custom={index + 1}
                    variants={linkVariants}
                  >
                    {isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={toggleMenu}
                        className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={toggleMenu}
                        className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                      >
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                );
              })}

              {/* 🔐 ADMIN ONLY - Botón visible solo para administradores */}
              {isAdmin && (
                <Link
                  href="/admin/live-stream"
                  className="w-full text-center text-black border bg-[#fadc70] border-[#E5E5E5] hover:bg-[#f0b100] py-2 flex h-fit justify-center items-center rounded-md hover:scale-105 transition-all duration-200 font-medium"
                >
                  Administrador
                </Link>
              )}
          </nav>
          </motion.div>
        )}
    </AnimatePresence >
    </>
  );
}