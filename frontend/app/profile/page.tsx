import { getUser } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Gestiona tu información personal
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-16 mb-4">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
                <span className="text-5xl font-bold text-gray-700 dark:text-gray-300">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user?.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Miembro activo
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Nombre de Usuario
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.username}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      ID de Usuario
                    </p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      #{user?.id}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Estado
                    </p>
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">
                      ✓ Activo
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Estadísticas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      12
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Subastas
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      28
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ofertas
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      5
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ganadas
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      8
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Favoritos
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-4">
                <Button asChild className="flex-1">
                  <Link href="/dashboard">Volver al Dashboard</Link>
                </Button>
                <Button variant="outline" className="flex-1">
                  Editar Perfil
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
