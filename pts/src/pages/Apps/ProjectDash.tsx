import { useState, Fragment, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'flatpickr/dist/flatpickr.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import { DataTable } from 'mantine-datatable';
import { GetCustomerNameById, GetCustomers } from '../../controllers/customerController';
import { getProjects } from '../../controllers/projectsController';
import { NavLink } from 'react-router-dom';
import { ActionIcon, Button, Checkbox, MultiSelect, SegmentedControl, Stack, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';

const Projects = () => {
    const dispatch = useDispatch();

    const [ allProject, setAllProject ] = useState([])
    const [ initialProject, setInitialProject] = useState([]);
    
    useEffect(() => {
        dispatch(setPageTitle('Projects'));
        fetchInitialProjects();
    }, [dispatch]);

    const fetchInitialProjects = async () => {
        const data = await getProjects()
        setInitialProject(data.projects)
        setAllProject(data.projects)
    }

    const [nameQuery, setNameQuery] = useState('');
    const [noProjectQuery, setNoProjectQuery] = useState('');
    const [debouncedNameQuery] = useDebouncedValue(nameQuery, 200);
    const [debouncedNoProjectQuery] = useDebouncedValue(noProjectQuery, 200);
    const [archiveFilter, setArchiveFilter] = useState('active')

    useEffect(() => {
        setAllProject(
            initialProject.filter((project) => {
                if (archiveFilter === 'active' && project.deleted) return false;
                if (archiveFilter === 'archived' && !project.deleted) return false;

                if (
                    debouncedNameQuery !== '' &&
                    !project.project_name.toLowerCase().includes(debouncedNameQuery.trim().toLowerCase())
                )
                    return false;
    
                if (
                    debouncedNoProjectQuery !== '' &&
                    !project.no_project.toLowerCase().includes(debouncedNoProjectQuery.trim().toLowerCase())
                )
                    return false;

                return true;
            })
        );
    }, [debouncedNameQuery, debouncedNoProjectQuery, initialProject, archiveFilter]);

    const CustomerCell = ({ customer }:any) => {
        const [customerName, setCustomerName] = useState('')
        useEffect(() => {
            const fetchCustomerName = async () => {
                const customerName = await GetCustomerNameById(customer)
                setCustomerName(customerName.customer)
            }
            fetchCustomerName()
        }, [customer])
        return <span>{customerName}</span>
    }

    const FormatDate = (date:any) => {
        const formattedDate = new Date(date);
            return formattedDate.toLocaleDateString('en-UK', {
                year: 'numeric',
                month: 'short',  
                day: '2-digit'   
            })
    }
    
    const colsProject = [
        {
            accessor: 'no_project',
            title: 'Project No.',
            noWrap: true,
            render: (data:any) => (
                <div className={`flex items-center ${data.deleted ? 'text-gray-500' : ''}`}>
                    <span>{data.project_name}</span>
                    {data.deleted && (
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">Archived</span>
                    )}
                </div>
            ),
            filter: (
                <TextInput
                    label="Project No"
                    description="Show projects whose numbers include the specified text"
                    placeholder="Search project numbers..."
                    leftSection={<IconSearch/>}
                    rightSection={
                        <ActionIcon size="sm" variant="transparent" color="gray" onClick={() => setNoProjectQuery('')}>
                            <IconX/>
                        </ActionIcon>
                    }
                    value={noProjectQuery}
                    onChange={(e) => setNoProjectQuery(e.currentTarget.value)}
                />
            ),
            filtering: noProjectQuery !== '',
        },
        {
            accessor: 'project_name',
            title: 'Project Name',
            noWrap:true,
            filter: (
                <TextInput
                    label="Project Name"
                    description="Show projects whose names include the specified text"
                    placeholder="Search project names..."
                    leftSection={<IconSearch/>}
                    rightSection={
                        <ActionIcon size="sm" variant="transparent" color="gray" onClick={() => setNameQuery('')}>
                            <IconX/>
                        </ActionIcon>
                    }
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.currentTarget.value)}
                />
            ),
            filtering: nameQuery !== '',
        },
        {
            accessor: 'customer_name',
            title: "Customer Name",
            render: (data:any) => (<CustomerCell customer={data.customer_name} />)
        },
        {
            accessor: 'start_date',
            title: 'Start',
            render: (data:any) => (<span>{data.start_date?FormatDate(data.start_date):"N/A"}</span>),
        },
        {
            accessor: 'end_date',
            title: 'End',
            render: (data:any) => (<span>{data.start_date?FormatDate(data.end_date):"N/A"}</span>)
        },
        {
            accessor: 'gm',
            title: 'Gross Margin',
            noWrap:true,
            render: (data:any) => (<span>{data.gm}%</span>)
        },
        {
            accessor: 'nilai',
            title: 'Nilai (Rp)',
            render: (data:any) => (<span>{data.nilai.toLocaleString('id-ID')}</span>)
        },
        {
            accessor: 'cost',
            title: 'Cost (Rp)',
            titleAlign: 'right',
            render: (data:any) => (<span className="flex justify-end mt-3">{
                (
                    (data.costs?(data.costs.material_cost?data.costs.material_cost:0) + 
                    (data.costs.manpower_cost?data.costs.manpower_cost:0) + 
                    (data.costs.machine_cost?data.costs.machine_cost:0) + 
                    (data.costs.other_cost?data.costs.other_cost:0):"N/A")
                ).toLocaleString('id-ID')}</span>)
        },
    ]

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Projects List</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <SegmentedControl
                        value={archiveFilter}
                        onChange={setArchiveFilter}
                        data={[
                            { label: 'All Projects', value: 'all' },
                            { label: 'Active', value: 'active' },
                            { label: 'Archived', value: 'archived' },
                        ]}
                        className="mb-4"
                    />
                </div>
            </div>
            <div className="mt-5 panel p-0 border-0 overflow-hidden">
                <div className="table-responsive">
                    <div className='datatables'>
                            <DataTable
                                className="whitespace-nowrap"
                                columns={colsProject}
                                records={allProject}
                                idAccessor='_id'
                                highlightOnHover
                                striped
                                withColumnBorders
                                rowClassName={({ deleted }) => 
                                    deleted ? 'bg-gray-50 text-gray-500 opacity-75' : ''
                                }
                                rowExpansion={{
                                    content: ({ record }) => (
                                        <div className="w-full bg-gray-100 py-2">
                                            <div className="grid grid-cols-8 w-full">
                                                {/* Empty space for alignment */}
                                                <div className="col-span-6"/>
                                                
                                                {/* Cost breakdown section */}
                                                <div className="col-span-2 pr-4">
                                                    {/* Material Cost */}
                                                    <div className="flex justify-between items-center py-1">
                                                        <span className="text-gray-600">Material Cost:</span>
                                                        <span>{record.costs?(record.costs.material_cost || "N/A"): "N/A"}</span>
                                                    </div>

                                                    {/* Machine Cost */}
                                                    <div className="flex justify-between items-center py-1">
                                                        <span className="text-gray-600">Machine Cost:</span>
                                                        <span>{record.costs?(record.costs.machine_cost || "N/A"): "N/A"}</span>
                                                    </div>

                                                    {/* Manpower Cost */}
                                                    <div className="flex justify-between items-center py-1">
                                                        <span className="text-gray-600">Manpower Cost:</span>
                                                        <span>{record.costs?(record.costs.manpower_cost || "N/A"): "N/A"}</span>
                                                    </div>

                                                    {/* Misc Cost */}
                                                    <div className="flex justify-between items-center py-1">
                                                        <span className="text-gray-600">Misc Cost:</span>
                                                        <span>{record.costs?(record.costs.other_cost || 'N/A'): "N/A"}</span>
                                                    </div>

                                                    {/* Button container */}
                                                    <div className="flex justify-end mt-5">
                                                        <button 
                                                            className="btn btn-outline-primary"
                                                            type="button"
                                                            
                                                        >
                                                            <NavLink to={`/projects/${record._id}`}>Detail</NavLink>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                      ),
                                    allowMultiple: true
                                    }
                                }
                            />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;
