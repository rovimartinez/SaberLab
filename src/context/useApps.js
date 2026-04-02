import { useContext } from 'react';
import { AppsContext } from './AppsContext';

export const useApps = () => useContext(AppsContext);
