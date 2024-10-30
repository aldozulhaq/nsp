import { API_BASE_URL } from '../config/api';

// Type for the resource names
type ResourceType = 'materials' | 'manpower' | 'machines';

// Get auth headers
const getAuthHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
});

// Generic create function
export const createResource = async (resourceType: ResourceType, data: any) => {
    const res = await fetch(`${API_BASE_URL}/project/${resourceType}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const responseData = await res.json();
    
    if (!res.ok) {
        throw Error(responseData.error);
    }
    
    return responseData;
};

// Generic get all function
export const getAllResources = async (resourceType: ResourceType) => {
    const res = await fetch(`${API_BASE_URL}/project/${resourceType}`, {
        headers: getAuthHeaders()
    });
    const data = await res.json();
    
    if (!res.ok) {
        throw Error(data.error);
    }
    
    return data;
};

// Generic get by id function
export const getResourceById = async (resourceType: ResourceType, id: string) => {
    const res = await fetch(`${API_BASE_URL}/project/${resourceType}/${id}`, {
        headers: getAuthHeaders()
    });
    const data = await res.json();
    
    if (!res.ok) {
        throw Error(data.error);
    }
    
    return data;
};

// Generic update function
export const updateResource = async (resourceType: ResourceType, id: string, updateData: any) => {
    const res = await fetch(`${API_BASE_URL}/project/${resourceType}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
    });
    const data = await res.json();
    
    if (!res.ok) {
        throw Error(data.error);
    }
    
    return data;
};

// Generic delete function
export const deleteResource = async (resourceType: ResourceType, id: string) => {
    const res = await fetch(`${API_BASE_URL}/project/${resourceType}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const data = await res.json();
    
    if (!res.ok) {
        throw Error(data.error);
    }
    
    return data;
};