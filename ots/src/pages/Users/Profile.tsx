import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import Dropdown from '../../components/Dropdown';
import { setPageTitle } from '../../store/themeConfigSlice';
import { Fragment, useContext, useEffect, useState } from 'react';
import IconPencilPaper from '../../components/Icon/IconPencilPaper';
import IconCoffee from '../../components/Icon/IconCoffee';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconMapPin from '../../components/Icon/IconMapPin';
import IconMail from '../../components/Icon/IconMail';
import IconPhone from '../../components/Icon/IconPhone';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconDribbble from '../../components/Icon/IconDribbble';
import IconGithub from '../../components/Icon/IconGithub';
import IconShoppingBag from '../../components/Icon/IconShoppingBag';
import IconTag from '../../components/Icon/IconTag';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconClock from '../../components/Icon/IconClock';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import { ChangePassword, GetSicByEmail } from '../../controllers/usersController';
import { UserContext } from '../../contexts/UserContext';
import IconBolt from '../../components/Icon/IconBolt';
import IconWheel from '../../components/Icon/IconWheel';
import { OppContext } from '../../contexts/oppContext';
import { getOpps } from '../../controllers/oppsController';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import Swal from 'sweetalert2';

const Profile = () => {
    const { opps, setOpps } = useContext(OppContext) 
    const { user, setUser } = useContext(UserContext)
    
    const [ sic, setSic ] = useState<any>('')
    
    const [ addContactModal, setAddContactModal ] = useState(false)

    const [ pw1, setPw1 ] = useState('')
    const [ pw2, setPw2 ] = useState('')

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Profile'));
    });

    const fetchSIC = async () => {
        try{
            const data = await GetSicByEmail(user.email)
            setSic(data)
        } catch(err)
        {
            console.error('Error fetching sic:', err);
        }
    }

    const fetchOpps = async () => {
        const data = await getOpps()
            
            const filteredOpps = data.opps.filter((item:any) => {
                return item.sic.includes(sic._id)
            })

            setOpps(filteredOpps.slice(0,7))
    }

    useEffect(() => {
        fetchSIC()
        fetchOpps()
    }, [opps, sic])

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const handleChangePassword = async (e:any) => {
        e.preventDefault()

        if(pw1 !== pw2)
            {
                showMessage("Password is not the same", "warning")
            }
        
        try{
            await ChangePassword(sic._id, pw1, pw2)
            showMessage("Password succesfully changed")
            setAddContactModal(false)
        } catch(err) {
            showMessage("" + err, "warning")
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

    return (
        <div>
            <div className="pt-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
                    <div className="panel">
                        <div className="flex items-center justify-between mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Profile</h5>
                        </div>
                        <div className="mb-5">
                            <div className="flex flex-col justify-center items-center">
                                <img src="/assets/images/user-profile.jpg" alt="img" className="w-24 h-24 rounded-full object-cover  mb-5" />
                                <p className="font-semibold text-primary text-xl">{sic.name}</p>
                            </div>
                            <ul className="mt-5 flex flex-col max-w-[160px] m-auto space-y-4 font-semibold text-white-dark">
                                <li className="flex items-center gap-2">
                                    <IconCoffee className="shrink-0" />
                                    {user.role}
                                </li>
                                {/* <li className="flex items-center gap-2">
                                    <IconCalendar className="shrink-0" />
                                    Jan 20, 1989
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconMapPin className="shrink-0" />
                                    New York, USA
                                </li> */}
                                <li>
                                    <button className="flex items-center gap-2">
                                        <IconMail className="w-5 h-5 shrink-0" />
                                        <span className="text-primary truncate">{user.email}</span>
                                    </button>
                                </li>
                                {/* <li className="flex items-center gap-2">
                                    <IconPhone />
                                    <span className="whitespace-nowrap" dir="ltr">
                                        +1 (530) 555-12121
                                    </span>
                                </li> */}
                            </ul>
                            <ul className="mt-7 flex items-center justify-center gap-2">
                                <li className='items-center flex'>
                                    <button className="btn btn-secondary flex items-center justify-center rounded-full w-10 h-10 p-0" onClick={() => setAddContactModal(true)}>
                                        <IconWheel className="w-5 h-5" />
                                    </button>
                                </li>
                                    <span className='font-semibold'> Change password </span>
                                {/* <li>
                                    <button className="btn btn-danger flex items-center justify-center rounded-full w-10 h-10 p-0">
                                        <IconDribbble />
                                    </button>
                                </li>
                                <li>
                                    <button className="btn btn-dark flex items-center justify-center rounded-full w-10 h-10 p-0">
                                        <IconGithub />
                                    </button>
                                </li> */}
                            </ul>
                        </div>
                    </div>
                    <div className="panel lg:col-span-2 xl:col-span-3">
                        <div className="mb-5">
                            <h5 className="font-semibold text-lg dark:text-white-light">Task</h5>
                        </div>
                        <div className="mb-5">
                            <div className="table-responsive text-[#515365] dark:text-white-light font-semibold">
                                <table className="whitespace-nowrap">
                                    <thead>
                                        <tr>
                                            <th>Opportunity Name</th>
                                            <th>Closing Date</th>
                                            <th>Opportunity Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="dark:text-white-dark">
                                    { opps && opps.map((opp) => <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 break-words" key={opp._id}>
                                        <td className='text-xs'> {opp.opportunity_name} </td>
                                        <td>
                                        {new Date(opp.closing_date).toLocaleDateString('en-UK', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                        </td>
                                        <td className="uppercase">
                                            <span
                                                className={`badge whitespace-nowrap ${
                                                    opp.opp_status === 'Identified'
                                                        ? 'bg-primary'
                                                        : opp.opp_status === 'Offer in progress'
                                                        ? 'bg-secondary'
                                                        : opp.opp_status === 'Offer Submitted'
                                                        ? 'bg-warning'
                                                        : opp.opp_status === 'Decline'
                                                        ? 'bg-danger'
                                                        : opp.opp_status === 'Lost'
                                                        ? 'bg-dark'
                                                        : opp.opp_status === 'Won'
                                                        ? 'bg-success'
                                                        : opp.opp_status === 'Customer did not pursue'
                                                        ? 'bg-dark'
                                                        : null
                                                }`}
                                            >
                                                {opp.opp_status}
                                            </span>
                                        </td>
                                    </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
                                        {"Change Password for " + sic.name}
                                    </div>
                                    <div className="p-5">
                                        <form id='change_password' name='change password modal' onSubmit={handleChangePassword}>
                                            <div className="mb-5">
                                                <label>Password</label>
                                                <input id='pw1' type="password" placeholder="Enter Password" className="form-input" required onChange={(e) => {setPw1(e.target.value)}}/>
                                            </div>
                                            <div className="mb-5">
                                                <label>Repeat Password</label>
                                                <input id='pw2' type="password" placeholder="Repeat Password" className="form-input" required onChange={(e) => {setPw2(e.target.value)}}/>
                                            </div>                                     
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    Confirm
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

export default Profile;
