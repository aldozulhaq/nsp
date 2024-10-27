import { API_BASE_URL } from '../config/api';

const GetCustomerNameById = async (_id : any) => {
    const res = await fetch(`${API_BASE_URL}/api/costumer/${_id}`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const GetCustomers = async () => {
    const res = await fetch(`${API_BASE_URL}/api/costumer/`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const GetCustomerArchives = async () => {
    const res = await fetch(`${API_BASE_URL}/api/costumer/archives`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const GetCustomerById = async (_id : any) => {
    const res = await fetch(`${API_BASE_URL}/api/costumer/getCustId/${_id}`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const PostCustomer = async (name:string, desc:string) => {
    const res = await fetch(`${API_BASE_URL}/api/costumer`, {
        method: 'POST',
        headers: {
            "Content-Type" : 'application/json', 
            "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            name,
            desc
        })
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const EditCustomer = async (_id:any, name:string, desc:string) => {
    const res = await fetch(`${API_BASE_URL}/api/costumer/up/${_id}`, {
        method: 'PUT',
        headers: {
            "Content-Type" : 'application/json', 
            "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            name,
            desc
        })
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const delCustomer = async (_id:any) => {
    const res = await fetch(`${API_BASE_URL}/api/costumer/del/${_id}`, {
        method: 'DELETE',
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const softDelCustomer = async (_id:any) => {
    const res = await fetch(`${API_BASE_URL}/api/costumer/archive/${_id}`, {
        method: 'PUT',
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const restoreCustomer = async (_id:any) => {
    const res = await fetch(`${API_BASE_URL}/api/costumer/restore/${_id}`, {
        method: 'PUT',
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}


export { GetCustomerNameById, GetCustomers, GetCustomerById, PostCustomer, EditCustomer, delCustomer, softDelCustomer, GetCustomerArchives, restoreCustomer } 