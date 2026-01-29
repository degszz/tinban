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
        <div className="container mx-auto px-4 py-12 max-w-4xl ">
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
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F6BCE" className="icon icon-tabler icons-tabler-outline icon-tabler-user-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h3.5" /><path d="M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97l-3.39 3.42h-3v-3l3.42 -3.39" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 ">
                                    <span className="text-2xl font-bold  text-blue-600">
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
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F6BCE"  className="icon icon-tabler icons-tabler-outline icon-tabler-brand-whatsapp"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" /><path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 ">
                                    <span className="text-2xl font-bold  text-blue-600">
                                        2
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Verificate mandando por Whatsapp
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className="border-l-4 border-l-blue-600 hover:shadow-md transition-all hover:translate-x-1"
                    >
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F6BCE"  className="icon icon-tabler icons-tabler-outline icon-tabler-coin"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1" /><path d="M12 7v10" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 ">
                                    <span className="text-2xl font-bold  text-blue-600">
                                        3
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                       Solicita créditos para participar en los remates 
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
                                <svg xmlns="http://center.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F6BCE"  className="icon icon-tabler icons-tabler-outline icon-tabler-gavel"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 10l7.383 7.418c.823 .82 .823 2.148 0 2.967a2.11 2.11 0 0 1 -2.976 0l-7.407 -7.385" /><path d="M6 9l4 4" /><path d="M13 10l-4 -4" /><path d="M3 21h7" /><path d="M6.793 15.793l-3.586 -3.586a1 1 0 0 1 0 -1.414l2.293 -2.293l.5 .5l3 -3l-.5 -.5l2.293 -2.293a1 1 0 0 1 1.414 0l3.586 3.586a1 1 0 0 1 0 1.414l-2.293 2.293l-.5 -.5l-3 3l.5 .5l-2.293 2.293a1 1 0 0 1 -1.414 0" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 ">
                                    <span className="text-2xl font-bold  text-blue-600">
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
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F6BCE"  className="icon icon-tabler icons-tabler-outline icon-tabler-trophy"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 21l8 0" /><path d="M12 17l0 4" /><path d="M7 4l10 0" /><path d="M17 4v8a5 5 0 0 1 -10 0v-8" /><path d="M3 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /></svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 ">
                                    <span className="text-2xl font-bold  text-blue-600">
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