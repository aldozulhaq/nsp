import { useState, useEffect } from 'react';
import { postOpp, updateOpp } from '../controllers/oppsController';

export const useEditOpportunity = (initialParams:any) => {
    const [params, setParams] = useState(initialParams || {
        _id: null,
        customer_name: '',
        opportunity_name: '',
        sic: '',
        closing_date: '',
        firm_budgetary: '',
        opp_status: '',
        nilai: '',
        gm: '',
        ntp: '',
        probability: '',
        keterangan: ''
    });

    const handleInputChange = (e:any) => {
        const { id, value } = e.target;
        setParams((prev:any) => ({ ...prev, [id]: value }));
    };

    const saveOpportunity = async () => {
        if (params._id) {
            try {
                await updateOpp(params._id,
                    params.customer_name,
                    params.opportunity_name,
                    params.sic,
                    params.closing_date,
                    params.firm_budgetary,
                    params.opp_status,
                    params.nilai,
                    params.gm,
                    params.ntp,
                    params.probability,
                    params.keterangan);
                return { success: true };
            } catch (error) {
                return { success: false, error };
            }
        } else {
            try {
                await postOpp(params.customer_name,
                    params.opportunity_name,
                    params.closing_date,
                    params.firm_budgetary,
                    params.opp_status,
                    params.nilai,
                    params.gm,
                    params.ntp,
                    params.probability,
                    params.keterangan);
                return { success: true };
            } catch (error) {
                return { success: false, error };
            }
        }
    };

    useEffect(() => {
        if (initialParams) {
            setParams(initialParams);
        }
    }, [initialParams]);

    return {
        params,
        setParams,
        handleInputChange,
        saveOpportunity
    };
};
