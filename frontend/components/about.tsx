import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, UserPlus, CreditCard, MousePointer, Eye, Package } from 'lucide-react';

// Tipos para el contenido de Strapi
interface NosotrosData {
    aboutTitle: string;
    aboutDescription: string;
    howItWorksTitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
}

// Iconos para cada paso
const stepIcons = [UserPlus, CreditCard, MousePointer, Eye, Package];

// Props del componente

export default function Nosotros() {


    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 mb-4">
                    <Gavel className="w-8 h-8 text-blue-600" />
                    <h1 className="text-4xl font-bold text-gray-900">Tinban</h1>
                </div>
                <p className="text-lg text-gray-600">Remates online sin vueltas</p>
            </div>

            {/* Sobre Nosotros */}
            <Card className="mb-8 border-2 hover:shadow-lg transition-shadow py-5">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">
                        Sobre Nosotros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 leading-relaxed text-l ">
                        Tinban es una plataforma de remates online donde podés comprar y vender de forma simple y sin vueltas. Creamos este espacio para que cualquiera pueda participar en remates desde su casa, ver las pujas en tiempo real y aprovechar buenas oportunidades.
                        <br />
                        <br />
                        Nuestro objetivo es que los remates sean claros, accesibles y confiables, usando la tecnología para hacer todo más fácil.
                    </p>
                </CardContent>
            </Card>

            <hr />
            {/* Cómo funciona */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center mt-4">
                    Cómo funciona Tinban
                </h2>

                <div className="space-y-6">
                    <Card
                        className="border-l-4 border-l-blue-600 hover:shadow-md transition-all hover:translate-x-1"
                    >
                        <CardContent className="flex items-start gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-bold text-blue-600">
                                1
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Registrate en la plataforma
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="border-l-4 border-l-blue-600 hover:shadow-md transition-all hover:translate-x-1"
                    >
                        <CardContent className="flex items-start gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-bold text-blue-600">
                                        2
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Cargá créditos en tu cuenta
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="border-l-4 border-l-blue-600 hover:shadow-md transition-all hover:translate-x-1"
                    >
                        <CardContent className="flex items-start gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-bold text-blue-600">
                                        3
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                       Elegí un lote y hacé tu puja
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="border-l-4 border-l-blue-600 hover:shadow-md transition-all hover:translate-x-1"
                    >
                        <CardContent className="flex items-start gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-bold text-blue-600">
                                        4
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Seguís el remate online en tiempo real
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="border-l-4 border-l-blue-600 hover:shadow-md transition-all hover:translate-x-1"
                    >
                        <CardContent className="flex items-start gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-bold text-blue-600">
                                        5
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Si ganás, coordinás la entrega o retiro del producto
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="mt-12 text-center">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="py-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            ¿Listo para empezar?
                        </h3>
                        <p className="text-gray-700 mb-4">
                            Unite a Tinban y empezá a participar en remates desde tu casa
                        </p>
                        <a className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors" href='/signup'>
                            Registrate ahora
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Datos de ejemplo (esto vendría de Strapi)
export const ejemploData: NosotrosData = {
    aboutTitle: "Sobre Nosotros",
    aboutDescription: "Tinban es una plataforma de remates online donde podés comprar y vender de forma simple y sin vueltas. Creamos este espacio para que cualquiera pueda participar en remates desde su casa, ver las pujas en tiempo real y aprovechar buenas oportunidades.",
    howItWorksTitle: "¿Cómo funciona Tinban?",
    step1: "Registrate en la plataforma",
    step2: "Cargá créditos en tu cuenta",
    step3: "Elegí un lote y hacé tu puja",
    step4: "Seguís el remate online en tiempo real",
    step5: "Si ganás, coordinás la entrega o retiro del producto"
};