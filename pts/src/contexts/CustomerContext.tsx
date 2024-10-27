import { createContext, useState, ReactNode } from "react";

// Define the type for the context value
interface CustomerContextType {
    customers: any[];
    setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
}

// Provide a default value for the context
const defaultValue: CustomerContextType = {
    customers: [],
    setCustomers: () => {},
};

export const CustomerContext = createContext<CustomerContextType>(defaultValue);

interface CustomerProviderProps {
    children: ReactNode;
}

const CustomerProvider = ({ children }: CustomerProviderProps) => {
    const [customers, setCustomers] = useState<any[]>([]);

    return (
        <CustomerContext.Provider value={{ customers, setCustomers }}>
            {children}
        </CustomerContext.Provider>
    );
};

export default CustomerProvider;
