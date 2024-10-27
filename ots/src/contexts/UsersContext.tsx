import { createContext, useState, ReactNode } from "react";

// Define the type for the context value
interface UsersContextType {
    users: any[];
    setUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

// Provide a default value for the context
const defaultValue: UsersContextType = {
    users: [],
    setUsers: () => {},
};

export const UsersContext = createContext<UsersContextType>(defaultValue);

interface UsersProviderProps {
    children: ReactNode;
}

const UsersProvider = ({ children }: UsersProviderProps) => {
    const [users, setUsers] = useState<any[]>([]);

    return (
        <UsersContext.Provider value={{ users, setUsers }}>
            {children}
        </UsersContext.Provider>
    );
};

export default UsersProvider;
