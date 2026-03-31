import { createContext, useState } from 'react';
import Whiteboard from '../components/Whiteboard';

export const WhiteboardContext = createContext();

export const WhiteboardProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openWhiteboard = () => setIsOpen(true);
    const closeWhiteboard = () => setIsOpen(false);

    return (
        <WhiteboardContext.Provider value={{ isOpen, openWhiteboard, closeWhiteboard }}>
            {children}
            {isOpen && <Whiteboard onClose={closeWhiteboard} />}
        </WhiteboardContext.Provider>
    );
};
