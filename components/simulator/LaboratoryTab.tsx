
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InteractiveMeasurement } from "../InteractiveMeasurement";

export function LaboratoryTab({ defaultTab }: { defaultTab?: string }) {

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Laboratorio Interactivo</CardTitle>
                <CardDescription>
                    Experimenta con un circuito interactivo. Ajusta los parámetros y usa el voltímetro virtual para medir el voltaje en diferentes puntos del circuito.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <InteractiveMeasurement />
            </CardContent>
        </Card>
    )
}
