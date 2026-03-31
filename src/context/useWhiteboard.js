import { useContext } from 'react';
import { WhiteboardContext } from './WhiteboardContext';

export const useWhiteboard = () => useContext(WhiteboardContext);
