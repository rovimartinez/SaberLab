export const l3Missions = [
    {
        title: 'Mision 1: Indicador listo',
        type: 'drag',
        goal: 'Prepara una senal visual para indicar que el sistema esta listo para leer un boton: configura el pin 13 como salida y enciende el LED.',
        expected: {
            setup: ['PINMODE_13_OUTPUT'],
            loop: ['DIGITALWRITE_13_HIGH']
        },
        ledCount: 1
    },
    {
        title: 'Mision 2: Codigo de espera',
        type: 'write',
        goal: 'Escribe el codigo minimo para dejar encendido el LED del pin 13 mientras el sistema espera una entrada del usuario.',
        hint: 'Primero define el pin 13 como OUTPUT en setup y luego mantenlo en HIGH en loop.',
        expected: {
            setup: 'pinMode(13, OUTPUT);',
            loop: 'digitalWrite(13, HIGH);'
        },
        ledCount: 1
    },
    {
        title: 'Mision 3: Confirmacion visual',
        type: 'drag',
        goal: 'Programa una respuesta visual que parpadee cuando el usuario realiza una accion esperada: encender, esperar, apagar y volver a esperar.',
        expected: {
            setup: ['PINMODE_13_OUTPUT'],
            loop: ['DIGITALWRITE_13_HIGH', 'DELAY_1000', 'DIGITALWRITE_13_LOW', 'DELAY_1000']
        },
        ledCount: 1
    }
];
