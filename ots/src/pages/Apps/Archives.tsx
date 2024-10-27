import { useState, Fragment, useEffect, useContext, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import 'flatpickr/dist/flatpickr.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconUserPlus from '../../components/Icon/IconUserPlus';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import { CustomerContext } from '../../contexts/CustomerContext';
import { EditCustomer, GetCustomerArchives, GetCustomerNameById, GetCustomers, PostCustomer, delCustomer, restoreCustomer, softDelCustomer } from '../../controllers/customerController';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import Tippy from '@tippyjs/react';
import { DataTable } from 'mantine-datatable';
import { OppContext } from '../../contexts/oppContext';
import { delOpp, getOppArchives, restoreOpp } from '../../controllers/oppsController';
import { GetUsers, GetUsersArc, delUser, restoreUser } from '../../controllers/usersController';
import { UsersContext } from '../../contexts/UsersContext';


const Archives = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Archives'));
    });

    const [searchCustomer, setSearchCustomer] = useState<any>('');
    const [searchOpp, setSearchOpp] = useState<any>('');
    const [searchUser, setSearchUser] = useState<any>('')

    const { customers, setCustomers } = useContext(CustomerContext)
    const { opps, setOpps} = useContext(OppContext)
    const { users, setUsers} = useContext(UsersContext)

    const [ allCustomers, setAllCustomers] = useState([])
    const [ allOpps, setAllOpps ] = useState([])
    const [ allUsers, setAllUsers ] = useState([])
    
    const fetchInitialCusts = async () => {
        const data = await GetCustomerArchives()
        setAllCustomers(data.costumers)
    }

    useEffect(() => {
        fetchInitialCusts()
    }, []);

    const fetchInitialOpps = async () => {
        const data = await getOppArchives()
        setAllOpps(data.opps)
    }

    useEffect(() => {
        fetchInitialOpps()
    }, []);

    const fetchInitialUsers = async () => {
        const data = await GetUsersArc()
        setAllUsers(data.users)
    }

    useEffect(() => {
        fetchInitialUsers()
    }, []);

    const fetchCusts = async () => {
            const filteredCusts = allCustomers
            .filter((item:any) => {
                return item.name.toLowerCase().includes(searchCustomer.toLowerCase())
            })
            setCustomers(filteredCusts)
    }

    const fetchOpps = async () => {
            const filteredOpps = allOpps
            .filter((item:any) => {
                return item.opportunity_name.toLowerCase().includes(searchOpp.toLowerCase())
            })
            setOpps(filteredOpps)
    }

    const fetchUsers = async () => {
            const filteredUsers = allUsers
            .filter((item:any) => {
                return item.username.toLowerCase().includes(searchUser.toLowerCase())
            })
        setUsers(filteredUsers)
    }

    useEffect(() => {
        fetchCusts()
    }, [searchCustomer, allCustomers]);

    useEffect(() => {
        fetchOpps()
    }, [searchOpp, allOpps])

    useEffect(() => {
        fetchUsers()
    }, [searchUser, allUsers])

    const colsCustomer = [
        {
            accessor: 'name',
            title: 'Customer Name',
            width: 200
        },
        {
            accessor: 'desc',
            title: 'Description'
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            render: (customer:any) => (
                <div className="flex gap-2 items-center justify-center">
                    <Tippy trigger="mouseenter focus" content="Restore" theme='secondary'>
                        <button type="button" className="btn btn-secondary rounded-full w-8 h-8 p-0" onClick={() => showAlert(11, 'Customer', customer._id)}>
                            <IconPencil/>
                        </button>
                    </Tippy>
                    <Tippy trigger="mouseenter focus" content="Delete" theme='danger'>
                        <button type="button" className="btn btn-danger rounded-full w-8 h-8 p-0" 
                        onClick={() => showAlert(12, 'Customer', customer._id)}
                        >
                            <IconTrash/>
                        </button>
                    </Tippy>
                </div>
            )
        }
    ]

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
            title: "Customer Name"
        },
        {
            accessor: 'sic',
            title: "SIC"
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            render: (customer:any) => (
                <div className="flex gap-2 items-center justify-center">
                    <Tippy trigger="mouseenter focus" content="Restore" theme='secondary'>
                        <button type="button" className="btn btn-secondary rounded-full w-8 h-8 p-0" onClick={() => showAlert(11, 'Opp', customer._id)}>
                            <IconPencil/>
                        </button>
                    </Tippy>
                    <Tippy trigger="mouseenter focus" content="Delete" theme='danger'>
                        <button type="button" className="btn btn-danger rounded-full w-8 h-8 p-0" 
                        onClick={() => showAlert(12, 'Opp', customer._id)}
                        >
                            <IconTrash/>
                        </button>
                    </Tippy>
                </div>
            )
        }
    ]

    const colsUser = [
        {
            accessor: 'username',
            title: "Username"
        },
        {
            accessor: 'email',
            title: 'Email'
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            render: (customer:any) => (
                <div className="flex gap-2 items-center justify-center">
                    <Tippy trigger="mouseenter focus" content="Restore" theme='secondary'>
                        <button type="button" className="btn btn-secondary rounded-full w-8 h-8 p-0" onClick={() => showAlert(11, 'User', customer._id)}>
                            <IconPencil/>
                        </button>
                    </Tippy>
                    <Tippy trigger="mouseenter focus" content="Delete" theme='danger'>
                        <button type="button" className="btn btn-danger rounded-full w-8 h-8 p-0" 
                        onClick={() => showAlert(12, 'User', customer._id)}
                        >
                            <IconTrash/>
                        </button>
                    </Tippy>
                </div>
            )
        }
    ]

    const restoreData = async (_id: any, type:string) => {
        try {
            if(type === 'Customer')
                {
                    const data = await restoreCustomer(_id)
                    fetchInitialCusts() 
                }
            if(type === 'Opp')
                {
                    const data = await restoreOpp(_id)
                    fetchInitialOpps()
                }
            if(type === 'User')
                {
                    const data = await restoreUser(_id)
                    fetchInitialUsers()
                }
            showMessage( type + ' has been restored successfully.');
        } catch (error) {
            showMessage('Error' + error)
        }
    };

    const deleteData = async (_id: any, type:string) => {
        try {
            if(type === 'Customer')
                {
                    const data = await delCustomer(_id)
                    fetchInitialUsers()
                }
            if(type === 'Opp')
                {
                    const data = await delOpp(_id)
                    fetchInitialOpps()
                }
            if(type === 'User')
                {
                    const data = await delUser(_id)
                    fetchInitialUsers()
                }
            showMessage( type + ' has been deleted successfully.');
        } catch (error) {
            showMessage('Error' + error)
        }
    };

    const checkIfAdmin = () => {
        const role = localStorage.getItem('role')
        if(role?.toLowerCase() !== 'user') {
            return (
                <>
                    <div className="flex items-center justify-between flex-wrap gap-4 mt-10">
                        <div>
                        <h2 className="text-xl">Users List</h2>
                        <span className='mb-5 text-xs italic'>Archived user isn't allowed to login</span>
                        </div>
                        <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                            <div className="relative">
                                <input id='search' type="text" placeholder="Search User Name" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} />
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
                                        columns={colsUser}
                                        records={users}
                                        idAccessor='_id'
                                        highlightOnHover
                                        striped
                                        withColumnBorders
                                        height={300}  
                                    />
                            </div>
                        </div>
                    </div>
                </>
            )
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

    const showAlert = async (type: number, table:string, id:string) => {
        if (type === 11) { //restore
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
                   text: "Your file will be archived back to main!",
                   icon: 'warning',
                   showCancelButton: true,
                   confirmButtonText: 'Yes, restore it!',
                   cancelButtonText: 'No, cancel!',
                   reverseButtons: true,
                   padding: '2em',
               })
               .then((result) => {
                   if (result.value) {
                        restoreData(id, table)
                       swalWithBootstrapButtons.fire('Restored!', 'Your file has been restored.', 'success');
                   } else if (result.dismiss === Swal.DismissReason.cancel) {
                       swalWithBootstrapButtons.fire('Cancelled', 'Your file stays archived :)', 'error');
                   }
               });
       }
       if (type === 12) { //delete
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
                popup: 'sweet-alerts',
            },
            buttonsStyling: false,
        });
        swalWithBootstrapButtons
            .fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this! File will be lost forever",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                reverseButtons: true,
                padding: '2em',
            })
            .then((result) => {
                if (result.value) {
                     deleteData(id, table)
                    swalWithBootstrapButtons.fire('Deleted!', 'Your file has been deleted.', 'success');
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    swalWithBootstrapButtons.fire('Cancelled', 'Your file is safe :)', 'error');
                }
            });
    }

   }

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Opportunity List</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <input id='search' type="text" placeholder="Search Opportunity Name" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={searchOpp} onChange={(e) => setSearchOpp(e.target.value)} />
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
                                    records={opps}
                                    idAccessor='_id'
                                    highlightOnHover
                                    striped
                                    withColumnBorders
                                    height={300}   
                                />
                        </div>
                    </div>
                </div>
            
            <div className="flex items-center justify-between flex-wrap gap-4 mt-10">
                <h2 className="text-xl">Customers List</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <input id='search' type="text" placeholder="Search Customer Name" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} />
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
                                    columns={colsCustomer}
                                    records={customers}
                                    idAccessor='_id'
                                    highlightOnHover
                                    striped
                                    withColumnBorders
                                    height={300}  
                                />
                        </div>
                    </div>
                </div>

            {checkIfAdmin()}
            
        </div>
    );
};

export default Archives;
