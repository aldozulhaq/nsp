import { useState, Fragment, useEffect, useContext, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import { getOpps, postOpp, softDelOpp, updateOpp } from '../../controllers/oppsController';
import { OppContext } from '../../contexts/oppContext';
import Opp from "../../components/Opps.js";
import Select, { SingleValue } from 'react-select';
import { IRootState } from '../../store';
import { GetCustomerById, GetCustomerNameById, GetCustomers } from '../../controllers/customerController';
import { GetSicByEmail, GetSicNameById, GetUsers } from '../../controllers/usersController';
import IconPencil from '../../components/Icon/IconPencil';
import Tippy from '@tippyjs/react';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconArchive from '../../components/Icon/IconArchive';

interface Option {
    value: string;
    label: string;
}

const Dashboard = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Dashboard'));
    });
    const [addContactModal, setAddContactModal] = useState<any>(false);

    const [defaultParams] = useState({
        _id: null,
        no: '',
        createdAt: '',
        no_opportunity: '',
        customer_name: '',
        opportunity_name: '',
        sic: '',
        closing_date: '',
        no_proposal: '',
        firm_budgetary: '',
        opp_status: '',
        nilai: '',
        gm: '',
        ntp: '',
        probability: '',
        keterangan: ''
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const oppStatusOptions = [
        { value: 'Identified', label: 'Identified' },
        { value: 'Offer in progress', label: 'Offer in progress' },
        { value: 'Offer Submitted', label: 'Offer Submitted' },
        { value: 'Decline', label: 'Decline' },
        { value: 'Lost', label: 'Lost' },
        { value: 'Won', label: 'Won' },
        { value: 'Customer did not pursue', label: 'Customer did not pursue' },
    ];
    const [selectedStatusOption, setSelectedStatusOption] = useState<Option | null>(null);

    const fBStatusOptions = [
        { value: 'Firm', label: 'Firm' },
        { value: 'Budgetary', label: 'Budgetary' },
    ];

    const [customerOptions, setCustomerOptions] = useState<Option[]>([]);
    const [selectedCustomerOption, setSelectedCustomerOption] = useState<Option | null>(null);
    const [sicOptions, setSicOptions] = useState<Option[]>([]);
    const [selectedSicOption, setSelectedSicOption] = useState<Option | null>(null);
    const [allSics, setAllSics] = useState<any>([]);

    const [filteredCustomerOptions, setFilteredCustomerOptions] = useState<Option[]>([])
    const [customerOptionSearch, setCustomerOptionSearch] = useState<any>('')
    const [allCustomers, setAllCustomers] = useState<any>([]);

    useEffect(() => {
        const fetchCustomersAndSics = async () => {
            try {
                const res = await GetCustomers();
                const cs = res.costumers.map((customer:any) => ({
                    value: customer._id,
                    label: customer.name
                }))
                setAllCustomers(cs);
                setFilteredCustomerOptions(cs);

                const sicRes = await GetUsers();
                const users = sicRes.users
                const userSics = users.filter((item:any) => {
                    return (item.role.toLowerCase().includes('user') && item.role.toLowerCase().includes('ots'))
                })

                const sics = userSics.map((user:any) => ({
                    value: user._id,
                    label: user.username
                }));

                setAllSics(sics);
                setSicOptions(sics);
            } catch (error) {
                console.error('Error fetching customer name:', error);
            }
        }
        fetchCustomersAndSics()
    }, [])

    // Filter locally based on search input
    useEffect(() => {
        const filteredCustomers = allCustomers.filter((item:any) =>
            item.label.toLowerCase().includes(customerOptionSearch.toLowerCase())
        );
        setFilteredCustomerOptions(filteredCustomers);
    }, [customerOptionSearch, allCustomers]);

    // Re-fetch or reset data when addContactModal changes
    useEffect(() => {
        if (addContactModal) {
            // Optionally, re-fetch data or reset states here if needed
            setCustomerOptions(allCustomers);
            setSicOptions(allSics);
        }
    }, [addContactModal, allCustomers, allSics]);

    const [selectedSICs, setSelectedSICs] = useState<any>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<any>([]);
    const [selectedCostumers, setSelectedCostumers] = useState<any>([]);
    const [selectedFB, setSelectedFB] = useState<any>([])

    const [search, setSearch] = useState<any>('');

    
    const { opps, setOpps } = useContext(OppContext)
    const [allOpps, setAllOpps] = useState([])

    const [noOpp, setNoOpp] = useState<any>('');

    const [sumNilai, setSumNilai] = useState(0)
    const [sumGM, setSumGM] = useState(0)

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
    
    // date range filter
    const [startDate, setStartDate] = useState<any>('');
    const [endDate, setEndDate] = useState<any>('');

    const [startNTPDate, setStartNTPDate] = useState<any>('')
    const [endNTPDate, setEndNTPDate] = useState<any>('')

    const [ startProb, setStartProb ] = useState<any>('')
    const [ endProb, setEndProb ] = useState<any>('')

    const [ oppsLength, setOppsLength ] = useState<any>('')

    const fetchAllOpps = async () => {
        const data = await getOpps();
        setAllOpps(data.opps);
        setOpps(data.opps)
        setNoOpp(data.opps[0].no)
        setSumNilai(data.opps.reduce((sum:any, item:any) => sum + (item.nilai || 0), 0));
        setOppsLength(data.opps.length)
        setSumGM(data.opps.reduce((sum:any, item:any) => {
            // Ensure item.nilai and item.gm are numbers and handle potential undefined or null values
            const nilai = item.nilai ? Number(item.nilai) : 0;
            const gm = item.gm ? Number(item.gm) : 0;
            
            // Add the GM contribution to the sum
            return sum + (nilai * gm / 100);
          }, 0));
    };

    // Fetch data once and store it locally
    useEffect(() => {
        fetchAllOpps();
    }, []);

    const fetchLocalOpps = () => {
        const filteredData = allOpps.filter((item:any) => {
            const itemDate = new Date(item.createdAt);
            const isWithinDateRange = (!startDate || itemDate >= new Date(startDate)) &&
                                      (!endDate || itemDate <= new Date(endDate));
            const itemNTPDate = new Date(item.ntp)
            const isWithinNTPDateRange = (!startNTPDate || itemNTPDate >= new Date(startNTPDate)) &&
                                         (!endNTPDate || itemNTPDate <= new Date(endNTPDate));
            const isWithinProbRange = (!startProb || item.probability >= Number(startProb)) &&
                                      (!endProb || item.probability <= Number(endProb))
            return item.opportunity_name.toLowerCase().includes(search.toLowerCase()) &&
            (selectedSICs.length === 0 || selectedSICs.includes(item.sic)) &&
            (selectedCostumers.length === 0 || selectedCostumers.includes(item.customer_name)) &&
            (selectedStatuses.length === 0 || selectedStatuses.includes(item.opp_status)) &&
            (selectedFB.length === 0 || selectedFB.includes(item.firm_budgetary)) &&
            isWithinDateRange && isWithinNTPDateRange && isWithinProbRange
        })

        setOpps(filteredData)
        setSumNilai(filteredData.reduce((sum:any, item:any) => sum + (item.nilai || 0), 0))
        setOppsLength(filteredData.length)
        setSumGM(filteredData.reduce((sum:any, item:any) => {
            // Ensure item.nilai and item.gm are numbers and handle potential undefined or null values
            const nilai = item.nilai ? Number(item.nilai) : 0;
            const gm = item.gm ? Number(item.gm) : 0;
            
            // Add the GM contribution to the sum
            return sum + (nilai * gm / 100);
          }, 0));
    }

    // const fetchOpps = async () => {
    //     const data = await getOpps()
    //         setNoOpp(data.opps[0].no)
    //         const filteredOpps = data.opps.filter((item:any) => {
    //             const itemDate = new Date(item.createdAt)
    //             const isWithinDateRange = (!startDate || itemDate >= new Date(startDate)) &&
    //                                       (!endDate || itemDate <= new Date(endDate));
    //             return item.opportunity_name.toLowerCase().includes(search.toLowerCase()) &&
    //             (selectedSICs.length === 0 || selectedSICs.includes(item.sic)) &&
    //             (selectedCostumers.length === 0 || selectedCostumers.includes(item.customer_name)) &&
    //             (selectedStatuses.length === 0 || selectedStatuses.includes(item.opp_status)) &&
    //             isWithinDateRange
    //         })

    //         setOpps(filteredOpps)
    //         setSumNilai(filteredOpps.reduce((sum:Number, item:any) => sum + (item.nilai || 0), 0))
    // }    

    useEffect(() => {
        fetchLocalOpps()
    }, [search, selectedSICs, selectedCostumers, selectedStatuses, startDate, endDate, selectedFB, startNTPDate, endNTPDate, startProb, endProb]);

    const handleSort = (key:any) => {
        let direction = 'ascending';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (sortConfig.direction === 'descending') {
                key = '';
            }
        }
        setSortConfig({ key, direction });
    };
    
    const sortedOpps = useMemo(() => {
        let sortableOpps = [...opps];
        if (sortConfig.key) {
            sortableOpps.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableOpps;
    }, [opps, sortConfig]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedOpps.slice(startIndex, endIndex);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(sortedOpps.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSICOptionChange = (sic:any) => {
        setSelectedSICs((prevSelected:any) =>
            prevSelected.includes(sic)
                ? prevSelected.filter((item:any) => item !== sic)
                : [...prevSelected, sic]
        );
    };

    const handleCustomerOptionChange = (customer:any) => {
        setSelectedCostumers((prevSelected:any) =>
            prevSelected.includes(customer)
                ? prevSelected.filter((item:any) => item !== customer)
                : [...prevSelected, customer]
        )
    }

    const handleStatusOptionChange = (status:any) => {
        setSelectedStatuses((prevSelected:any)=>
            prevSelected.includes(status)
                ? prevSelected.filter((item:any) => item !== status)
                : [...prevSelected, status]
        )
    }

    const handleFBOptionChange = (fb:any) => {
        setSelectedFB((prevSelected:any) =>
            prevSelected.includes(fb)
                ? prevSelected.filter((item:any) => item !== fb)
                : [...prevSelected, fb]
        )
    }
    
    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const saveUser = async () => {
        if (!params.opportunity_name) {
            showMessage('Name is required.', 'error');
            return true;
        }
        if (!params.customer_name) {
            showMessage('Customer is required.', 'error');
            return true;
        }
        if (!params.closing_date) {
            showMessage('Closing Date is required.', 'error');
            return true;
        }
        if (!params.firm_budgetary) {
            showMessage('Firm and Budgetary is required.', 'error');
            return true;
        }
        if (!params.firm_budgetary) {
            showMessage('Status is required.', 'error');
            return true;
        }

        if (params._id)
        {
            try{
                const data = updateOpp(params._id,
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
                    params.keterangan)
            } catch(error) {
                showMessage("error:" + error)
            }
        }
        else {
            try{
                const data = postOpp(params.customer_name,
                    params.opportunity_name,
                    params.closing_date,
                    params.firm_budgetary,
                    params.opp_status,
                    params.nilai,
                    params.gm,
                    params.ntp,
                    params.probability,
                    params.keterangan)
            } catch(error) {
                showMessage("error:" + error)
            }
        }

        showMessage('Opportunity has been saved successfully.')
        setAddContactModal(false)
        fetchAllOpps()
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [date1, setDate1] = useState<any>();
    const [date2, setDate2] = useState<any>()

    const getCustomerByIdLocal = (id:any) => {
        const customer = allCustomers.find((customer:any) => customer.value === id);
        return customer;
    };

    const getSicByIdLocal = (id:any) => {
        const sic = allSics.find((sic:any) => sic.value === id);
        return sic;
    };

    const editUser = (user: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        setDate1(new Date)
        setDate2(null)
        setParams({...params, ["closing_date"]:new Date})
        setParams({...params, ["ntp"]:null})
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1)
            

            if(user.closing_date)
                setDate1(user.closing_date)
            else setDate1(new Date)

            if(user.ntp)
                setDate2(user.ntp)
            else setDate2(null)

            if(user.opp_status) {
                setSelectedStatusOption({value: user.opp_status, label: user.opp_status})
            } else {
                setSelectedStatusOption(null)
            }

            const fetchSelectedCustomer = async () => {
                if (user && user.customer_name) {
                    const customer = getCustomerByIdLocal(user.customer_name)
                    setSelectedCustomerOption({ value: customer.value, label: customer.label    })
                } else {
                    setSelectedCustomerOption(null)
                }
            }
            fetchSelectedCustomer()

            const fetchSelectedSic = async () => {
                if (user && user.sic) {
                    const sic = getSicByIdLocal(user.sic)
                    setSelectedSicOption({ value: sic.value, label: sic.label})
                } else {
                    setSelectedSicOption(null)
                }
            }
            fetchSelectedSic()
        } else {
            setSelectedCustomerOption(null)
            setSelectedStatusOption(null)

            const sicUsername =  localStorage.getItem("username")
            setSelectedSicOption({value: '', label: sicUsername?sicUsername:''})
        }
        setAddContactModal(true);
    };

    const handleCustomerChange = (option: SingleValue<Option>) => {
        setSelectedCustomerOption(option)
        setParams({...params, ["customer_name"]:option?.value})
    }

    const handleSicChange = (option: SingleValue<Option>) => {
        setSelectedSicOption(option)
        setParams({...params, ["sic"]:option?.value})
    }

    const handleStatusChange = (option: SingleValue<Option>) => {
        setSelectedStatusOption(option)
        setParams({...params, ["opp_status"]:option?.value})
    }

    const handleDateChange = (date: Date[]) => {
        setDate1(date)
        setParams({...params, ["closing_date"]:date})
    }

    const handleStartDateChange = (date: Date[]) => {
        setStartDate(date)
    }

    const handleEndDateChange = (date: Date[]) => {
        setEndDate(date)
    }

    const handleNTPChange = (date: Date[]) => {
        if(date.length > 0)
        {
            setDate2(date)
            setParams({...params, ["ntp"]:date})
        }
        else
        {
            setDate2(null)
            setParams({...params, ["ntp"]:null})
        }
    }

    const deleteUser = async (_id: any) => {
        try {
            const data = await softDelOpp(_id)
            fetchAllOpps() 
            showMessage('Opp has been deleted successfully.');
        } catch (error) {
            showMessage('Error' + error)
        }
    };

    function romanize(num: any): string | false {
        if (!+num) return false;
    
        const digits = String(+num).split("");
        const key = [
            "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"
        ];
        let roman = "";
        let i = 3;
    
        while (i--) {
            const digit = digits.pop();
            roman = (key[+(digit ?? 0) + (i * 10)] || "") + roman;
        }
    
        return Array(+digits.join("") + 1).join("M") + roman;
    }
    
    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const showAlert = async (type: number, id:string) => {
        if (type === 11) {
           const swalWithBootstrapButtons = Swal.mixin({
               customClass: {
                   confirmButton: 'btn btn-secondary',
                   cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
                   popup: 'sweet-alerts',
               },
               buttonsStyling: false,
           });
           swalWithBootstrapButtons
               .fire({
                   title: 'Are you sure?',
                   text: "Opp will be send to archvies!",
                   icon: 'warning',
                   showCancelButton: true,
                   confirmButtonText: 'Yes, archive it!',
                   cancelButtonText: 'No, cancel!',
                   reverseButtons: true,
                   padding: '2em',
               })
               .then((result) => {
                   if (result.value) {
                        deleteUser(id)
                       swalWithBootstrapButtons.fire('Archived!', 'Opp has been archived.', 'success');
                   } else if (result.dismiss === Swal.DismissReason.cancel) {
                       swalWithBootstrapButtons.fire('Cancelled', 'Opp data is safe', 'error');
                   }
               });
       }
   }


    return (
        <>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Opportunity Tracking System</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => {editUser(); setParams({...params, ["_id"]:null})}}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Opportunity
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input id='search' type="text" placeholder="Search Opportunity Name" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
                <section className="mt-5 panel p-0 border-0">
                    <section className="">
                        {/* <div className='flex flex-col h-screen'> */}
                        <div>
                            <table className="table-hover min-w-full divide-y divide-gray-200">
                                <thead className='bg-gray-50 sticky z-10 top-12'>
                                    <tr className='break-words font-bold'>
                                        {/* <th className='text-nowrap' onClick={() => handleSort('no')}>
                                            No {sortConfig.key === 'no' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕︎'}
                                        </th> */}
                                        <th className='text-center'>
                                            <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                                    btnClassName="!flex items-center font-extrabold rounded-md px-0 py-0 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                    button={
                                                        <>
                                                            <span className="ltr:mr-1 rtl:ml-1">Create Date</span>
                                                            <IconCaretDown className="w-5 h-5" />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[135px]">
                                                        <div className='mt-2'>
                                                            <label htmlFor="start-date">From </label>
                                                            <input type="date"
                                                            className="form-input w-28 h-8 text-xs"
                                                            value={startDate}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(date:any) => setStartDate(date.target.value)}/>
                                                        </div>
                                                        <div className='mt-5'>
                                                            <label htmlFor="end-date">To </label>
                                                            <input type="date"
                                                            className="form-input w-28 h-8 text-xs"
                                                            value={endDate}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(date:any) => setEndDate(date.target.value)}/>
                                                        </div>
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </th>
                                        <th className='text-center font-extrabold' onClick={() => handleSort('no_opportunity')}>
                                            <p>Opp No. &</p> Proposal No. {sortConfig.key === 'no_opportunity' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕︎'}
                                        </th>
                                        <th className='text-center'>
                                            <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                                    btnClassName="!flex items-center font-extrabold rounded-md px-0 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                    button={
                                                        <>
                                                            <span className="ltr:mr-1 rtl:ml-1">Customer Name</span>
                                                            <IconCaretDown className="w-5 h-5" />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[135px]">
                                                        <input type="text" placeholder="Enter name..." 
                                                        value={customerOptionSearch} autoFocus 
                                                        className="form-input"
                                                        onChange={(e) => setCustomerOptionSearch(e.target.value)} 
                                                        onClick={(e) => {e.stopPropagation()}}/>
                                                        {filteredCustomerOptions.map(customer => {
                                                            return (
                                                                <li
                                                                    key={customer.value}
                                                                    className="flex flex-col truncate"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    <div className="flex items-center px-4 py-1">
                                                                        <label className="cursor-pointer mb-0 max-w-24">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-checkbox"
                                                                                value={customer.value}
                                                                                checked={selectedCostumers.includes(customer.value)}
                                                                                onChange={() => {
                                                                                    handleCustomerOptionChange(customer.value)
                                                                                }}
                                                                            />
                                                                            <span className="text-xs">{customer.label.substring(0,18) + (customer.label.length > 18? "...": "")}</span>
                                                                        </label>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </th>
                                        <th className='text-center font-extrabold'>Opportunity Name</th>
                                        <th className='text-center font-extrabold'>
                                        <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                                    btnClassName="!flex items-center font-extrabold rounded-md px-0 py-3 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                    button={
                                                        <>
                                                            <span className="ltr:mr-1 rtl:ml-1">SIC</span>
                                                            <IconCaretDown className="w-4 h-4" />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[90px]">
                                                        {sicOptions.map(sic => {
                                                            return (
                                                                <li
                                                                key={sic.value}
                                                                    className="flex flex-col"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    <div className="flex items-center px-4 py-1">
                                                                        <label className="cursor-pointer mb-0">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-checkbox"
                                                                                value={sic.value}
                                                                                checked={selectedSICs.includes(sic.value)}
                                                                                onChange={() => {
                                                                                    handleSICOptionChange(sic.value);
                                                                                }}
                                                                            />
                                                                            <span className="text-xs text-ellipsis">{sic.label}</span>
                                                                        </label>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </th>
                                        <th className='text-center font-extrabold'>Closing Date</th>
                                        <th className='text-center font-extrabold'>
                                        <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                                    btnClassName="!flex items-center font-extrabold ounded-md px-0 py-3 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                    button={
                                                        <>
                                                            <span className="ltr:mr-1 rtl:ml-1">Firm / Budgetary</span>
                                                            <IconCaretDown className="w-5 h-5" />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[130px]">
                                                        {fBStatusOptions.map(fb => {
                                                            return (
                                                                <li
                                                                    key={fb.value}
                                                                    className="flex flex-col"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    <div className="flex items-center px-4 py-1">
                                                                        <label className="cursor-pointer mb-0">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-checkbox"
                                                                                value={fb.value}
                                                                                checked={selectedFB.includes(fb.value)}
                                                                                onChange={() => {
                                                                                    handleFBOptionChange(fb.label)
                                                                                }}
                                                                            />
                                                                            <span className="text-xs">{fb.label.substring(0,18) + (fb.label.length > 18? "...": "")}</span>
                                                                        </label>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </th>
                                        <th className='text-center font-extrabold'>
                                            <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                                    btnClassName="!flex items-center font-extrabold ounded-md px-0 py-3 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                    button={
                                                        <>
                                                            <span className="ltr:mr-1 rtl:ml-1">Opportunity Status</span>
                                                            <IconCaretDown className="w-5 h-5" />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[130px]">
                                                        {oppStatusOptions.map(status => {
                                                            return (
                                                                <li
                                                                    key={status.value}
                                                                    className="flex flex-col"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    <div className="flex items-center px-4 py-1">
                                                                        <label className="cursor-pointer mb-0">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-checkbox"
                                                                                value={status.value}
                                                                                checked={selectedStatuses.includes(status.value)}
                                                                                onChange={() => {
                                                                                    handleStatusOptionChange(status.label)
                                                                                }}
                                                                            />
                                                                            <span className="text-xs">{status.label.substring(0,18) + (status.label.length > 18? "...": "")}</span>
                                                                        </label>
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </th>
                                        <th className='text-center font-extrabold'>Keterangan</th>
                                        <th className='text-center text-nowrap font-extrabold' onClick={() => handleSort('nilai')}>
                                            Nilai {sortConfig.key === 'nilai' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕︎'}
                                        </th>
                                        <th className='text-center text-nowrap font-extrabold' onClick={() => handleSort('gm')}>
                                            GM {sortConfig.key === 'gm' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕︎'}
                                        </th>
                                        <th className='text-center'>
                                        <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                                    btnClassName="!flex items-center font-extrabold rounded-md px-0 py-0 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                    button={
                                                        <>
                                                            <span className="ltr:mr-1 rtl:ml-1">Prob</span>
                                                            <IconCaretDown className="w-5 h-5" />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[135px]">
                                                        <div className='mt-2'>
                                                            <label htmlFor="start-date">From </label>
                                                            <input type="number"
                                                            className="form-input w-28 h-8 text-xs"
                                                            value={startProb}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e:any) => setStartProb(e.target.value)}/>
                                                        </div>
                                                        <div className='mt-5'>
                                                            <label htmlFor="end-date">To </label>
                                                            <input type="number"
                                                            className="form-input w-28 h-8 text-xs"
                                                            value={endProb}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e:any) => setEndProb(e.target.value)}/>
                                                        </div>
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </th>
                                        <th className='text-center font-extrabold'>
                                        <div className="dropdown">
                                                <Dropdown
                                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                                    btnClassName="!flex items-center font-extrabold rounded-md px-0 py-0 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                                    button={
                                                        <>
                                                            <span className="ltr:mr-1 rtl:ml-1">NTP</span>
                                                            <IconCaretDown className="w-5 h-5" />
                                                        </>
                                                    }
                                                >
                                                    <ul className="!min-w-[135px]">
                                                        <div className='mt-2'>
                                                            <label htmlFor="ntp=start-date">From </label>
                                                            <input type="date"
                                                            className="form-input w-28 h-8 text-xs"
                                                            value={startNTPDate}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(date:any) => setStartNTPDate(date.target.value)}/>
                                                        </div>
                                                        <div className='mt-5'>
                                                            <label htmlFor="end-date">To </label>
                                                            <input type="date"
                                                            className="form-input w-28 h-8 text-xs"
                                                            value={endNTPDate}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(date:any) => setEndNTPDate(date.target.value)}/>
                                                        </div>
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </th>
                                        <th className="text-center !text-center font-extrabold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { sortedOpps && sortedOpps.map((opp) => <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 break-words" key={opp._id}>
                                    <Opp opp={opp} allCustomers={allCustomers} allSics={allSics}/>
                                        <td>
                                            <div className="flex gap-2 items-center justify-center">
                                                <Tippy trigger="mouseenter focus" content="Edit" theme='warning'>
                                                    <button type="button" className="btn btn-warning rounded-full w-8 h-8 p-0" onClick={() => editUser(opp)}>
                                                        <IconPencil/>
                                                    </button>
                                                </Tippy>
                                                <Tippy trigger="mouseenter focus" content="Archive" theme='secondary'>
                                                    <button type="button" className="btn btn-secondary rounded-full w-8 h-8 p-0" 
                                                    onClick={() => showAlert(11, opp._id)}
                                                    >
                                                        <IconArchive/>
                                                    </button>
                                                </Tippy>
                                            </div>
                                        </td>
                                    </tr>)}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Paging controls */}
                        {/* <div className="paging-controls">
                            <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
                            <span>Page {currentPage} of {Math.ceil(sortedOpps.length / itemsPerPage)}</span>
                            <button onClick={handleNextPage} disabled={currentPage === Math.ceil(sortedOpps.length / itemsPerPage)}>Next</button>
                        </div> */}

                        {/* Fixed footer aligned with "nilai" column */}
                            <div className="fixed bottom-0 left-0 w-full bg-white shadow-md">
                                <div className="container mx-auto flex justify-between items-center p-2">
                                    <div>
                                        <span className="font-bold sm:text-xs min-[320px]:text-xs md:text-base text-nowrap">
                                            Jumlah Opp: {oppsLength}
                                        </span>
                                    </div>
                                    <div className="flex space-x-4">
                                        <div>
                                            <span className="font-bold sm:text-xs min-[320px]:text-xs md:text-base text-nowrap">
                                            Sum Nilai: {new Intl.NumberFormat('id-ID').format(sumNilai)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-bold sm:text-xs min-[320px]:text-xs md:text-base text-nowrap">
                                            Sum GM: {new Intl.NumberFormat('id-ID').format(sumGM)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </section>
                </section>

            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddContactModal(false)}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX /> {/* x button */}
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {params._id ? 'Edit Opportunity' : 'Add Opportunity - ' + (noOpp+1)}
                                    </div>
                                    <div className="p-5">
                                        <form id='opportunity' name='opportunity modal'>
                                            <div className="mb-5">
                                                <label>Opportunity Name</label>
                                                <input id='opportunity_name' type="text" placeholder="Enter Name" className="form-input" defaultValue={params._id?params.opportunity_name:''} onChange={(e) => {changeValue(e)}}/>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="mb-5">
                                                    <label className="text-white-dark">
                                                        Create Date
                                                    </label>
                                                    <input
                                                        id='createdAt'
                                                        type="text"
                                                        value={params._id?new Date(params.createdAt).toLocaleDateString('en-UK'):new Date().toLocaleDateString('en-UK')}
                                                        className="form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label className="text-white-dark">
                                                        No Opportunity
                                                    </label>
                                                    <input
                                                        id='no_opportunity'
                                                        type="text"
                                                        value={params._id?params.no_opportunity:"100" + (0 + (new Date().getMonth()+1).toString().slice(-2)) + new Date().getFullYear().toString().slice(-2) + "0" + (noOpp+1)}
                                                        className="form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                <label className="text-white-dark">No Proposal</label>
                                                <input id='no_proposal' type="text"
                                                value={params._id?params.no_proposal:"PEN-NSP-" + new Date().getFullYear().toString() + "/"+ romanize(new Date().getMonth() + 1) + "/" + (noOpp+1) + "_R00"}
                                                className="form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                disabled/>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="mb-5">
                                                    <label>Customer Name</label>
                                                    <Select id='customer_name' placeholder="Customer" options={customerOptions} value={selectedCustomerOption} onChange={handleCustomerChange} isDisabled={params.handover_status != 'Finished'? false : true}/>
                                                </div>
                                                <div className="mb-5">
                                                    <label>SIC</label>
                                                    <Select placeholder="SIC" options={sicOptions} value={selectedSicOption} onChange={handleSicChange} isDisabled={params.handover_status != 'Finished'? false : true}/>
                                                </div>
                                                <div className="mb-5">
                                                    <label>Opportunity Status</label>
                                                    <Select placeholder="Status" options={oppStatusOptions} value={selectedStatusOption} onChange={handleStatusChange} isDisabled={params.handover_status != 'Finished'? false : true}/>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className='mb-3.5'>Firm/Budgetary</label>
                                                    <input id='firm_budgetary' type="radio" name="FiBu" className="form-radio" value="Firm"
                                                    onChange={(e) => changeValue(e)}
                                                    defaultChecked={params._id?params.firm_budgetary === 'Firm':false}
                                                    disabled={params.handover_status != 'Finished'? false : true}/>
                                                    <span className='pr-5'>Firm</span>
                                                    <input id='firm_budgetary' type="radio" name="FiBu" className="form-radio" value="Budgetary"
                                                    onChange={(e) => changeValue(e)}
                                                    defaultChecked={params._id?params.firm_budgetary === 'Budgetary':false}
                                                    disabled={params.handover_status != 'Finished'? false : true}/>
                                                    <span>Budgetary</span>
                                                </div>
                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                                    <div className="mb-5">
                                                        <label>Closing Date</label>
                                                        <Flatpickr
                                                        value={date1}
                                                        id='closing_date'
                                                        disabled={params.handover_status != 'Finished'? false : true}
                                                        options={{ dateFormat: 'd-m-Y', position: isRtl ? 'auto right' : 'auto left' }}
                                                        className="form-input"
                                                        onChange={(date) => handleDateChange(date)} />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label>NTP</label>
                                                        <Flatpickr
                                                        value={date2}
                                                        id='ntp'
                                                        disabled={params.handover_status != 'Finished'? false : true}
                                                        options={{ dateFormat: 'd-m-Y', position: isRtl ? 'auto right' : 'auto left' }}
                                                        className="form-input"
                                                        onChange={(date) => handleNTPChange(date)} />
                                                    </div>
                                                </div>
                                            </div>                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="mb-5">
                                                    <label>Nilai</label>
                                                    <input id='nilai' type="number" inputMode='numeric' placeholder="Enter Nilai" className="form-input" defaultValue={params._id?params.nilai:""} onChange={(e) => changeValue(e)}/>
                                                </div>
                                                    <div className="mb-5">
                                                        <label>GM</label>
                                                        <div className='flex'>
                                                        <input id='gm' type="number" inputMode='numeric' placeholder="Enter GM" className="form-input" defaultValue={params._id?params.gm:""} onChange={(e) => changeValue(e)}/>
                                                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                %
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label>Probability</label>
                                                        <div className='flex'>
                                                        <input id='probability' type="number" inputMode='numeric' placeholder="Enter Probability" className="form-input" disabled={params.handover_status != 'Finished'? false : true} defaultValue={params._id?params.probability:""} onChange={(e) => changeValue(e)}/>
                                                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                %
                                                            </div>
                                                        </div>
                                                    </div>
                                            </div>
                                            <div className="mb-5">
                                                <label>Keterangan</label>
                                                <textarea
                                                    id='keterangan'
                                                    placeholder="Enter Keterangan"
                                                    className="form-textarea resize-none min-h-[130px]"
                                                    defaultValue={params._id?params.keterangan:""}
                                                    onChange={(e) => changeValue(e)}
                                                ></textarea>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveUser}>
                                                    {params._id ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default Dashboard;
