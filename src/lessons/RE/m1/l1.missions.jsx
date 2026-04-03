export const l1Missions = [
    {
        title: 'Misi\u00f3n 1: Prender LED',
        type: 'drag',
        goal: 'Arrastra el bloque correcto para configurar el pin 13 como salida y enviar senal HIGH para prender el LED.',
        expected: {
            setup: ['PINMODE_13_OUTPUT'],
            loop: ['DIGITALWRITE_13_HIGH']
        },
        ledCount: 1
    },
    {
        title: 'Misi\u00f3n 2: Codigo LED',
        type: 'write',
        goal: 'Configura el pin 13 como salida para que el LED pueda recibir energia.',
        hint: 'Usa pinMode(numeroPin, MODO); dentro del bloque setup.',
        expected: {
            setup: 'pinMode(13, OUTPUT);',
            loop: 'digitalWrite(13, HIGH);'
        },
        ledCount: 1
    },
    {
        title: 'Misi\u00f3n 3: Parpadeo',
        type: 'drag',
        goal: 'Arrastra los bloques para hacer parpadear el LED: Prender -> Esperar aproximadamente un segundo -> Apagar -> Esperar aproximadamente un segundo.',
        expected: {
            setup: ['PINMODE_13_OUTPUT'],
            loop: ['DIGITALWRITE_13_HIGH', 'DELAY_1000', 'DIGITALWRITE_13_LOW', 'DELAY_1000']
        },
        ledCount: 1
    },
    {
        title: 'Misi\u00f3n 4: Codigo Parpadeo',
        type: 'write',
        goal: 'Haz que el LED del pin 13 parpadee con pausas de aproximadamente un segundo.',
        hint: 'Necesitas prender el LED, esperar un momento largo, apagarlo y volver a esperar el mismo tiempo.',
        expected: {
            setup: 'pinMode(13, OUTPUT);',
            loop: 'digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000);'
        },
        ledCount: 1
    },
    {
        title: 'Misi\u00f3n 5: Sirena Policial',
        type: 'drag',
        goal: 'Arrastra los bloques para crear una secuencia de luces de sirena (Rojo y Azul alternando) con cambios rapidos, de menos de un segundo.',
        expected: {
            setup: ['PINMODE_13_OUTPUT', 'PINMODE_12_OUTPUT'],
            loop: ['DIGITALWRITE_13_HIGH', 'DIGITALWRITE_12_LOW', 'DELAY_300', 'DIGITALWRITE_13_LOW', 'DIGITALWRITE_12_HIGH', 'DELAY_300']
        },
        ledCount: 2
    },
    {
        title: 'Misi\u00f3n 6: Codigo Sirena',
        type: 'write',
        goal: 'Crea una sirena policial alternando los pines 13 (rojo) y 12 (azul).',
        hint: 'Mientras uno esta en HIGH, el otro debe estar en LOW, y el cambio debe sentirse rapido: menos de un segundo.',
        expected: {
            setup: 'pinMode(13, OUTPUT); pinMode(12, OUTPUT);',
            loop: 'digitalWrite(13, HIGH); digitalWrite(12, LOW); delay(300); digitalWrite(13, LOW); digitalWrite(12, HIGH); delay(300);'
        },
        ledCount: 2
    }
];
