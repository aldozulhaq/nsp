import { createContext, useState, ReactNode } from "react";

// Define the type for the context value
interface ProjectContextType {
    projects: any[];
    setProjects: React.Dispatch<React.SetStateAction<any[]>>;
}

// Provide a default value for the context
const defaultValue: ProjectContextType = {
    projects: [],
    setProjects: () => {},
};

export const ProjectContext = createContext<ProjectContextType>(defaultValue);

interface ProjectProviderProps {
    children: ReactNode;
}

const ProjectProvider = ({ children }: ProjectProviderProps) => {
    const [projects, setProjects] = useState<any[]>([]);

    return (
        <ProjectContext.Provider value={{ projects, setProjects }}>
            {children}
        </ProjectContext.Provider>
    );
};

export default ProjectProvider;
