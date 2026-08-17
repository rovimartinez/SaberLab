import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ArduinoSimulatorV2 from '../../simulators/RE/ArduinoSimulatorV2';
import LedSimulator from '../../simulators/RE/LedSimulator';
import ConductorAnimation from '../../simulators/electricity/ConductorAnimation';
import InteractiveOhmLaw from '../../simulators/electricity/InteractiveOhmLaw';
import ResistorCalculator from '../../simulators/electricity/ResistorCalculator';
import CircuitSimulator from '../../simulators/electricity/CircuitSimulator';
import MultimeterExplorer from '../../simulators/electricity/MultimeterExplorer';
import HydraulicAnalogy from '../../simulators/electricity/HydraulicAnalogy';
import AtomModel from '../../simulators/electricity/AtomModel';
import MaterialSorter from '../../simulators/electricity/MaterialSorter';
import ChargeInteraction from '../../simulators/electricity/ChargeInteraction';
import CurrentDirectionSimulator from '../../simulators/electricity/CurrentDirectionSimulator';
import AcDcSimulator from '../../simulators/electricity/AcDcSimulator';
import CircuitStatesSimulator from '../../simulators/electricity/CircuitStatesSimulator';
import PracticalLabL1 from '../../simulators/electricity/PracticalLabL1';
import PracticalLabL2 from '../../simulators/electricity/PracticalLabL2';
import PracticalLabL3 from '../../simulators/electricity/PracticalLabL3';
import SeriesCircuitDemo from '../../simulators/electricity/SeriesCircuitDemo';
import SeriesCalculationVisualizer from '../../simulators/electricity/SeriesCalculationVisualizer';
import HorsepowerSimulator from '../../simulators/electricity/HorsepowerSimulator';

const LessonLegacyBridge = ({ hasSimulator, onShowGuide, onShowArduinoParts }) => {
    const rootsRef = useRef(new Map());

    useEffect(() => {
        window.dispatchShowGuide = () => onShowGuide?.();
        window.showArduinoParts = () => onShowArduinoParts?.();

        return () => {
            delete window.dispatchShowGuide;
            delete window.showArduinoParts;
        };
    }, [onShowArduinoParts, onShowGuide]);

    useEffect(() => {
        const mountInto = (containerId, element) => {
            const container = document.getElementById(containerId);
            if (!container || rootsRef.current.has(container)) return;

            const root = createRoot(container);
            root.render(element);
            rootsRef.current.set(container, root);
        };

        const mountAllSimulators = () => {
            // Arduino / RE
            mountInto(
                'led-simulator-container',
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0.5rem' }}>
                    <LedSimulator />
                </div>
            );

            mountInto(
                'arduino-simulator-container',
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <ArduinoSimulatorV2 />
                </div>
            );

            // Electricidad & Electrónica (EE)
            mountInto(
                'charge-interaction-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <ChargeInteraction />
                </div>
            );

            mountInto(
                'atom-model-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <AtomModel />
                </div>
            );

            mountInto(
                'conductor-animation-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <ConductorAnimation />
                </div>
            );

            mountInto(
                'material-sorter-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <MaterialSorter />
                </div>
            );

            mountInto(
                'current-direction-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <CurrentDirectionSimulator />
                </div>
            );

            mountInto(
                'hydraulic-analogy-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <HydraulicAnalogy />
                </div>
            );

            mountInto(
                'ac-dc-simulator-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <AcDcSimulator />
                </div>
            );

            mountInto(
                'practical-lab-l1-container',
                <div style={{ width: '100%' }}>
                    <PracticalLabL1 />
                </div>
            );

            mountInto(
                'practical-lab-l2-container',
                <div style={{ width: '100%' }}>
                    <PracticalLabL2 />
                </div>
            );

            mountInto(
                'practical-lab-l3-container',
                <div style={{ width: '100%' }}>
                    <PracticalLabL3 />
                </div>
            );

            mountInto(
                'series-circuit-demo-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <SeriesCircuitDemo />
                </div>
            );

            mountInto(
                'series-calculation-visualizer-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <SeriesCalculationVisualizer />
                </div>
            );

            mountInto(
                'circuit-states-simulator-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <CircuitStatesSimulator />
                </div>
            );

            mountInto(
                'ohm-law-simulator-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <InteractiveOhmLaw />
                </div>
            );

            mountInto(
                'horsepower-simulator-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <HorsepowerSimulator />
                </div>
            );

            mountInto(
                'resistor-calculator-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <ResistorCalculator />
                </div>
            );

            mountInto(
                'circuit-simulator-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <CircuitSimulator />
                </div>
            );

            mountInto(
                'multimeter-explorer-container',
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <MultimeterExplorer />
                </div>
            );
        };

        const timeoutId = window.setTimeout(mountAllSimulators, 300);
        const observer = new MutationObserver(mountAllSimulators);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.clearTimeout(timeoutId);
            observer.disconnect();
            rootsRef.current.forEach((root) => root.unmount());
            rootsRef.current.clear();
        };
    }, [hasSimulator]);

    return null;
};

export default LessonLegacyBridge;
