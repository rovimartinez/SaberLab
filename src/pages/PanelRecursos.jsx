import React, { useState, useMemo } from 'react';
import { 
    FolderOpen, FileText, Video, Download, Search, Filter, ExternalLink, 
    Book, Link as LinkIcon, Zap, Bot, Code, FlaskConical, Box, Brain, 
    CheckCircle2, AlertCircle, Layers, Sparkles, Check
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import '../styles/PanelRecursos.css';

// ── BANCO DE CONTENIDOS TÉCNICOS REALES PARA DESCARGA DIRECTA ──────────
const RESOURCE_CONTENTS = {
    'ee-1': {
        filename: 'Manual_Tecnico_Ley_de_Ohm_y_Kirchhoff_SaberLab.md',
        type: 'text/markdown;charset=utf-8;',
        content: `# SABERLAB - MANUAL TÉCNICO DE FUNDAMENTOS ELÉCTRICOS
Curso: Electricidad y Electrónica Básica (EE)
Módulo 1: Fundamentos y Leyes de Circuitos

---

## 1. LEY DE OHM
Establece la relación matemática fundamental entre Tensión (V), Corriente (I) y Resistencia (R):

- **Voltaje (V):** V = I · R      [Voltios (V)]
- **Corriente (I):** I = V / R    [Amperios (A)]
- **Resistencia (R):** R = V / I  [Ohmios (Ω)]

---

## 2. LEYES DE KIRCHHOFF

### 2.1 Ley de Corrientes de Kirchhoff (LCK - Regla de Nodos)
La suma algebraica de las corrientes que entran a cualquier nodo es igual a la suma de las corrientes que salen:
> Σ I_entrantes = Σ I_salientes  =>  I_total = I1 + I2 + ... + In

### 2.2 Ley de Voltajes de Kirchhoff (LVK - Regla de Mallas)
La suma de las elevaciones de potencial es igual a la suma de las caídas de potencial en un lazo cerrado:
> Σ V_fuentes = Σ V_caídas  =>  V_total = V_R1 + V_R2 + ... + V_Rn

---

## 3. REDUCCIÓN DE TOPOLOGÍAS DE CIRCUITOS

### 3.1 Circuito Serie
- R_total = R1 + R2 + R3 + ... + Rn
- La corriente I_T es la misma a través de todos los componentes.
- Divisor de Voltaje: V_Rx = V_total · (Rx / R_total)

### 3.2 Circuito Paralelo
- 1 / R_total = 1/R1 + 1/R2 + ... + 1/Rn
- Para 2 resistores: R_eq = (R1 · R2) / (R1 + R2)
- El voltaje V_T es idéntico en todas las ramas en paralelo.
- Divisor de Corriente (2 ramas): I_R1 = I_total · [R2 / (R1 + R2)]

### 3.3 Circuito Mixto (Serie - Paralelo)
1. Identificar bloques internos en paralelo y reducirlos a resistencias equivalentes (Rp).
2. Sumar en serie los bloques reducidos con las resistencias de la rama principal.
3. Calcular I_T = V_T / R_eq y desglosar tensiones y corrientes de regreso hacia cada rama.

---
© SaberLab Education Platform. Material educativo de libre distribución para fines académicos.
`
    },
    'ee-2': {
        filename: 'Tabla_Codigo_Colores_Resistencias_SaberLab.txt',
        type: 'text/plain;charset=utf-8;',
        content: `================================================================================
           SABERLAB - TABLA OFICIAL DE CÓDIGO DE COLORES PARA RESISTORES
================================================================================

[ BANDA 1 / 2 ]     [ BANDA 3: MULTIPLICADOR ]     [ BANDA 4: TOLERANCIA ]
--------------------------------------------------------------------------------
Negro    = 0        x 10^0  (1 Ω)                  -
Marrón   = 1        x 10^1  (10 Ω)                 ± 1%    (F)
Rojo     = 2        x 10^2  (100 Ω)                ± 2%    (G)
Naranja  = 3        x 10^3  (1,000 Ω / 1 kΩ)       -
Amarillo = 4        x 10^4  (10,000 Ω / 10 kΩ)     -
Verde    = 5        x 10^5  (100,000 Ω / 100 kΩ)   ± 0.5%  (D)
Azul     = 6        x 10^6  (1,000,000 Ω / 1 MΩ)   ± 0.25% (C)
Violeta  = 7        x 10^7  (10 MΩ)                ± 0.1%  (B)
Gris     = 8        x 10^8  (100 MΩ)               ± 0.05% (A)
Blanco   = 9        x 10^9  (1 GΩ)                 -
Dorado   = -        x 0.1                          ± 5%    (J)
Plateado = -        x 0.01                         ± 10%   (K)
--------------------------------------------------------------------------------

CÓMO LEER UNA RESISTENCIA DE 4 BANDAS:
1. Banda 1 (Dígito 1)
2. Banda 2 (Dígito 2)
3. Banda 3 (Multiplicador de 10)
4. Banda 4 (Margen de Tolerancia)

EJEMPLOS PRÁCTICOS:
- Marrón (1) - Negro (0) - Rojo (x100) - Dorado (±5%)
  => 10 x 100 = 1,000 Ω = 1 kΩ (±5%)

- Amarillo (4) - Violeta (7) - Naranja (x1k) - Dorado (±5%)
  => 47 x 1,000 = 47,000 Ω = 47 kΩ (±5%)

- Rojo (2) - Rojo (2) - Marrón (x10) - Dorado (±5%)
  => 22 x 10 = 220 Ω (±5%)

================================================================================
`
    },
    'ee-3': {
        filename: 'Datasheets_Semiconductores_Basicos_SaberLab.md',
        type: 'text/markdown;charset=utf-8;',
        content: `# SABERLAB - HOJAS TÉCNICAS DE DATOS (DATASHEETS)
Curso: Electricidad y Electrónica Básica (EE)

---

## 1. Diodo Rectificador 1N4007
- **Tipo:** Diodo de silicio de propósito general
- **Tensión Inversa de Pico Máxima (VRRM):** 1000 V
- **Corriente Directa Continua (IF):** 1.0 A
- **Caída de Tensión Directa (VF típica):** 0.7 V a 1.0 A
- **Encapsulado:** DO-41
- **Identificación:** La franja plateada/gris indica el CÁTODO (-).

---

## 2. Transistor NPN 2N2222A (TO-92)
- **Tipo:** Transistor BJT NPN de conmutación rápida y amplificación
- **Tensión Colector-Emisor (VCEO máx):** 40 V
- **Corriente Continua de Colector (IC máx):** 800 mA
- **Ganancia de Corriente DC (hFE / beta):** 100 - 300 (a IC = 150 mA)
- **Voltaje Saturación VCE(sat):** ~0.3 V
- **Pinout (Vista frontal, cara plana de izq. a der.):**
  1. Emisor (E) | 2. Base (B) | 3. Colector (C)

---

## 3. Transistor NPN BC547 & PNP BC557 (TO-92)
- **BC547 (NPN):** VCEO = 45V, IC = 100mA, hFE = 110-800.
- **BC557 (PNP):** VCEO = -45V, IC = -100mA (Conduce con voltaje negativo en base).
- **Pinout (Vista frontal):** 1. Colector | 2. Base | 3. Emisor

---

## 4. Circuito Integrado Temporizador NE555
- **Tensión de Alimentación (VCC):** 4.5 V a 15 V
- **Corriente de Salida Máxima (Sink/Source):** 200 mA
- **Configuraciones:** Monoestable (un pulso) y Astable (oscilador continuo).
- **Pinout DIP-8:**
  - Pin 1: GND
  - Pin 2: TRIGGER (Disparo < 1/3 Vcc)
  - Pin 3: OUTPUT (Salida)
  - Pin 4: RESET (Activo en bajo)
  - Pin 5: CONTROL VOLTAGE
  - Pin 6: THRESHOLD (Umbral > 2/3 Vcc)
  - Pin 7: DISCHARGE (Descarga del capacitor)
  - Pin 8: VCC (+)

---
`
    },
    'ee-4': {
        filename: 'Guia_Montaje_Protoboard_y_Multimetro_SaberLab.md',
        type: 'text/markdown;charset=utf-8;',
        content: `# SABERLAB - GUÍA DE MONTAJE EN PROTOBOARD Y MULTÍMETRO
Curso: Electricidad y Electrónica Básica (EE)

---

## 1. ESTRUCTURA DE LA PROTOBOARD (TABLA DE PRUEBAS)
- **Rieles Laterales de Alimentación (+ / -):** Conectados verticalmente a lo largo de toda la fila.
- **Pistas Centrales de Componentes (a-b-c-d-e y f-g-h-i-j):** Conectadas horizontalmente en grupos de 5 orificios.
- **Canal Central Separador:** Diseñado para insertar Circuitos Integrados (DIP) aislando los pines de cada lado.

---

## 2. MEDIDAS CORRECTAS CON MULTÍMETRO DIGITAL (DMM)

### 2.1 Medición de Tensión / Voltaje (V)
- Conectar la sonda NEGRA en COM y la ROJA en V/Ω.
- Seleccionar escala DCV (⎓).
- **CONEXIÓN EN PARALELO:** Colocar las puntas en los dos extremos del componente sin desconectar el circuito.

### 2.2 Medición de Corriente / Intensidad (I)
- Conectar sonda NEGRA en COM y ROJA en mA o 10A según la magnitud esperada.
- **CONEXIÓN EN SERIE (ABRIR EL CIRCUITO):** Se debe abrir un cable y hacer que los electrones atraviesen el multímetro.

### 2.3 Medición de Resistencia (Ω) y Continuidad
- **IMPORTANTE:** El circuito debe estar **TOTALMENTE APAGADO Y DESCONECTADO DE LA FUENTE**.
- Para continuidad (pitido), probar diodos o cables para verificar que no haya rupturas.

---
`
    },
    'ee-6': {
        filename: 'Formulario_Ley_de_Watt_Potencia_SaberLab.md',
        type: 'text/markdown;charset=utf-8;',
        content: `# SABERLAB - FORMULARIO DE LEY DE WATT Y ENERGÍA
Curso: Electricidad y Electrónica Básica (EE)

---

## 1. LEY DE WATT (POTENCIA ELÉCTRICA)
La potencia (P) mide la rapidez con la que se consume o transforma energía eléctrica en calor, luz o movimiento:

- **P = V · I**        [Vatios / Watts (W)]
- **P = I² · R**       [Especial para disipación térmica en resistores]
- **P = V² / R**       [Potencia calculada conociendo la caída de tensión]

---

## 2. UNIDADES Y CONVERSIONES
- 1 Milivatio (mW) = 0.001 W = 10^-3 W
- 1 Vatio (W) = 1 Joule / segundo (J/s) = 1 Voltio · 1 Amperio
- 1 Kilovatio (kW) = 1,000 W

---

## 3. SELECCIÓN DE POTENCIA EN RESISTORES
Los resistores comerciales se clasifican por su capacidad de disipación:
- 1/8 W (0.125 W)
- 1/4 W (0.250 W) -> Uso estándar en protoboard
- 1/2 W (0.500 W)
- 1 W, 2 W, 5 W (Resistencias de potencia cerámica)

> **Regla de Ingeniería:** Seleccionar un resistor con al menos el doble (2x) de la potencia calculada para evitar sobrecalentamiento.
---
`
    },
    're-1': {
        filename: 'Pinout_Arduino_Uno_R3_SaberLab.md',
        type: 'text/markdown;charset=utf-8;',
        content: `# SABERLAB - PINOUT Y ARQUITECTURA ARDUINO UNO R3
Curso: Robótica Educativa (RE)

---

## 1. ESPECIFICACIONES TÉCNICAS (ATmega328P)
- **Voltaje de Operación:** 5 V
- **Voltaje de Entrada Recomendado (Vin / Jack):** 7 V a 12 V
- **Pines Digitales I/O:** 14 (Pines 0 al 13)
- **Pines con Modulación por Ancho de Pulso (PWM ~):** 6 (Pines 3, 5, 6, 9, 10, 11)
- **Pines de Entrada Analógica (ADC):** 6 (A0 al A5) - Resolución de 10 bits (0 a 1023)
- **Corriente Máxima por Pin I/O:** 20 mA (40 mA absoluto)
- **Memoria Flash:** 32 KB (0.5 KB usados por el Bootloader)
- **SRAM:** 2 KB | **EEPROM:** 1 KB
- **Frecuencia de Reloj:** 16 MHz

---

## 2. ASIGNACIÓN ESPECIAL DE PINES
- **Serial UART:** Pin 0 (RX) y Pin 1 (TX)
- **Interrupciones Externas:** Pin 2 (INT0) y Pin 3 (INT1)
- **Bus I2C:** A4 (SDA - Datos) y A5 (SCL - Reloj)
- **Bus SPI:** Pin 10 (SS), Pin 11 (MOSI), Pin 12 (MISO), Pin 13 (SCK)
- **LED Integrado:** Pin 13 (LED_BUILTIN)

---
`
    },
    're-2': {
        filename: 'Manual_Programacion_Arduino_Cpp_SaberLab.ino',
        type: 'text/plain;charset=utf-8;',
        content: `/*
 * ==============================================================================
 * SABERLAB - PLANTILLA Y GUÍA MAESTRA DE PROGRAMACIÓN C++ PARA ARDUINO
 * Curso: Robótica Educativa (RE)
 * ==============================================================================
 */

// 1. DEFINICIÓN DE PINES Y CONSTANTES
const int PIN_LED = 13;
const int PIN_BOTON = 2;
const int PIN_POTENCIOMETRO = A0;

// 2. VARIABLES GLOBALES DE ESTADO Y TIEMPO (NO BLOQUEANTE)
unsigned long tiempoAnterior = 0;
const long intervaloLED = 500; // Milisegundos para parpadeo
int estadoLED = LOW;

void setup() {
  // Configuración de velocidad del monitor serie
  Serial.begin(9600);
  
  // Configuración de modos de pin
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BOTON, INPUT_PULLUP); // Resistencia pull-up interna activada
  
  Serial.println(F("--- Sistema SaberLab Arduino Inicializado con Exito ---"));
}

void loop() {
  // LECTURA DE SENSORES
  int valorPot = analogRead(PIN_POTENCIOMETRO); // 0 a 1023
  int lecturaBoton = digitalRead(PIN_BOTON);    // LOW al presionar (Pull-Up)
  
  // CONVERSIÓN A VOLTAJE
  float voltaje = (valorPot * 5.0) / 1023.0;
  
  // TEMPORIZADOR NO BLOQUEANTE CON millis() (Reemplazo profesional de delay)
  unsigned long tiempoActual = millis();
  if (tiempoActual - tiempoAnterior >= intervaloLED) {
    tiempoAnterior = tiempoActual;
    
    estadoLED = (estadoLED == LOW) ? HIGH : LOW;
    digitalWrite(PIN_LED, estadoLED);
    
    // Telemetría en Monitor Serie
    Serial.print(F("Potenciometro: "));
    Serial.print(valorPot);
    Serial.print(F(" | Voltaje: "));
    Serial.print(voltaje, 2);
    Serial.print(F("V | Boton: "));
    Serial.println(lecturaBoton == LOW ? F("PRESIONADO") : F("LIBRE"));
  }
}
`
    },
    're-3': {
        filename: 'Guia_Conexion_Driver_L298N_Servomotores_SaberLab.ino',
        type: 'text/plain;charset=utf-8;',
        content: `/*
 * ==============================================================================
 * SABERLAB - CONTROL DE MOTORES DC CON PUENTE H L298N Y SERVOMOTOR SG90
 * Curso: Robótica Educativa (RE)
 * ==============================================================================
 */

#include <Servo.h>

// PINES CONTROL L298N (MOTOR IZQUIERDO Y DERECHO)
const int ENA = 5;  // PWM Velocidad Motor A
const int IN1 = 6;  // Dirección Motor A
const int IN2 = 7;
const int IN3 = 8;  // Dirección Motor B
const int IN4 = 9;
const int ENB = 10; // PWM Velocidad Motor B

Servo servoradar;
const int PIN_SERVO = 11;

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);
  
  servoradar.attach(PIN_SERVO);
  servoradar.write(90); // Centrar servo
}

void moverAdelante(int velocidad) {
  analogWrite(ENA, velocidad);
  analogWrite(ENB, velocidad);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void detener() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
}

void loop() {
  moverAdelante(200); // Rango 0 a 255
  delay(2000);
  detener();
  delay(1000);
}
`
    },
    're-4': {
        filename: 'Guia_Librerias_Arduino_Esenciales_SaberLab.md',
        type: 'text/markdown;charset=utf-8;',
        content: `# SABERLAB - GUÍA DE LIBRERÍAS ARDUINO ESENCIALES
Curso: Robótica Educativa (RE)

---

## 1. LiquidCrystal_I2C (Pantallas LCD 16x2 / 20x4 con solo 2 cables)
- **Conexiones:** VCC -> 5V, GND -> GND, SDA -> Pin A4, SCL -> Pin A5
- **Código Inicial:**
\`\`\`cpp
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); // Dirección I2C común: 0x27 o 0x3F

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("SaberLab Robot");
}
\`\`\`

---

## 2. Servo.h (Control preciso de servomotores)
- **Frecuencia:** Genera pulsos PWM de 50 Hz (1ms a 2ms de ancho de pulso).
- **Código:**
\`\`\`cpp
#include <Servo.h>
Servo miServo;

void setup() {
  miServo.attach(9); // Conectar pin de control al Pin 9
  miServo.write(0);  // 0 a 180 grados
}
\`\`\`

---
`
    },
    're-6': {
        filename: 'Robot_Seguidor_de_Linea_SaberLab.ino',
        type: 'text/plain;charset=utf-8;',
        content: `/*
 * ==============================================================================
 * SABERLAB - CÓDIGO ROBOT SEGUIDOR DE LÍNEA DE 2 SENSORES ÓPTICOS TCRT5000
 * Curso: Robótica Educativa (RE) - Proyecto Módulo 4
 * ==============================================================================
 */

const int SENSOR_IZQ = A1;
const int SENSOR_DER = A2;

const int IN1 = 6;
const int IN2 = 7;
const int IN3 = 8;
const int IN4 = 9;
const int ENA = 5;
const int ENB = 10;

const int VELOCIDAD_BASE = 180;
const int UMBRAL_NEGRO = 600; // Valor ADC para línea negra

void setup() {
  pinMode(SENSOR_IZQ, INPUT);
  pinMode(SENSOR_DER, INPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
}

void loop() {
  int valorIzq = analogRead(SENSOR_IZQ);
  int valorDer = analogRead(SENSOR_DER);
  
  bool izqNegro = (valorIzq > UMBRAL_NEGRO);
  bool derNegro = (valorDer > UMBRAL_NEGRO);
  
  if (izqNegro && derNegro) {
    // Ambos en línea -> Avanzar recto
    avanzar(VELOCIDAD_BASE, VELOCIDAD_BASE);
  } else if (izqNegro && !derNegro) {
    // Se desvía a la derecha -> Corregir a la izquierda
    girarIzquierda(VELOCIDAD_BASE);
  } else if (!izqNegro && derNegro) {
    // Se desvía a la izquierda -> Corregir a la derecha
    girarDerecha(VELOCIDAD_BASE);
  } else {
    // Ninguno en línea -> Mantener avance cauteloso
    avanzar(120, 120);
  }
}

void avanzar(int velA, int velB) {
  analogWrite(ENA, velA);
  analogWrite(ENB, velB);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void girarIzquierda(int vel) {
  analogWrite(ENA, 50);
  analogWrite(ENB, vel);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void girarDerecha(int vel) {
  analogWrite(ENA, vel);
  analogWrite(ENB, 50);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}
`
    }
};

// ── BANCO DE RECURSOS OFICIALES ───────────────────────────────────────
const OFFICIAL_RESOURCES = [
    // ── ELECTRICIDAD Y ELECTRÓNICA BÁSICA (EE) ──
    {
        id: 'ee-1',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Manual Técnico de Ley de Ohm y Leyes de Kirchhoff',
        description: 'Guía práctica con demostraciones de reducción de circuitos serie, paralelo y mixto, cálculo de caídas de tensión y divisor de voltaje.',
        category: 'guides',
        type: 'PDF',
        size: '2.8 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['Ley de Ohm', 'Kirchhoff', 'Circuitos Mixtos']
    },
    {
        id: 'ee-2',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Tabla Oficial de Código de Colores para Resistores',
        description: 'Carta gráfica de referencia rápida para resistencias de 4 y 5 bandas, valores comerciales de la serie E12 y multiplicadores.',
        category: 'documents',
        type: 'PDF',
        size: '1.2 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['Resistencias', 'Código de Colores', 'Tolerancias']
    },
    {
        id: 'ee-3',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Pack de Datasheets: Semiconductores Clave',
        description: 'Hojas técnicas de especificaciones: Diodo 1N4007, Transistores NPN 2N2222 / BC547, PNP BC557 y Temporizador NE555.',
        category: 'documents',
        type: 'ZIP',
        size: '4.5 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['1N4007', '2N2222', 'BC547', 'NE555']
    },
    {
        id: 'ee-4',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Guía de Montaje en Protoboard y Uso del Multímetro Digital',
        description: 'Manual de buenas prácticas para medición de voltaje DC, corriente en serie sin fundir fusible y pruebas de continuidad.',
        category: 'guides',
        type: 'PDF',
        size: '3.1 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['Protoboard', 'Multímetro', 'Seguridad Eléctrica']
    },
    {
        id: 'ee-5',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Simulador Falstad & Tinkercad Circuits',
        description: 'Acceso a simuladores interactivos de circuitos electrónicos en tiempo real con animación de corrientes y osciloscopio virtual.',
        category: 'links',
        type: 'Enlace',
        link: 'https://www.falstad.com/circuit/',
        date: 'En vivo',
        tags: ['Simulación', 'Falstad', 'Tinkercad']
    },
    {
        id: 'ee-6',
        courseId: 1,
        courseAbbr: 'EE',
        courseName: 'Electricidad y Electrónica Básica',
        courseColor: '#f59e0b',
        title: 'Formulario de Ley de Watt y Potencia Disipada',
        description: 'Resumen gráfico de fórmulas para cálculo de potencia (P = V·I, P = I²·R, P = V²/R) y dimensionamiento de disipadores térmicos.',
        category: 'documents',
        type: 'PDF',
        size: '1.4 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['Ley de Watt', 'Potencia', 'Disipación']
    },

    // ── ROBÓTICA EDUCATIVA (RE) ──
    {
        id: 're-1',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Diagrama de Pinout y Arquitectura Arduino Uno R3',
        description: 'Mapa de alta resolución con pines digitales, analógicos (ADC), salidas PWM (~), pines de alimentación e interfaces UART/I2C/SPI.',
        category: 'documents',
        type: 'PDF',
        size: '2.4 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['Arduino Uno', 'Pinout', 'Microcontrolador']
    },
    {
        id: 're-2',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Manual de Programación en C++ para Microcontroladores',
        description: 'Estructura esencial de sketch: setup(), loop(), pinMode(), digitalWrite(), analogRead() y control temporal no bloqueante con millis().',
        category: 'guides',
        type: 'PDF',
        size: '3.6 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['C++', 'Arduino IDE', 'Variables', 'Funciones']
    },
    {
        id: 're-3',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Guía de Conexión de Driver L298N y Servomotores SG90',
        description: 'Esquemas de potencia y aislamiento para control de sentido de giro con puente H L298N y posicionamiento angular con servomotores.',
        category: 'guides',
        type: 'PDF',
        size: '3.0 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['L298N', 'Servomotor SG90', 'Puente H', 'PWM']
    },
    {
        id: 're-4',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Pack de Librerías Arduino Esenciales',
        description: 'Colección de librerías verificadas para Display LCD I2C (LiquidCrystal_I2C), Servos (Servo.h) y sensor ultrasónico HC-SR04.',
        category: 'documents',
        type: 'ZIP',
        size: '5.2 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['Librerías', 'LCD I2C', 'HC-SR04', 'Servo']
    },
    {
        id: 're-5',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Simulador Wokwi Online para Arduino',
        description: 'Entorno de simulación online de código C++ y componentes Arduino con lógica de sensores, pulsadores y LEDs en tiempo real.',
        category: 'links',
        type: 'Enlace',
        link: 'https://wokwi.com',
        date: 'En vivo',
        tags: ['Wokwi', 'Simulador Arduino', 'Online']
    },
    {
        id: 're-6',
        courseId: 3,
        courseAbbr: 'RE',
        courseName: 'Robótica Educativa',
        courseColor: '#a855f7',
        title: 'Esquema y Código Base del Robot Seguidor de Línea',
        description: 'Guía paso a paso para armado del chasis 2WD, calibración de sensores ópticos infrarrojos TCRT5000 y algoritmo de seguimiento.',
        category: 'guides',
        type: 'PDF',
        size: '4.1 MB',
        date: 'Agosto 2026',
        link: null,
        tags: ['Seguidor de Línea', 'TCRT5000', 'Robótica Móvil']
    }
];

const PanelRecursos = () => {
    const { profile, enrolledCourses } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
    const [downloadedId, setDownloadedId] = useState(null);

    const isStaff = ['admin', 'teacher', 'docente', 'profesor'].includes(profile?.role);

    // Mapear cursos en los que está inscrito el estudiante
    const enrolledAbbrs = useMemo(() => {
        return (enrolledCourses || []).map(c => (c.abbr || '').toUpperCase());
    }, [enrolledCourses]);

    // Filtrar banco de recursos según los cursos permitidos para el usuario
    const userAllowedResources = useMemo(() => {
        if (isStaff) {
            return OFFICIAL_RESOURCES;
        }
        return OFFICIAL_RESOURCES.filter(r => enrolledAbbrs.includes(r.courseAbbr));
    }, [isStaff, enrolledAbbrs]);

    // Opciones de filtro por curso disponibles para este usuario
    const availableCourseFilters = useMemo(() => {
        const list = [{ id: 'all', label: 'Todos los Cursos', icon: <Layers size={15} /> }];
        
        const hasEE = isStaff || enrolledAbbrs.includes('EE');
        const hasRE = isStaff || enrolledAbbrs.includes('RE');

        if (hasEE) {
            list.push({ id: 'EE', label: 'Electricidad (EE)', color: '#f59e0b', icon: <Zap size={15} /> });
        }
        if (hasRE) {
            list.push({ id: 'RE', label: 'Robótica (RE)', color: '#a855f7', icon: <Bot size={15} /> });
        }

        return list;
    }, [isStaff, enrolledAbbrs]);

    const categories = [
        { id: 'all', name: 'Todos', icon: <FolderOpen size={18} /> },
        { id: 'guides', name: 'Guías Técnicas', icon: <Book size={18} /> },
        { id: 'documents', name: 'Datasheets y Tablas', icon: <FileText size={18} /> },
        { id: 'links', name: 'Simuladores y Enlaces', icon: <LinkIcon size={18} /> }
    ];

    const filteredResources = useMemo(() => {
        return userAllowedResources.filter(resource => {
            const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (resource.tags && resource.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
            
            const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
            const matchesCourse = selectedCourseFilter === 'all' || resource.courseAbbr === selectedCourseFilter;

            return matchesSearch && matchesCategory && matchesCourse;
        });
    }, [userAllowedResources, searchTerm, selectedCategory, selectedCourseFilter]);

    const getTypeBadgeStyle = (type, color) => {
        switch (type) {
            case 'PDF': return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' };
            case 'ZIP': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' };
            case 'Enlace': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
            default: return { bg: `${color}20`, color: color };
        }
    };

    // ── DESCARGA REAL DE ARCHIVO EN EL NAVEGADOR ──────────────────────
    const handleDownloadOrOpen = (resource) => {
        if (resource.link) {
            window.open(resource.link, '_blank', 'noopener,noreferrer');
            return;
        }

        const resData = RESOURCE_CONTENTS[resource.id];
        if (resData) {
            const blob = new Blob([resData.content], { type: resData.type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = resData.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setDownloadedId(resource.id);
            setTimeout(() => setDownloadedId(null), 3000);
        } else {
            // Fallback para recursos sin contenido binario directo
            const fallbackText = `# ${resource.title}\nCurso: ${resource.courseName}\n\n${resource.description}\n\nSaberLab Education Platform`;
            const blob = new Blob([fallbackText], { type: 'text/markdown;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="resources-page">
            <div className="page-header" style={{ marginBottom: '0.5rem' }}>
                <div className="header-title">
                    <FolderOpen size={28} color="#38bdf8" />
                    <div>
                        <h1 style={{ margin: 0 }}>Centro de Recursos Oficiales</h1>
                        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Guías de laboratorio, hojas técnicas de datos (datasheets), esquemas y herramientas de simulación.
                        </p>
                    </div>
                </div>
            </div>

            {/* BARRA DE FILTRO POR CURSO */}
            {availableCourseFilters.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {availableCourseFilters.map(cf => (
                        <button
                            key={cf.id}
                            onClick={() => setSelectedCourseFilter(cf.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.45rem 1rem',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: selectedCourseFilter === cf.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                                background: selectedCourseFilter === cf.id ? 'rgba(56,189,248,0.15)' : 'rgba(15,23,42,0.6)',
                                color: selectedCourseFilter === cf.id ? '#38bdf8' : '#cbd5e1',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {cf.icon}
                            <span>{cf.label}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="search-and-filter">
                <div className="search-box glass-panel">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por título, componente o palabra clave (ej. Kirchhoff, L298N, 2N2222, Wokwi)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="resources-layout">
                <aside className="categories-sidebar glass-panel">
                    <h3>Categorías</h3>
                    <nav className="categories-nav">
                        {categories.map(category => {
                            const count = userAllowedResources.filter(r => 
                                (category.id === 'all' || r.category === category.id) &&
                                (selectedCourseFilter === 'all' || r.courseAbbr === selectedCourseFilter)
                            ).length;

                            return (
                                <button
                                    key={category.id}
                                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.icon}
                                    <span>{category.name}</span>
                                    <span className="category-count">{count}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="resources-grid-container">
                    {userAllowedResources.length === 0 ? (
                        <div className="empty-state glass-panel">
                            <Layers size={48} color="#64748b" />
                            <h3>No tienes cursos con recursos activos</h3>
                            <p style={{ maxWidth: '420px', margin: '0.5rem auto 0', lineHeight: 1.5 }}>
                                Únete a un curso como <strong>Electricidad y Electrónica Básica</strong> o <strong>Robótica Educativa</strong> para acceder a sus manuales y herramientas técnicas.
                            </p>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="empty-state glass-panel">
                            <Search size={48} color="#64748b" />
                            <h3>No se encontraron recursos</h3>
                            <p>Intenta con otro término de búsqueda o categoría.</p>
                        </div>
                    ) : (
                        <div className="resources-grid">
                            {filteredResources.map(resource => {
                                const badgeStyle = getTypeBadgeStyle(resource.type, resource.courseColor);
                                const isDownloaded = downloadedId === resource.id;

                                return (
                                    <div key={resource.id} className="resource-card glass-panel">
                                        <div className="resource-header">
                                            <div 
                                                className="resource-type-badge"
                                                style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
                                            >
                                                {resource.type === 'Enlace' ? <ExternalLink size={14} /> : resource.type === 'ZIP' ? <FolderOpen size={14} /> : <FileText size={14} />}
                                                <span>{resource.type}</span>
                                            </div>
                                            <span 
                                                className="resource-subject"
                                                style={{ 
                                                    fontWeight: 700, 
                                                    fontSize: '0.78rem',
                                                    color: resource.courseColor,
                                                    background: `${resource.courseColor}15`,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                {resource.courseAbbr}
                                            </span>
                                        </div>

                                        <h3 className="resource-title">{resource.title}</h3>
                                        <p className="resource-description">{resource.description}</p>

                                        {resource.tags && resource.tags.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                {resource.tags.map(tag => (
                                                    <span 
                                                        key={tag} 
                                                        style={{ 
                                                            fontSize: '0.72rem', 
                                                            color: '#94a3b8', 
                                                            background: 'rgba(255,255,255,0.05)', 
                                                            padding: '2px 7px', 
                                                            borderRadius: '5px' 
                                                        }}
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="resource-footer">
                                            <div className="resource-meta">
                                                {resource.size && <span>{resource.size}</span>}
                                                <span>{resource.date}</span>
                                            </div>
                                            <div className="resource-actions">
                                                {resource.type === 'Enlace' ? (
                                                    <button 
                                                        onClick={() => handleDownloadOrOpen(resource)}
                                                        className="action-btn external" 
                                                        title="Abrir Simulador / Enlace"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDownloadOrOpen(resource)}
                                                        className="action-btn download" 
                                                        title="Descargar Archivo Real"
                                                        style={isDownloaded ? { background: 'rgba(16, 185, 129, 0.25)', color: '#34d399' } : {}}
                                                    >
                                                        {isDownloaded ? <Check size={16} /> : <Download size={16} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PanelRecursos;
