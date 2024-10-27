import { useEffect, useState, Fragment } from "react"
import Tippy from "@tippyjs/react"
import 'tippy.js/dist/tippy.css';
import { Dialog, Transition } from '@headlessui/react';


const Opp = ({ opp, allCustomers, allSics }:any) => {
    const [modal2, setModal2] = useState(false);
    
    const [formattedCreatedAt, setFormattedCreatedAt] = useState<any>()
    const [formattedClosingDate, setFormattedClosingDate] = useState<any>()
    const [formattedNTP, setFormattedNTP] = useState<any>()

    const getCustomerNameById = (id:any) => {
        const customer = allCustomers.find((customer:any) => customer.value === id);
        return customer ? customer.label : 'Unknown Customer';
    };

    const getSicNameById = (id:any) => {
        const sic = allSics.find((sic:any) => sic.value === id);
        return sic ? sic.label : 'Unknown SIC';
    };

    useEffect(() => {
        
        // Format createdAt and closing_date
        const formattedCreatedAt = new Date(opp.createdAt).toLocaleDateString('en-UK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        setFormattedCreatedAt(formattedCreatedAt);

        const formattedClosingDate = new Date(opp.closing_date).toLocaleDateString('en-UK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        setFormattedClosingDate(formattedClosingDate);

        const formattedNTP = new Date(opp.ntp).toLocaleDateString('en-UK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        setFormattedNTP(formattedNTP);

    }, [opp.customer_name, opp.createdAt, opp.closing_date, opp.sic]);

    const closeDeadlineCheck = () => {
        const deadline = new Date(opp.closing_date)
        const dateNow = new Date()
        let classe = ''
        const dateDiff = dateDiffInDays(deadline, dateNow)
        if(opp.opp_status === 'Offer in progress')
            {
                if(dateDiff <= 0 && dateDiff >= -5)
                    classe = "bg-success text-white"
                else if(dateDiff >= 0)
                    classe = "bg-red-600 text-white"
                // if(dateNow <= deadline)
                //     if(dateDiff <= 7)
                //         classe = "bg-red-600 text-white"
                // else
                //     classe = "bg-orange-400 text-white"
            }
        else
            classe = "text-center"
        return classe
    }

    function dateDiffInDays(a:Date, b:Date) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
      
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    const terlambatCheck = () => {
        let classe
        if(opp.opp_status === 'Offer in progress')
            {
                if(dateDiffInDays(new Date(opp.closing_date), new Date()) < 0)
                    {
                        classe = (<Tippy trigger="mouseenter focus" content={dateDiffInDays(new Date(opp.closing_date), new Date()) + " hari sampai deadline"}>
                                    <button type="button" data-trigger="mouseenter">
                                    {opp.closing_date?formattedClosingDate:''}
                                    </button>
                        </Tippy>)
                    }
                else
                {
                    classe = (<Tippy trigger="mouseenter focus" content={"Terlambat " + dateDiffInDays(new Date(opp.closing_date), new Date()) + " hari"}>
                                    <button type="button" data-trigger="mouseenter">
                                    {opp.closing_date?formattedClosingDate:''}
                                    </button>
                        </Tippy>)
                }
            }
        else
            classe = opp.closing_date?formattedClosingDate:''
        
    return classe
    }
    
    return <>
                        {/* <td className="text-center">{opp.no}</td> */}
                        <td>{formattedCreatedAt}</td>
                        <td className="text-nowrap text-center">
                            <p>{opp.no_opportunity}</p>
                            <p className="text-xs">{opp.no_proposal}</p>
                        </td>
                        <td>{getCustomerNameById(opp.customer_name)}</td>
                        <td className="text-wrap text-pretty font-medium">{opp.opportunity_name}</td>
                        <td className="text-center">
                            {getSicNameById(opp.sic)}
                        </td>
                        
                        <td className={closeDeadlineCheck()}>
                            {terlambatCheck()}
                            {/* <Tippy trigger="mouseenter focus" content={terlambatCheck()}>
                                    <button type="button" data-trigger="mouseenter">
                                    {opp.closing_date?formattedClosingDate:''}
                                    </button>
                            </Tippy> */}
                        </td>
                        {/* <td className="text-nowrap text-center">{opp.no_proposal}</td> */}
                        <td className="text-center">{opp.firm_budgetary}</td>
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
                        <td>{//opp.keterangan
                        opp.keterangan?
                        opp.keterangan.length >= 50?(
                            <div>
                                <span>{opp.keterangan.substring(0,50) + " "}</span>
                                <button type="button" className="text-sky-500 after:content-['_↗']" onClick={() => setModal2(true)}>
                                detail
                                </button>
                            </div>):
                            opp.keterangan
                        :""}
                        </td>
                        <td>{opp.nilai?new Intl.NumberFormat('id-ID').format(opp.nilai):null}</td>{/*nilai*/}
                        <td className="text-center">{opp.gm?opp.gm + "%":""}</td>
                        <td className="text-center">{opp.probability?opp.probability + "%":""}</td>{/*probability*/}
                        <td>{opp.ntp?formattedNTP:''}</td>{/* ntp */}

                        <Transition appear show={modal2} as={Fragment}>
                            <Dialog as="div" open={modal2} onClose={() => setModal2(false)}>
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="fixed inset-0" />
                                </Transition.Child>
                                <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                                    <div className="flex items-center justify-center min-h-screen px-4">
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                                    <h5 className="font-bold text-lg"> {opp.opportunity_name} </h5>
                                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal2(false)}>
                                                    </button>
                                                </div>
                                                <div className="px-5 py-1 text-sm bg-[#121c2c]">
                                                    <p className="flex justify-start text-[#fbfbfb]">
                                                    {getCustomerNameById(opp.customer_name)} | {getSicNameById(opp.sic)} | {opp.no_proposal}
                                                    </p>
                                                </div>
                                                <div className="p-5">
                                                    <p>
                                                        {opp.keterangan}
                                                    </p>
                                                    <div className="flex justify-end items-center mt-8">
                                                        <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => setModal2(false)}>
                                                            Close
                                                        </button>
                                                    </div>
                                                </div>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
    </>
}

export default Opp