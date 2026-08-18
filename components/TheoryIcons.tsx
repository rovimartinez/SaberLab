
import { SVGProps } from "react";
import { Home } from "lucide-react";

const AtomIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" stroke="currentColor" strokeWidth="1.5"/>
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
)

const ConductorsIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M9.5 13c-3-1.5-3-5.5 0-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 18c-3-1.5-3-5.5 0-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 6c3 1.5 3 5.5 0 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 11c3 1.5 3 5.5 0 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const MagnitudesIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M9.47 20.14c.83.21 1.7.33 2.6.33 4.42 0 8-2.69 8-6s-3.58-6-8-6-8 2.69-8 6c0 1.03.35 2 .94 2.86" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.99 8.5v-4l-4-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m10.39 12 3.6-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.03 2.5c-.02 0-.03.01-.05.01-.52.09-.93.53-.93 1.06v.01c0 .59.48 1.07 1.07 1.07.56 0 1.02-.43 1.06-.98.01-.02.01-.05.01-.07-.01-1.03-1.16-1.1-1.16-1.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const LawsIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20.25 10.83V16c0 3.5-2 5-5 5H8.75c-3 0-5-1.5-5-5V8c0-3.5 2-5 5-5h6.08" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m14.25 3 6 6" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.25 9h6V3" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.75 12h6.5M8.75 16h3.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const CircuitsIcon = (props: SVGProps<SVGSVGElement>) => (
     <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.5 12H14c-1.1 0-2 .9-2 2v1.5c0 1.1.9 2 2 2h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 6.5H10c1.1 0 2 .9 2 2V10c0 1.1-.9 2-2 2H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6.5V2M12 22v-4.5M17.5 12H22M6.5 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const ColorsIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M18.5 12c0-4.64-3.27-8.5-7.5-8.5-4.22 0-7.5 3.86-7.5 8.5 0 2.22.89 4.33 2.5 5.88" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 12a7.52 7.52 0 0 1-7.5 7.5c-2.45 0-4.68-1.18-6.1-3.12" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.13 18.22c-1.39.73-2.98 1.13-4.63 1.13-4.22 0-7.5-3.86-7.5-8.5 0-1.63.46-3.2 1.34-4.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.5 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const MeasurementIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M19 15a7 7 0 1 1-14 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15v-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13.5L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const iconMap: { [key: string]: (props: SVGProps<SVGSVGElement> | any) => JSX.Element } = {
    Home: Home,
    Atom: AtomIcon,
    GitBranch: ConductorsIcon,
    Zap: MagnitudesIcon,
    LawsIcon: LawsIcon,
    CircuitBoard: CircuitsIcon,
    Palette: ColorsIcon,
    Gauge: MeasurementIcon
};

export const TheoryIcon = ({ iconName, ...props }: { iconName: string } & SVGProps<SV4SVGElement>) => {
    const Icon = iconMap[iconName] || CircuitsIcon;
    return <Icon {...props} />;
};
