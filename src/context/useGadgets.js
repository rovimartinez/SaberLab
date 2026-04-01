import { useContext } from 'react';
import { GadgetsContext } from './GadgetsContext';

export const useGadgets = () => useContext(GadgetsContext);
