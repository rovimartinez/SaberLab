export const l4Missions = [
    {
        title: 'Mision 1: Senal de depuracion',
        type: 'drag',
        goal: 'Antes de leer datos por Monitor Serie, crea una senal visual base: configura el pin 13 como salida y enciende el LED de referencia.',
        expected: {
            setup: ['PINMODE_13_OUTPUT'],
            loop: ['DIGITALWRITE_13_HIGH']
        },
        ledCount: 1
    },
    {
        title: 'Mision 2: Codigo de referencia',
        type: 'write',
        goal: 'Escribe el codigo minimo para mantener un indicador visual encendido mientras observas datos en la consola.',
        hint: 'Configura el pin 13 en setup y escribe HIGH en loop.',
        expected: {
            setup: 'pinMode(13, OUTPUT);',
            loop: 'digitalWrite(13, HIGH);'
        },
        ledCount: 1
    },
    {
        title: 'Mision 3: Pulso observable',
        type: 'drag',
        goal: 'Genera un pulso visible para comparar lo que verias en el hardware con lo que reportarias por el Monitor Serie.',
        expected: {
            setup: ['PINMODE_13_OUTPUT'],
            loop: ['DIGITALWRITE_13_HIGH', 'DELAY_1000', 'DIGITALWRITE_13_LOW', 'DELAY_1000']
        },
        ledCount: 1
    }
];
