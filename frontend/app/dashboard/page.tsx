import { getUser } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RequestCreditsDialog } from "@/components/request-credits-dialog";
import { getUserMeService } from "@/lib/services/auth-service";
import { getUserFavorites } from "@/lib/services/favorites-service";
import { getStrapiData, homePageQuery } from "@/lib/strapi";
import { FavoritesSection } from "@/components/favorites-section";
import { cookies } from "next/headers";
import { Coins } from "lucide-react";

export default async function DashboardPage() {
  const user = await getUser();

  // Obtener créditos del usuario
  let userCredits = 0;
  try {
    const jwtCookie = (await cookies()).get("strapi_jwt")?.value;
    if (jwtCookie) {
      const userData = await getUserMeService(jwtCookie);
      userCredits = userData.credits || 0;
    }
  } catch (error) {
    console.error("Error fetching user credits:", error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <RequestCreditsDialog />
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
                Disponibles para pujar
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
                <Coins className="h-16 w-16 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

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
          </div>
        </div>

        {/* Favoritos Section */}
        <div className="mb-8 ">
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
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Mis Ofertas</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/#auctions">Ir a Favoritos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
