// Get opps
const getOpps = async () => {
    const res = await fetch('/api/opps', {
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

const getOppArchives = async () => {
    const res = await fetch('/api/opps/archives', {
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

const getOppById = async (_id:any) => {
    const res = await fetch(`/api/opps/${_id}`, {
        headers: { "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        }
    })
    const data = await res.json()

    if(!res.ok) {
        throw Error(data.error)
    }

    return data
}


const softDelOpp = async (_id:any) => {
    const res = await fetch(`/api/opps/archive/${_id}`, {
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

const restoreOpp = async (_id:any) => {
    const res = await fetch(`/api/opps/restore/${_id}`, {
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


const handoverOpp = async (_id:any) => {
    const res = await fetch(`/api/opps/handover/${_id}`, {
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

const delOpp = async (_id:any) => {
    const res = await fetch(`/api/opps/del/${_id}`, {
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

const postOpp = async (
        customer_name: any,
        opportunity_name: string,
        closing_date: Date,
        firm_budgetary: string,
        opp_status: string,
        nilai: string,
        gm: number,
        ntp: Date,
        probability: Number,
        keterangan: string
        ) => {
    
    const res = await fetch('/api/opps', {
        method: 'POST',
        headers: {
            "Content-Type" : 'application/json', 
            "Authorization" : `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            customer_name,
            opportunity_name,
            closing_date,
            firm_budgetary,
            opp_status,
            nilai,
            gm,
            ntp,
            probability,
            keterangan})
    })

    const data = await res.json()

    if (!res.ok) {
        throw Error(data.error)
    }

    return data
}

const updateOpp = async (_id: any,
    customer_name: any,
    opportunity_name: string,
    sic: any,
    closing_date: Date,
    firm_budgetary: string,
    opp_status: string,
    nilai: string,
    gm: number,
    ntp: Date,
    probability: Number,
    keterangan: string
    ) => {

const res = await fetch(`/api/opps/up/${_id}`, {
    method: 'PUT',
    headers: {
        "Content-Type" : 'application/json', 
        "Authorization" : `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
        customer_name,
        opportunity_name,
        sic,
        closing_date,
        firm_budgetary,
        opp_status,
        nilai,
        gm,
        ntp,
        probability,
        keterangan})
})

const data = await res.json()

if (!res.ok) {
    throw Error(data.error)
}

return data
}

export { getOpps, postOpp, getOppById, softDelOpp, updateOpp, delOpp, restoreOpp, getOppArchives, handoverOpp }