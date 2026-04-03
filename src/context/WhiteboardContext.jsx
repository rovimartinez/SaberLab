import { createContext, useState } from 'react';
import PizarraMagica from '../components/widgets/PizarraMagica';

export const WhiteboardContext = createContext();

export const WhiteboardProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openWhiteboard = () => setIsOpen(true);
    const closeWhiteboard = () => setIsOpen(false);

    return (
        <WhiteboardContext.Provider value={{ isOpen, openWhiteboard, closeWhiteboard }}>
            {children}
            {isOpen && <PizarraMagica onClose={closeWhiteboard} />}
        </WhiteboardContext.Provider>
    );
};
