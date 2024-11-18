import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconSend from '../../components/Icon/IconSend';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconDownload from '../../components/Icon/IconDownload';
import IconEdit from '../../components/Icon/IconEdit';
import IconPlus from '../../components/Icon/IconPlus';
import { archiveProject, getProjectDetail, restoreProject } from '../../controllers/projectsController';
import IconTrash from '../../components/Icon/IconTrash';
import Swal from 'sweetalert2';
import IconX from '../../components/Icon/IconX';
import ProjectDescriptionModal from '../Components/project-detail-description-modal';
import { SegmentedControl } from '@mantine/core';

interface Material {
    name: string;
  }
  

  interface GrossMarginIndicatorProps {
    nilai: number;
    totalCost: number;
  }

  interface Manpower {
    name: string;
  }
  
  interface Machine {
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

  interface CustomerDetails {
    name: string;
    desc: string
  }
  
  interface Project {
    _id:string;
    no_project: string;
    start_date: string;
    end_date: string;
    costs: ProjectCosts;
    master_costs: ProjectCosts;
    customer_name: CustomerDetails,
    project_name: string,
    nilai: number
    gm: number
    deleted: boolean
    desc: string
    project_status: string
  }
  
  interface TableItem {
    name: string;
    amount: number;
    unit_cost: number;
  }
  
  interface CostTableProps {
    title: string;
    data: any[];
    getItemName: (item: any) => string;
    getItemRate: (item: any) => number;
    getItemAmount: (item: any) => number;
    getItemCost: (item: any) => number;
  }

  const CostRatioIndicator: React.FC<{ nilai: number; totalCost: number }> = ({ nilai, totalCost }) => {
    const ratio = nilai ? (totalCost / nilai) * 100 : 0;
    
    const getColorClass = (percentage: number) => {
      if (percentage >= 90) return 'bg-red-500';
      if (percentage >= 75) return 'bg-orange-500';
      if (percentage >= 60) return 'bg-yellow-500';
      return 'bg-green-500';
    };
  
    return (
      <div className="mb-4 space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Cost to Nilai Ratio: {ratio.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${getColorClass(ratio)}`} 
            style={{ width: `${Math.min(ratio, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  const CostTable: React.FC<CostTableProps> = ({ title, data = [], getItemName, getItemRate, getItemAmount, getItemCost }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    if (!data || data.length === 0) {
      return (
        <div className="mt-6">
          <div className="text-xl font-bold uppercase mb-4">{title}</div>
          <div className="p-4 text-center text-gray-500">No data available</div>
        </div>
      );
    }
  
    return (
      <div className="mt-6">
        <div 
          className={`
            flex items-center justify-between 
            cursor-pointer bg-gray-50 dark:bg-gray-700 
            p-4 rounded-t-lg
            transition-all duration-200
            hover:bg-gray-100 dark:hover:bg-gray-600
            ${!isExpanded && 'rounded-b-lg'}
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold uppercase">{title}</div>
            <div className="text-sm text-gray-500">
              ({data.length} items)
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 mr-2">
              {isExpanded ? 'Click to collapse' : 'Click to expand'}
            </span>
            <div className="transform transition-transform duration-200">
              {isExpanded ? (
                <>↑</>
              ) : (
                <>↓</>
              )}
            </div>
          </div>
        </div>
        
        <div className={`
          transform transition-all duration-300 origin-top
          overflow-hidden
          ${isExpanded ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 h-0'}
        `}>
          <div className="table-responsive">
            <table className="table-striped w-full">
              <thead>
                <tr className="text-sm font-semibold">
                  <th className="w-16">No</th>
                  <th className="w-1/2">Name</th>
                  <th className="w-1/6">Rate</th>
                  <th className="w-1/6 text-right">Quantity</th>
                  <th className="w-1/6 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td>{index + 1}</td>
                    <td className="font-medium">{getItemName(item)}</td>
                    <td className="">{getItemRate(item).toLocaleString('id-ID')}</td>
                    <td className="text-right">{getItemAmount(item)}</td>
                    <td className="text-right font-semibold">
                      {getItemCost(item).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  const CostSummary = ({ costs, type }:any) => {
    const costItems = [
      { label: 'Total Material Cost', value: costs?.material_cost ?? 0 },
      { label: 'Total Manpower Cost', value: costs?.manpower_cost ?? 0 },
      { label: 'Total Machine Cost', value: costs?.machine_cost ?? 0 },
      { label: 'Total Misc Cost', value: costs?.other_cost ?? 0 }
    ];
  
    const totalCost = costItems.reduce((sum, item) => sum + item.value, 0);
  
    return (
      <div className="ltr:text-right rtl:text-left space-y-2 bg-gray-50 p-4 rounded-lg mt-6">
        {type && (
          <div className="text-lg font-bold text-blue-600 mb-4">
            {type === 'Master'? 'As Sold' : type} Costs Summary
          </div>
        )}
        {costItems.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div className="flex-1">{item.label}</div>
            <div className="w-[37%] font-medium">{item.value.toLocaleString('id-ID')}</div>
          </div>
        ))}
        <div className="flex items-center text-lg font-bold pt-2 border-t">
          <div className="flex-1">Total Cost</div>
          <div className="w-[37%]">{totalCost.toLocaleString('id-ID')}</div>
        </div>
      </div>
    );
  };

  const GrossMarginIndicator: React.FC<GrossMarginIndicatorProps> = ({ nilai, totalCost }) => {
    const grossMargin = nilai - totalCost;
    const grossMarginPercentage = nilai ? (grossMargin / nilai) * 100 : 0;
    
    const getColorClass = (percentage: number): string => {
      if (percentage <= 10) return 'bg-red-500';
      if (percentage <= 20) return 'bg-orange-500';
      if (percentage <= 30) return 'bg-yellow-500';
      return 'bg-green-500';
    };
  
    return (
      <div className="mb-4 space-y-4">
        {/* Gross Margin in Rupiah */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Gross Margin (Rp)</span>
            <span>{grossMargin.toLocaleString('id-ID')}</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${getColorClass(grossMarginPercentage)}`} 
              style={{ width: `${Math.max(0, Math.min(grossMargin / nilai * 100, 100))}%` }}
            ></div>
          </div>
        </div>
  
        {/* Gross Margin Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Gross Margin (%)</span>
            <span>{(grossMarginPercentage).toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${getColorClass(grossMarginPercentage)}`} 
              style={{ width: `${Math.max(0, Math.min(grossMarginPercentage, 100))}%` }}
            ></div>
          </div>
        </div>
  
        {/* Warning Message */}
        {grossMargin < 0 && (
          <div className="text-xs text-red-500 font-medium">
            Warning: Project is operating at a loss!
          </div>
        )}
      </div>
    );
  };

  const ComparisonSummary = ({ masterCosts, actualCosts, nilai }:any) => {
    const getTotalCost = (costs:any) => {
      return (
        (costs?.material_cost ?? 0) +
        (costs?.manpower_cost ?? 0) +
        (costs?.machine_cost ?? 0) +
        (costs?.other_cost ?? 0)
      );
    };
  
    const masterTotal = getTotalCost(masterCosts);
    const actualTotal = getTotalCost(actualCosts);
    const difference = actualTotal - masterTotal;
    const percentageDiff = ((difference / masterTotal) * 100).toFixed(1);
  
    const masterGrossMargin = nilai - masterTotal;
    const actualGrossMargin = nilai - actualTotal;
    const masterGrossMarginPercentage = ((masterGrossMargin / nilai) * 100).toFixed(1);
    const actualGrossMarginPercentage = ((actualGrossMargin / nilai) * 100).toFixed(1);
  
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mt-6">
        <h3 className="text-xl font-bold mb-4">Cost Comparison Summary</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">As Sold Total</div>
            <div className="text-lg font-bold">{masterTotal.toLocaleString('id-ID')}</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Actual Total</div>
            <div className="text-lg font-bold">{actualTotal.toLocaleString('id-ID')}</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Difference</div>
            <div className={`text-lg font-bold ${difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {difference.toLocaleString('id-ID')} ({difference > 0 ? '+' : ''}{percentageDiff}%)
            </div>
          </div>
        </div>
  
        {/* <h3 className="text-xl font-bold mb-4">Gross Margin Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">Master Gross Margin</div>
            <div className="text-lg font-bold">{masterGrossMargin.toLocaleString('id-ID')}</div>
            <div className="text-sm font-medium">{masterGrossMarginPercentage}%</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">Actual Gross Margin</div>
            <div className="text-lg font-bold">{actualGrossMargin.toLocaleString('id-ID')}</div>
            <div className="text-sm font-medium">{actualGrossMarginPercentage}%</div>
          </div>
        </div> */}
      </div>
    );
  };
  
  const ProjectDetail = () => {

    const baseSegmentStyle = "px-4 py-2 text-sm font-medium transition-colors duration-200";
    const activeSegmentStyle = "bg-blue-500 text-white rounded shadow-sm";
    const inactiveSegmentStyle = "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700";

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [view, setView] = useState('actual');

    const [userCanSeeMaster, setUserCanSeeMaster] = useState<boolean>(false);

    const checkUser = () => {
      const uRole = localStorage.getItem("role")
      if (uRole?.toLowerCase().includes("mod") || uRole === "dev") {
        setUserCanSeeMaster(true)
      }
    }
  
    useEffect(() => {
      dispatch(setPageTitle('Project Detail'));
      checkUser();
    });
  
    useEffect(() => {
      const fetchProject = async () => {
        try {
          const response = await getProjectDetail(id);
          setProject(response.project);
        } catch (error) {
          console.error('Error fetching project details:', error);
        }
      };
  
      fetchProject();
    }, [id]);
  
    const formatDate = (date: any) => {
      if (!date) return 'N/A';
      const formattedDate = new Date(date);
      return formattedDate.toLocaleDateString('en-UK', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    };

    const getTotalCost = (costs: any) => {
        return (
          (costs?.material_cost ?? 0) +
          (costs?.manpower_cost ?? 0) +
          (costs?.machine_cost ?? 0) +
          (costs?.other_cost ?? 0)
        );
    };
  
    if (!project) return <div>Loading...</div>;

    const renderCostContent = () => {
      switch (view) {
        case 'master':
          return (
            <>
              {getTables(project.master_costs).map((table, index) => (
                <CostTable key={index} {...table} />
              ))}
              <CostSummary costs={project.master_costs} type="Master" />
            </>
          );
        case 'all':
          return (
            <>
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">As Sold Costs</h2>
                  <div className="lg:min-h-[600px]">
                    {getTables(project.master_costs, 'Master').map((table, index) => (
                      <CostTable key={index} {...table} />
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Actual Costs</h2>
                  <div className="lg:min-h-[600px]">
                    {getTables(project.costs, 'Actual').map((table, index) => (
                      <CostTable key={index} {...table} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6">
                <CostSummary costs={project.master_costs} type="Master" />
                <CostSummary costs={project.costs} type="Actual" />
              </div>
              <ComparisonSummary 
                masterCosts={project.master_costs} 
                actualCosts={project.costs}
                nilai={project.nilai}
              />
            </>
          );
        default: // 'actual'
          return (
            <>
              {getTables(project.costs).map((table, index) => (
                <CostTable key={index} {...table} />
              ))}
              <CostSummary costs={project.costs} type="Actual" />
            </>
          );
      }
    };
  
    const getTables = (costs: any, prefix: string = '') => [
      {
        title: `${prefix} Material List`,
        data: costs?.material_list ?? [],
        getItemName: (item: any) => item?.material?.name ?? 'N/A',
        getItemRate: (item: any) => item?.material?.unit_cost ?? 0,
        getItemAmount: (item: any) => item?.amount ?? 0,
        getItemCost: (item: any) => (item?.material?.unit_cost ?? 0) * (item?.amount ?? 0)
      },
      {
        title: `${prefix} Manpower List`,
        data: costs?.manpower_list ?? [],
        getItemName: (item: any) => item?.manpower?.name ?? 'N/A',
        getItemRate: (item: any) => item?.manpower?.unit_cost ?? 0,
        getItemAmount: (item: any) => item?.amount ?? 0,
        getItemCost: (item: any) => (item?.manpower?.unit_cost ?? 0) * (item?.amount ?? 0)
      },
      {
        title: `${prefix} Machine List`,
        data: costs?.machine_list ?? [],
        getItemName: (item: any) => item?.machine?.name ?? 'N/A',
        getItemRate: (item: any) => item?.machine?.unit_cost ?? 0,
        getItemAmount: (item: any) => item?.amount ?? 0,
        getItemCost: (item: any) => (item?.machine?.unit_cost ?? 0) * (item?.amount ?? 0)
      },
      {
        title: `${prefix} Misc List`,
        data: costs?.other_description ?? [],
        getItemName: (item: any) => item?.description ?? 'N/A',
        getItemRate: (item: any) => item?.cost ?? 0,
        getItemAmount: (item: any) => item?.amount ?? 0,
        getItemCost: (item: any) => (item?.cost ?? 0) * (item?.amount ?? 0)
      }
    ];

    const dellProject = async (id: string) => {
      try {
        await archiveProject(id);
        navigate('/');
      } catch (error) {
        console.error('Error archiving project:', error);
      }
    };

    const resProject = async (id: string) => {
      try {
        await restoreProject(id);
        navigate('/');
      } catch (error) {
        console.error('Error restoring project:', error);
      }
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
                 text: "Project will be archived!",
                 icon: 'warning',
                 showCancelButton: true,
                 confirmButtonText: 'Yes, archive it!',
                 cancelButtonText: 'No, cancel!',
                 reverseButtons: true,
                 padding: '2em',
             })
             .then((result) => {
                 if (result.value) {
                    dellProject(id)
                     swalWithBootstrapButtons.fire('Archived!', 'Project has been archived.', 'success');
                 } else if (result.dismiss === Swal.DismissReason.cancel) {
                     swalWithBootstrapButtons.fire('Cancelled', 'Project data is safe', 'error');
                 }
             });
     }
     if (type === 12) {
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
              text: "Project will be restored!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, restore it!',
              cancelButtonText: 'No, cancel!',
              reverseButtons: true,
              padding: '2em',
          })
          .then((result) => {
              if (result.value) {
                  resProject(id)
                  swalWithBootstrapButtons.fire('Restored!', 'Project has been restored.', 'success');
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                  swalWithBootstrapButtons.fire('Cancelled', 'Project stays archived', 'error');
              }
          });
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
  return desc.length > 20 ? `${desc.slice(0, 20)}...` : desc;
};
  
    return (
      <div>
        <div className="flex items-center lg:justify-end justify-center flex-wrap gap-4 mb-6">
          <button 
            type="button" 
            onClick={() => navigate(`/projects`)} 
            className="btn btn-outline-danger"
          >
            <IconX className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            Back
          </button>

          {!project.deleted && (
          <>
          <NavLink to={`/projects/edit/${project._id}`} className="btn btn-warning gap-2">
            <IconEdit />
            Edit
          </NavLink>
          <NavLink to={`/projects`} className="btn btn-danger gap-2" onClick={(e) => showAlert(11, project._id)}>
            <IconTrash />
            {project.deleted}
            Archive
          </NavLink>
          </>
          )}
            
          {project.deleted && (<NavLink to={`/projects`} className="btn btn-warning gap-2" onClick={(e) => showAlert(12, project._id)}>
            <IconSend />
            {project.deleted}
            Restore
          </NavLink>)}
          </div>
      <div className="panel">
        <div className="flex justify-between flex-wrap gap-4 px-4">
          <div className="text-3xl font-bold uppercase">Project Detail</div>
        </div>

        <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
        <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap">
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Customer Name</div>
                <div className="text-lg font-semibold">{project.customer_name?.name ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Project Name</div>
                <div className="text-lg font-semibold">{project.project_name ?? 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Project Status</div>
                <div className="text-lg">
                  <span className={`badge ${getProjectStatusColor(project.project_status)} font-semibold`}>
                    {project.project_status ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between sm:flex-row flex-col gap-6 lg:w-2/3">
            <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
              <div className="space-y-3">
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">No Project</div>
                  <div className="font-medium">{project.no_project ?? 'N/A'}</div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium">{formatDate(project.start_date)}</div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="font-medium">{formatDate(project.end_date)}</div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">Desc</div>
                  <div className="font-medium">{formatDescription(project.desc)}</div>
                </div>
              </div>
              {project.desc ? <ProjectDescriptionModal description={project.desc} /> : ''}
            </div>
            <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
              <div className="space-y-3">
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">Nilai</div>
                  <div className="font-bold text-lg">{(project.nilai ?? 0).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">GM - As Sold</div>
                  <div className="font-bold text-lg">{(project.gm ?? 0).toFixed(1)}%</div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">Cost</div>
                  <div className="font-bold text-lg">
                    {getTotalCost(project.costs).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">Gross Margin (Rp)</div>
                  <div className="font-bold text-lg">
                    {(project.nilai - getTotalCost(project.costs)).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="flex items-center w-full justify-between">
                  <div className="text-sm text-gray-500">Gross Margin (%)</div>
                  <div className="font-bold text-lg">
                    {((project.nilai - getTotalCost(project.costs))/project.nilai * 100).toFixed(1)}%
                  </div>
                </div>
                <CostRatioIndicator 
                  nilai={project.nilai ?? 0} 
                  totalCost={getTotalCost(project.costs)} 
                />
              </div>
            </div>
          </div>
        </div>

        { userCanSeeMaster && (
        <div className="flex justify-center rounded-lg overflow-hidden w-full md:w-fit mx-auto my-6">
          {/* {['actual', 'master', 'all'].map((option) => (
            <button
              key={option}
              className={`
                ${baseSegmentStyle}
                ${view === option ? activeSegmentStyle : inactiveSegmentStyle}
                flex-1 md:flex-none
              `}
              onClick={() => setView(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))} */}
          <SegmentedControl
                value={view}
                onChange={(value: string) => setView(value as string)}
                data={[
                  { label: 'As Sold', value: 'master' },
                  { label: 'Actual', value: 'actual' },
                  { label: 'All', value: 'all' }
                ]}
                className="mb-4"
              />
        </div>
        )}

        {renderCostContent()}
      </div>
    </div>
  );
};

export default ProjectDetail;