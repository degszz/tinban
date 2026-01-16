import { getUser } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RequestCreditsDialog } from "@/components/request-credits-dialog";
import { getUserMeService } from "@/lib/services/auth-service";
import { getUserFavorites } from "@/lib/services/favorites-service";
import { getStrapiData, homePageQuery } from "@/lib/strapi";
import { FavoritesSection } from "@/components/favorites-section";
import { VerificationBanner } from "@/components/verification-banner";
import { cookies } from "next/headers";
import { Coins, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();

  // Obtener créditos y estado de confirmación del usuario
  let userCredits = 0;
  let isConfirmed = false;
  let userData = null;
  
  try {
    const jwtCookie = (await cookies()).get("strapi_jwt")?.value;
    if (jwtCookie) {
      userData = await getUserMeService(jwtCookie);
      userCredits = userData.credits || 0;
      isConfirmed = userData.confirmed === true; // ✅ Obtener estado de confirmación
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  // Obtener favoritos del usuario
  const userFavorites = await getUserFavorites();

  // Obtener todas las subastas de Strapi
  const strapiData = await getStrapiData("/api/home-page", homePageQuery);
  const auctionsSection = strapiData.data?.sections?.find(
    (s: any) => s.__component === 'layout.auctions-section'
  );
  const allAuctions = auctionsSection?.cards || [];

  // Filtrar solo las subastas favoritas
  const favoriteAuctions = allAuctions.filter((auction: any) => {
    const auctionId = auction.documentId || auction.id.toString();
    return userFavorites.includes(auctionId);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 🔔 Banner de Verificación - NUEVO */}
        <VerificationBanner 
          isConfirmed={isConfirmed} 
          userName={user?.username}
        />

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Menu
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Bienvenido de nuevo, {user?.username}!
            </p>
          </div>
          
          {/* Botón de Solicitar Créditos - Deshabilitado si no está confirmado */}
          {isConfirmed ? (
            <RequestCreditsDialog />
          ) : (
            <div className="relative group">
              <Button 
                className="w-full sm:w-auto opacity-50 cursor-not-allowed" 
                size="lg"
                disabled
              >
                <Coins className="h-5 w-5 mr-2" />
                🔒 Solicitar Créditos
              </Button>
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg">
                  Verifica tu cuenta para solicitar créditos
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-br from-[#115FB7]/60 to-[#115FB7]/80 rounded-lg shadow-lg p-8 mb-8 border-2 border-[#115FB7]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-6 w-6 text-white" />
                <p className="text-sm font-medium text-white">
                  Tus Créditos
                </p>
              </div>
              <p className="text-5xl font-bold text-white">
                ${userCredits.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-white">
                {isConfirmed 
                  ? "Disponibles para pujar" 
                  : "⚠️ Verifica tu cuenta para usar créditos"}
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
                {isConfirmed ? (
                  <Coins className="h-16 w-16 text-yellow-500" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Verificación - NUEVO */}
        {!isConfirmed && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 p-6 rounded-lg mb-8 shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-2">
                  Funcionalidades Limitadas
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">
                  Hasta que tu cuenta sea verificada, no podrás:
                </p>
                <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-400">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✗</span>
                    <span>Solicitar créditos adicionales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✗</span>
                    <span>Realizar pujas en subastas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">✗</span>
                    <span>Participar en remates activos</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-800/30 rounded border border-orange-200 dark:border-orange-700">
                  <p className="text-xs text-orange-800 dark:text-orange-300 font-medium">
                    💡 Usa el banner amarillo arriba para verificar tu cuenta por WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Subastas Activas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  12
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ofertas Realizadas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  28
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ganadas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  5
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Información de Usuario
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 w-32">Usuario:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {user?.username}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 w-32">Email:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {user?.email}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 w-32">ID:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                #{user?.id}
              </span>
            </div>
            {/* Estado de Verificación */}
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 w-32">Estado:</span>
              <span className={`font-medium flex items-center gap-2 ${
                isConfirmed 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {isConfirmed ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Verificado
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    Pendiente de verificación
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Favoritos Section */}
        <div className="mb-8">
          <FavoritesSection 
            favorites={favoriteAuctions}
            userId={user?.id?.toString() || ""}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="w-full">
              <Link href="/">Ver Subastas</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/profile">Mi Perfil</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}