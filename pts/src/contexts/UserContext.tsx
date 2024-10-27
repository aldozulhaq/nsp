import { createContext, useState, ReactNode } from "react";

// Define the type for the user state
interface UserType {
    email: string | null;
    role: string | null;
}

// Define the type for the context value
interface UserContextType {
    user: UserType;
    setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

// Provide a default value for the context
const defaultValue: UserContextType = {
    user: { email: null, role: null },
    setUser: () => {},
};

export const UserContext = createContext<UserContextType>(defaultValue);

interface UserProviderProps {
    children: ReactNode;
}

const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<UserType>({
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role')
    });

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;