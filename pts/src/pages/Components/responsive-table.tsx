import { useState, Fragment, useEffect, useCallback, useMemo } from 'react';
import { DataTable } from 'mantine-datatable';
import { useMediaQuery } from '@mantine/hooks';
import { NavLink } from 'react-router-dom';
import { ActionIcon, TextInput } from '@mantine/core';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import ProjectDescriptionModal from '../Components/project-detail-description-modal';

const ProjectTable = ({ 
  data, 
  columns, 
  sortDirection,
  toggleSort,
  nameQuery,
  setNameQuery,
  noProjectQuery,
  setNoProjectQuery,
  storeColumnsKey
}: any) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const formatDescription = (desc: string) => {
    if (!desc) return 'N/A';
    return desc.length > 100 ? `${desc.slice(0, 100)}...` : desc;
  };

  const FormatDate = (date: any) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString('en-UK', {
      year: 'numeric',
      month: 'short',  
      day: '2-digit'   
    });
  };

  const getMobileColumns = useMemo(() => [
    {
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
      width: '30%',
      filter: (
        <TextInput
          label="Project No"
          description="Show projects whose numbers include the specified text"
          placeholder="Search project numbers..."
          leftSection={<IconSearch />}
          rightSection={
            <ActionIcon size="sm" variant="transparent" color="gray" onClick={() => setNoProjectQuery('')}>
              <IconX />
            </ActionIcon>
          }
          value={noProjectQuery}
          onChange={(e) => setNoProjectQuery(e.currentTarget.value)}
        />
      ),
      filtering: noProjectQuery !== '',
      render: (data: any) => (
        <div className="space-y-1">
          <div className={`flex items-center ${data.deleted ? 'text-gray-500' : ''}`}>
            <span className="font-semibold text-sm">{data.no_project}</span>
            {data.deleted && (
              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                Archived
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {data.start_date ? FormatDate(data.start_date) : "N/A"} - {data.end_date ? FormatDate(data.end_date) : "N/A"}
          </div>
        </div>
      ),
    },
    {
      accessor: 'project_details',
      title: <span className="font-bold text-gray-900">Project Details</span>,
      width: '70%',
      filter: (
        <TextInput
          label="Project Name"
          description="Show projects whose names include the specified text"
          placeholder="Search project names..."
          leftSection={<IconSearch />}
          rightSection={
            <ActionIcon size="sm" variant="transparent" color="gray" onClick={() => setNameQuery('')}>
              <IconX />
            </ActionIcon>
          }
          value={nameQuery}
          onChange={(e) => setNameQuery(e.currentTarget.value)}
        />
      ),
      filtering: nameQuery !== '',
      render: (data: any) => (
        <div className="space-y-2">
          <div>
            <div className="font-medium text-sm">{data.project_name}</div>
            <div className="text-xs text-gray-500">{data.customer_name.name}</div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs badge ${getProjectStatusColor(data.project_status)} px-2 py-0.5`}>
              {data.project_status ?? 'N/A'}
            </span>
            <span className="text-xs font-medium">
              GM: {data.gm}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Nilai: Rp {data.nilai.toLocaleString('id-ID')}</span>
            <span>Cost: Rp {getTotalCost(data.costs)}</span>
          </div>
        </div>
      ),
    },
  ], [sortDirection, nameQuery, noProjectQuery]);

  const getTotalCost = useCallback((costs: any) => {
    if (!costs) return 'N/A';
    const total = (costs.material_cost || 0) + 
                 (costs.manpower_cost || 0) + 
                 (costs.machine_cost || 0) + 
                 (costs.other_cost || 0);
    return total.toLocaleString('id-ID');
  }, []);

  const getProjectStatusColor = useCallback((status: string) => {
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
  }, []);

  const rowExpansion = useMemo(() => ({
    content: ({ record }: any) => (
      <div className="w-full bg-gray-100 py-2">
        <div className="grid grid-cols-1 md:grid-cols-9 w-full gap-4 px-4">
          <div className="md:col-span-2">
            <span className="text-sm font-medium text-gray-600">Description:</span>
            <div>
              <span className="text-sm">{formatDescription(record.desc)}</span>
              {record.desc ? <ProjectDescriptionModal description={record.desc} /> : ''}
            </div>
          </div>
          
          <div className="md:col-span-5" />
          
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Material Cost:</span>
              <span className="text-sm font-bold">
                {record.costs ? (record.costs.material_cost || "N/A").toLocaleString('id-ID') : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Machine Cost:</span>
              <span className="text-sm font-bold">
                {record.costs ? (record.costs.machine_cost || "N/A").toLocaleString('id-ID') : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Manpower Cost:</span>
              <span className="text-sm font-bold">
                {record.costs ? (record.costs.manpower_cost || "N/A").toLocaleString('id-ID') : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Misc Cost:</span>
              <span className="text-sm font-bold">
                {record.costs ? (record.costs.other_cost || 'N/A').toLocaleString('id-ID') : "N/A"}
              </span>
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
  }), [formatDescription]);

  return (
    <DataTable
      className="whitespace"
      columns={isMobile ? getMobileColumns : columns}
      records={data}
      idAccessor="_id"
      storeColumnsKey={isMobile ? null : storeColumnsKey}
      highlightOnHover
      striped
      height="84vh"
      withColumnBorders
      rowClassName={({ deleted }: any) => 
        deleted ? 'bg-gray-50 text-gray-500 opacity-75' : ''
      }
      rowExpansion={rowExpansion}
    />
  );
};

export default ProjectTable;