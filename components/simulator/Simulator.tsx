
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BasicCircuitTab } from "./BasicCircuitTab";
import { SeriesCircuitTab } from "./SeriesCircuitTab";
import { ParallelCircuitTab } from "./ParallelCircuitTab";
import { MixedCircuitTab } from "./MixedCircuitTab";
import { LaboratoryTab } from "./LaboratoryTab";
import { AdvancedSimulatorTab } from "./AdvancedSimulatorTab";

const validTabs = ["basic", "series", "parallel", "mixed", "lab", "advanced"];

export function Simulator({ defaultTab, defaultLabTab }: { defaultTab?: string, defaultLabTab?: string }) {
    const tabToShow = defaultTab && validTabs.includes(defaultTab) ? defaultTab : 'basic';
    
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Calculadora y Laboratorio</CardTitle>
          <CardDescription>
            Usa las pestañas como una calculadora para resolver circuitos, experimenta en el laboratorio o explora el simulador avanzado.
          </CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue={tabToShow} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 border shadow-sm">
          <TabsTrigger value="basic" className="text-base hidden md:inline-flex">Básico</TabsTrigger>
          <TabsTrigger value="series" className="text-base">Serie</TabsTrigger>
          <TabsTrigger value="parallel" className="text-base">Paralelo</TabsTrigger>
          <TabsTrigger value="mixed" className="text-base hidden md:inline-flex">Mixto</TabsTrigger>
          <TabsTrigger value="lab" className="text-base">Laboratorio</TabsTrigger>
          <TabsTrigger value="advanced" className="text-base">Avanzado</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <BasicCircuitTab />
        </TabsContent>
        <TabsContent value="series">
          <SeriesCircuitTab />
        </TabsContent>
        <TabsContent value="parallel">
          <ParallelCircuitTab />
        </TabsContent>
        <TabsContent value="mixed">
          <MixedCircuitTab />
        </TabsContent>
        <TabsContent value="lab">
          <LaboratoryTab defaultTab={defaultLabTab}/>
        </TabsContent>
        <TabsContent value="advanced">
          <AdvancedSimulatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
