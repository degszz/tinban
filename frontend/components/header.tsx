import Link from "next/link";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

interface LinkItem {
  id: number;
  href: string;
  label: string;
  isExternal: boolean | null;
}

interface Logo {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
}

interface HeaderProps {
  data: {
    id: number;
    logo: Logo;
    Link: LinkItem[];
  };
}

export async function Header({ data }: HeaderProps) {
  console.log("Header received data:", JSON.stringify(data, null, 2));

  if (!data) {
    console.warn("No header data provided");
    return null;
  }

  const { logo, Link: navigationLinks } = data;

  // Check if user is logged in
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const isLoggedIn = !!session?.userId;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {logo && (
            <Link href="/" className="flex items-center">
              <img
                src={getStrapiMedia(logo.url)}
                alt={logo.alternativeText || "Tinban Remates"}
                className="h-12 w-auto"
              />
            </Link>
          )}

          {navigationLinks && navigationLinks.length > 0 && (
            <ul className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => {
                const isExternal = link.isExternal === true;

                if (isExternal) {
                  return (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-600">
                  Hola, {session.username}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile">Perfil</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/signin">Iniciar Sesión</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Registrarse</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
