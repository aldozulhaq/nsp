import { createContext, useState, ReactNode } from "react";

// Define the type for the context value
interface OppContextType {
    opps: any[];
    setOpps: React.Dispatch<React.SetStateAction<any[]>>;
}

// Provide a default value for the context
const defaultValue: OppContextType = {
    opps: [],
    setOpps: () => {},
};

export const OppContext = createContext<OppContextType>(defaultValue);

interface OppProviderProps {
    children: ReactNode;
}

const OppProvider = ({ children }: OppProviderProps) => {
    const [opps, setOpps] = useState<any[]>([]);

    return (
        <OppContext.Provider value={{ opps, setOpps }}>
            {children}
        </OppContext.Provider>
    );
};

export default OppProvider;
