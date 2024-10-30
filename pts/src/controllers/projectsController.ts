import { API_BASE_URL } from '../config/api';

const getProjects = async () => {
    const res = await fetch(`${API_BASE_URL}/project`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        mode: 'no-cors',
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const getProjectDetail = async (_id:any) => {
    const res = await fetch(`${API_BASE_URL}/project/detail/${_id}`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const updateProject = async (_id: any, data:any) => {
    const res = await fetch(`${API_BASE_URL}/project/${_id}`, {
        method: 'PUT',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })
    const result = await res.json()

    if (!res.ok) {
        throw Error(result.error)
    }

    return result
}

const archiveProject = async (_id: any) => {
    const res = await fetch(`${API_BASE_URL}/project/archive/${_id}`, {
        method: 'PUT',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    const result = await res.json()

    if (!res.ok) {
        throw Error(result.error)
    }

    return result
}

const restoreProject = async (_id: any) => {
    const res = await fetch(`${API_BASE_URL}/project/restore/${_id}`, {
        method: 'PUT',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    const result = await res.json()

    if (!res.ok) {
        throw Error(result.error)
    }

    return result
}


export { getProjects, getProjectDetail, updateProject, archiveProject, restoreProject }