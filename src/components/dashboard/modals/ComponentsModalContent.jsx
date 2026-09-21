import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Box, Sparkles, Layers, Info, ExternalLink, Bot, Navigation, Radio, Compass, Disc, Zap, Activity, Eye, ChevronDown, Search, X } from 'lucide-react';

export default function ComponentsModalContent({ mainCourseDef, isStaff }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeComponent, setActiveComponent] = useState('arduino-uno');
    const [openCategoryDropdown, setOpenCategoryDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (openCategoryDropdown) {
                const openDropdownEl = document.querySelector(`[data-category-id="${openCategoryDropdown}"]`);
                if (openDropdownEl && !openDropdownEl.contains(e.target)) {
                    setOpenCategoryDropdown(null);
                }
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openCategoryDropdown]);

    const components = [
        // ── 1. PLACAS Y CONTROLADORES ──
        {
            id: 'arduino-uno',
            name: 'Arduino UNO R3',
            category: 'Controladores',
            tag: 'Placa Estándar',
            tagColor: '#00979C',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/85e4a60ec0294e2c83fbafa6051a3681/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Mohamed Fathi',
            authorUrl: 'https://sketchfab.com/MohamedFathi',
            modelUrl: 'https://sketchfab.com/3d-models/arduino-uno-85e4a60ec0294e2c83fbafa6051a3681',
            desc: 'Placa de desarrollo estándar basada en el microcontrolador ATmega328P. Es el cerebro principal para prototipado electrónico y robótica.',
            specs: [
                { label: 'Microcontrolador', val: 'ATmega328P (8-bit)' },
                { label: 'Voltaje Operativo', val: '5V (Lógica digital)' },
                { label: 'Voltaje de Entrada', val: '7V - 12V DC (Jack)' },
                { label: 'Pines Digitales E/S', val: '14 (6 PWM)' },
                { label: 'Pines Analógicos', val: '6 (A0 - A5, 10-bit)' },
                { label: 'Frecuencia de Reloj', val: '16 MHz' },
                { label: 'Memoria Flash', val: '32 KB' },
                { label: 'SRAM & EEPROM', val: '2 KB / 1 KB' }
            ],
            keyPinouts: [
                { pin: 'Pin 13', role: 'LED Integrado en placa' },
                { pin: 'Pines 0 (RX) y 1 (TX)', role: 'Comunicación serial con PC' },
                { pin: 'Pines 3, 5, 6, 9, 10, 11', role: 'Salidas analógicas simuladas (PWM)' },
                { pin: 'Pines A4 (SDA) y A5 (SCL)', role: 'Bus de comunicación I2C' }
            ]
        },
        {
            id: 'arduino-uno-f2a',
            name: 'Arduino UNO R3 (Edición F2A)',
            category: 'Controladores',
            tag: 'Detalle HD',
            tagColor: '#00979C',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/943bae9bb86842408fc718b6e4c92ddb/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'F2A',
            authorUrl: 'https://sketchfab.com/Fa_Sketch',
            modelUrl: 'https://sketchfab.com/3d-models/arduino-uno-943bae9bb86842408fc718b6e4c92ddb',
            desc: 'Renderizado de alta precisión de la clásica placa Arduino UNO R3, destacando el zócalo DIP del microcontrolador ATmega328P y el puerto USB tipo B.',
            specs: [
                { label: 'Encapsulado', val: 'DIP-28 Extraíble' },
                { label: 'Chip USB-Serial', val: 'ATmega16U2' },
                { label: 'Regulador 5V/3.3V', val: 'Lineal en placa' },
                { label: 'Lógica', val: '5V TTL' }
            ],
            keyPinouts: [
                { pin: 'Pines D0 a D13', role: 'Entradas/Salidas Digitales' },
                { pin: 'Pines A0 a A5', role: 'Conversor Analógico Digital 10-bit' }
            ]
        },
        {
            id: 'arduino-uno-r4-wifi',
            name: 'Arduino UNO R4 WiFi',
            category: 'Controladores',
            tag: '32-bit & WiFi',
            tagColor: '#0284c7',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/e3eeb74bcc014f7c909220fc88b66f57/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'F2A',
            authorUrl: 'https://sketchfab.com/Fa_Sketch',
            modelUrl: 'https://sketchfab.com/3d-models/arduino-uno-r4-wifi-e3eeb74bcc014f7c909220fc88b66f57',
            desc: 'Placa de última generación con procesador Renesas RA4M1 ARM Cortex-M4 (32-bit a 48 MHz), coprocesador ESP32-S3 para WiFi/Bluetooth y matriz LED 12x8.',
            specs: [
                { label: 'Microcontrolador', val: 'Renesas RA4M1 (ARM Cortex-M4 32-bit)' },
                { label: 'Frecuencia de Reloj', val: '48 MHz (3 veces más rápido)' },
                { label: 'Memoria Flash', val: '256 KB' },
                { label: 'SRAM', val: '32 KB' },
                { label: 'Módulo Inalámbrico', val: 'ESP32-S3 (WiFi 2.4 GHz + BLE 5.0)' },
                { label: 'Matriz LED', val: 'Matriz integrada 12x8 (96 LEDs rojos)' },
                { label: 'Conector USB', val: 'USB-C Moderno con HID support' },
                { label: 'Voltaje Entrada', val: 'Hasta 24V DC soportados' }
            ],
            keyPinouts: [
                { pin: 'Matriz 12x8', role: 'Animaciones gráficas e iconos en tiempo real' },
                { pin: 'CAN Bus', role: 'Pines integrados CAN RX/TX para automotriz' },
                { pin: 'DAC 12-bit', role: 'Salida analógica real sin modulación PWM' }
            ]
        },
        {
            id: 'arduino-mega-2560',
            name: 'Arduino MEGA 2560 REV3',
            category: 'Controladores',
            tag: '54 Pines E/S',
            tagColor: '#3b82f6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/133e7d23d5e140a98b4178a1bd1ecfb1/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'F2A',
            authorUrl: 'https://sketchfab.com/Fa_Sketch',
            modelUrl: 'https://sketchfab.com/3d-models/arduino-mega-2560-rev3-133e7d23d5e140a98b4178a1bd1ecfb1',
            desc: 'Placa extendida de alta potencia con microcontrolador ATmega2560. Diseñada para proyectos complejos como impresoras 3D, brazos robóticos y CNC.',
            specs: [
                { label: 'Microcontrolador', val: 'ATmega2560 (8-bit AVR)' },
                { label: 'Pines Digitales E/S', val: '54 (15 con modulación PWM)' },
                { label: 'Pines Analógicos', val: '16 Entradas ADC (A0 - A15)' },
                { label: 'Puertos UART Serial', val: '4 Puertos Seriales por Hardware' },
                { label: 'Memoria Flash', val: '256 KB (8 KB para bootloader)' },
                { label: 'SRAM & EEPROM', val: '8 KB SRAM / 4 KB EEPROM' },
                { label: 'Frecuencia de Reloj', val: '16 MHz' },
                { label: 'Voltaje Operativo', val: '5V (Entrada Jack 7-12V)' }
            ],
            keyPinouts: [
                { pin: 'Serial 1, 2, 3', role: 'Puertos hardware independientes (TX1-3 / RX1-3)' },
                { pin: 'Pines PWM 2 a 13', role: '15 canales PWM simultáneos' },
                { pin: 'Bus SPI dedicado', role: 'Pines 50 (MISO), 51 (MOSI), 52 (SCK), 53 (SS)' }
            ]
        },
        {
            id: 'arduino-micro',
            name: 'Arduino Micro (USB Nativo)',
            category: 'Controladores',
            tag: 'Teclado/Mouse HID',
            tagColor: '#059669',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/0fa81cb46f6f4abd8a109296ec5a71cd/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'F2A',
            authorUrl: 'https://sketchfab.com/Fa_Sketch',
            modelUrl: 'https://sketchfab.com/3d-models/arduino-micro-0fa81cb46f6f4abd8a109296ec5a71cd',
            desc: 'Placa compacta con procesador ATmega32U4 que integra comunicación USB nativa, permitiendo emular teclados, ratones y joysticks en la PC.',
            specs: [
                { label: 'Microcontrolador', val: 'ATmega32U4 (8-bit con USB Nativo)' },
                { label: 'Frecuencia de Reloj', val: '16 MHz' },
                { label: 'Memoria Flash', val: '32 KB' },
                { label: 'SRAM', val: '2.5 KB' },
                { label: 'Pines Digitales E/S', val: '20 Pines (7 PWM)' },
                { label: 'Pines Analógicos', val: '12 Entradas ADC' },
                { label: 'Capacidad HID', val: 'Emulación nativa Mouse / Keyboard' },
                { label: 'Conector', val: 'Micro USB' }
            ],
            keyPinouts: [
                { pin: 'USB Nativo', role: 'Librerías Keyboard.h y Mouse.h' },
                { pin: 'Pines D0 a D13', role: 'Entradas/Salidas lógicas 5V' }
            ]
        },
        {
            id: 'arduino-nano-every',
            name: 'Arduino Nano Every',
            category: 'Controladores',
            tag: 'Placa Compacta',
            tagColor: '#008184',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/6753fa6843c84931a5fc8c734cc4c819/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'F2A',
            authorUrl: 'https://sketchfab.com/Fa_Sketch',
            modelUrl: 'https://sketchfab.com/3d-models/arduino-nano-every-6753fa6843c84931a5fc8c734cc4c819',
            desc: 'Evolución compacta del clásico Nano con procesador ATmega4809 a 20 MHz. Ideal para protoboards y robots pequeños con espacio limitado.',
            specs: [
                { label: 'Microcontrolador', val: 'ATmega4809 (8-bit)' },
                { label: 'Frecuencia de Reloj', val: '20 MHz' },
                { label: 'Memoria Flash', val: '48 KB' },
                { label: 'SRAM', val: '6 KB' },
                { label: 'Voltaje Lógica', val: '5V' },
                { label: 'Pines Digitales / PWM', val: '14 / 5 PWM' },
                { label: 'Pines Analógicos', val: '8 Entradas ADC' },
                { label: 'Conexión USB', val: 'Micro USB (ATSAMD11D14A)' }
            ],
            keyPinouts: [
                { pin: 'Pines D0 - D13', role: 'Entradas/Salidas digitales' },
                { pin: 'Pines A0 - A7', role: 'Entradas analógicas' },
                { pin: 'Pin VIN', role: 'Alimentación externa 7-21V' }
            ]
        },
        {
            id: 'arduino-uno-mini',
            name: 'Arduino UNO Mini (Limited Edition)',
            category: 'Controladores',
            tag: 'Colección / Miniatura',
            tagColor: '#f59e0b',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/edc2774b4bd64f77b31761bc982ba26d/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'F2A',
            authorUrl: 'https://sketchfab.com/Fa_Sketch',
            modelUrl: 'https://sketchfab.com/3d-models/new-arduino-uno-mini-limited-edition-edc2774b4bd64f77b31761bc982ba26d',
            desc: 'Edición especial de colección del Arduino UNO miniaturizado al 25% de su tamaño original, con conector USB-C y acabado negro-dorado mate.',
            specs: [
                { label: 'Edición', val: 'Limited Edition 25% Scale' },
                { label: 'Microcontrolador', val: 'ATmega328P SMD' },
                { label: 'Conector', val: 'USB Tipo C' },
                { label: 'Acabado PCB', val: 'Negro mate con serigrafía dorada' }
            ],
            keyPinouts: [
                { pin: 'Pinout 1:1', role: 'Mismos pines y funciones que el UNO R3' }
            ]
        },

        // ── 2. SENSORES, INTERRUPTORES Y PULSADORES ──
        {
            id: 'sensor-ir-tcrt5000',
            name: 'Módulo Sensor Infrarrojo (Obstáculos / Línea)',
            category: 'Sensores',
            tag: 'Sensor Óptico',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/6ad4f3afb83940fea95cd3846aa68a18/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Veer AI',
            authorUrl: 'https://sketchfab.com/veer_ai',
            modelUrl: 'https://sketchfab.com/3d-models/ir-sensor-module-for-arduino-projects-3d-model-6ad4f3afb83940fea95cd3846aa68a18',
            desc: 'Módulo óptico reflexivo compuesto por un LED emisor infrarrojo y un fototransistor receptor, con potenciómetro de ajuste de umbral y comparador LM393.',
            specs: [
                { label: 'Emisor / Receptor', val: 'Diodo IR (940nm) + Fototransistor' },
                { label: 'Comparador de Tensión', val: 'LM393 de alta precisión' },
                { label: 'Rango de Detección', val: '2 cm a 30 cm (Ajustable)' },
                { label: 'Voltaje Operativo', val: '3.3V - 5V DC' },
                { label: 'Salida Digital (DO)', val: 'Nivel bajo (0V) al detectar obstáculo' },
                { label: 'LED Indicador', val: 'LED de encendido y LED de detección' }
            ],
            keyPinouts: [
                { pin: 'VCC', role: 'Alimentación positiva 5V o 3.3V' },
                { pin: 'GND', role: 'Tierra / Masa común con Arduino' },
                { pin: 'OUT / DO', role: 'Señal digital conectada a pin de Arduino (ej: D2)' }
            ]
        },
        {
            id: 'pulsador-tactil-2pin',
            name: 'Pulsador Táctil (2-Pin Push Button)',
            category: 'Comunes',
            tag: 'Interruptor / Entrada',
            tagColor: '#38bdf8',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/caa7bb6a632249daa4032eb7f7eaa1e5/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Veer AI',
            authorUrl: 'https://sketchfab.com/veer_ai',
            modelUrl: 'https://sketchfab.com/3d-models/two-pin-tactile-push-button-caa7bb6a632249daa4032eb7f7eaa1e5',
            desc: 'Pulsador normalmente abierto (NO) de 2 terminales para protoboard. Es el componente de entrada digital estándar para disparar eventos, inicios de carrera y menús de control en Arduino.',
            specs: [
                { label: 'Tipo de Contacto', val: 'Normalmente Abierto (SPST Momentáneo)' },
                { label: 'Número de Pines', val: '2 Pines (Paso estándar 2.54 mm)' },
                { label: 'Voltaje Máximo', val: '12V DC' },
                { label: 'Corriente Máxima', val: '50 mA' },
                { label: 'Configuración Típica', val: 'Pull-Up interno o Pull-Down externo (10kΩ)' },
                { label: 'Resistencia de Contacto', val: '< 50 mΩ' },
                { label: 'Vida Útil Mecánica', val: '> 100,000 ciclos' },
                { label: 'Técnica de Código', val: 'Anti-rebote (Debounce por software / millis())' }
            ],
            keyPinouts: [
                { pin: 'Terminal 1', role: 'Conexión a Pin Digital (con pinMode(pin, INPUT_PULLUP))' },
                { pin: 'Terminal 2', role: 'Conexión a GND (Tierra común)' }
            ]
        },
        {
            id: 'limit-switch-push-button',
            name: 'Final de Carrera / Interruptor Push Button',
            category: 'Comunes',
            tag: 'Fin de Carrera',
            tagColor: '#f97316',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/ea70f4a26d5949d08bc738ade4e4454f/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'YouniqueĪdeaStudio',
            authorUrl: 'https://sketchfab.com/sinnervoncrawsz',
            modelUrl: 'https://sketchfab.com/3d-models/limit-switch-push-button-switch-dummy-ea70f4a26d5949d08bc738ade4e4454f',
            desc: 'Interruptor de límite mecánico de alta precisión con accionador pulsador y terminales de conexión. Empleado en impresoras 3D, brazos mecánicos y cancelas automáticas.',
            specs: [
                { label: 'Tipo de Sensor', val: 'Interruptor de contacto de fin de carrera' },
                { label: 'Configuración', val: 'NO (Normalmente Abierto) / NC (Normalmente Cerrado)' },
                { label: 'Uso en Robótica', val: 'Homing en ejes X/Y/Z, detección de topes' },
                { label: 'Fuerza de Actuación', val: 'Mecánica de resorte de retorno rápido' }
            ],
            keyPinouts: [
                { pin: 'COM (Común)', role: 'Tierra / GND de referencia' },
                { pin: 'NO (Normal Open)', role: 'Pin digital de interrupción con INPUT_PULLUP' }
            ]
        },
        {
            id: 'adafruit-pushbutton-power-breakout',
            name: 'Push-Button Power Switch Breakout (Adafruit)',
            category: 'Comunes',
            tag: 'Módulo Encendido',
            tagColor: '#a855f7',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/4683fc2b9d1043bb8456c8f4da4599b7/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'astoria_cansat',
            authorUrl: 'https://sketchfab.com/astoria_cansat',
            modelUrl: 'https://sketchfab.com/3d-models/push-button-power-switch-breakout-from-adafruit-4683fc2b9d1043bb8456c8f4da4599b7',
            desc: 'Placa de distribución de control de encendido inteligente con pulsador. Permite controlar la alimentación DC de proyectos con autoapagado por software y protección contra rebotes.',
            specs: [
                { label: 'Fabricante / Diseño', val: 'Adafruit Breakout' },
                { label: 'Función', val: 'Interruptor biestable de encendido por pulsador' },
                { label: 'Rango de Tensión', val: '3V a 14V DC' },
                { label: 'Corriente Máxima', val: 'Hasta 3A' },
                { label: 'Control por Software', val: 'Pin OFF para auto-apagado desde microcontrolador' }
            ],
            keyPinouts: [
                { pin: 'VIN / VOUT', role: 'Entrada y salida conmutada de potencia' },
                { pin: 'GND', role: 'Masa común del sistema' },
                { pin: 'OFF', role: 'Pulso HIGH desde Arduino para apagado controlado' }
            ]
        },
        {
            id: 'tactile-switch-b3f',
            name: 'Pulsador Táctil Omron B3F (4 Pines)',
            category: 'Comunes',
            tag: 'Pulsador SMD/THT',
            tagColor: '#06b6d4',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/8dc79eb9e70f450c8fcbc233e0009b23/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Stichting Consortium Beroepsonderwijs',
            authorUrl: 'https://sketchfab.com/scb3d',
            modelUrl: 'https://sketchfab.com/3d-models/tactile-switch-b3f-8dc79eb9e70f450c8fcbc233e0009b23',
            desc: 'Microinterruptor táctil estándar industrial serie B3F de 4 terminales. Cuenta con pares de patas puenteadas internamente para máxima fijación mecánica en PCB y protoboards.',
            specs: [
                { label: 'Serie Industrial', val: 'Omron B3F Tactile Switch' },
                { label: 'Pines', val: '4 Pines (2 pares interconectados)' },
                { label: 'Resistencia Máxima', val: '100 mΩ' },
                { label: 'Vida Útil', val: '1,000,000 operaciones mecánicas' }
            ],
            keyPinouts: [
                { pin: 'Pines 1 y 2 (Par A)', role: 'Conectados internamente entre sí' },
                { pin: 'Pines 3 y 4 (Par B)', role: 'Conectados internamente; conmutan con Par A al pulsar' }
            ]
        },
        {
            id: 'button-col000r',
            name: 'Pulsador Mecánico de Panel',
            category: 'Comunes',
            tag: 'Botón de Mando',
            tagColor: '#ec4899',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/efd839834eeb4cb2babd710b770a8c4e/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'col000r',
            authorUrl: 'https://sketchfab.com/col000r',
            modelUrl: 'https://sketchfab.com/3d-models/button-efd839834eeb4cb2babd710b770a8c4e',
            desc: 'Pulsador ergonómico de montaje superficial o chasis para interfaces de usuario, tableros de control arcade, botoneras industriales y paneles de mando.',
            specs: [
                { label: 'Tipo de Mando', val: 'Pulsador mecánico de contacto momentáneo' },
                { label: 'Material', val: 'Polímero de alta resistencia' },
                { label: 'Aplicación', val: 'Mandos, consolas y tableros interactivos' }
            ],
            keyPinouts: [
                { pin: 'Terminal A / B', role: 'Conmutación directa hacia entrada digital de Arduino' }
            ]
        },
        {
            id: 'modulo-433mhz-transmissor',
            name: 'Módulo RF 433 MHz (Transmisor Inalámbrico)',
            category: 'Sensores',
            tag: 'Radiofrecuencia',
            tagColor: '#3b82f6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/fdd3cff753944d13a824cbf4aa0316e2/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-33-modulo-433mhz-transmissor-fdd3cff753944d13a824cbf4aa0316e2',
            desc: 'Módulo transmisor de radiofrecuencia ASK/OOK a 433 MHz montado en protoboard con Arduino. Ideal para telemetría a distancia, alarmas y mandos inalámbricos.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 33 - Módulo 433MHz Transmisor' },
                { label: 'Frecuencia de Portadora', val: '433.92 MHz' },
                { label: 'Modulación', val: 'ASK (Amplitude Shift Keying)' },
                { label: 'Tensión de Trabajo', val: '3.5V - 12V DC (a más V, mayor alcance)' },
                { label: 'Librería Recomendada', val: 'RadioHead / VirtualWire' }
            ],
            keyPinouts: [
                { pin: 'DATA', role: 'Arduino Pin Digital (ej: Pin D12)' },
                { pin: 'VCC', role: 'Alimentación positiva 5V - 12V' },
                { pin: 'GND', role: 'Tierra común con Arduino' },
                { pin: 'ANT', role: 'Cable antena de 17.3 cm (1/4 de onda)' }
            ]
        },
        {
            id: 'modulo-nrf24l01-transmissor',
            name: 'Módulo Transmisor nRF24L01+ (2.4 GHz)',
            category: 'Sensores',
            tag: 'RF SPI 2.4GHz',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/230bf08cdf8d4d0fa4c6615cd38716fc/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-33-modulo-nrf24l01-transmissor-230bf08cdf8d4d0fa4c6615cd38716fc',
            desc: 'Transceptor de alta velocidad en banda ISM 2.4 GHz montado en protoboard. Proporciona comunicación bidireccional fiable con direccionamiento por paquetes y CRC por bus SPI.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 33 - nRF24L01 Transmisor' },
                { label: 'Banda de Frecuencia', val: '2.4 GHz ISM (2400 a 2525 MHz)' },
                { label: 'Tasa de Datos', val: '250 kbps, 1 Mbps, 2 Mbps' },
                { label: 'Voltaje de Alimentación', val: '3.3V DC estricto (Tolerante 5V en lógica)' },
                { label: 'Protocolo de Bus', val: 'SPI (MISO, MOSI, SCK, CE, CSN)' },
                { label: 'Librería Recomendada', val: 'RF24 de TMRh20' }
            ],
            keyPinouts: [
                { pin: 'VCC', role: 'Alimentación 3.3V (¡No conectar a 5V!)' },
                { pin: 'GND', role: 'Masa común' },
                { pin: 'CE / CSN', role: 'Pines de control (D9 / D10)' },
                { pin: 'SCK / MOSI / MISO', role: 'Bus SPI de hardware (D13, D11, D12)' }
            ]
        },

        {
            id: 'sensor-cardiaco-heartbeat',
            name: 'Sensor de Ritmo Cardíaco (Pulse / Heartbeat)',
            category: 'Sensores',
            tag: 'Biomédico',
            tagColor: '#ef4444',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/af09f1c288c24a658a0fa3c08955e5cc/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'maekers',
            authorUrl: 'https://sketchfab.com/Innolabs01',
            modelUrl: 'https://sketchfab.com/3d-models/heartbeat-sensor-af09f1c288c24a658a0fa3c08955e5cc',
            desc: 'Sensor fotopletismográfico de pulso óptico para medir frecuencia cardíaca (BPM) mediante la variación de absorción de luz en el flujo sanguíneo del dedo.',
            specs: [
                { label: 'Principio Físico', val: 'Fotopletismografía óptica (LED verde + Fotodiodo)' },
                { label: 'Voltaje Operativo', val: '3.3V - 5V DC' },
                { label: 'Salida', val: 'Señal analógica amplificada' },
                { label: 'Aplicación', val: 'Monitores de salud, wearables y telemedicina' }
            ],
            keyPinouts: [
                { pin: 'S (Signal)', role: 'Arduino Pin Analógico A0' },
                { pin: '+ (VCC)', role: 'Alimentación 5V o 3.3V' },
                { pin: '- (GND)', role: 'Tierra común' }
            ]
        },
        {
            id: 'sensor-pir-movimiento',
            name: 'Sensor de Movimiento PIR PBR Ajustable',
            category: 'Sensores',
            tag: 'Sensor Infrarrojo',
            tagColor: '#f97316',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/deee7096b57b46ae999cd57f8822b1a3/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Mustafa Özgen',
            authorUrl: 'https://sketchfab.com/mustafaozgen',
            modelUrl: 'https://sketchfab.com/3d-models/3d-pbr-adjustable-ir-motion-sensor-pir-deee7096b57b46ae999cd57f8822b1a3',
            desc: 'Sensor piroeléctrico pasivo con lente de Fresnel para detección de presencia humana y animales por radiación térmica en 360°/120°.',
            specs: [
                { label: 'Sensor', val: 'Piroeléctrico con lente Fresnel gran angular' },
                { label: 'Ajustes', val: 'Potenciómetro de sensibilidad y tiempo de retardo' },
                { label: 'Rango de Detección', val: 'Hasta 7 metros (Cono de 120°)' },
                { label: 'Salida Digital', val: 'HIGH (3.3V) al detectar movimiento / LOW inactivo' }
            ],
            keyPinouts: [
                { pin: 'VCC', role: 'Alimentación 4.5V - 12V DC' },
                { pin: 'OUT', role: 'Entrada digital en Arduino (ej: D2 con interrupción)' },
                { pin: 'GND', role: 'Tierra de referencia' }
            ]
        },
        {
            id: 'modulo-sensor-obstaculo-ir',
            name: 'Módulo Sensor de Obstáculo IR (Evitación)',
            category: 'Sensores',
            tag: 'Sensor de Proximidad',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/4fe4e2b921a54a25a2a889dd536d32dd/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/modulo-sensor-de-obstaculo-ir-4fe4e2b921a54a25a2a889dd536d32dd',
            desc: 'Sensor reflectivo de haz infrarrojo con potenciómetro multivuelta para calibrar la distancia de detección frontal en robots móviles.',
            specs: [
                { label: 'Diodos', val: 'LED Emisor IR + Fototransistor Receptor' },
                { label: 'Distancia', val: '2 a 10 cm ajustable' },
                { label: 'Comparador', val: 'LM393 SMD' },
                { label: 'Salida', val: 'Digital Activa en BAJO (0V)' }
            ],
            keyPinouts: [
                { pin: 'VCC', role: 'Alimentación 3.3V / 5V' },
                { pin: 'GND', role: 'Tierra' },
                { pin: 'OUT', role: 'Arduino Pin Digital D4' }
            ]
        },
        {
            id: 'sensor-ir-peddinti',
            name: 'Sensor Óptico Infrarrojo de Reflexión',
            category: 'Sensores',
            tag: 'Infrarrojo',
            tagColor: '#06b6d4',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/1982adc93d214bbda32333dbfef9708b/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'peddintiudaykiran176',
            authorUrl: 'https://sketchfab.com/peddintiudaykiran176',
            modelUrl: 'https://sketchfab.com/3d-models/infrared-sensor-ir-sensor-1982adc93d214bbda32333dbfef9708b',
            desc: 'Módulo detector infrarrojo clásico de 3 pines para velocímetros ópticos, encoders de rueda y contadores de paso.',
            specs: [
                { label: 'Longitud de Onda', val: '940 nm (Invisible al ojo humano)' },
                { label: 'Tiempo de Respuesta', val: '< 10 microsegundos' }
            ],
            keyPinouts: [
                { pin: 'VCC / GND / OUT', role: 'Conexión estándar a placa controladora' }
            ]
        },
        {
            id: 'modulo-dht11-temperatura',
            name: 'Módulo Sensor de Humedad y Temperatura DHT11',
            category: 'Sensores',
            tag: 'Clima & Entorno',
            tagColor: '#3b82f6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/4b7c7f7436ad46cc97a837b7503b5901/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/modulo-sensor-de-umidade-e-temperatura-dht11-4b7c7f7436ad46cc97a837b7503b5901',
            desc: 'Sensor digital calibrado que combina un termistor NTC y un sensor resistivo de humedad con salida digital de bus unifilar (Single-Wire).',
            specs: [
                { label: 'Rango Temperatura', val: '0°C a 50°C (±2°C precisión)' },
                { label: 'Rango Humedad', val: '20% a 90% RH (±5% precisión)' },
                { label: 'Frecuencia de Muestreo', val: '1 Hz (1 lectura por segundo)' },
                { label: 'Protocolo', val: 'Custom Single-Wire Data Bus' }
            ],
            keyPinouts: [
                { pin: 'DATA', role: 'Arduino Pin Digital (ej: Pin D7 con pull-up)' },
                { pin: 'VCC', role: 'Alimentación 3.3V a 5.5V' },
                { pin: 'GND', role: 'Tierra' }
            ]
        },
        {
            id: 'sparkfun-sensor-board',
            name: 'SparkFun Sensor Breakout Board',
            category: 'Sensores',
            tag: 'Breakout PCB',
            tagColor: '#e11d48',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/7c2ca34defe5401ebbd8237dd9e370b0/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'chaitanyacandy1122',
            authorUrl: 'https://sketchfab.com/chaitanyacandy1122',
            modelUrl: 'https://sketchfab.com/3d-models/spark-fun-sensor-7c2ca34defe5401ebbd8237dd9e370b0',
            desc: 'Placa de prototipado rápido estilo SparkFun para acondicionamiento analógico de sensores resistivos y transductores de señal.',
            specs: [
                { label: 'Fabricante', val: 'SparkFun Open Hardware Design' },
                { label: 'Topología', val: 'Divisor de tensión con amplificador' }
            ],
            keyPinouts: [
                { pin: 'VCC / GND / SIG', role: 'Conexión a puertos analógicos' }
            ]
        },
        {
            id: 'sensor-humedad-suelo-motor',
            name: 'Sensor de Humedad de Suelo con Actuador',
            category: 'Sensores',
            tag: 'AgroTIC / Suelo',
            tagColor: '#84cc16',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/39b830a144594eb0b260d6ec4ef6bf3e/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Dien',
            authorUrl: 'https://sketchfab.com/Dien',
            modelUrl: 'https://sketchfab.com/3d-models/humidity-sensor-motor-39b830a144594eb0b260d6ec4ef6bf3e',
            desc: 'Sonda resistiva de humedad para tierra y sustratos conectada a un actuador motorizado / electrobomba para sistemas de riego automatizado.',
            specs: [
                { label: 'Sonda', val: 'Horquilla de inmersión galvanizada anticorrosión' },
                { label: 'Salida', val: 'Analógica (Nivel de agua) + Digital (Umbral)' },
                { label: 'Actuador Asociado', val: 'Mini bomba o motor de compuerta' }
            ],
            keyPinouts: [
                { pin: 'A0', role: 'Lectura analógica de resistividad del suelo' },
                { pin: 'D0', role: 'Disparo digital hacia relé de bomba' }
            ]
        },
        {
            id: 'sensor-ultrasonico-hcsr04',
            name: 'Sensor Ultrasónico HC-SR04',
            category: 'Sensores',
            tag: 'Sonar / Distancia',
            tagColor: '#0284c7',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/e8a6adcef8fd4f45bf27b8d7718ed489/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'peddintiudaykiran176',
            authorUrl: 'https://sketchfab.com/peddintiudaykiran176',
            modelUrl: 'https://sketchfab.com/3d-models/hc-sr04-e8a6adcef8fd4f45bf27b8d7718ed489',
            desc: 'Transductor ultrasónico de ecolocalización (40 kHz). Emite un pulso sonoro y calcula la distancia con base en el tiempo de retorno del eco.',
            specs: [
                { label: 'Rango de Medición', val: '2 cm a 400 cm (Precisión de 3 mm)' },
                { label: 'Ángulo de Apertura', val: '< 15 grados' },
                { label: 'Frecuencia de Ultrasonido', val: '40 kHz' },
                { label: 'Fórmula de Distancia', val: 'Distancia (cm) = Tiempo (µs) / 58' }
            ],
            keyPinouts: [
                { pin: 'VCC', role: 'Alimentación 5V DC' },
                { pin: 'TRIG', role: 'Pulso de disparo de 10µs desde Arduino' },
                { pin: 'ECHO', role: 'Pulso de ancho proporcional recibido (pulseIn)' },
                { pin: 'GND', role: 'Masa común' }
            ]
        },
        {
            id: 'sensor-gas-mq-series',
            name: 'Sensores de Gas Serie MQ (MQ-2 / MQ-135)',
            category: 'Sensores',
            tag: 'Calidad del Aire',
            tagColor: '#d97706',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/55499b0b26b64204adc2252564e84a6d/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'arieffitrah',
            authorUrl: 'https://sketchfab.com/arieffitrah',
            modelUrl: 'https://sketchfab.com/3d-models/gas-sensors-for-arduino-55499b0b26b64204adc2252564e84a6d',
            desc: 'Sensor electroquímico con filamento calentador interno (SnO2) sensible a gases combustibles (GLP, metano, propano, humo y CO).',
            specs: [
                { label: 'Capa Sensible', val: 'Dióxido de Estaño (SnO2)' },
                { label: 'Consumo del Calentador', val: 'Aprox. 150 mA a 5V' },
                { label: 'Gases Detectables', val: 'GLP, Butano, Metano, Alcohol, Humo' },
                { label: 'Salidas', val: 'Analógica (ppm) y Digital (Comparador LM393)' }
            ],
            keyPinouts: [
                { pin: 'AOUT', role: 'Arduino Pin A1 (Lectura proporcional a concentración)' },
                { pin: 'DOUT', role: 'Alarma de umbral digital' },
                { pin: 'VCC / GND', role: 'Alimentación 5V regulada' }
            ]
        },
        {
            id: 'rfid-keychain-tag-rc522',
            name: 'Llavero Tag RFID 13.56 MHz (Mifare RC522)',
            category: 'Sensores',
            tag: 'Identificación RFID',
            tagColor: '#8b5cf6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/b4adb76ad9df4e288156bf44b84bd76b/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Stichting Consortium Beroepsonderwijs',
            authorUrl: 'https://sketchfab.com/scb3d',
            modelUrl: 'https://sketchfab.com/3d-models/rfid-keychain-tag-voor-rc522-rfid-module-b4adb76ad9df4e288156bf44b84bd76b',
            desc: 'Transpondedor pasivo de radiofrecuencia (Llavero Token) con chip Mifare Classic 1K y UID único para sistemas de control de acceso y asistencia.',
            specs: [
                { label: 'Frecuencia de Trabajo', val: '13.56 MHz (HF)' },
                { label: 'Protocolo Estándar', val: 'ISO/IEC 14443 Type A' },
                { label: 'Memoria EEPROM', val: '1 KB dividido en 16 sectores' },
                { label: 'Alimentación', val: 'Pasiva (Inducción electromagnética por lector)' }
            ],
            keyPinouts: [
                { pin: 'Antena Interna', role: 'Bobina toroidal LC acoplada a 13.56 MHz' }
            ]
        },
        {
            id: 'lector-rfid-rc522-modulo',
            name: 'Módulo Lector RFID RC522 (SPI)',
            category: 'Sensores',
            tag: 'Lector RFID / NFC',
            tagColor: '#059669',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/36af29ef403b4bd1a4bc694eaeb6e089/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'maekers',
            authorUrl: 'https://sketchfab.com/Innolabs01',
            modelUrl: 'https://sketchfab.com/3d-models/rc522-rfid-sensor-module-36af29ef403b4bd1a4bc694eaeb6e089',
            desc: 'Módulo lector/escritor de tarjetas y llaveros inteligentes basado en el chip NXP MFRC522 con antena integrada en PCB y comunicación SPI.',
            specs: [
                { label: 'Chipset', val: 'NXP MFRC522' },
                { label: 'Voltaje de Trabajo', val: '3.3V DC (¡No conectar a 5V directo!)' },
                { label: 'Distancia de Lectura', val: 'Hasta 5 cm' },
                { label: 'Interfaz de Datos', val: 'Bus SPI de alta velocidad (Hasta 10 Mbit/s)' }
            ],
            keyPinouts: [
                { pin: 'SDA (SS)', role: 'Arduino Pin D10 (Slave Select)' },
                { pin: 'SCK / MOSI / MISO', role: 'Arduino Pines D13, D11, D12' },
                { pin: 'RST', role: 'Arduino Pin D9' },
                { pin: '3.3V / GND', role: 'Alimentación desde riel 3.3V de Arduino' }
            ]
        },
        {
            id: 'sensor-giroscopio-mpu6050',
            name: 'Sensor Giroscopio & Acelerómetro 6-DOF (MPU-6050)',
            category: 'Sensores',
            tag: 'IMU / Inercial',
            tagColor: '#6366f1',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/15c941336da04ceaa497df7e53d2ea27/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'teslacoil358',
            authorUrl: 'https://sketchfab.com/teslacoil358',
            modelUrl: 'https://sketchfab.com/3d-models/mpu6050gyro-sensor-15c941336da04ceaa497df7e53d2ea27',
            desc: 'Unidad de medición inercial (IMU) MEMS de 6 grados de libertad: acelerómetro de 3 ejes y giróscopo de 3 ejes con procesador DMP (Digital Motion Processor).',
            specs: [
                { label: 'Ejes Sensibles', val: '6 Ejes (Aceleración X,Y,Z + Giro Yaw, Pitch, Roll)' },
                { label: 'Resolución ADC', val: '16-bit en todos los canales' },
                { label: 'Bus de Conexión', val: 'I2C Estándar (Dirección 0x68 o 0x69)' },
                { label: 'Voltaje Lógico', val: '3.3V - 5V (Incluye regulador en placa)' }
            ],
            keyPinouts: [
                { pin: 'VCC / GND', role: 'Alimentación 5V o 3.3V y tierra' },
                { pin: 'SCL', role: 'Arduino Pin Analógico A5' },
                { pin: 'SDA', role: 'Arduino Pin Analógico A4' },
                { pin: 'INT', role: 'Pin D2 (Interrupción externa por datos listos)' }
            ]
        },
        {
            id: 'display-oled-128x64-i2c',
            name: 'Display OLED 128x64 (SSD1306 / I2C)',
            category: 'Comunes',
            tag: 'Pantalla OLED',
            tagColor: '#38bdf8',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/917cce8c366c4fe18c3347366d91d57c/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/display-oled-128x64-917cce8c366c4fe18c3347366d91d57c',
            desc: 'Pantalla gráfica monocromática de tecnología OLED de 0.96 pulgadas con resolución de 128x64 píxeles, alto contraste y autoemisión de luz con controlador SSD1306.',
            specs: [
                { label: 'Controlador Interno', val: 'SSD1306 CMOS' },
                { label: 'Resolución Gráfica', val: '128 x 64 Píxeles (0.96")' },
                { label: 'Protocolo de Bus', val: 'I2C (Dirección 0x3C o 0x3D)' },
                { label: 'Tensión de Trabajo', val: '3.3V a 5V DC' }
            ],
            keyPinouts: [
                { pin: 'GND / VCC', role: 'Masa y Alimentación lógica 5V/3.3V' },
                { pin: 'SCL', role: 'Arduino Pin A5 (Reloj I2C)' },
                { pin: 'SDA', role: 'Arduino Pin A4 (Datos I2C)' }
            ]
        },
        {
            id: 'display-lcd-16x2-i2c',
            name: 'Display LCD 16x2 con Módulo I2C (HD44780)',
            category: 'Comunes',
            tag: 'Pantalla Alfanumérica',
            tagColor: '#0ea5e9',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/a79703f3835f458a86a0eaace29c8aeb/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/display-lcd-16x2-a79703f3835f458a86a0eaace29c8aeb',
            desc: 'Pantalla alfanumérica de matriz de cristal líquido de 16 caracteres por 2 líneas con retroiluminación azul/verde y expansor I2C PCF8574T incorporado.',
            specs: [
                { label: 'Capacidad de Texto', val: '16 Caracteres x 2 Líneas (5x8 puntos)' },
                { label: 'Controlador Base', val: 'Hitachi HD44780 o compatible' },
                { label: 'Módulo Expansor', val: 'PCF8574T I2C Backpack (Ahorro de 16 a 4 pines)' },
                { label: 'Dirección I2C', val: '0x27 o 0x3F (Ajustable por jumpers)' }
            ],
            keyPinouts: [
                { pin: 'GND / VCC', role: 'Alimentación 5V DC' },
                { pin: 'SDA', role: 'Arduino Pin A4 (Línea de datos serie I2C)' },
                { pin: 'SCL', role: 'Arduino Pin A5 (Línea de reloj serie I2C)' }
            ]
        },
        {
            id: 'resistor-lowpoly',
            name: 'Resistencia / Resistor de Carbón (Lowpoly)',
            category: 'Comunes',
            tag: 'Pasivo / Resistor',
            tagColor: '#d97706',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/9fb4a7c5018049adbfd337fe149611d2/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Jiří Kuba',
            authorUrl: 'https://sketchfab.com/kuba.jirka',
            modelUrl: 'https://sketchfab.com/3d-models/lowpoly-resistor-9fb4a7c5018049adbfd337fe149611d2',
            desc: 'Resistor de película de carbón / película metálica con bandas de código de colores para limitación de corriente y polarización en circuitos electrónicos.',
            specs: [
                { label: 'Tipo de Componente', val: 'Pasivo lineal (Ley de Ohm V = I·R)' },
                { label: 'Potencia Típica', val: '1/4W (0.25 Watts)' },
                { label: 'Tolerancia', val: '±5% (Banda dorada)' },
                { label: 'Montaje', val: 'Through-Hole (THT)' }
            ],
            keyPinouts: [
                { pin: 'Terminales Axiales', role: 'No polarizado (conductividad bidireccional)' }
            ]
        },
        {
            id: 'resistor-1k-ohm',
            name: 'Resistor 1kΩ (1000 Ohmios)',
            category: 'Comunes',
            tag: 'Resistencia 1K',
            tagColor: '#b45309',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/5d239115cc7942b895bd817a9edd3ae5/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/resistor-1kohms-5d239115cc7942b895bd817a9edd3ae5',
            desc: 'Resistor axial de 1 Kiloohm (Marrón-Negro-Rojo-Dorado). Esencial como resistencia de pull-up, pull-down y limitación de corriente de transistores y sensores.',
            specs: [
                { label: 'Valor Óhmico', val: '1,000 Ω (1 kΩ)' },
                { label: 'Código de Colores', val: 'Marrón (1), Negro (0), Rojo (x100), Oro (±5%)' },
                { label: 'Disipación Máxima', val: '250 mW' },
                { label: 'Aplicación', val: 'Divisores de tensión y filtros RC' }
            ],
            keyPinouts: [
                { pin: 'Terminales 1 y 2', role: 'Conexión en serie o paralelo' }
            ]
        },
        {
            id: 'pcb-traffic-light-mini',
            name: 'Módulo Semáforo LED en PCB (Rojo/Ámbar/Verde)',
            category: 'Comunes',
            tag: 'Módulo Semáforo',
            tagColor: '#ef4444',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/40d6e7ffa1cb4d97b24ec1a2723bd396/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Rixx',
            authorUrl: 'https://sketchfab.com/rixx_vr',
            modelUrl: 'https://sketchfab.com/3d-models/pcb-traffic-light-40d6e7ffa1cb4d97b24ec1a2723bd396',
            desc: 'Módulo integrado compacto con 3 LEDs integrados (Rojo, Amarillo, Verde) con resistores limitadores en PCB para prácticas de control de tráfico y lógica vial.',
            specs: [
                { label: 'Colores Integrados', val: 'Rojo (625nm), Amarillo (590nm), Verde (520nm)' },
                { label: 'Tensión de Entrada', val: '3.3V - 5V DC' },
                { label: 'Resistencias PCB', val: 'Limitadoras SMD incorporadas (330Ω)' },
                { label: 'Nivel Lógico', val: 'Ánodo común / Cátodo común' }
            ],
            keyPinouts: [
                { pin: 'GND', role: 'Masa común' },
                { pin: 'R / Y / G', role: 'Control individual desde pines digitales Arduino' }
            ]
        },
        {
            id: 'fotoresistencia-ldr',
            name: 'Fotorresistor LDR (Light Dependent Resistor)',
            category: 'Sensores',
            tag: 'Sensor de Luz',
            tagColor: '#eab308',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/7ca420aeb24a4fa988c16cd3fbeb2363/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'FrancescoMilanese',
            authorUrl: 'https://sketchfab.com/FrancescoMilanese',
            modelUrl: 'https://sketchfab.com/3d-models/photoresistor-7ca420aeb24a4fa988c16cd3fbeb2363',
            desc: 'Sensor óptico resistivo de Sulfuro de Cadmio (CdS). Su resistencia disminuye exponencialmente a medida que aumenta la intensidad de luz incidente.',
            specs: [
                { label: 'Material Fotosensible', val: 'Sulfuro de Cadmio (CdS 5mm)' },
                { label: 'Resistencia en Luz', val: 'Aprox. 1 kΩ - 5 kΩ (10 Lux)' },
                { label: 'Resistencia en Oscuridad', val: '> 1 MΩ (Megaohmio)' },
                { label: 'Tiempo de Respuesta', val: '20 ms - 30 ms' }
            ],
            keyPinouts: [
                { pin: 'Terminal A / B', role: 'Se conecta con resistencia de 10k en divisor analógico (A0)' }
            ]
        },
        {
            id: 'diodo-led-5mm',
            name: 'Diodo LED 5mm Difuso / Ultrabrillante',
            category: 'Comunes',
            tag: 'Diodo Emisor Luz',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/efefd8bfed6d4e988932f58c5926233b/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Venus9',
            authorUrl: 'https://sketchfab.com/Venus9',
            modelUrl: 'https://sketchfab.com/3d-models/led-diode-efefd8bfed6d4e988932f58c5926233b',
            desc: 'Semiconductor emisor de fotones bajo polarización directa. Elemento básico de señalización óptica en electrónica y prototipado.',
            specs: [
                { label: 'Encapsulado', val: 'Epóxico 5mm con reborde plano' },
                { label: 'Voltaje Umbral (Vf)', val: '1.8V - 2.2V (Rojo/Verde) / 3.0V - 3.4V (Azul/Blanco)' },
                { label: 'Corriente Nominal', val: '15 mA - 20 mA' },
                { label: 'Resistencia Sugerida', val: '220Ω a 330Ω con fuente de 5V' }
            ],
            keyPinouts: [
                { pin: 'Ánodo (+)', role: 'Pata más larga / Polaridad positiva' },
                { pin: 'Cátodo (-)', role: 'Pata más corta / Lado plano del cuerpo' }
            ]
        },
        {
            id: 'kit-electronic-compounds',
            name: 'Kit Multicomponente Electrónico',
            category: 'Comunes',
            tag: 'Kit Componentes',
            tagColor: '#8b5cf6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/9c6ea31998b2447e8964476756d18125/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'EL.Farrouji.Amine',
            authorUrl: 'https://sketchfab.com/EL.Farrouji.Amine',
            modelUrl: 'https://sketchfab.com/3d-models/electronic-compounds-9c6ea31998b2447e8964476756d18125',
            desc: 'Conjunto didáctico de componentes discretos que incluye condensadores electrolíticos y cerámicos, transistores BJT, diodos rectificadores y resistencias.',
            specs: [
                { label: 'Familias Incluidas', val: 'Pasivos (R, C), Semiconductores (Diodos, Transistores)' },
                { label: 'Condensadores', val: 'Electrolíticos de aluminio y lentejas cerámicas' },
                { label: 'Transistores', val: 'NPN / PNP TO-92' }
            ],
            keyPinouts: [
                { pin: 'Pines THT', role: 'Compatibles con inserción directa en Protoboard' }
            ]
        },
        {
            id: 'trimmer-potenciometro-multivuelta',
            name: 'Trimmer Potenciómetro de Ajuste Fino',
            category: 'Comunes',
            tag: 'Trimmer / Calibración',
            tagColor: '#0284c7',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/845b5837a0734332857aa3fcd9c96515/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'FrancescoMilanese',
            authorUrl: 'https://sketchfab.com/FrancescoMilanese',
            modelUrl: 'https://sketchfab.com/3d-models/trimmer-2-845b5837a0734332857aa3fcd9c96515',
            desc: 'Potenciómetro miniatura tipo trimmer para ajuste y calibración precisa de circuitos impresos, ajuste de ganancia operacional o contraste de pantallas LCD.',
            specs: [
                { label: 'Mecanismo', val: 'Tornillo de ajuste micrométrico' },
                { label: 'Pista Resistiva', val: 'Cermet de alta estabilidad' },
                { label: 'Potencia Nominal', val: '0.5 W a 70°C' }
            ],
            keyPinouts: [
                { pin: 'Pines 1 y 3', role: 'Extremos resistivos fijos' },
                { pin: 'Pin 2 (Central)', role: 'Cursor móvil de voltaje ajustable' }
            ]
        },
        {
            id: 'potenciometro-rotativo-10k',
            name: 'Potenciómetro Rotativo 10kΩ con Eje',
            category: 'Comunes',
            tag: 'Potenciómetro 10K',
            tagColor: '#06b6d4',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/a4cab519bdab46b580a5c9bd172fbeef/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'vimalgeorge10',
            authorUrl: 'https://sketchfab.com/vimalgeorge10',
            modelUrl: 'https://sketchfab.com/3d-models/10k-potentiometer-without-pcb-board-a4cab519bdab46b580a5c9bd172fbeef',
            desc: 'Resistencia variable giratoria de 10 kΩ lineal (B10K). Es el componente principal para diales de control analógico, control de velocidad y posición de servos.',
            specs: [
                { label: 'Curva Resistiva', val: 'Lineal (Tipo B)' },
                { label: 'Valor Total', val: '10,000 Ω (10 kΩ)' },
                { label: 'Ángulo de Rotación', val: '300° ± 5°' },
                { label: 'Vida Útil', val: '15,000 ciclos mecánicos' }
            ],
            keyPinouts: [
                { pin: 'Pin 1', role: 'VCC (+5V)' },
                { pin: 'Pin 2 (Wiper)', role: 'Salida analógica variable hacia Arduino (A0-A5)' },
                { pin: 'Pin 3', role: 'GND (Masa)' }
            ]
        },
        {
            id: 'buzzer-activo-generico',
            name: 'Zumbador / Buzzer Clásico THT',
            category: 'Comunes',
            tag: 'Buzzer Acústico',
            tagColor: '#f43f5e',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/9bac5489126440b09328fd355573cfa3/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'antoniomenamaroto09',
            authorUrl: 'https://sketchfab.com/antoniomenamaroto09',
            modelUrl: 'https://sketchfab.com/3d-models/buzzer-9bac5489126440b09328fd355573cfa3',
            desc: 'Transductor sonoro electromagnético/piezoeléctrico sellado para alarmas audibles, confirmación sonora de pulsaciones e indicadores acústicos de estado.',
            specs: [
                { label: 'Nivel de Presión Sonora', val: '≥ 85 dB a 10 cm' },
                { label: 'Voltaje Nominal', val: '5V DC (3V - 12V soportado)' },
                { label: 'Frecuencia de Resonancia', val: '2300 Hz ± 300 Hz' }
            ],
            keyPinouts: [
                { pin: 'Pin Largo (+)', role: 'Salida digital o PWM Arduino' },
                { pin: 'Pin Corto (-)', role: 'GND / Tierra' }
            ]
        },
        {
            id: 'buzzer-pasivo-piezo',
            name: 'Zumbador Pasivo Piezoeléctrico (Passive Buzzer)',
            category: 'Comunes',
            tag: 'Buzzer Pasivo',
            tagColor: '#a855f7',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/dfe0dfdda972465c9bba53f964d23269/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'maekers',
            authorUrl: 'https://sketchfab.com/Innolabs01',
            modelUrl: 'https://sketchfab.com/3d-models/passive-buzzer-dfe0dfdda972465c9bba53f964d23269',
            desc: 'Buzzer pasivo que requiere señal oscilante (onda cuadrada generada con función tone() de Arduino) para sintetizar notas musicales y melodías completas.',
            specs: [
                { label: 'Tipo de Transductor', val: 'Elemento Piezoeléctrico sin oscilador interno' },
                { label: 'Rango de Frecuencias', val: '1.5 kHz a 5 kHz (Generador de notas Do-Re-Mi)' },
                { label: 'Consumo', val: '< 30 mA' }
            ],
            keyPinouts: [
                { pin: 'Pin Señal (+)', role: 'Arduino Pin PWM (tone(pin, frecuencia))' },
                { pin: 'Pin GND (-)', role: 'Masa común' }
            ]
        },
        {
            id: 'modulo-alarma-pasiva-3pin',
            name: 'Módulo de Alarma Pasiva de 3 Pines (KY-006)',
            category: 'Comunes',
            tag: 'Módulo Buzzer PCB',
            tagColor: '#ec4899',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/fe3f50f6adc040c3b180dbb29dafba51/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'vimalgeorge10',
            authorUrl: 'https://sketchfab.com/vimalgeorge10',
            modelUrl: 'https://sketchfab.com/3d-models/3-pin-outlet-33-5v-passive-alarm-module-fe3f50f6adc040c3b180dbb29dafba51',
            desc: 'Módulo de buzzer montado en placa PCB con conector estándar de 3 pines (Señal, VCC, GND) y transistor de conmutación para protección del microcontrolador.',
            specs: [
                { label: 'Módulo Estándar', val: 'KY-006 / Passive Alarm Module' },
                { label: 'Alimentación', val: '3.3V a 5V DC' },
                { label: 'Transistor Driver', val: 'S8550 PNP integrado' }
            ],
            keyPinouts: [
                { pin: 'S (Signal)', role: 'Disparo de onda cuadrada PWM' },
                { pin: 'VCC (+)', role: 'Alimentación 5V' },
                { pin: 'GND (-)', role: 'Tierra' }
            ]
        },
        {
            id: 'buzzer-industrial-bz1',
            name: 'Zumbador Acústico de Alta Potencia BZ1',
            category: 'Comunes',
            tag: 'Alarma Industrial',
            tagColor: '#dc2626',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/c1b59906df354f9f8f1d1d7375fb370a/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'MARCO SpA',
            authorUrl: 'https://sketchfab.com/marcospa',
            modelUrl: 'https://sketchfab.com/3d-models/bz1-c1b59906df354f9f8f1d1d7375fb370a',
            desc: 'Sirena / zumbador acústico de señalización industrial de alto decibelio para paneles de control, máquinas automatizadas y avisos de emergencia.',
            specs: [
                { label: 'Nivel Sonoro', val: '> 95 dB a 1 metro' },
                { label: 'Protección', val: 'Carcasa sellada IP54' },
                { label: 'Alimentación', val: '12V - 24V DC / AC' }
            ],
            keyPinouts: [
                { pin: 'Terminales L/N (+/-)', role: 'Control por relé o transistor MOSFET' }
            ]
        },
        {
            id: 'modulo-sensor-obstaculo-ir-rp',
            name: 'Módulo Sensor de Obstáculo Infrarrojo (Proximity)',
            category: 'Sensores',
            tag: 'Sensor Obstáculo IR',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/4fe4e2b921a54a25a2a889dd536d32dd/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/modulo-sensor-de-obstaculo-ir-4fe4e2b921a54a25a2a889dd536d32dd',
            desc: 'Módulo detector de proximidad óptico por reflexión de haz infrarrojo con LED emisor, fototransistor receptor y comparador analógico LM393 ajustable.',
            specs: [
                { label: 'Emisor / Receptor', val: 'LED IR 940nm + Fototransistor' },
                { label: 'Rango de Detección', val: '2 cm a 30 cm (Ajustable por potenciómetro en placa)' },
                { label: 'Ángulo de Detección', val: '35 grados' },
                { label: 'Salida Digital', val: 'Nivel bajo (LOW / 0V) al detectar obstáculo' }
            ],
            keyPinouts: [
                { pin: 'VCC / GND', role: 'Alimentación 3.3V a 5V DC' },
                { pin: 'OUT', role: 'Salida digital TTL conectada a pin digital de Arduino' }
            ]
        },
        {
            id: 'oled-display-innolabs',
            name: 'Pantalla Gráfica OLED 0.96" Micro',
            category: 'Comunes',
            tag: 'Display OLED Micro',
            tagColor: '#0ea5e9',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/e4ba7e97c8a349cf8cd9fcb3760e2370/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'maekers',
            authorUrl: 'https://sketchfab.com/Innolabs01',
            modelUrl: 'https://sketchfab.com/3d-models/oled-display-e4ba7e97c8a349cf8cd9fcb3760e2370',
            desc: 'Módulo de pantalla OLED ultra compacto de bajo consumo para proyectos portátiles, wearables, relojes inteligentes e interfaces gráficas IoT.',
            specs: [
                { label: 'Tecnología', val: 'OLED Monocromático de Píxeles Autoiluminados' },
                { label: 'Consumo Energético', val: '0.04W (Ultra bajo consumo)' },
                { label: 'Ángulo de Visión', val: '> 160 grados' }
            ],
            keyPinouts: [
                { pin: 'VCC / GND', role: 'Alimentación 3.3V a 5V' },
                { pin: 'SCL / SDA', role: 'Bus I2C (Pines A5 y A4 de Arduino UNO)' }
            ]
        },
        {
            id: 'aula-36-display-oled-128x64-lab',
            name: 'Proyecto: Display OLED 128x64 en Protoboard (Aula 36)',
            category: 'Proyectos',
            tag: 'Interfaz Gráfica',
            tagColor: '#38bdf8',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/23165ae400774f9e913bcc19ad539ed7/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-36-display-oled-128x64-23165ae400774f9e913bcc19ad539ed7',
            desc: 'Montaje didáctico en protoboard que integra la pantalla gráfica OLED 128x64 con Arduino UNO mediante bus I2C para desplegar animaciones y telemetría.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 36 - Display OLED 128x64' },
                { label: 'Librerías Recomendadas', val: 'Adafruit_SSD1306 / Adafruit_GFX / U8g2' },
                { label: 'Conexión', val: 'Bus I2C compartido' }
            ],
            keyPinouts: [
                { pin: 'SDA / SCL', role: 'Arduino Pines A4 y A5' },
                { pin: 'VCC / GND', role: 'Alimentación 5V y Tierra' }
            ]
        },
        {
            id: 'adaptador-fuente-protoboard',
            name: 'Módulo Fuente de Alimentación para Protoboard (MB102)',
            category: 'Drivers',
            tag: 'Fuente de Poder',
            tagColor: '#f59e0b',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/728e46ea80ba4b298f9d7c9b4a1244c0/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/adaptador-de-fonte-para-protoboard-728e46ea80ba4b298f9d7c9b4a1244c0',
            desc: 'Módulo regulador de voltaje enchufable directamente en los rieles laterales de una protoboard estándar MB102 con selector independiente de 3.3V y 5V.',
            specs: [
                { label: 'Modelo Típico', val: 'MB102 Breadboard Power Supply Module' },
                { label: 'Voltaje de Entrada', val: '6.5V - 12V DC (Jack 2.1mm) o 5V (USB Tipo A)' },
                { label: 'Salidas Reguladas', val: '3.3V y 5V DC conmutables por Jumpers en cada riel' },
                { label: 'Corriente Máxima', val: '700 mA (Reguladores lineales AMS1117)' }
            ],
            keyPinouts: [
                { pin: 'Riel Izquierdo', role: 'Selector 0V / 3.3V / 5V mediante Jumper' },
                { pin: 'Riel Derecho', role: 'Selector 0V / 3.3V / 5V independiente' },
                { pin: 'Puerto USB Tipo A', role: 'Salida de 5V auxiliar para alimentar dispositivos externos' }
            ]
        },
        // ── 3. PROYECTOS Y CIRCUITOS ENSAMBLADOS ──
        {
            id: 'aula-04-semaforo-ir',
            name: 'Proyecto: Semáforo Inteligente con Sensor IR (Kit 2021)',
            category: 'Proyectos',
            tag: 'Control de Tráfico',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/d123b4479ab643c6b2b08ae274cfd9be/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-04-semaforo-inteligente-ir-kit-2021-d123b4479ab643c6b2b08ae274cfd9be',
            desc: 'Sistema de control de tráfico automatizado en protoboard: detecta la presencia de vehículos mediante sensor infrarrojo y conmuta la prioridad de la luz verde.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 04 - Semáforo Inteligente IR' },
                { label: 'Sensores', val: 'Módulo Obstáculo Infrarrojo' },
                { label: 'Luces de Señalización', val: '3 LEDs (Rojo, Amarillo, Verde) con resistores' }
            ],
            keyPinouts: [
                { pin: 'Sensor IR', role: 'Arduino Pin Digital D2' },
                { pin: 'LEDs Semáforo', role: 'Arduino Pines D10, D9, D8' }
            ]
        },
        {
            id: 'aula-28-motor-de-passo-lab',
            name: 'Proyecto: Control de Motor de Pasos con Driver ULN2003',
            category: 'Proyectos',
            tag: 'Robótica & Pasos',
            tagColor: '#8b5cf6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/b34306a0794349a0be92665081bb4b0c/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-28-motor-de-passo-b34306a0794349a0be92665081bb4b0c',
            desc: 'Circuito didáctico en protoboard para aprender secuencias de pasos (Wave Drive, Full Step y Half Step) en motores paso a paso 28BYJ-48 con Arduino.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 28 - Motor de Passo' },
                { label: 'Driver de Etapa', val: 'ULN2003 Darlington Array con LEDs de fase' },
                { label: 'Librería', val: 'Stepper.h / Custom Step Sequence' }
            ],
            keyPinouts: [
                { pin: 'Fases IN1 a IN4', role: 'Arduino Pines D8, D9, D10, D11' },
                { pin: 'Alimentación Driver', role: '5V - 12V Externa' }
            ]
        },
        {
            id: 'aula-13-push-button-led',
            name: 'Circuito Didáctico: Push Button con LED',
            category: 'Proyectos',
            tag: 'Entrada Digital',
            tagColor: '#38bdf8',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/f1e3822bfbb4417e9074f29338f3694a/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-13-push-button-botao-de-pressao-f1e3822bfbb4417e9074f29338f3694a',
            desc: 'Montaje en protoboard para aprender a leer el estado de un pulsador y encender un LED indicador con resistor pull-down.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 13 - Push Button (Botão de Pressão)' },
                { label: 'Controlador', val: 'Arduino UNO R3' },
                { label: 'Componentes', val: 'Pulsador táctil, Resistor 10kΩ, LED y Resistor 220Ω' },
                { label: 'Concepto Clave', val: 'digitalRead() e instrucción condicional if / else' }
            ],
            keyPinouts: [
                { pin: 'Pulsador', role: 'Arduino Pin Digital D2 (Entrada)' },
                { pin: 'LED', role: 'Arduino Pin Digital D13 (Salida)' }
            ]
        },
        {
            id: 'aula-8-aperte-para-acionar',
            name: 'Proyecto: Aperte Para Acionar',
            category: 'Proyectos',
            tag: 'Lógica Pulsador',
            tagColor: '#f59e0b',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/9a66b2b3e60c41c6a6b75746c55b6be5/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-8-aperte-para-acionar-9a66b2b3e60c41c6a6b75746c55b6be5',
            desc: 'Circuito didáctico en protoboard donde se programa el accionamiento interactivo de actuadores mediante la pulsación continua y momentánea.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 8 - Aperte Para Acionar' },
                { label: 'Placa', val: 'Arduino UNO R3' },
                { label: 'Enfoque', val: 'Interacción humana y señales digitales' }
            ],
            keyPinouts: [
                { pin: 'Botonera', role: 'Lectura de entrada en Pin D7' },
                { pin: 'Salida de Estado', role: 'Indicador luminoso en Pin D12' }
            ]
        },
        {
            id: 'aula-8-painel-senhas-2021',
            name: 'Proyecto: Panel de Contraseñas (Kit 2021)',
            category: 'Proyectos',
            tag: 'Seguridad Digital',
            tagColor: '#6366f1',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/2a7f7365f6c24111abd100642bff3220/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-08-painel-de-senhas-kit-2021-2a7f7365f6c24111abd100642bff3220',
            desc: 'Sistema de control de acceso por clave con pulsadores independientes, LEDs de validación (Aceptado/Rechazado) y buzzer acústico.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 08 - Painel de Senhas Kit 2021' },
                { label: 'Entradas', val: 'Matriz de pulsadores con código de secuencia' },
                { label: 'Indicadores', val: 'LED Verde (Correcto) / LED Rojo (Error)' }
            ],
            keyPinouts: [
                { pin: 'Pulsadores Clave', role: 'Arduino Pines D2, D3, D4' },
                { pin: 'LEDs Estado', role: 'Arduino Pines D8 y D9' }
            ]
        },
        {
            id: 'aula-8-painel-senhas-2023',
            name: 'Proyecto: Panel de Contraseñas (Kit 2023)',
            category: 'Proyectos',
            tag: 'Edición Actualizada',
            tagColor: '#8b5cf6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/c1f0722cdc3b409a82bc492827b45d21/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-08-painel-de-senhas-kit-2023-c1f0722cdc3b409a82bc492827b45d21',
            desc: 'Evolución del sistema de contraseña con cableado optimizado, mejor distribución de protoboard y control de acceso numérico.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 08 - Painel de Senhas Kit 2023' },
                { label: 'Controlador', val: 'Arduino UNO R3' },
                { label: 'Algoritmo', val: 'Array de comprobación de secuencia' }
            ],
            keyPinouts: [
                { pin: 'Botones 1, 2, 3', role: 'Arduino Pines D3, D4, D5' },
                { pin: 'Buzzer Sonoro', role: 'Arduino Pin D11 PWM (Tonos)' }
            ]
        },
        {
            id: 'aula-29-alarme-musical',
            name: 'Proyecto: Alarma Musical & Acústica',
            category: 'Proyectos',
            tag: 'Sonido / Buzzer',
            tagColor: '#ec4899',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/41ec5976debd40a2a6578ee634dfa854/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-29-alarme-musical-41ec5976debd40a2a6578ee634dfa854',
            desc: 'Circuito generador de melodías y sirenas de emergencia con Buzzer piezoeléctrico accionado por sensores o pulsadores de disparo.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 29 - Alarme Musical' },
                { label: 'Actuador Acústico', val: 'Buzzer Piezoeléctrico Pasivo' },
                { label: 'Funciones de Código', val: 'tone(pin, freq, dur) y noTone(pin)' }
            ],
            keyPinouts: [
                { pin: 'Buzzer (+)', role: 'Arduino Pin D9 PWM con resistencia limitadora' },
                { pin: 'Pulsador Disparo', role: 'Arduino Pin D2 (Interrupción INT0)' }
            ]
        },
        {
            id: 'aulas-23-24-25-genius',
            name: 'Proyecto: Juego de Memoria "Genius" (Simón Dice)',
            category: 'Proyectos',
            tag: 'Juego Interactivo',
            tagColor: '#eab308',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/2d19400de55b4d0f98766f51552c6e48/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aulas-23-24-e-25-genius-2d19400de55b4d0f98766f51552c6e48',
            desc: 'Consola interactiva del popular juego Simón Dice con 4 pulsadores, 4 LEDs de colores y generación de secuencias pseudoaleatorias con sonido.',
            specs: [
                { label: 'Clase / Lección', val: 'Aulas 23, 24 e 25 - Genius' },
                { label: 'Canales de Juego', val: '4 Colores (Rojo, Verde, Azul, Amarillo)' },
                { label: 'Estructura de Datos', val: 'Arreglo dinámico con randomSeed(analogRead(A0))' }
            ],
            keyPinouts: [
                { pin: 'LEDs 1 a 4', role: 'Arduino Pines D2, D3, D4, D5' },
                { pin: 'Botones 1 a 4', role: 'Arduino Pines D8, D9, D10, D11' },
                { pin: 'Buzzer', role: 'Arduino Pin D6' }
            ]
        },
        {
            id: 'aula-15-semaforo-pedestre',
            name: 'Proyecto: Semáforo Vehicular y Peatonal con Botón',
            category: 'Proyectos',
            tag: 'Automatismo Urbano',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/89dbd02b91bb42cebcb9bd5e1109f585/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-15-sem-car-e-ped-com-bot-kit-2021-89dbd02b91bb42cebcb9bd5e1109f585',
            desc: 'Simulación completa de cruce semafórico inteligente: semáforo de coches (R/A/V), semáforo de peatones (R/V) y pulsador de solicitud de cruce.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 15 - Semáforo Autos y Peatones' },
                { label: 'Controlador', val: 'Arduino UNO R3' },
                { label: 'LEDs Totales', val: '5 LEDs (3 Vehicular + 2 Peatonal)' },
                { label: 'Lógica Temporal', val: 'Máquina de estados finitos con millis()' }
            ],
            keyPinouts: [
                { pin: 'Semáforo Autos (R/A/V)', role: 'Arduino Pines D10, D9, D8' },
                { pin: 'Semáforo Peatón (R/V)', role: 'Arduino Pines D7, D6' },
                { pin: 'Botón Peatonal', role: 'Arduino Pin D2' }
            ]
        },
        {
            id: 'aula-25-resistor-led',
            name: 'Circuito Didáctico: Resistor para cada LED',
            category: 'Proyectos',
            tag: 'Fundamentos EE/RE',
            tagColor: '#eab308',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/6700a5f624804c3380f990393a395b3c/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-25-um-resistor-para-cada-led-6700a5f624804c3380f990393a395b3c',
            desc: 'Montaje didáctico en protoboard que demuestra la Ley de Ohm y la necesidad de colocar resistores limitadores de corriente independientes por cada diodo LED.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 25 - Resistor para cada LED' },
                { label: 'Controlador', val: 'Arduino UNO R3' },
                { label: 'Resistencias', val: '220 Ω / 330 Ω (Código de colores)' },
                { label: 'LEDs', val: 'Diodos emisores de luz rojo, amarillo y verde' },
                { label: 'Concepto Físico', val: 'Caída de tensión Vf y corriente If (20mA)' }
            ],
            keyPinouts: [
                { pin: 'Ánodo LED (Pata Larga)', role: 'Conectado a resistor y pin digital' },
                { pin: 'Cátodo LED (Pata Corta)', role: 'Conectado a riel negativo GND' }
            ]
        },

        // ── 4. DRIVERS Y PUENTES H ──
        {
            id: 'driver-l298n',
            name: 'Driver Puente H L298N',
            category: 'Drivers',
            tag: 'Control de Potencia',
            tagColor: '#ef4444',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/4226c9ad6210401fb21d7a1ec5f31c16/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'peddintiudaykiran176',
            authorUrl: 'https://sketchfab.com/peddintiudaykiran176',
            modelUrl: 'https://sketchfab.com/3d-models/l298n-motor-driver-4226c9ad6210401fb21d7a1ec5f31c16',
            desc: 'Módulo de doble puente H para controlar sentido de giro y velocidad (PWM) de 2 motores DC o 1 motor paso a paso bipolar.',
            specs: [
                { label: 'Chip Principal', val: 'L298N Dual H-Bridge' },
                { label: 'Voltaje Motor (Vs)', val: '5V - 35V DC' },
                { label: 'Corriente Pico', val: '2A por canal' },
                { label: 'Voltaje Lógico (Vss)', val: '5V' },
                { label: 'Potencia Máxima', val: '25W' },
                { label: 'Regulador 78M05', val: 'Integrado (Jump 5V)' },
                { label: 'Protección', val: 'Diodos de supresión back-EMF' },
                { label: 'Disipador Térmico', val: 'Aluminio anodizado' }
            ],
            keyPinouts: [
                { pin: 'ENA y ENB', role: 'Habilitación y control de velocidad PWM' },
                { pin: 'IN1, IN2, IN3, IN4', role: 'Control de sentido (Horario/Antihorario)' },
                { pin: 'OUT1 - OUT4', role: 'Borneras de salida hacia motores A y B' },
                { pin: 'Bornera GND / VMS', role: 'Masa común y alimentación de batería' }
            ]
        },
        {
            id: 'shield-l293d',
            name: 'Motor Shield L293D',
            category: 'Drivers',
            tag: 'Shield Arduino',
            tagColor: '#3b82f6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/887fb608b35447c2b0cef2f3b61ef28c/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/motor-shield-l293d-887fb608b35447c2b0cef2f3b61ef28c',
            desc: 'Placa de expansión directa para Arduino UNO. Permite controlar hasta 4 motores DC bidireccionales, 2 motores paso a paso y 2 servomotores.',
            specs: [
                { label: 'Chips L293D', val: '2 Puentes H Cuádruples' },
                { label: 'Registro de Desplazamiento', val: '74HC595 (Ahorro de pines)' },
                { label: 'Motores DC Soportados', val: 'Hasta 4 (0.6A - 1.2A pico)' },
                { label: 'Servomotores', val: '2 Puertos dedicados (5V)' },
                { label: 'Alimentación Externa', val: 'Bornera EXT_PWR dedicada' },
                { label: 'Pulsador de Reset', val: 'Integrado en placa' },
                { label: 'Librería Oficial', val: 'AFMotor.h' }
            ],
            keyPinouts: [
                { pin: 'M1, M2, M3, M4', role: 'Borneras de conexión motores DC' },
                { pin: 'SERVO 1 y SERVO 2', role: 'Pines dedicados (D10 y D9)' },
                { pin: 'Jumper PWR', role: 'Une alimentación Arduino con motores' }
            ]
        },
        {
            id: 'conexiones-puente-h',
            name: 'Ensamble de Control Motores DC',
            category: 'Proyectos',
            tag: 'Circuito Completo',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/1d02d9e79fc54187a90ae17f061b5046/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-31-controle-de-motores-dc-kit-2023-1d02d9e79fc54187a90ae17f061b5046',
            desc: 'Circuito completo montado en protoboard que ilustra el conexionado de Arduino UNO con el driver de potencia, batería y motores DC.',
            specs: [
                { label: 'Tipo de Ensamble', val: 'Kit Educativo Robótica 2023' },
                { label: 'Controlador', val: 'Arduino UNO R3' },
                { label: 'Actuadores', val: '2 Motores BO con Ruedas' },
                { label: 'Fuente de Poder', val: 'Portapilas / Batería Li-Ion' }
            ],
            keyPinouts: [
                { pin: 'Señales de Giro', role: 'Arduino D4, D5, D6, D7 hacia driver' },
                { pin: 'PWM Velocidad', role: 'Arduino D9 y D10 hacia ENA/ENB' },
                { pin: 'Tierra Común', role: 'GND Arduino unida a GND batería' }
            ]
        },

        // ── 5. MOTORES Y ACTUADORES ──
        {
            id: 'stepper-nema-industrial',
            name: 'Motor Paso a Paso Híbrido NEMA',
            category: 'Actuadores',
            tag: 'CNC / Industrial',
            tagColor: '#6366f1',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/458dbc5bf94045f8beff19e13898ad2f/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Sketchfab Creator',
            authorUrl: 'https://sketchfab.com',
            modelUrl: 'https://sketchfab.com/3d-models/electronic-stepper-motor-458dbc5bf94045f8beff19e13898ad2f',
            desc: 'Motor paso a paso bipolar híbrido de alto torque para impresoras 3D, routers CNC, mesas de corte láser y actuadores lineales industriales.',
            specs: [
                { label: 'Tipo de Motor', val: 'Paso a Paso Bipolar Híbrido (NEMA)' },
                { label: 'Ángulo por Paso', val: '1.8° por paso (200 pasos/vuelta)' },
                { label: 'Control', val: 'Drivers A4988 / TMC2209 / DRV8825' },
                { label: 'Bobinados', val: '2 Fases Bipolares (4 Hilos: A+, A-, B+, B-)' }
            ],
            keyPinouts: [
                { pin: 'Bobina A (A1 / A2)', role: 'Cables Rojo y Azul al driver' },
                { pin: 'Bobina B (B1 / B2)', role: 'Cables Verde y Negro al driver' }
            ]
        },
        {
            id: 'motor-dc-type130-brushless',
            name: 'Motor DC Tipo 130 Brushless / Coreless',
            category: 'Actuadores',
            tag: 'Alta Velocidad',
            tagColor: '#0ea5e9',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/6b6b19f1986e4dcdba38d2642c8fc61c/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'SomeGuyUsingBlender',
            authorUrl: 'https://sketchfab.com/SomeGuyUsingBlender',
            modelUrl: 'https://sketchfab.com/3d-models/type-130-dc-brushless-motor-6b6b19f1986e4dcdba38d2642c8fc61c',
            desc: 'Motor miniatura tipo 130 de alta rotación para vehículos de juguete, pequeños robots y hélices de ventilación.',
            specs: [
                { label: 'Formato / Chasis', val: 'Tipo 130 Micro Motor' },
                { label: 'Tensión Nominal', val: '3V - 6V DC' },
                { label: 'Velocidad', val: 'Hasta 12,000 RPM (a 6V)' }
            ],
            keyPinouts: [
                { pin: 'Terminales +/-', role: 'Inversión de polaridad cambia dirección de giro' }
            ]
        },
        {
            id: 'motor-reduction-gear-metal',
            name: 'Motorreductor con Caja de Engranajes Metálicos (GA12-N20)',
            category: 'Actuadores',
            tag: 'Alto Torque / Mini',
            tagColor: '#f59e0b',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/de762670ae4c4cfeb1d06ca0ab215b32/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'chiwei',
            authorUrl: 'https://sketchfab.com/chiwei2333',
            modelUrl: 'https://sketchfab.com/3d-models/reduction-gear-motor-de762670ae4c4cfeb1d06ca0ab215b32',
            desc: 'Motorreductor micrométrico con piñonería 100% de bronce/acero templado. Ofrece un altísimo par motor en un volumen extremadamente compacto para mini sumos y cerraduras electrónicas.',
            specs: [
                { label: 'Tipo de Reductora', val: 'Engranajes rectos metálicos cilíndricos' },
                { label: 'Voltaje Nominal', val: '6V DC (Soporta 3V a 12V)' },
                { label: 'Torque de Bloqueo', val: 'Hasta 2.5 kg·cm' },
                { label: 'Eje de Salida', val: 'Eje tipo D (3 mm diámetro)' }
            ],
            keyPinouts: [
                { pin: 'Polo Positivo (+)', role: 'Salida de driver de potencia' },
                { pin: 'Polo Negativo (-)', role: 'Retorno de corriente a driver' }
            ]
        },
        {
            id: 'motor-dc-3v-6v-hobby',
            name: 'Motor DC Hobby 3V - 6V con Eje Estándar',
            category: 'Actuadores',
            tag: 'Motor Educativo',
            tagColor: '#eab308',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/251868bd4b614083a14765f01c883493/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'DaylaQuan',
            authorUrl: 'https://sketchfab.com/DaylaQuan',
            modelUrl: 'https://sketchfab.com/3d-models/motor-dc-3v-6v-251868bd4b614083a14765f01c883493',
            desc: 'Motor de corriente continua de imán permanente para kits educativos escolares, experimentos de inducción electromagnética y hélices.',
            specs: [
                { label: 'Tensión Operativa', val: '3V a 6V DC' },
                { label: 'Consumo sin Carga', val: '0.2A' },
                { label: 'Aplicación', val: 'Proyectos básicos STEAM de primaria y secundaria' }
            ],
            keyPinouts: [
                { pin: 'Terminales A / B', role: 'Conexión a transistores NPN (2N2222 / TIP120)' }
            ]
        },
        {
            id: 'motor-bo',
            name: 'Motorreductor BO (Yellow Motor)',
            category: 'Actuadores',
            tag: 'Motor DC',
            tagColor: '#f59e0b',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/8814186842ac429fb01bf687a2bdce33/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'peddintiudaykiran176',
            authorUrl: 'https://sketchfab.com/peddintiudaykiran176',
            modelUrl: 'https://sketchfab.com/3d-models/bo-battery-operated-motor-8814186842ac429fb01bf687a2bdce33',
            desc: 'Motor DC con caja reductora plástica (relación 1:48). Es el motor estándar más popular en robótica móvil escolar y universitaria.',
            specs: [
                { label: 'Voltaje de Trabajo', val: '3V - 6V DC' },
                { label: 'Relación de Reducción', val: '1:48' },
                { label: 'Velocidad sin Carga', val: '200 RPM (a 6V)' },
                { label: 'Consumo sin Carga', val: '70 mA (a 3V) / 250 mA max' },
                { label: 'Torque Máximo', val: '0.8 kg·cm (a 6V)' },
                { label: 'Eje de Salida', val: 'Doble eje plano (para rueda/encoder)' }
            ],
            keyPinouts: [
                { pin: 'Terminal (+)', role: 'Polo positivo (giro horario/antihorario)' },
                { pin: 'Terminal (-)', role: 'Polo negativo (retorno de corriente)' }
            ]
        },
        {
            id: 'motor-paso-a-paso',
            name: 'Motor Paso a Paso 28BYJ-48',
            category: 'Actuadores',
            tag: 'Alta Precisión',
            tagColor: '#8b5cf6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/554dd0d074fa463098061ffcd7b4829d/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/motor-de-passo-554dd0d074fa463098061ffcd7b4829d',
            desc: 'Motor de pasos 28BYJ-48 con reductora interna. Permite posicionamiento angular exacto sin sensores de realimentación (lazo abierto).',
            specs: [
                { label: 'Modelo Típico', val: '28BYJ-48 Unipolar' },
                { label: 'Voltaje Nominal', val: '5V DC' },
                { label: 'Número de Fases', val: '4 Fases (A, B, C, D)' },
                { label: 'Pasos por Vuelta Completa', val: '4096 pasos (Medio paso)' }
            ],
            keyPinouts: [
                { pin: 'Cable Rojo', role: 'Común VCC (+5V)' },
                { pin: 'Cables Fase 1-4', role: 'Conexión a driver ULN2003' }
            ]
        },
        {
            id: 'servomotor-sg90',
            name: 'Servomotor de Precisión (Micro Servo)',
            category: 'Actuadores',
            tag: 'Control Angular',
            tagColor: '#06b6d4',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/6e5ff0e57708426b87ea8cf2edfbb2cc/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Marco De Simone',
            authorUrl: 'https://sketchfab.com/marcodesimone888',
            modelUrl: 'https://sketchfab.com/3d-models/arduino-servomotor-6e5ff0e57708426b87ea8cf2edfbb2cc',
            desc: 'Servomotor angular de 180° controlado mediante pulsos PWM de 50 Hz. Esencial para brazos robóticos, timones y garras mecánicas.',
            specs: [
                { label: 'Rango de Giro', val: '0° a 180° (Posición angular)' },
                { label: 'Voltaje Operativo', val: '4.8V - 6.0V DC' },
                { label: 'Torque', val: '1.8 kg·cm (a 4.8V)' },
                { label: 'Señal de Control', val: 'PWM (Pulsos de 1ms a 2ms / 20ms)' }
            ],
            keyPinouts: [
                { pin: 'Naranja/Amarillo', role: 'Señal de control PWM (Pin digital)' },
                { pin: 'Rojo', role: 'Alimentación positiva (+5V)' },
                { pin: 'Marrón/Negro', role: 'GND (Tierra común)' }
            ]
        },
        {
            id: 'aula-16-servo',
            name: 'Módulo Práctico: Servomotor Individual',
            category: 'Actuadores',
            tag: 'Laboratorio',
            tagColor: '#0284c7',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/5aa81171a538478abff61cf5dfc86473/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-16-servomotor-5aa81171a538478abff61cf5dfc86473',
            desc: 'Montaje didáctico para estudiar la calibración, barrido angular (Sweep) y posicionamiento del servomotor con potenciómetro.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 16 - Servomotores' },
                { label: 'Sensor de Mando', val: 'Potenciómetro 10k (Lectura analógica)' }
            ],
            keyPinouts: [
                { pin: 'Potenciómetro', role: 'Arduino A0 (Lectura ADC)' },
                { pin: 'Servo PWM', role: 'Arduino Pin D9' }
            ]
        },
        {
            id: 'aula-18-multi-servo',
            name: 'Control Multieje de Servomotores',
            category: 'Actuadores',
            tag: 'Multieje',
            tagColor: '#6366f1',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/f74e1d9820bb439591fffb57fbc0e7df/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-18-controlando-servomotores-f74e1d9820bb439591fffb57fbc0e7df',
            desc: 'Configuración para sincronizar múltiples servomotores simultáneamente con joysticks o potenciómetros independientes.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 18 - Control Simultáneo' },
                { label: 'Canales PWM Activos', val: '2 a 4 Servos independientes' }
            ],
            keyPinouts: [
                { pin: 'Servo Pan / Tilt', role: 'Arduino Pines D9 y D10' }
            ]
        },

        // ── 6. ROBOTS COMPLETOS Y MECANISMOS ──
        {
            id: 'chassi-2wd',
            name: 'Chasis Robótico 2WD (Smart Car)',
            category: 'Robots',
            tag: 'Plataforma Móvil',
            tagColor: '#ec4899',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/91319184ddff4873b6d8a0991e52ed83/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-32-chassi-2wd-robo-kit-2023-91319184ddff4873b6d8a0991e52ed83',
            desc: 'Estructura base de acrílico con 2 ruedas motrices y rueda loca (caster wheel). Es el chasis móvil estándar para todos los retos de robótica autónoma.',
            specs: [
                { label: 'Tracción', val: 'Diferencial 2WD' },
                { label: 'Rueda de Apoyo', val: 'Rueda loca universal (Caster)' },
                { label: 'Material Chasis', val: 'Acrílico cortado a láser' }
            ],
            keyPinouts: [
                { pin: 'Motores', role: 'Conexión a driver L298N' }
            ]
        },
        {
            id: 'seguidor-linea',
            name: 'Robot Seguidor de Línea Autónomo',
            category: 'Robots',
            tag: 'Lógica Óptica',
            tagColor: '#14b8a6',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/aaafac5b7fbb4c06b39241a3225454b1/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-33-seguidor-de-linha-kit-2023-aaafac5b7fbb4c06b39241a3225454b1',
            desc: 'Robot móvil ensamblado con matriz de sensores infrarrojos TCRT5000 para navegación automática sobre pistas con cinta negra reflectiva.',
            specs: [
                { label: 'Sensores de Pista', val: 'Módulo Infrarrojo TCRT5000' },
                { label: 'Algoritmo', val: 'Control Proporcional / if-else' }
            ],
            keyPinouts: [
                { pin: 'Sensor Izq / Der', role: 'Arduino Pines D2 y D3' }
            ]
        },
        {
            id: 'braco-robotico',
            name: 'Brazo Robótico Articulado (4 DOF)',
            category: 'Robots',
            tag: 'Cinemática',
            tagColor: '#a855f7',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/03d7364f2f02487a9c4deec73801e46a/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-21-braco-robotico-03d7364f2f02487a9c4deec73801e46a',
            desc: 'Brazo mecánico impreso en 3D / acrílico con 4 servomotores: Base (Giro 180°), Hombro, Codo y Pinza Garra (Gripper).',
            specs: [
                { label: 'Grados de Libertad (DOF)', val: '4 Ejes independientes' },
                { label: 'Actuadores', val: '4 Micro Servos SG90' }
            ],
            keyPinouts: [
                { pin: 'Servos 1 a 4', role: 'Arduino Pines D3, D5, D6 y D9' }
            ]
        },
        {
            id: 'robo-sumo',
            name: 'Robot Mini Sumo de Combate',
            category: 'Robots',
            tag: 'Competencia',
            tagColor: '#e11d48',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/d20591c4e3cf4b16b11fa3fc477ed097/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-38-robo-sumo-kit-2021-d20591c4e3cf4b16b11fa3fc477ed097',
            desc: 'Robot de combate con pala frontal biselada, sensores de línea para no salir del dohyo y sensor ultrasónico para embestir al rival.',
            specs: [
                { label: 'Categoría', val: 'Mini Sumo (10x10 cm, 500g)' },
                { label: 'Sensor de Búsqueda', val: 'Ultrasónico HC-SR04' }
            ],
            keyPinouts: [
                { pin: 'Trigger / Echo', role: 'Arduino Pines D11 y D12' }
            ]
        },
        {
            id: 'robo-wifi',
            name: 'Robot Explorador WiFi Teleoperado',
            category: 'Robots',
            tag: 'IoT & WiFi',
            tagColor: '#0284c7',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/f12499b337354cf6969860284776db83/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Cleiton Rosa',
            authorUrl: 'https://sketchfab.com/cleitonrosa',
            modelUrl: 'https://sketchfab.com/3d-models/robo-wifi-f12499b337354cf6969860284776db83',
            desc: 'Plataforma robótica conectada a red inalámbrica para control remoto desde navegador web o aplicación móvil mediante websockets.',
            specs: [
                { label: 'Módulo de Red', val: 'ESP8266 / NodeMCU / ESP32' },
                { label: 'Protocolo de Mando', val: 'WebSockets / HTTP Server' }
            ],
            keyPinouts: [
                { pin: 'Serial ESP-Arduino', role: 'TX/RX cruzado' }
            ]
        },
        {
            id: 'cancela-automatica',
            name: 'Cancela de Acceso Automática',
            category: 'Robots',
            tag: 'Mecanismo',
            tagColor: '#f97316',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/17be6013bf964c66b2a5c16afec50f57/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-36-cancela-automatica-17be6013bf964c66b2a5c16afec50f57',
            desc: 'Sistema automatizado de talanquera / peaje con detección ultrasónica de vehículos, apertura por servomotor y señalización con LEDs.',
            specs: [
                { label: 'Clase / Lección', val: 'Aula 36 - Automatización' },
                { label: 'Detector', val: 'Sensor Ultrasónico HC-SR04' }
            ],
            keyPinouts: [
                { pin: 'LEDs Rojo/Verde', role: 'Arduino D7 y D8' },
                { pin: 'Servo Barrera', role: 'Arduino Pin D9' }
            ]
        },
        {
            id: 'robo-equilibrista',
            name: 'Robot Autobalanceado (Self-Balancing)',
            category: 'Robots',
            tag: 'Control PID',
            tagColor: '#10b981',
            sketchfabEmbedUrl: 'https://sketchfab.com/models/9298bf226fd1407ab06d52a6403e27b2/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0',
            authorName: 'Robótica Paraná',
            authorUrl: 'https://sketchfab.com/roboticaparana',
            modelUrl: 'https://sketchfab.com/3d-models/aula-35-robo-equilibrista-9298bf226fd1407ab06d52a6403e27b2',
            desc: 'Robot de 2 ruedas basado en el principio del péndulo invertido. Mantiene su centro de gravedad vertical mediante un sensor MPU-6050 y control PID.',
            specs: [
                { label: 'Sensor Inercial', val: 'MPU-6050 (Giro + Acelerómetro)' },
                { label: 'Algoritmo', val: 'Filtro Complementario + PID' }
            ],
            keyPinouts: [
                { pin: 'Bus I2C', role: 'SDA (A4) y SCL (A5)' },
                { pin: 'Interrupción', role: 'Arduino Pin D2' }
            ]
        }
    ];

    const categories = [
        { id: 'all', name: 'Todos', icon: Layers, count: components.length, color: '#0284c7' },
        { id: 'Controladores', name: 'Placas', icon: Cpu, count: components.filter(c => c.category === 'Controladores').length, color: '#00979C' },
        { id: 'Sensores', name: 'Sensores', icon: Activity, count: components.filter(c => c.category === 'Sensores').length, color: '#10b981' },
        { id: 'Comunes', name: 'Comunes', icon: Box, count: components.filter(c => c.category === 'Comunes').length, color: '#f97316' },
        { id: 'Proyectos', name: 'Proyectos', icon: Sparkles, count: components.filter(c => c.category === 'Proyectos').length, color: '#eab308' },
        { id: 'Drivers', name: 'Drivers', icon: Zap, count: components.filter(c => c.category === 'Drivers').length, color: '#8b5cf6' },
        { id: 'Actuadores', name: 'Motores', icon: Disc, count: components.filter(c => c.category === 'Actuadores').length, color: '#f43f5e' },
        { id: 'Robots', name: 'Robots', icon: Bot, count: components.filter(c => c.category === 'Robots').length, color: '#6366f1' },
    ];

    // Filtrado por categoría y búsqueda textual
    const filteredComponents = components.filter(c => {
        const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
        const matchesSearch = !searchTerm.trim() || 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.desc.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const searchResults = searchTerm.trim()
        ? components.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (searchTerm.trim().length > 3 && c.desc.toLowerCase().includes(searchTerm.toLowerCase()))
        ).sort((a, b) => {
            const s = searchTerm.toLowerCase();
            const aNameOrTag = a.name.toLowerCase().includes(s) || a.tag.toLowerCase().includes(s);
            const bNameOrTag = b.name.toLowerCase().includes(s) || b.tag.toLowerCase().includes(s);
            if (aNameOrTag && !bNameOrTag) return -1;
            if (!aNameOrTag && bNameOrTag) return 1;
            return 0;
        })
        : [];

    const currentComp = components.find(c => c.id === activeComponent) || components[0];

    return (
        <div className="components-modal-wrapper">
            {/* Barra de Navegación con Menús Desplegables de Categoría + Buscador Integrado */}
            <div className="components-top-bar">
                {/* 1. Botones de Categorías con Menú Desplegable Directo */}
                <div className="components-categories-track">
                    {categories.map(cat => {
                        const IconComp = cat.icon;
                        const catItems = cat.id === 'all' ? components : components.filter(c => c.category === cat.id);
                        const isCatActive = cat.id === 'all' 
                            ? selectedCategory === 'all' 
                            : currentComp.category === cat.id;
                        const isOpen = openCategoryDropdown === cat.id;

                        return (
                            <div 
                                key={cat.id} 
                                data-category-id={cat.id}
                                className="components-cat-pill-wrapper"
                                style={{ position: 'relative' }}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        setOpenCategoryDropdown(prev => prev === cat.id ? null : cat.id);
                                        setIsSearchOpen(false);
                                    }}
                                    className="components-cat-btn"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '5px 8px',
                                        borderRadius: '9px',
                                        fontSize: '0.73rem',
                                        fontWeight: isCatActive ? 850 : 700,
                                        background: isCatActive 
                                            ? cat.color 
                                            : isOpen 
                                                ? `${cat.color}18` 
                                                : 'var(--surface-card-subtle)',
                                        color: isCatActive ? '#ffffff' : 'var(--text-heading)',
                                        border: isCatActive 
                                            ? `1px solid ${cat.color}` 
                                            : isOpen 
                                                ? `1px solid ${cat.color}` 
                                                : `1px solid ${cat.color}35`,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        whiteSpace: 'nowrap',
                                        boxShadow: isCatActive ? `0 3px 10px ${cat.color}45` : 'none',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isCatActive) {
                                            e.currentTarget.style.background = `${cat.color}15`;
                                            e.currentTarget.style.borderColor = cat.color;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isCatActive) {
                                            e.currentTarget.style.background = isOpen ? `${cat.color}18` : 'var(--surface-card-subtle)';
                                            e.currentTarget.style.borderColor = isOpen ? cat.color : `${cat.color}35`;
                                        }
                                    }}
                                >
                                    <IconComp size={13} color={isCatActive ? '#ffffff' : cat.color} />
                                    <span>{cat.name}</span>
                                    <span style={{
                                        fontSize: '0.64rem',
                                        fontWeight: 800,
                                        background: isCatActive ? 'rgba(255, 255, 255, 0.28)' : `${cat.color}18`,
                                        color: isCatActive ? '#ffffff' : cat.color,
                                        padding: '1px 5px',
                                        borderRadius: '5px'
                                    }}>
                                        {cat.count}
                                    </span>
                                    <ChevronDown 
                                        size={11} 
                                        color={isCatActive ? '#ffffff' : cat.color}
                                        style={{ 
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                                            transition: 'transform 0.18s ease',
                                            opacity: isCatActive ? 1 : 0.75
                                        }} 
                                    />
                                </button>

                                {/* Desplegable Flotante Anclado al Botón */}
                                {isOpen && (
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 8px)',
                                            left: ['Drivers', 'Actuadores', 'Robots'].includes(cat.id) ? 'auto' : 0,
                                            right: ['Drivers', 'Actuadores', 'Robots'].includes(cat.id) ? 0 : 'auto',
                                            minWidth: '240px',
                                            maxWidth: 'min(350px, calc(100vw - 32px))',
                                            maxHeight: '340px',
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            background: 'var(--surface-panel)',
                                            border: `1.5px solid ${cat.color}50`,
                                            borderTop: `3px solid ${cat.color}`,
                                            borderRadius: '14px',
                                            boxShadow: `0 16px 40px rgba(0, 0, 0, 0.35), 0 2px 12px ${cat.color}25`,
                                            padding: '0.45rem',
                                            zIndex: 250,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px'
                                        }}
                                    >
                                        <div style={{
                                            padding: '4px 8px',
                                            fontSize: '0.66rem',
                                            fontWeight: 800,
                                            color: cat.color,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.4px',
                                            borderBottom: '1px solid var(--border-subtle)',
                                            marginBottom: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <IconComp size={12} />
                                                {cat.name}
                                            </span>
                                            <span style={{
                                                background: `${cat.color}18`,
                                                color: cat.color,
                                                padding: '1px 6px',
                                                borderRadius: '4px',
                                                fontWeight: 800
                                            }}>
                                                {catItems.length} modelos
                                            </span>
                                        </div>

                                        {catItems.map(item => {
                                            const isItemSelected = item.id === activeComponent;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveComponent(item.id);
                                                        setSelectedCategory(cat.id === 'all' ? 'all' : item.category);
                                                        setOpenCategoryDropdown(null);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '8px',
                                                        padding: '0.42rem 0.6rem',
                                                        borderRadius: '8px',
                                                        background: isItemSelected ? `${cat.color}18` : 'transparent',
                                                        border: isItemSelected ? `1px solid ${cat.color}` : '1px solid transparent',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        transition: 'all 0.12s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isItemSelected) e.currentTarget.style.background = `${cat.color}0c`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isItemSelected) e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    <span style={{
                                                        fontSize: '0.76rem',
                                                        fontWeight: isItemSelected ? 850 : 650,
                                                        color: isItemSelected ? cat.color : 'var(--text-heading)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {item.name}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.62rem',
                                                        fontWeight: 800,
                                                        color: item.tagColor || cat.color,
                                                        background: `${item.tagColor || cat.color}18`,
                                                        padding: '1px 5px',
                                                        borderRadius: '4px',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0
                                                    }}>
                                                        {item.tag}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 2. Buscador Textual en Tiempo Real con Menú Flotante */}
                <div 
                    ref={searchContainerRef} 
                    className="components-search-box"
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--surface-card-subtle)',
                        border: isSearchOpen && searchTerm ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-default)',
                        borderRadius: '10px',
                        padding: '0.35rem 0.65rem',
                        transition: 'all 0.15s ease'
                    }}>
                        <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsSearchOpen(true);
                                if (openCategoryDropdown) setOpenCategoryDropdown(null);
                            }}
                            onFocus={() => {
                                if (searchTerm.trim()) setIsSearchOpen(true);
                                if (openCategoryDropdown) setOpenCategoryDropdown(null);
                            }}
                            placeholder="Buscar sensor, chip..."
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-heading)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                width: '100%',
                                outline: 'none'
                            }}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setIsSearchOpen(false);
                                }}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '2px'
                                }}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Menú Flotante de Resultados de Búsqueda */}
                    {isSearchOpen && searchTerm.trim() && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            right: 0,
                            width: 'min(320px, calc(100vw - 32px))',
                            maxHeight: '340px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            background: 'var(--surface-panel)',
                            border: '1.5px solid var(--border-default)',
                            borderRadius: '14px',
                            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.1)',
                            padding: '0.45rem',
                            zIndex: 260,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                        }}>
                            <div style={{
                                padding: '4px 8px',
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                                borderBottom: '1px solid var(--border-subtle)',
                                marginBottom: '3px',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>Coincidencias</span>
                                <span>{searchResults.length} {searchResults.length === 1 ? 'modelo' : 'modelos'}</span>
                            </div>

                            {searchResults.length === 0 ? (
                                <div style={{ padding: '0.85rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                    No se encontraron modelos con "{searchTerm}"
                                </div>
                            ) : (
                                searchResults.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveComponent(item.id);
                                            setSelectedCategory(item.category);
                                            setSearchTerm('');
                                            setIsSearchOpen(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '8px',
                                            padding: '0.42rem 0.6rem',
                                            borderRadius: '8px',
                                            background: item.id === activeComponent ? 'var(--surface-card-hover)' : 'transparent',
                                            border: item.id === activeComponent ? `1px solid ${item.tagColor || '#00979C'}` : '1px solid transparent',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.12s ease',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (item.id !== activeComponent) e.currentTarget.style.background = 'var(--surface-card-subtle)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (item.id !== activeComponent) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <span style={{
                                            fontSize: '0.76rem',
                                            fontWeight: item.id === activeComponent ? 850 : 650,
                                            color: item.id === activeComponent ? (item.tagColor || 'var(--brand-primary)') : 'var(--text-heading)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            minWidth: 0,
                                            flex: 1
                                        }}>
                                            {item.name}
                                        </span>
                                        <span style={{
                                            fontSize: '0.62rem',
                                            fontWeight: 800,
                                            color: item.tagColor || '#00979C',
                                            background: `${item.tagColor || '#00979C'}18`,
                                            padding: '2px 5px',
                                            borderRadius: '4px',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0
                                        }}>
                                            {item.tag}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Layout Principal: Visor 3D a la Izquierda y Ficha Técnica a la Derecha */}
            <div className="components-main-grid">
                {/* ── COLUMNA IZQUIERDA: VISOR 3D SKETCHFAB ── */}
                <div className="components-viewer-card">
                    <div style={{
                        padding: '0.75rem 1.1rem',
                        background: 'var(--surface-card-subtle)',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '6px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Box size={18} color={currentComp.tagColor || '#00979C'} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                Visor 3D: {currentComp.name}
                            </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            🖱️ Gira • Arrastra • Zoom
                        </span>
                    </div>

                    {/* iFrame Embed Sketchfab con key para forzar recarga limpia al cambiar de modelo */}
                    <div className="components-iframe-wrap">
                        <iframe 
                            key={currentComp.id}
                            title={currentComp.name} 
                            frameBorder="0" 
                            allowFullScreen 
                            mozallowfullscreen="true" 
                            webkitallowfullscreen="true" 
                            allow="autoplay; fullscreen; xr-spatial-tracking" 
                            xr-spatial-tracking="true" 
                            execution-while-out-of-viewport="true" 
                            execution-while-not-rendered="true" 
                            web-share="true" 
                            src={currentComp.sketchfabEmbedUrl}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    </div>

                    {/* Créditos y Footer de Sketchfab */}
                    <div style={{
                        padding: '0.55rem 1.1rem',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--surface-card-subtle)',
                        borderTop: '1px solid var(--border-subtle)',
                        flexWrap: 'wrap',
                        gap: '4px'
                    }}>
                        <span>
                            Modelo 3D por{' '}
                            <a 
                                href={currentComp.authorUrl} 
                                target="_blank" 
                                rel="noreferrer nofollow" 
                                style={{ fontWeight: 750, color: currentComp.tagColor || '#00979C', textDecoration: 'none' }}
                            >
                                {currentComp.authorName}
                            </a>
                        </span>
                        <a 
                            href={currentComp.modelUrl} 
                            target="_blank" 
                            rel="noreferrer nofollow" 
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 750 }}
                        >
                            <span>Sketchfab</span>
                            <ExternalLink size={13} />
                        </a>
                    </div>
                </div>

                {/* ── COLUMNA DERECHA: INFORMACIÓN Y FICHA TÉCNICA DEL COMPONENTE ── */}
                <div className="components-info-card">
                    {/* Tarjeta de Encabezado y Descripción */}
                    <div style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '16px',
                        padding: '1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                <Info size={17} color={currentComp.tagColor || '#00979C'} />
                                <span style={{ fontSize: '0.9rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                    Descripción Funcional
                                </span>
                            </div>
                            <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color: currentComp.tagColor || '#00979C',
                                background: `${currentComp.tagColor || '#00979C'}18`,
                                border: `1px solid ${currentComp.tagColor || '#00979C'}35`,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                textTransform: 'uppercase'
                            }}>
                                {currentComp.tag}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                            {currentComp.desc}
                        </p>
                    </div>

                    {/* Tabla de Especificaciones Técnicas */}
                    {currentComp.specs && currentComp.specs.length > 0 && (
                        <div style={{
                            background: 'var(--surface-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '16px',
                            padding: '1rem 1.1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.65rem',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)'
                        }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 850, color: 'var(--text-heading)', letterSpacing: '-0.1px' }}>
                                📋 Parámetros de Ingeniería & Rendimiento
                            </span>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.6rem 0.85rem'
                            }}>
                                {currentComp.specs.map((s, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                        <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                            {s.label}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-heading)', fontWeight: 800 }}>
                                            {s.val}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pines Clave / Conexiones */}
                    {currentComp.keyPinouts && currentComp.keyPinouts.length > 0 && (
                        <div style={{
                            background: 'var(--surface-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '16px',
                            padding: '1rem 1.1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.6rem',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)'
                        }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 850, color: 'var(--text-heading)' }}>
                                ⚡ Pines y Conexiones de Señal / Potencia
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                {currentComp.keyPinouts.map((k, idx) => (
                                    <div 
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            gap: '7px',
                                            fontSize: '0.78rem',
                                            color: 'var(--text-body)',
                                            padding: '6px 8px',
                                            background: 'var(--surface-card-subtle)',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-subtle)'
                                        }}
                                    >
                                        <span style={{ fontWeight: 850, color: currentComp.tagColor || '#00979C', whiteSpace: 'nowrap' }}>
                                            {k.pin}:
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                                            {k.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
