import { useState, Fragment, useEffect, useContext, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import 'flatpickr/dist/flatpickr.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import Tippy from '@tippyjs/react';
import { DataTable } from 'mantine-datatable';
import { OppContext } from '../../contexts/oppContext';
import { delOpp, getOpps, handoverOpp, restoreOpp } from '../../controllers/oppsController';
import { GetCustomerNameById, GetCustomers } from '../../controllers/customerController';
import { GetSicNameById, GetUsers } from '../../controllers/usersController';
import { $CombinedState } from '@reduxjs/toolkit';
import { useEditOpportunity } from '../../components/EditOpp';
import Flatpickr from 'react-flatpickr';
import Select, { SingleValue } from 'react-select';
import { IRootState } from '../../store';
import IconBookmark from '../../components/Icon/IconBookmark';

interface Option {
    value: string;
    label: string;
}

const Handover = () => {
    const dispatch = useDispatch();

    const [addContactModal, setAddContactModal] = useState<any>(false);

    const { opps, setOpps} = useContext(OppContext)
    
    const [ allOpps, setAllOpps ] = useState([])    
    const [ pendingOpps, setPendingOpps ] = useState([])
    const [ finishedOpps, setFinishedOpps ] = useState([])
    const [selectedOpp, setSelectedOpp] = useState(null);

    const { params, setParams, handleInputChange, saveOpportunity } = useEditOpportunity(selectedOpp);  // Hook usage

    const [searchPendingOpp, setSearchPendingOpp] = useState<any>('');
    const [searchFinishedOpp, setSearchFinishedOpp] = useState<any>('');
    
    useEffect(() => {
        dispatch(setPageTitle('Handover'));
        fetchInitialOpps();
    }, [dispatch]);

    const fetchInitialOpps = async () => {
        const data = await getOpps()
        setAllOpps(data.opps)
    }

    const fetchPendingOpps = async () => {
            const filteredOpps = allOpps
            .filter((item:any) => {
                return item.opportunity_name.toLowerCase().includes(searchPendingOpp.toLowerCase()) &&
                item.handover_status == "Pending"
            })
            setPendingOpps(filteredOpps)
            setOpps(filteredOpps)
    }

    useEffect(() => {
        fetchPendingOpps()
    }, [searchPendingOpp, allOpps])

    const fetchFinishedOpps = async () => {
        const filteredOpps = allOpps
            .filter((item:any) => {
                return item.opportunity_name.toLowerCase().includes(searchFinishedOpp.toLowerCase()) &&
                item.handover_status == "Finished"
            })
            setFinishedOpps(filteredOpps)
    }

    useEffect(() => {
        fetchFinishedOpps()
    }, [searchFinishedOpp, allOpps])

    const SicCell = ({ sic }:any) => {
        const [sicName, setSicName] = useState('')
        useEffect(() => {
          const fetchSicName = async () => {
            const sicName = await getSicByIdLocal(sic)
            setSicName(sicName?.label || 'Unknown SIC')
          }
          fetchSicName();
        }, [sic]);
        return <span>{sicName}</span>;
    };

    const CustomerCell = ({ customer }:any) => {
        const [customerName, setCustomerName] = useState('')
        useEffect(() => {
            const fetchCustomerName = async () => {
                const customerName = await getCustomerByIdLocal(customer)
                setCustomerName(customerName.label)
            }
            fetchCustomerName()
        }, [customer])
        return <span>{customerName}</span>
    }

    const getCustomerByIdLocal = (id:any) => {
        const customer = allCustomers.find((customer:any) => customer.value === id);
        return customer;
    };

    const getSicByIdLocal = (id:any) => {
        const sic = allSics.find((sic:any) => sic.value === id);
        return sic;
    };
    
    const editOpp = (opp:any) => {
        setSelectedOpp(opp);  // Set selected opportunity for editing
        let json1 = JSON.parse(JSON.stringify(opp));
            setParams(json1)
            

            if(opp.closing_date)
                setDate1(opp.closing_date)
            else setDate1(new Date)

            if(opp.ntp)
                setDate2(opp.ntp)
            else setDate2(null)

            if(opp.opp_status) {
                setSelectedStatusOption({value: opp.opp_status, label: opp.opp_status})
            } else {
                setSelectedStatusOption(null)
            }

            const fetchSelectedCustomer = async () => {
                if (opp && opp.customer_name) {
                    const customer = getCustomerByIdLocal(opp.customer_name)
                    setSelectedCustomerOption({ value: customer.value, label: customer.label    })
                } else {
                    setSelectedCustomerOption(null)
                }
            }
            fetchSelectedCustomer()

            const fetchSelectedSic = async () => {
                if (opp && opp.sic) {
                    const sic = getSicByIdLocal(opp.sic)
                    setSelectedSicOption({ value: sic.value, label: sic.label})
                } else {
                    setSelectedSicOption(null)
                }
            }
            fetchSelectedSic()
        setAddContactModal(true);  // Show the modal to edit opportunity
    };

    const handleSave = async () => {
        const result = await saveOpportunity();
        if (result.success) {
            Swal.fire('Success!', 'Opportunity has been updated.', 'success');
            setAddContactModal(false);  // Close modal after saving
            fetchInitialOpps();  // Refresh opportunities after update
        } else {
            Swal.fire('Error', 'Failed to update opportunity.', 'error');
        }
    };
    
    const colsOpp = [
        {
            accessor: 'no_opportunity',
            title: 'Opp. No'
        },
        {
            accessor: 'no_proposal',
            title: 'No Proposal'
        },
        {
            accessor: 'opportunity_name',
            title: "Opportunity Name"
        },
        {
            accessor: 'customer_name',
            title: "Customer Name",
            render: (data:any) => (<CustomerCell customer={data.customer_name} />)
        },
        {
            accessor: 'sic',
            title: "SIC",
            render: (data:any) => (<SicCell sic={data.sic} />)
        },
        {
            accessor: 'opp_status',
            title: "Opportunity Status"
        },
        {
            accessor: 'nilai',
            title: "Nilai",
            render: (data:any) => (<span>{data.nilai?.toLocaleString('id-ID')}</span>)
        },
        {
            accessor: 'gm',
            title: "Gross Margin",
            render: (data:any) => (<span>{data.gm}%</span>)
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            render: (opp:any) => (
                <div className="flex gap-2 items-center justify-center">
                    <Tippy trigger="mouseenter focus" content="Edit" theme='warning'>
                        <button type="button" className="btn btn-warning rounded-full w-8 h-8 p-0" onClick={() => editOpp(opp)}>
                            <IconPencil/>
                        </button>
                    </Tippy>
                    <Tippy trigger="mouseenter focus" content="Handover" theme='success'>
                        <button type="button" className="btn btn-success rounded-full w-8 h-8 p-0" onClick={() => showAlert(11,opp._id)}>
                            <IconBookmark/>
                        </button>
                    </Tippy>
                </div>
            )
        }
    ]

    const colsFinishedOpp = [
        {
            accessor: 'no_opportunity',
            title: 'Opp. No'
        },
        {
            accessor: 'no_proposal',
            title: 'No Proposal'
        },
        {
            accessor: 'opportunity_name',
            title: "Opportunity Name"
        },
        {
            accessor: 'customer_name',
            title: "Customer Name",
            render: (data:any) => (<CustomerCell customer={data.customer_name} />)
        },
        {
            accessor: 'sic',
            title: "SIC",
            render: (data:any) => (<SicCell sic={data.sic} />)
        },
        {
            accessor: 'opp_status',
            title: "Opportunity Status"
        },
        {
            accessor: 'nilai',
            title: "Nilai",
            render: (data:any) => (<span>{data.nilai.toLocaleString('id-ID')}</span>)
        },
        {
            accessor: 'gm',
            title: "Gross Margin",
            render: (data:any) => (<span>{data.gm}%</span>)
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            render: (opp:any) => (
                <div className="flex gap-2 items-center justify-center">
                    <Tippy trigger="mouseenter focus" content="Edit" theme='warning'>
                        <button type="button" className="btn btn-warning rounded-full w-8 h-8 p-0" onClick={() => editOpp(opp)}>
                            <IconPencil/>
                        </button>
                    </Tippy>
                </div>
            )
        }
    ]

    const [customerOptions, setCustomerOptions] = useState<Option[]>([]);
    const [selectedCustomerOption, setSelectedCustomerOption] = useState<Option | null>(null);
    const [sicOptions, setSicOptions] = useState<Option[]>([]);
    const [selectedSicOption, setSelectedSicOption] = useState<Option | null>(null);
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
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [date1, setDate1] = useState<any>();
    const [date2, setDate2] = useState<any>();
    const [allSics, setAllSics] = useState<any>([]);
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

                const sicRes = await GetUsers();
                const users = sicRes.users
                const userSics = users.filter((item:any) => {
                    return item.role.toLowerCase().includes('user')
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

    useEffect(() => {
        if (addContactModal) {
            // Optionally, re-fetch data or reset states here if needed
            setCustomerOptions(allCustomers);
            setSicOptions(allSics);
        }
    }, [addContactModal, allCustomers, allSics]);

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

    const handoverOppToProject = async (_id: any) => {
        try {
            const data = await handoverOpp(_id);
            showMessage('Opp has been handover successfully to PTS.');
        } catch (error) {
            showMessage('Error' + error)
        }
        fetchInitialOpps();
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
                   text: "Your file will be handed over to PTS!",
                   icon: 'warning',
                   showCancelButton: true,
                   confirmButtonText: 'Yes, handover!',
                   cancelButtonText: 'No, cancel!',
                   reverseButtons: true,
                   padding: '2em',
               })
               .then((result) => {
                   if (result.value) {
                        handoverOppToProject(id)
                       swalWithBootstrapButtons.fire('Handover!', 'Your file has been handed over.', 'success');
                   } else if (result.dismiss === Swal.DismissReason.cancel) {
                       swalWithBootstrapButtons.fire('Cancelled', 'Your file stays pending', 'error');
                   }
               });
       }
    }

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Pending Opportunity List</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <input id='search' type="text" placeholder="Search Opportunity Name" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={searchPendingOpp} onChange={(e) => setSearchPendingOpp(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-5 panel p-0 border-0 overflow-hidden">
                <div className="table-responsive">
                    <div className='datatables'>
                            <DataTable
                                className="whitespace-nowrap"
                                columns={colsOpp}
                                records={pendingOpps}
                                idAccessor='_id'
                                highlightOnHover
                                striped
                                withColumnBorders
                                height={500}
                                pinLastColumn   
                            />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 mt-10">
                <h2 className="text-xl">Finished Opportunity List</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <input id='search' type="text" placeholder="Search Opportunity Name" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={searchFinishedOpp} onChange={(e) => setSearchFinishedOpp(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-5 panel p-0 border-0 overflow-hidden">
                <div className="table-responsive">
                    <div className='datatables'>
                            <DataTable
                                className="whitespace-nowrap"
                                columns={colsFinishedOpp}
                                records={finishedOpps}
                                idAccessor='_id'
                                highlightOnHover
                                striped
                                withColumnBorders
                                height={500}
                                pinLastColumn   
                            />
                    </div>
                </div>
            </div>

            {selectedOpp && (
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
                                        <div className="p-5">
                                            <form id='opportunity' name='opportunity modal'>
                                                <div className="mb-5">
                                                    <label>Opportunity Name</label>
                                                    <input id='opportunity_name' type="text" placeholder="Enter Name" className="form-input" defaultValue={params.opportunity_name} onChange={(e) => {handleInputChange(e)}}/>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="mb-5">
                                                        <label className="text-white-dark">
                                                            Create Date
                                                        </label>
                                                        <input
                                                            id='createdAt'
                                                            type="text"
                                                            value={new Date(params.createdAt).toLocaleDateString('en-UK')}
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
                                                            value={params.no_opportunity}
                                                            className="form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                            disabled
                                                            />
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className="text-white-dark">No Proposal</label>
                                                            <input id='no_proposal' type="text"
                                                                value={params.no_proposal}
                                                                className="form-input disabled:bg-[#eee] dark:disabled:bg-[#1b2e4b] cursor-not-allowed"
                                                                disabled/>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="mb-5">
                                                        <label>Customer Name</label>
                                                        <Select id='customer_name' placeholder="Customer" options={customerOptions} value={selectedCustomerOption} onChange={handleCustomerChange} isDisabled={params.handover_status == 'Pending'? false : true}/>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label>SIC</label>
                                                        <Select placeholder="SIC" options={sicOptions} value={selectedSicOption} onChange={handleSicChange} isDisabled={params.handover_status == 'Pending'? false : true}/>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label>Opportunity Status</label>
                                                        <Select placeholder="Status" options={oppStatusOptions} value={selectedStatusOption} onChange={handleStatusChange} isDisabled={params.handover_status == 'Pending'? false : true}/>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className='mb-3.5'>Firm/Budgetary</label>
                                                        <input id='firm_budgetary' type="radio" name="FiBu" className="form-radio" value="Firm"
                                                        onChange={(e) => handleInputChange(e)}
                                                        defaultChecked={params.firm_budgetary === 'Firm'}
                                                        disabled={params.handover_status == 'Pending'? false : true}/>
                                                        <span className='pr-5'>Firm</span>
                                                        <input id='firm_budgetary' type="radio" name="FiBu" className="form-radio" value="Budgetary"
                                                        onChange={(e) => handleInputChange(e)}
                                                        defaultChecked={params.firm_budgetary === 'Budgetary'}
                                                        disabled={params.handover_status == 'Pending'? false : true}/>
                                                        <span>Budgetary</span>
                                                    </div>
                                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                                        <div className="mb-5">
                                                            <label>Closing Date</label>
                                                            <Flatpickr
                                                            value={date1}
                                                            id='closing_date'
                                                            options={{ dateFormat: 'd-m-Y', position: isRtl ? 'auto right' : 'auto left' }}
                                                            className="form-input"
                                                            onChange={(date) => handleDateChange(date)}
                                                            disabled={params.handover_status == 'Pending'? false : true}/>
                                                        </div>
                                                        <div className="mb-5">
                                                            <label>NTP</label>
                                                            <Flatpickr
                                                            value={date2}
                                                            id='ntp'
                                                            options={{ dateFormat: 'd-m-Y', position: isRtl ? 'auto right' : 'auto left' }}
                                                            className="form-input"
                                                            onChange={(date) => handleNTPChange(date)}
                                                            disabled={params.handover_status == 'Pending'? false : true}/>
                                                        </div>
                                                    </div>
                                                </div>                                            
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="mb-5">
                                                        <label>Nilai</label>
                                                        <input id='nilai' type="number" inputMode='numeric' placeholder="Enter Nilai" className="form-input" defaultValue={params.nilai} onChange={(e) => handleInputChange(e)}/>
                                                    </div>
                                                        <div className="mb-5">
                                                            <label>GM</label>
                                                            <div className='flex'>
                                                            <input id='gm' type="number" inputMode='numeric' placeholder="Enter GM" className="form-input" defaultValue={params.gm} onChange={(e) => handleInputChange(e)}/>
                                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                    %
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mb-5">
                                                            <label>Probability</label>
                                                            <div className='flex'>
                                                            <input id='probability' type="number" inputMode='numeric' placeholder="Enter Probability" className="form-input" defaultValue={params.probability} onChange={(e) => handleInputChange(e)}/>
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
                                                        defaultValue={params.keterangan}
                                                        onChange={(e) => handleInputChange(e)}
                                                    ></textarea>
                                                </div>
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={handleSave}>
                                                        Save Changes
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
            )}
        </div>
    );
};

export default Handover;
