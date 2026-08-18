
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export function AdvancedSimulatorTab() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Simulador Avanzado (Falstad)</CardTitle>
        <CardDescription>
          Un simulador de circuitos electrónicos completo, integrado directamente en SaberLabs para tu experimentación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertTitle>Simulador Externo</AlertTitle>
          <AlertDescription>
            Estás utilizando el simulador de circuitos de Falstad. Para una mejor experiencia o si tienes problemas de visualización, puedes {" "}
            <Link href="https://www.falstad.com/circuit/circuitjs.html" target="_blank" className="font-bold underline">
              abrirlo en una nueva pestaña
            </Link>.
          </AlertDescription>
        </Alert>
        <div className="aspect-video w-full overflow-hidden rounded-lg border shadow-sm">
          <iframe
            src="https://www.falstad.com/circuit/circuitjs.html"
            className="w-full h-full border-0"
            title="Falstad Circuit Simulator"
          />
        </div>
      </CardContent>
    </Card>
  );
}
