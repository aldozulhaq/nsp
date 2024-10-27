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
import { EditCustomer, GetCustomerNameById, GetCustomers, PostCustomer, delCustomer, softDelCustomer } from '../../controllers/customerController';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import Tippy from '@tippyjs/react';
import { DataTable } from 'mantine-datatable';
import IconArchive from '../../components/Icon/IconArchive';


const CustomerTable = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Customers'));
    });
    const [addContactModal, setAddContactModal] = useState<any>(false);

    const [defaultParams] = useState({
        _id: null,
        name: '',
        desc: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const [search, setSearch] = useState<any>('');

    const { customers, setCustomers } = useContext(CustomerContext)
    const [ allCustomers, setAllCustomers] = useState([])
    
    const initialFetchCusts = async () => {
        const data = await GetCustomers()
        setCustomers(data.costumers)
        setAllCustomers(data.costumers)
    }    

    useEffect(() => {
        initialFetchCusts()
    }, []);

    const fetchCustsLocal = () => {
        const filteredCusts = allCustomers
                .filter((item:any) => {
                    return item.name.toLowerCase().includes(search.toLowerCase())
                })
                setCustomers(filteredCusts)
    }

    useEffect(() => {
        fetchCustsLocal()
    }, [search, allCustomers]);

    const cols = [
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
                    <Tippy trigger="mouseenter focus" content="Edit" theme='warning'>
                        <button type="button" className="btn btn-warning rounded-full w-8 h-8 p-0" onClick={() => editUser(customer)}>
                            <IconPencil/>
                        </button>
                    </Tippy>
                    <Tippy trigger="mouseenter focus" content="Archive" theme='secondary'>
                        <button type="button" className="btn btn-secondary rounded-full w-8 h-8 p-0" 
                        onClick={() => showAlert(11, customer._id)}
                        >
                            <IconArchive/>
                        </button>
                    </Tippy>
                </div>
            )
        }
    ]

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const saveUser = async () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return true;
        }
        if (params._id)
        {
            try{
                const data = EditCustomer(params._id,
                    params.name,
                    params.desc,)
            } catch(error) {
                showMessage("error:" + error)
            }
        }
        else {
            try{
                const data = PostCustomer(params.name,
                    params.desc,)
            } catch(error) {
                showMessage("error:" + error)
            }
        }

        showMessage('Customer has been saved successfully.')
        setAddContactModal(false)
        initialFetchCusts()
    };

    const editUser = (user: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1)
        } else {

        }
        setAddContactModal(true);
    };

    const deleteUser = async (_id: any) => {
        try {
            const data = await softDelCustomer(_id)
            initialFetchCusts() 
            showMessage('Customer has been archived successfully.');
        } catch (error) {
            showMessage('Error' + error)
        }
    };

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
                   text: "You won't be able to revert this!",
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
                       swalWithBootstrapButtons.fire('Archived!', 'Your file has been archived.', 'success');
                   } else if (result.dismiss === Swal.DismissReason.cancel) {
                       swalWithBootstrapButtons.fire('Cancelled', 'Your file is safe :)', 'error');
                   }
               });
       }
   }

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Customers List</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => {editUser(); setParams({...params, ["_id"]:null})}}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Customer
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input id='search' type="text" placeholder="Search Customer Name" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
                <div className="mt-5 flex justify-center p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <div className='datatables'>
                                <DataTable
                                    className="whitespace-nowrap"
                                    columns={cols}
                                    records={customers}
                                    idAccessor='_id'
                                    highlightOnHover
                                    striped
                                    withBorder
                                    withColumnBorders
                                />
                        </div>
                    </div>
                </div>

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
                                        {params._id ? 'Edit Customer - ' + params.name : 'Add Customer'}
                                    </div>
                                    <div className="p-5">
                                        <form id='customer' name='customer modal'>
                                            <div className="mb-5">
                                                <label>Customer Name</label>
                                                <input id='name' type="text" placeholder="Enter Name" className="form-input" defaultValue={params._id?params.name:''} onChange={(e) => {changeValue(e)}}/>
                                            </div>
                                            <div className="mb-5">
                                                <label>Keterangan</label>
                                                <textarea
                                                    id='desc'
                                                    placeholder="Enter Keterangan"
                                                    className="form-textarea resize-none min-h-[130px]"
                                                    defaultValue={params._id?params.desc:""}
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
        </div>
    );
};

export default CustomerTable;
