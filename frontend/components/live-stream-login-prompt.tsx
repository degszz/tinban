import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LiveStreamLoginPrompt() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Youtube className="w-16 h-16 text-red-600" />
              <Lock className="w-8 h-8 text-red-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                🔴 Transmisión en Vivo Disponible
              </h3>
              <p className="text-gray-600 max-w-md">
                Inicia sesión para ver nuestra transmisión en vivo y participar en el chat con otros usuarios.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/signin">
                <Button className="bg-red-600 hover:bg-red-700">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">
                  Crear Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}