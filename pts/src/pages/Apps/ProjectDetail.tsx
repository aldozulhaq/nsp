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

interface Material {
    name: string;
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
    customer_name: CustomerDetails,
    project_name: string,
    nilai: number
    deleted: boolean
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
        <div className="flex justify-between text-xs text-gray-500">
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
  
  const CostTable: React.FC<CostTableProps> = ({ title, data = [], getItemName, getItemAmount, getItemCost }) => {
    if (!data || data.length === 0) {
      return (
        <div className="mt-6">
          <div className="text-lg font-semibold uppercase">{title}</div>
          <div className="p-4 text-center text-gray-500">No data available</div>
        </div>
      );
    }
  
    return (
      <div className="table-responsive mt-6">
        <div className="text-lg font-semibold uppercase">{title}</div>
        <table className="table-striped w-full">
          <thead>
            <tr>
              <th className="w-16">No</th>
              <th className="w-1/2">Name</th>
              <th className="w-1/6 text-right">Amount</th>
              <th className="w-1/6 text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{getItemName(item)}</td>
                <td className="text-right">{getItemAmount(item)}</td>
                <td className="text-right">{getItemCost(item).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const CostSummary: React.FC<{ costs: any }> = ({ costs }) => {
    const costItems = [
      { label: 'Total Material Cost', value: costs?.material_cost ?? 0 },
      { label: 'Total Manpower Cost', value: costs?.manpower_cost ?? 0 },
      { label: 'Total Machine Cost', value: costs?.machine_cost ?? 0 },
      { label: 'Total Misc Cost', value: costs?.other_cost ?? 0 }
    ];
  
    const totalCost = costItems.reduce((sum, item) => sum + item.value, 0);
  
    return (
      <div className="grid sm:grid-cols-2 grid-cols-1 px-4 mt-6">
        <div></div>
        <div className="ltr:text-right rtl:text-left space-y-2">
          {costItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">{item.label}</div>
              <div className="w-[37%]">{item.value.toLocaleString('id-ID')}</div>
            </div>
          ))}
          <div className="flex items-center font-semibold text-lg">
            <div className="flex-1">Total Cost</div>
            <div className="w-[37%]">{totalCost.toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>
    );
  };
  
  const ProjectDetail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
  
    useEffect(() => {
      dispatch(setPageTitle('Project Detail'));
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
  
    const tables = [
      {
        title: 'Material List',
        data: project.costs?.material_list ?? [],
        getItemName: (item: any) => item?.material?.name ?? 'N/A',
        getItemAmount: (item: any) => item?.amount ?? 0,
        getItemCost: (item: any) => (item?.material?.unit_cost ?? 0) * (item?.amount ?? 0)
      },
      {
        title: 'Manpower List',
        data: project.costs?.manpower_list ?? [],
        getItemName: (item: any) => item?.manpower?.name ?? 'N/A',
        getItemAmount: (item: any) => item?.amount ?? 0,
        getItemCost: (item: any) => (item?.manpower?.unit_cost ?? 0) * (item?.amount ?? 0)
      },
      {
        title: 'Machine List',
        data: project.costs?.machine_list ?? [],
        getItemName: (item: any) => item?.machine?.name ?? 'N/A',
        getItemAmount: (item: any) => item?.amount ?? 0,
        getItemCost: (item: any) => (item?.machine?.unit_cost ?? 0) * (item?.amount ?? 0)
      },
      {
        title: 'Misc List',
        data: project.costs?.other_description ?? [],
        getItemName: (item: any) => item?.description ?? 'N/A',
        getItemAmount: (item: any) => item?.amount ?? 0,
        getItemCost: (item: any) => (item?.cost ?? 0) * (item?.amount ?? 0)
      }
    ];

    const dellProject = async (id: string) => {
      try {
        await archiveProject(id);
        navigate('/projects');
      } catch (error) {
        console.error('Error archiving project:', error);
      }
    };

    const resProject = async (id: string) => {
      try {
        await restoreProject(id);
        navigate('/projects');
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
  
    return (
      <div>
        <div className="flex items-center lg:justify-end justify-center flex-wrap gap-4 mb-6">
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
            <div className="text-2xl font-semibold uppercase">Project Detail</div>
          </div>
  
          <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
          <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap">
            <div className="flex-1">
              <div className="space-y-1 text-white-dark">
                <div>Issue For:</div>
                <div className="text-black dark:text-white font-semibold">{project.customer_name?.name ?? 'N/A'}</div>
              </div>
              <div className="space-y-1 text-white-dark">
                <div>Project Name:</div>
                <div className="text-black dark:text-white font-semibold">{project.project_name ?? 'N/A'}</div>
              </div>
            </div>
            <div className="flex justify-between sm:flex-row flex-col gap-6 lg:w-2/3">
              <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
                <div className="flex items-center w-full justify-between mb-2">
                  <div className="text-white-dark">No Project :</div>
                  <div>{project.no_project ?? 'N/A'}</div>
                </div>
                <div className="flex items-center w-full justify-between mb-2">
                  <div className="text-white-dark">Start Date :</div>
                  <div>{formatDate(project.start_date)}</div>
                </div>
                <div className="flex items-center w-full justify-between mb-2">
                  <div className="text-white-dark">End Date :</div>
                  <div>{formatDate(project.end_date)}</div>
                </div>
              </div>
              <div className="xl:1/3 lg:w-2/5 sm:w-1/2">
                <div className="flex items-center w-full justify-between mb-2">
                  <div className="text-white-dark">Nilai :</div>
                  <div className="whitespace-nowrap">{(project.nilai ?? 0).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex items-center w-full justify-between mb-2">
                  <div className="text-white-dark">Cost :</div>
                  <div>
                    {getTotalCost(project.costs).toLocaleString('id-ID')}
                  </div>
                </div>
                  <CostRatioIndicator 
                  nilai={project.nilai ?? 0} 
                  totalCost={getTotalCost(project.costs)} 
                  />
              </div>
            </div>
          </div>
  
          {tables.map((table, index) => (
            <CostTable key={index} {...table} />
          ))}
  
          <CostSummary costs={project.costs} />
        </div>
      </div>
    );
  };
  
  export default ProjectDetail;