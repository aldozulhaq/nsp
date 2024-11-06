import { useState, Fragment, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'flatpickr/dist/flatpickr.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import { DataTable, DataTableSortStatus, useDataTableColumns } from 'mantine-datatable';
import { GetCustomerNameById, GetCustomers } from '../../controllers/customerController';
import { getProjects } from '../../controllers/projectsController';
import { NavLink } from 'react-router-dom';
import { ActionIcon, Button, Checkbox, MultiSelect, SegmentedControl, Stack, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import ProjectDescriptionModal from '../Components/project-detail-description-modal';

interface Project {
    _id:string;
    no_project: string;
    start_date: string;
    end_date: string;
    project_name: string,
    nilai: number
    deleted: boolean
    costs: ProjectCosts
    desc: string
    project_status: string
}

interface Manpower {
    name: string;
}
  
interface Machine {
    name: string;
}

interface Material {
    name: string;
}

interface ProjectCosts {
    material_list: {
      material: Material;
      amount: number;
    }[];
    manpower_list: {
      manpower: Manpower;
      amount: number;
    }[];
    machine_list: {
      machine: Machine;
      amount: number;
    }[];
    material_cost: number;
    manpower_cost: number;
    machine_cost: number;
    other_description: {
        description: String,
        cost: number,
        amount: number,
    }[];
    other_cost: number
  }

const Projects = () => {
    const dispatch = useDispatch();

    const [initialProject, setInitialProject] = useState<Project[]>([]);
    const [allProject, setAllProject] = useState<Project[]>([]);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    
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

    const toggleSort = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    useEffect(() => {
        const filteredProjects = initialProject.filter((project) => {
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
        });

        const sortedData = [...filteredProjects].sort((a, b) => {
            const comparison = a.no_project.localeCompare(b.no_project);
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        setAllProject(sortedData);
    }, [debouncedNameQuery, debouncedNoProjectQuery, initialProject, archiveFilter, sortDirection]);

    const CustomerCell = ({ customer }:any) => {
        const [customerName, setCustomerName] = useState('')
        useEffect(() => {
            const fetchCustomerName = async () => {
                const customerName = await GetCustomerNameById(customer)
                setCustomerName(customerName.customer)
            }
            fetchCustomerName()
        }, [customer])
        return <span  className="text-sm font-medium">{customerName}</span>
    }

    const FormatDate = (date:any) => {
        const formattedDate = new Date(date);
            return formattedDate.toLocaleDateString('en-UK', {
                year: 'numeric',
                month: 'short',  
                day: '2-digit'   
            })
    }

    const getProjectStatusColor = (status: string) => {
        switch (status) {
          case 'preparation':
            return 'bg-blue-500';
          case 'ongoing':
            return 'bg-green-500';
          case 'BASTP':
            return 'bg-yellow-500';
          case 'Invoice':
            return 'bg-orange-500';
          case 'Closing':
            return 'bg-red-500';
          default:
            return 'bg-gray-500';
        }
    };

    
    const formatDescription = (desc: string) => {
        if (!desc) return 'N/A';
        return desc.length > 100 ? `${desc.slice(0, 100)}...` : desc;
      };

    const storeKey = 'project-table-columns';
    
    const { effectiveColumns, resetColumnsWidth } = useDataTableColumns<Project>({
        key: storeKey,
        columns: [{
            accessor: 'no_project',
            title: (
                <div className="flex items-center gap-2 font-bold text-gray-900">                    
                    <button 
                        onClick={toggleSort}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        {sortDirection === 'asc' ? (
                            <>↑</>
                        ) : (
                            <>↓</>
                        )}
                    </button>
                    <span className='font-bold'>Project No.</span>
                </div>
            ),
            render: (data:any) => (
                <div className={`flex items-center ${data.deleted ? 'text-gray-500' : ''}`}>
                    <span className="font-semibold text-base">{data.no_project}</span>
                    {data.deleted && (
                        <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">Archived</span>
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
            resizable: true,
            width: 150
        },
        {
            accessor: 'project_name',
            title: <span className="font-bold text-gray-900">Project Name</span>,
            width: 300,
            render: (data:any) => (
                <span className="font-bold text-base">{data.project_name}</span>
            ),
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
            resizable: true,
            filtering: nameQuery !== ''
        },
        {
            accessor: 'customer_name',
            title: <span className="font-bold text-gray-900">Customer</span>,
            resizable: true,
            render: (data:any) => (<CustomerCell customer={data.customer_name} />),
            width: 150
        },
        {
            accessor: 'start_date',
            title: <span className="font-bold text-gray-900">Start</span>,
            resizable: true,
            render: (data:any) => (<span className="text-sm">{data.start_date?FormatDate(data.start_date):"N/A"}</span>),
        },
        {
            accessor: 'end_date',
            title: <span className="font-bold text-gray-900">End</span>,
            resizable: true,
            render: (data:any) => (<span className="text-sm">{data.start_date?FormatDate(data.end_date):"N/A"}</span>)
        },
        {
            accessor: 'project_status',
            title: <span className="font-bold text-gray-900">Status</span>,
            width: 100,
            resizable: true,
            render: (data:any) => (
                <span className={`badge ${getProjectStatusColor(data.project_status)} font-medium px-2 py-1`}>
                    {data.project_status ?? 'N/A'}
                </span>
            )
        },
        {
            accessor: 'gm',
            title: <span className="font-bold text-gray-900">GM</span>,
            noWrap:true,
            resizable: true,
            render: (data:any) => (<span className="text-sm font-medium">{data.gm}%</span>)
        },
        {
            accessor: 'nilai',
            title: <span className="font-bold text-gray-900">Nilai (Rp)</span>,
            resizable: true,
            render: (data:any) => (<span className="text-sm font-bold">{data.nilai.toLocaleString('id-ID')}</span>)
        },
        {
            accessor: 'cost',
            title: <span className="font-bold text-gray-900">Cost (Rp)</span>,
            textAlign: 'right',
            resizable: true,
            render: (data:any) => (
                <span className="flex justify-end mt-3 text-sm font-bold">{
                    (
                        (data.costs?(data.costs.material_cost?data.costs.material_cost:0) + 
                        (data.costs.manpower_cost?data.costs.manpower_cost:0) + 
                        (data.costs.machine_cost?data.costs.machine_cost:0) + 
                        (data.costs.other_cost?data.costs.other_cost:0):"N/A")
                    ).toLocaleString('id-ID')}
                </span>
            )
        }]
    });

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Projects List</h2>
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
                    <Button className="mb-4" onClick={resetColumnsWidth} size="sm">Reset Columns</Button>
                </div>
            </div>
            <div className="mt-5 panel p-0 border-0 overflow-hidden">
                <div className="table-responsive">
                    <div className="datatables">
                        <DataTable
                            className="whitespace"
                            columns={effectiveColumns}
                            records={allProject}
                            idAccessor="_id"
                            highlightOnHover
                            striped
                            height={800}
                            withColumnBorders
                            storeColumnsKey={storeKey}
                            rowClassName={({ deleted }) => 
                                deleted ? 'bg-gray-50 text-gray-500 opacity-75' : ''
                            }
                            rowExpansion={{
                                content: ({ record }) => (
                                    <div className="w-full bg-gray-100 py-2">
                                        <div className="grid grid-cols-9 w-full">
                                            <span className="text-sm font-medium text-gray-600">Desc:</span>
                                            <div>
                                                <span className="text-sm">{formatDescription(record.desc)}</span>
                                                {record.desc ? <ProjectDescriptionModal description={record.desc} /> : ''}
                                            </div>
                                            <div className="col-span-5"/>
                                            
                                            <div className="col-span-2 pr-4">
                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-sm font-medium text-gray-600">Material Cost:</span>
                                                    <span className="text-sm font-bold">{record.costs?(record.costs.material_cost || "N/A").toLocaleString('id-ID'): "N/A"}</span>
                                                </div>

                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-sm font-medium text-gray-600">Machine Cost:</span>
                                                    <span className="text-sm font-bold">{record.costs?(record.costs.machine_cost || "N/A").toLocaleString('id-ID'): "N/A"}</span>
                                                </div>

                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-sm font-medium text-gray-600">Manpower Cost:</span>
                                                    <span className="text-sm font-bold">{record.costs?(record.costs.manpower_cost || "N/A").toLocaleString('id-ID'): "N/A"}</span>
                                                </div>

                                                <div className="flex justify-between items-center py-1">
                                                    <span className="text-sm font-medium text-gray-600">Misc Cost:</span>
                                                    <span className="text-sm font-bold">{record.costs?(record.costs.other_cost || 'N/A').toLocaleString('id-ID'): "N/A"}</span>
                                                </div>

                                                <div className="flex justify-end mt-5">
                                                    <button 
                                                        className="btn btn-outline-primary text-sm font-medium"
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
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;