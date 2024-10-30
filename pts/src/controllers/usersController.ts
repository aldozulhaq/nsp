import { API_BASE_URL } from '../config/api';

// Login user
const loginUser = async (email: string, password: string) => {
    if (!email || !password) {
        throw Error('All fields are required')
    }

    const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({email, password})
    })

    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('email', data.email)
    localStorage.setItem('role', data.role)
    localStorage.setItem('username', data.username)
}

// Register User
const registerUser = async (username:string, email:string, role:string, password:string, passwordConfirm:string) => {
    if(!username || !email || !role || !password || !passwordConfirm){
        throw Error("All fields are required")
    }

    if(password !== passwordConfirm){
        throw Error("Passwords do not match")
    }

    const res = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({username, email, password, role})
    })

    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('email', data.email)
}

const GetSicNameById = async (_id: any) => {
    const res = await fetch(`${API_BASE_URL}/users/${_id}`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const GetSicByEmail = async (email: any) => {
    const res = await fetch(`${API_BASE_URL}/users/email/${email}`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const GetEmailById = async (_id: any) => {
    const res = await fetch(`${API_BASE_URL}/users/getEmail/${_id}`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const ChangePassword = async (_id:any, password:string, passwordConfirm:string) => {
    if(!password || !passwordConfirm){
        throw Error("All fields are required")
    }

    if(password !== passwordConfirm){
        throw Error("Passwords do not match")
    }

    const res = await fetch(`${API_BASE_URL}/users/changePW/${_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type' : 'application/json',
            "Authorization" : `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({password})
    })

    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }
}

const GetUsers = async () => {
    const res = await fetch(`${API_BASE_URL}/users/`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const GetUsersArc = async () => {
    const res = await fetch(`${API_BASE_URL}/users/archives/`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const softDelUser = async (_id:any) => {
    const res = await fetch(`${API_BASE_URL}/users/archive/${_id}`, {
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

const EditUser = async (_id:any, username:string, email:string, role:string) => {
    const res = await fetch(`${API_BASE_URL}/users/up/${_id}`, {
        method: 'PUT',
        headers: {
            "Content-Type" : 'application/json', 
            "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            username,
            email,
            role
        })
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}

const restoreUser = async (_id:any) => {
    const res = await fetch(`${API_BASE_URL}/users/restore/${_id}`, {
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

const delUser = async (_id:any) => {
    const res = await fetch(`${API_BASE_URL}/users/del/${_id}`, {
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

export { loginUser, registerUser, GetSicNameById, GetUsers, GetSicByEmail, GetEmailById, ChangePassword, softDelUser, delUser, restoreUser, GetUsersArc, EditUser } 