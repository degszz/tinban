import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { Menu } from "@/components/menu";
import { CreditsDisplay } from "@/components/credits-display";
import { getUserMeService } from "@/lib/services/auth-service";

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
    logoMobile?: Logo;
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

  // 🔧 Verificar sesión usando JWT de Strapi o cookie de Next.js
  const cookieStore = await cookies();
  const strapiJwt = cookieStore.get("strapi_jwt")?.value;
  const sessionCookie = cookieStore.get("session")?.value;
  
  let session = null;
  let isLoggedIn = false;
  let userCredits = 0;

  // Intentar obtener datos del usuario con JWT de Strapi
  if (strapiJwt) {
    try {
      const userData = await getUserMeService(strapiJwt);
      if (!("error" in userData)) {
        session = {
          userId: userData.id,
          username: userData.username,
          email: userData.email,
        };
        isLoggedIn = true;
        userCredits = userData.credits || 0;
      }
    } catch (error) {
      console.error("Error fetching user with strapi_jwt:", error);
    }
  }

  // Si no funcionó con Strapi JWT, intentar con session cookie (local)
  if (!isLoggedIn && sessionCookie) {
    try {
      const { decrypt } = await import("@/lib/session");
      const decryptedSession = await decrypt(sessionCookie);
      if (decryptedSession?.userId) {
        session = decryptedSession;
        isLoggedIn = true;
        
        // Intentar obtener créditos si tenemos el JWT
        if (strapiJwt) {
          try {
            const userData = await getUserMeService(strapiJwt);
            userCredits = userData.credits || 0;
          } catch (error) {
            console.error("Error fetching credits:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error decrypting session:", error);
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            {/* Logo Desktop */}
            {logo && (
              <img
                src={getStrapiMedia(logo.url)}
                alt={logo.alternativeText || "Tinban Remates"}
                className="h-[60px] w-auto hidden lg:block"
              />
            )}

            {/* Logo Mobile */}
            {data.logoMobile ? (
              <img
                src={getStrapiMedia(data.logoMobile.url)}
                alt={data.logoMobile.alternativeText || "Tinban Remates"}
                className="h-[60px] w-auto block lg:hidden"
              />
            ) : logo ? (
              <img
                src={getStrapiMedia(logo.url)}
                alt={logo.alternativeText || "Tinban Remates"}
                className="h-[60px] w-auto block lg:hidden"
              />
            ) : null}
          </Link>

          {/* Desktop Navigation */}
          {navigationLinks && navigationLinks.length > 0 && (
            <ul className="hidden lg:flex items-center space-x-8">
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

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <CreditsDisplay initialCredits={userCredits} />
                <span className="hidden lg:block text-sm text-gray-600">
                  Hola, {session?.username}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Menu</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" /></svg></Link>
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

          {/* Mobile Auth & Menu Section */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Credits Display */}
            {isLoggedIn && (
              <a className="mr-2" href="/dashboard">
                <CreditsDisplay initialCredits={userCredits} />
              </a>
            )}
            
            {/* Mobile Auth Buttons */}
            {isLoggedIn ? (
              <>
                <Button asChild variant="outline" size="sm" className="text-xs px-2">
                  <Link href="/profile">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" /></svg>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="text-xs px-2">
                  <Link href="/signin">Ingresar</Link>
                </Button>
                <Button asChild size="sm" className="text-xs px-2">
                  <Link href="/signup">Registrarse</Link>
                </Button>
              </>
            )}
            
            {/* Mobile Menu */}
            <Menu
              navigationLinks={navigationLinks || []}
              isLoggedIn={isLoggedIn}
              username={session?.username}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
