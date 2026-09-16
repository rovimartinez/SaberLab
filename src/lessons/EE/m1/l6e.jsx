import { createContentBlock, createFlashcardsBlock, createQuizBlock, defineLesson } from '../../../lib/lessonSchema';

const lessonDefinition = {
    title: 'Laboratorio Integrador y Evaluación de Fundamentos',
    hasSimulator: true,
    content: `
        <h3 id="ee-1-6-1" style="color: #f59e0b; margin: 1.5rem 0 1rem; font-size: 1.4rem;">6.1 Síntesis del Módulo 1: Fundamentos de Electricidad</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            ¡Felicitaciones por llegar a la evaluación integradora del <strong>Módulo 1</strong>! A lo largo de estas semanas has dominado los pilares fundamentales del análisis circuital y el diagnóstico eléctrico:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #10b981; margin: 0 0 0.5rem; font-size: 1rem;">1. Ley de Ohm & Medición</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    V = I × R, P = V × I. Medición de voltaje (en paralelo), corriente (en serie abriendo el circuito) y resistencia (sin energía).
                </p>
            </div>
            <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #60a5fa; margin: 0 0 0.5rem; font-size: 1rem;">2. Circuitos en Serie</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Corriente única y constante (I_T = I_1 = I_2), suma de resistencias (Req = R1 + R2 + ...), divisor de tensión proporcional.
                </p>
            </div>
            <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #c084fc; margin: 0 0 0.5rem; font-size: 1rem;">3. Circuitos en Paralelo</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Voltaje constante en todas las ramas (V_T = V_1 = V_2), suma de corrientes en nodos (LCK) y reducción de la Req total.
                </p>
            </div>
            <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 16px; padding: 1.25rem;">
                <h4 style="color: #fbbf24; margin: 0 0 0.5rem; font-size: 1rem;">4. Redes Mixtas Complejas</h4>
                <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin: 0;">
                    Método sistemático de reducción de adentro hacia afuera, cálculo inverso de voltajes/corrientes y balance de potencias.
                </p>
            </div>
        </div>

        <h3 id="ee-1-6-2" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">6.2 Guía de Diagnóstico de Fallas (Troubleshooting)</h3>
        <p style="margin-bottom: 1rem; line-height: 1.8;">
            En el trabajo de campo y laboratorio, un profesional de ingeniería se distingue por su capacidad para diagnosticar fallas con el multímetro de forma rápida y segura:
        </p>

        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.25rem; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: #fbbf24;">
                        <th style="padding: 0.75rem;">Falla Típica</th>
                        <th style="padding: 0.75rem;">Lectura en Multímetro</th>
                        <th style="padding: 0.75rem;">Causa Física</th>
                        <th style="padding: 0.75rem;">Acción Correctiva</th>
                    </tr>
                </thead>
                <tbody style="color: #cbd5e1;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #f87171; font-weight: bold;">Cortocircuito (R ≈ 0 Ω)</td>
                        <td style="padding: 0.75rem;">Corriente excesiva, caída de voltaje a 0V</td>
                        <td style="padding: 0.75rem;">Líneas positiva y negativa tocándose directamente</td>
                        <td style="padding: 0.75rem;">Desenergizar y revisar puentes en protoboard</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <td style="padding: 0.75rem; color: #38bdf8; font-weight: bold;">Circuito Abierto (R = ∞)</td>
                        <td style="padding: 0.75rem;">Corriente = 0 A, lectura 'OL' en Ohmios</td>
                        <td style="padding: 0.75rem;">Jumper suelto, pista rota o filamento abierto</td>
                        <td style="padding: 0.75rem;">Verificar continuidad con el buzzer del tester</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.75rem; color: #fbbf24; font-weight: bold;">Sobrecarga Térmica</td>
                        <td style="padding: 0.75rem;">Resistor caliente, alteración de resistencia</td>
                        <td style="padding: 0.75rem;">Potencia disipada supera el límite nominal (ej. > 1/4W)</td>
                        <td style="padding: 0.75rem;">Sustituir por resistor de mayor disipación (1/2W o 1W)</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 id="ee-1-6-3" style="color: #f59e0b; margin: 2.5rem 0 1rem; font-size: 1.4rem;">6.3 Estructura del Examen 1 (150 Puntos Totales)</h3>
        <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
                <div style="background: rgba(0,0,0,0.3); padding: 1.25rem; borderRadius: 14px; border: 1px solid rgba(245, 158, 11, 0.2);">
                    <div style="color: #f59e0b; font-weight: 800; font-size: 0.85rem;">PARTE TEÓRICA · PESTAÑA "EVALUACIÓN"</div>
                    <div style="font-size: 1.6rem; font-weight: 900; color: #f8fafc; margin: 0.25rem 0;">60 Puntos</div>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5;">
                        30 preguntas de opción múltiple contextuales y de razonamiento conceptual (2 pts c/u), sin cálculos numéricos engorrosos.
                    </p>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 1.25rem; borderRadius: 14px; border: 1px solid rgba(56, 189, 248, 0.2);">
                    <div style="color: #38bdf8; font-weight: 800; font-size: 0.85rem;">PARTE PRÁCTICA · PESTAÑA "LABORATORIO"</div>
                    <div style="font-size: 1.6rem; font-weight: 900; color: #f8fafc; margin: 0.25rem 0;">90 Puntos</div>
                    <p style="color: #94a3b8; font-size: 0.8rem; margin: 0; line-height: 1.5;">
                        Resolución interactiva de red mixta real de 8 resistores (Req, IT, PT, 8 voltajes y corrientes de rama con validación en tiempo real).
                    </p>
                </div>
            </div>
        </div>
    `,
    flashcards: [
        { id: 'ee-1-6-f1', type: 'concept', q: '¿Qué es la corriente eléctrica desde el punto de vista atómico?', a: 'El flujo ordenado de electrones libres a través de la estructura del conductor', sub: 'Movimiento de portadores de carga', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f2', type: 'concept', q: '¿Por qué los metales son excelentes conductores?', a: 'Tienen electrones en la banda de valencia débilmente unidos que se mueven con facilidad', sub: 'Estructura atómica', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f3', type: 'instrument', q: '¿Por qué el voltímetro se conecta siempre en paralelo?', a: 'Porque tiene una resistencia interna casi infinita que evita alterar la corriente del circuito', sub: 'Medición de diferencia de potencial', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f4', type: 'instrument', q: '¿Por qué el amperímetro se conecta siempre en serie abriendo el circuito?', a: 'Porque debe atravesarlo toda la corriente y tiene resistencia interna casi nula', sub: 'Medición de intensidad de corriente', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f5', type: 'safety', q: '¿Qué ocurre si conectas un amperímetro en paralelo con la fuente?', a: 'Provocas un cortocircuito directo que funde el fusible interno del instrumento', sub: 'Seguridad instrumental', sectionId: 'ee-1-6-2' },
        { id: 'ee-1-6-f6', type: 'concept', q: 'En un circuito serie, ¿qué magnitud se mantiene constante en todos los elementos?', a: 'La corriente eléctrica (I_T = I_1 = I_2 = ...)', sub: 'Leyes de circuitos serie', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f7', type: 'concept', q: 'En un circuito paralelo, ¿qué magnitud es idéntica en todas las ramas?', a: 'El voltaje o diferencia de potencial (V_T = V_1 = V_2 = ...)', sub: 'Leyes de circuitos paralelo', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f8', type: 'concept', q: '¿Qué ocurre con la resistencia equivalente total al añadir más ramas en paralelo?', a: 'La resistencia total disminuye y la corriente entregada por la fuente aumenta', sub: 'Comportamiento en paralelo', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f9', type: 'troubleshoot', q: '¿Qué síntoma presenta un circuito abierto (Open Circuit)?', a: 'La corriente cae a 0 A y el multímetro marca resistencia infinita u \'OL\'', sub: 'Diagnóstico de fallas', sectionId: 'ee-1-6-2' },
        { id: 'ee-1-6-f10', type: 'troubleshoot', q: '¿Qué síntoma presenta un cortocircuito (Short Circuit)?', a: 'Resistencia cercana a 0 Ω, corriente altísima y caída de tensión nula', sub: 'Diagnóstico de fallas', sectionId: 'ee-1-6-2' },
        { id: 'ee-1-6-f11', type: 'concept', q: '¿Qué establece el principio de Balance de Potencias?', a: 'La potencia total entregada por las fuentes es igual a la suma de las potencias disipadas', sub: 'Conservación de la energía', sectionId: 'ee-1-6-1' },
        { id: 'ee-1-6-f12', type: 'safety', q: '¿Cuál es la regla de oro para medir resistencia con el multímetro?', a: 'El circuito debe estar totalmente desenergizado (apagado)', sub: 'Seguridad en mediciones', sectionId: 'ee-1-6-2' }
    ],
    // 30 Preguntas Teóricas Conceptuales / Contextuales (2 pts c/u = 60 pts totales, SIN cálculos numéricos)
    questions: [
        {
            id: 'ee-1-6-q1',
            objective: 'Comprender la naturaleza atómica de la corriente eléctrica',
            concept: 'naturaleza_corriente',
            difficulty: 'easy',
            q: 'Desde la perspectiva de la física de materiales, ¿qué es la corriente eléctrica en un conductor metálico?',
            options: [
                'El flujo ordenado de electrones libres impulsados por una diferencia de potencial',
                'El desplazamiento masivo de protones desde el núcleo atómico hacia el exterior',
                'La creación de nuevos átomos dentro del cable al conectar la batería',
                'La rotación de neutrones en la capa más externa del átomo'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q2',
            objective: 'Diferenciar conductores y aislantes',
            concept: 'conductores_aislantes',
            difficulty: 'easy',
            q: '¿Por qué materiales como el cobre o la plata conducen la electricidad fácilmente mientras que el plástico no?',
            options: [
                'Porque poseen electrones de valencia débilmente unidos al núcleo que se liberan con facilidad',
                'Porque los metales son más pesados y atraen la energía del aire',
                'Porque el plástico no tiene átomos en su estructura molecular',
                'Porque los aislantes tienen un exceso de protones libres en su superficie'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q3',
            objective: 'Definir el concepto físico de Voltaje',
            concept: 'concepto_voltaje',
            difficulty: 'easy',
            q: 'El Voltaje (o diferencia de potencial) entre dos puntos de un circuito representa físicamente:',
            options: [
                'La energía o trabajo necesario por unidad de carga para moverla entre dichos puntos',
                'La velocidad a la que viajan los neutrones por el interior del cable',
                'La cantidad total de electrones almacenados estáticamente en un resistor',
                'La oposición que ofrece el aislante al calentamiento'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q4',
            objective: 'Definir el concepto físico de Corriente',
            concept: 'concepto_corriente',
            difficulty: 'easy',
            q: 'La intensidad de corriente eléctrica medida en Amperios (A) cuantifica:',
            options: [
                'La cantidad neta de carga eléctrica que atraviesa una sección transversal del conductor por segundo',
                'La presión térmica que empuja a los átomos a vibrar más rápido',
                'La longitud total del cable por donde circula la señal eléctrica',
                'El porcentaje de energía disipada en forma de luz'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q5',
            objective: 'Comprender el concepto de Resistencia Eléctrica',
            concept: 'concepto_resistencia',
            difficulty: 'easy',
            q: 'La resistencia eléctrica de un componente se define como:',
            options: [
                'La oposición natural que presentan los átomos del material al paso de los electrones libres',
                'La capacidad de la batería para almacenar energía química durante años',
                'La fuerza magnética que atrae a los polos positivo y negativo',
                'El aislamiento exterior de PVC que recubre a los cables'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q6',
            objective: 'Diferenciar sentido real vs sentido convencional de la corriente',
            concept: 'sentido_corriente',
            difficulty: 'medium',
            q: 'Históricamente se adoptó el sentido convencional de la corriente de positivo (+) a negativo (−). Sin embargo, físicamente los electrones se desplazan:',
            options: [
                'Desde el polo negativo (−) con exceso de electrones hacia el polo positivo (+)',
                'Desde el polo positivo (+) hacia el polo negativo (−) a la velocidad de la luz',
                'En ambas direcciones simultáneamente chocando entre sí en el centro',
                'Únicamente de arriba hacia abajo debido a la fuerza de gravedad'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q7',
            objective: 'Reconocer el Efecto Joule',
            concept: 'efecto_joule',
            difficulty: 'easy',
            q: 'El fenómeno físico por el cual un conductor o resistencia disipa energía en forma de calor cuando circula corriente se denomina:',
            options: [
                'Efecto Joule',
                'Efecto Fotoeléctrico',
                'Efecto Doppler',
                'Efecto Gravitacional'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q8',
            objective: 'Analizar la relación causa-efecto de la Ley de Ohm',
            concept: 'ley_ohm_voltaje',
            difficulty: 'medium',
            q: 'Si en un circuito cerrado se duplica el voltaje de la fuente manteniendo constante la resistencia:',
            options: [
                'La corriente eléctrica por el circuito se duplicará proporcionalmente',
                'La corriente se reducirá a la mitad para compensar la energía',
                'La resistencia aumentará automáticamente para proteger la fuente',
                'La corriente permanecerá exactamente igual sin alterarse'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q9',
            objective: 'Analizar el efecto de la variación de resistencia en la corriente',
            concept: 'ley_ohm_resistencia',
            difficulty: 'medium',
            q: 'Si en un circuito con voltaje fijo se sustituye la resistencia de carga por otra de valor mucho mayor:',
            options: [
                'La corriente que circula por el circuito disminuirá',
                'La corriente aumentará porque hay más material conductor',
                'El voltaje de la batería se incrementará al doble',
                'La potencia consumida aumentará drásticamente'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q10',
            objective: 'Identificar la conexión correcta del voltímetro',
            concept: 'conexion_voltimetro',
            difficulty: 'medium',
            q: 'Para medir la caída de tensión en un componente con el multímetro, las puntas de prueba deben colocarse:',
            options: [
                'En paralelo con el componente, sin necesidad de desconectar ni abrir el circuito',
                'En serie, cortando el cable y haciendo pasar la corriente a través del tester',
                'Únicamente en el borne negativo de la batería',
                'En los extremos del fusible de protección con el circuito apagado'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q11',
            objective: 'Identificar la conexión correcta del amperímetro',
            concept: 'conexion_amperimetro',
            difficulty: 'medium',
            q: 'Para medir la corriente eléctrica que fluye por una rama, el amperímetro debe conectarse:',
            options: [
                'En serie, abriendo la rama para que los electrones atraviesen obligatoriamente el instrumento',
                'En paralelo con la resistencia para medir la corriente que sobra',
                'Entre el chasis metálico y la tierra física directamente',
                'Directamente entre los bornes positivo y negativo de la fuente encendida'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q12',
            objective: 'Identificar el peligro de conectar un amperímetro en paralelo',
            concept: 'peligro_amperimetro',
            difficulty: 'medium',
            q: '¿Por qué es sumamente peligroso conectar un amperímetro en paralelo directo con una fuente de voltaje?',
            options: [
                'Porque tiene una resistencia interna casi nula y provocará un cortocircuito severo que fundirá su fusible',
                'Porque su resistencia interna es infinita y apagará toda la instalación',
                'Porque el instrumento absorberá todo el magnetismo del laboratorio',
                'Porque invertirá la polaridad química de la batería'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q13',
            objective: 'Dominar la regla de seguridad para medir resistencia con el óhmetro',
            concept: 'medicion_ohmetro',
            difficulty: 'easy',
            q: 'Al medir el valor de una resistencia con la función de óhmetro del multímetro, ¿qué condición es indispensable?',
            options: [
                'El circuito debe estar completamente desenergizado (apagado)',
                'La fuente debe estar ajustada a su máximo voltaje para excitar el resistor',
                'El componente debe estar sumergido en agua para evitar sobrecalentamiento',
                'El multímetro debe configurarse en modo de corriente alterna de alta frecuencia'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q14',
            objective: 'Comprender la función de prueba de continuidad',
            concept: 'prueba_continuidad',
            difficulty: 'easy',
            q: 'La función de continuidad con buzzer en un multímetro digital se utiliza en la práctica para:',
            options: [
                'Verificar si existe un camino conductor ininterrumpido (resistencia muy baja) entre dos puntos',
                'Medir la potencia en vatios que consume un motor en funcionamiento',
                'Comprobar la frecuencia de la red eléctrica de corriente alterna',
                'Aumentar la velocidad de carga de un condensador'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q15',
            objective: 'Diagnosticar un circuito abierto',
            concept: 'diagnostico_abierto',
            difficulty: 'medium',
            q: 'Si un cable se corta o un interruptor se abre en un circuito, el multímetro registrará:',
            options: [
                'Una corriente de 0 A y una resistencia infinita (lectura \'OL\')',
                'Una corriente infinita y un calentamiento instantáneo',
                'Un aumento del 500% en la potencia disipada',
                'Una caída de voltaje nula en todos los componentes del sistema'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q16',
            objective: 'Diagnosticar un cortocircuito',
            concept: 'diagnostico_corto',
            difficulty: 'medium',
            q: 'Un cortocircuito en una instalación se caracteriza principalmente por:',
            options: [
                'Una trayectoria de resistencia casi nula que dispara la corriente a niveles destructivos',
                'Una resistencia infinita que impide el paso de cualquier electrón',
                'Una disminución gradual de la temperatura hasta congelar los bornes',
                'Un consumo nulo de energía por parte de la fuente de poder'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q17',
            objective: 'Comprender la función del fusible',
            concept: 'funcion_fusible',
            difficulty: 'easy',
            q: 'El fusible es un componente de seguridad esencial que protege los circuitos porque:',
            options: [
                'Su filamento interno se funde y abre el circuito cuando la corriente supera el umbral seguro',
                'Almacena corriente extra para liberarla cuando la fuente se apaga',
                'Aumenta el voltaje del circuito cuando hay caídas de tensión',
                'Convierte la corriente alterna en corriente continua automáticamente'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q18',
            objective: 'Identificar la propiedad fundamental de la corriente en circuitos serie',
            concept: 'propiedad_serie_corriente',
            difficulty: 'easy',
            q: 'En un circuito puramente en serie compuesto por 4 resistencias de distintos valores:',
            options: [
                'La misma intensidad de corriente circula exactamente a través de todas las resistencias',
                'La resistencia más grande absorbe toda la corriente dejando a las demás sin flujo',
                'La corriente va disminuyendo progresivamente a medida que pasa cada resistencia',
                'La corriente se divide en 4 partes iguales sin importar los valores óhmicos'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q19',
            objective: 'Comprender el reparto de voltajes en circuitos serie',
            concept: 'divisor_voltaje_serie',
            difficulty: 'medium',
            q: 'Al conectar en serie un resistor de 10 kΩ y otro de 100 Ω a una fuente:',
            options: [
                'El resistor de 10 kΩ experimentará una caída de voltaje mucho mayor que el de 100 Ω',
                'Ambos resistores tendrán exactamente la misma caída de voltaje',
                'El resistor de 100 Ω absorberá el 99% del voltaje de la fuente',
                'El voltaje total de la fuente se destruirá antes de llegar al segundo resistor'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q20',
            objective: 'Analizar fallas en circuitos serie',
            concept: 'falla_serie',
            difficulty: 'easy',
            q: 'Si se quema uno de los bombillos en una guirnalda navideña conectada estrictamente en serie:',
            options: [
                'Todos los demás bombillos se apagan inmediatamente porque se interrumpe la única trayectoria de corriente',
                'Los demás bombillos brillarán con el doble de intensidad',
                'El circuito entrará en cortocircuito y fundirá el transformador',
                'Solo los bombillos ubicados antes del quemado permanecerán encendidos'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q21',
            objective: 'Identificar la propiedad fundamental del voltaje en circuitos paralelo',
            concept: 'propiedad_paralelo_voltaje',
            difficulty: 'easy',
            q: 'En un circuito en paralelo conectado a una fuente de 12 V:',
            options: [
                'Todas las ramas conectadas en paralelo reciben exactamente 12 V en sus extremos',
                'El voltaje de 12 V se divide proporcionalmente entre el número de ramas',
                'La rama con menor resistencia recibe el voltaje más alto de todas',
                'El voltaje cae a 0 V en cuanto se conecta más de una carga'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q22',
            objective: 'Comprender la independencia de ramas en circuitos paralelo',
            concept: 'independencia_paralelo',
            difficulty: 'easy',
            q: '¿Qué ventaja fundamental ofrece la conexión en paralelo en los circuitos de iluminación residencial?',
            options: [
                'Si se apaga o desconecta una lámpara, las demás siguen funcionando con total normalidad',
                'Permite que todos los electrodomésticos funcionen con corriente continua sin cables',
                'Reduce la corriente total consumida a cero vatios',
                'Evita que se utilicen fusibles o interruptores termomagnéticos'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q23',
            objective: 'Aplicar la Ley de Corrientes de Kirchhoff (LCK)',
            concept: 'lck_nodos',
            difficulty: 'medium',
            q: 'La Ley de Corrientes de Kirchhoff (LCK) en un nodo eléctrico establece fundamentalmente que:',
            options: [
                'La suma de las corrientes que entran a un nodo es idéntica a la suma de las corrientes que salen de él',
                'La corriente que entra a un nodo se multiplica por el número de cables conectados',
                'El voltaje en el nodo es igual a la suma de todas las resistencias del circuito',
                'La corriente siempre prefiere circular por el camino de mayor resistencia óhmica'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q24',
            objective: 'Analizar el efecto de añadir ramas en paralelo',
            concept: 'resistencia_equivalente_paralelo',
            difficulty: 'medium',
            q: 'Cuando conectas más resistencias en paralelo a una regleta o circuito de alimentación:',
            options: [
                'La resistencia equivalente total disminuye y la corriente total demandada a la fuente aumenta',
                'La resistencia equivalente total aumenta y la fuente trabaja más descansada',
                'El voltaje de la red se incrementa automáticamente para abastecer la demanda',
                'La corriente total se reduce a la mitad por cada nueva carga añadida'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q25',
            objective: 'Interpretar el diseño de instalaciones eléctricas comerciales y domiciliarias',
            concept: 'diseno_domiciliario',
            difficulty: 'medium',
            q: 'Los tomacorrientes de una vivienda están conectados en paralelo para garantizar que:',
            options: [
                'Cada equipo reciba el voltaje nominal estándar (ej. 120V) independientemente de los demás aparatos encendidos',
                'La factura de electricidad siempre marque cero kilovatios-hora',
                'Todos los electrodomésticos compartan una única corriente de 1 Amperio',
                'La energía fluya solo cuando todos los enchufes de la casa tengan un aparato conectado'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q26',
            objective: 'Comprender la metodología de reducción en circuitos mixtos',
            concept: 'metodo_reduccion_mixto',
            difficulty: 'medium',
            q: 'La estrategia sistemática y estándar para resolver una red mixta serie-paralelo compleja consiste en:',
            options: [
                'Identificar y simplificar los bloques más internos puramente serie o paralelo de adentro hacia afuera',
                'Sumar todas las resistencias directamente sin considerar la topología de los nodos',
                'Medir únicamente la primera resistencia y multiplicar su valor por el voltaje de la fuente',
                'Eliminar todas las ramas en paralelo y reemplazarlas por cables directos'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q27',
            objective: 'Aplicar el principio de Balance de Potencias',
            concept: 'balance_potencias',
            difficulty: 'medium',
            q: 'En cualquier circuito eléctrico sin pérdidas, el principio de conservación de la energía exige que:',
            options: [
                'La potencia total suministrada por la fuente sea igual a la suma de las potencias disipadas por todas las resistencias',
                'La potencia de la fuente sea el doble de la potencia disipada por los componentes',
                'Las resistencias en paralelo no consuman potencia alguna',
                'La potencia total dependa únicamente del color de los cables utilizados'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q28',
            objective: 'Evaluar la potencia nominal de componentes electrónicos',
            concept: 'potencia_nominal_resistor',
            difficulty: 'medium',
            q: 'Si un circuito hace que una resistencia estándar de 1/4 W (0.25 W) disipe 1.5 W de potencia continua:',
            options: [
                'La resistencia se sobrecalentará rápidamente, humeará y terminará quemándose y abriéndose',
                'La resistencia aumentará su tamaño físico para enfriarse sola',
                'El voltaje de la batería caerá a valores negativos',
                'El circuito funcionará de manera más eficiente y fría'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q29',
            objective: 'Comprender los factores de seguridad eléctrica en el ser humano',
            concept: 'seguridad_humana',
            difficulty: 'easy',
            q: '¿Por qué el riesgo de electrocución aumenta drásticamente cuando una persona tiene las manos mojadas o húmedas?',
            options: [
                'Porque el agua y las sales reducen drásticamente la resistencia eléctrica de la piel, permitiendo el paso de mayor corriente',
                'Porque el agua atrae a los protones del aire hacia el cuerpo',
                'Porque el cuerpo mojado se transforma en un aislante perfecto que acumula carga estática',
                'Porque el agua incrementa el voltaje de la instalación eléctrica al doble'
            ],
            correct: 0
        },
        {
            id: 'ee-1-6-q30',
            objective: 'Aplicar buenas prácticas y reglas de oro en el laboratorio con protoboard',
            concept: 'buenas_practicas_laboratorio',
            difficulty: 'easy',
            q: 'Antes de energizar por primera vez un circuito montado en protoboard, la mejor práctica de ingeniería es:',
            options: [
                'Verificar visualmente el cableado, polaridades de componentes y asegurarse de que no haya puentes entre positivo y tierra',
                'Subir el voltaje de la fuente al máximo posible para verificar si los componentes resisten el impacto',
                'Tocar con los dedos todos los terminales mientras se conecta el interruptor principal',
                'Retirar todos los resistores de protección para agilizar la prueba'
            ],
            correct: 0
        }
    ],
    quizConfig: { 
        timePerQuestion: 40, 
        requiredScorePercent: 70,
        pointsPerQuestion: 2
    }
};

export const lessonData = defineLesson({
    ...lessonDefinition,
    blocksByTab: {
        contenido: [
            createContentBlock({
                id: 'ee-m1-l6-content',
                content: lessonDefinition.content,
                hasSimulator: lessonDefinition.hasSimulator
            })
        ],
        repaso: [
            createFlashcardsBlock({
                id: 'ee-m1-l6-review',
                flashcards: lessonDefinition.flashcards,
                lessonContent: lessonDefinition.content
            })
        ],
        simulador: [
            createContentBlock({
                id: 'ee-m1-l6-practical-lab',
                content: `<div id="practical-lab-l6-container"></div>`,
                hasSimulator: true
            })
        ],
        prueba: [
            createQuizBlock({
                id: 'ee-m1-l6-quiz',
                title: lessonDefinition.title,
                questions: lessonDefinition.questions,
                quizConfig: lessonDefinition.quizConfig
            })
        ]
    }
});
