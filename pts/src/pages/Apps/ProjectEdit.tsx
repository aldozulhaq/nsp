import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconX from '../../components/Icon/IconX';
import IconSave from '../../components/Icon/IconSave';
import IconPlus from '../../components/Icon/IconPlus';
import { getProjectDetail, updateProject } from '../../controllers/projectsController';
import Select, { SingleValue } from 'react-select';
import { SegmentedControl } from '@mantine/core';

interface ItemOption {
  value: string;
  label: string;
  fullData: any;
}

interface GrossMarginIndicatorProps {
  nilai: number;
  totalCost: number;
}

interface MaterialItem {
  material: {
    _id: string;
    name: string;
    unit_cost: number;
    stock: number;
  };
  amount: number;
}

interface ManpowerItem {
  manpower: {
    _id: string;
    name: string;
    unit_cost: number;
    stock: number;
  };
  amount: number;
}

interface MachineItem {
  machine: {
    _id: string;
    name: string;
    unit_cost: number;
    stock: number;
  };
  amount: number;
}

interface SubcontractorItem {
  subcontractor: {
    _id: string;
    name: string;
    unit_cost: number;
    stock: number;
  };
  amount: number;
}

interface OtherItem {
  description: string;
  cost: number;
  amount: number;
}

interface ProjectCosts {
  material_cost: number;
  material_list: MaterialItem[];
  manpower_cost: number;
  manpower_list: ManpowerItem[];
  machine_cost: number;
  machine_list: MachineItem[];
  other_cost: number;
  other_description: OtherItem[];
  subcontractor_list: SubcontractorItem[];
  subcontractor_cost: number;
}

interface CustomerDetails {
  name: string;
  desc: string;
}

interface Project {
  no_project: string;
  start_date: string;
  end_date: string;
  nilai?: number;
  costs?: ProjectCosts;
  master_costs?: ProjectCosts;
  invoice?: ProjectCosts;
  customer_name: CustomerDetails;
  project_name: string;
  project_status: string;
  desc: string;
}

interface FormData {
  no_project: string;
  start_date: string;
  end_date: string;
  costs: ProjectCosts;
  project_status: string;
  desc: string;
  master_costs: ProjectCosts;
  invoice: ProjectCosts;
}

interface CostRatioIndicatorProps {
  nilai: number;
  totalCost: number;
}

interface CostTableProps {
  title: string;
  items: any[];
  onItemsChange: (items: any[]) => void;
  itemType: string;
  calculateCosts: () => void;
  readOnlyTotal?: boolean;
}

type CostView = 'master' | 'actual' | 'invoice';

const CostRatioIndicator: React.FC<CostRatioIndicatorProps> = ({ nilai, totalCost }) => {
  const ratio = nilai ? (totalCost / nilai) * 100 : 0;
  
  const getColorClass = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>Cost to Nilai Ratio: {ratio.toFixed(1)}%</span>
        {ratio >= 100 && (
          <span className="text-red-500 font-semibold">Warning: Cost exceeds project value!</span>
        )}
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

const CostTable: React.FC<CostTableProps> = ({ title, items, onItemsChange, itemType, calculateCosts, readOnlyTotal = false }) => {
  const addItem = () => {
    const newItem: any = {
      [itemType]: {
        name: "",
        unit_cost: 0,
      },
      amount: 0,
    };
  
    if (!items) {
      onItemsChange([newItem]);
    } else {
      onItemsChange([...items, newItem]);
    }
    calculateCosts();
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'name' || field === 'unit_cost') {
      newItems[index][itemType][field] = value;
    } else {
      newItems[index][field] = value;
    }
    onItemsChange(newItems);
    calculateCosts();
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
    calculateCosts();
  };

  const getTotalCost = (): number => {
    if (!items || items.length === 0) return 0;
    
    if (itemType === 'description') {
      return items.reduce((total, item) => {
        const cost = Number(item?.cost) || 0;
        const amount = Number(item?.amount) || 0;
        return total + (cost * amount);
      }, 0);
    } else {
      return items.reduce((total, item) => {
        const unitCost = Number(item?.[itemType]?.unit_cost) || 0;
        const amount = Number(item?.amount) || 0;
        return total + (unitCost * amount);
      }, 0);
    }
  };
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold tracking-wide text-gray-800">{title}</div>
      </div>
      <div className="table-responsive mt-4">
        <table className="table-striped w-full">
          <thead>
            <tr className="text-sm font-semibold text-gray-700">
              <th className="w-16">No</th>
              <th className="w-128">
                {itemType === 'description' ? 'Description' : `${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
              </th>
              <th className="w-40">Rate</th>
              <th className="w-32">Quantity</th>
              <th className="w-32">Total</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
              {items && items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={itemType === 'description' ? item.description : item[itemType].name}
                      onChange={(e) => updateItem(index, itemType === 'description' ? 'description' : 'name', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={itemType === 'description' ? item.cost : item[itemType].unit_cost}
                      onChange={(e) => updateItem(index, itemType === 'description' ? 'cost' : 'unit_cost', Number(e.target.value))}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={item.amount ?? 0}
                      onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
                      required
                    />
                  </td>
                  <td className="text-right">
                    {((itemType === 'description' ? item.cost : item[itemType].unit_cost) * item.amount).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <IconX className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold text-gray-800">
              <td colSpan={4} className="text-right p-2">Total {title}</td>
              <td className="text-right p-2">
                {getTotalCost().toLocaleString('id-ID')}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <div className="flex justify-end mt-2">
          <button 
            type="button" 
            className="btn btn-primary btn-sm flex items-center space-x-1 font-medium"
            onClick={addItem}
          >
            <IconPlus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectEdit: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [totalCost, setTotalCost] = useState<number>(0);
    const [formData, setFormData] = useState<FormData>({
      no_project: '',
      start_date: '',
      end_date: '',
      costs: {
        material_cost: 0,
        material_list: [],
        manpower_cost: 0,
        manpower_list: [],
        machine_cost: 0,
        machine_list: [],
        other_cost: 0,
        other_description: [],
        subcontractor_cost: 0,
        subcontractor_list: [],
      },
      project_status: '',
      desc: '',
      master_costs: {
        material_cost: 0,
        material_list: [],
        manpower_cost: 0,
        manpower_list: [],
        machine_cost: 0,
        machine_list: [],
        other_cost: 0,
        other_description: [],
        subcontractor_cost: 0,
        subcontractor_list: [],
      },
      invoice: {
        material_cost: 0,
        material_list: [],
        manpower_cost: 0,
        manpower_list: [],
        machine_cost: 0,
        machine_list: [],
        other_cost: 0,
        other_description: [],
        subcontractor_cost: 0,
        subcontractor_list: [],
      },
    });

    const [costView, setCostView] = useState<CostView>('actual');

    const [userCanSeeMaster, setUserCanSeeMaster] = useState<boolean>(false);

    const checkUser = () => {
      const uRole = localStorage.getItem("role")
      if (uRole?.toLowerCase().includes("mod") || uRole === "dev") {
        setUserCanSeeMaster(true)
      }
    }
  
    useEffect(() => {
      dispatch(setPageTitle('Project Edit'));
      fetchProject();
      checkUser();
    }, []);
  
    const fetchProject = async () => {
      try {
        const response = await getProjectDetail(id as string);
        setProject(response.project);
        setFormData({
          no_project: response.project.no_project,
          start_date: response.project.start_date?.split('T')[0] || '',
          end_date: response.project.end_date?.split('T')[0] || '',
          costs: response.project.costs || {
            material_cost: 0,
            material_list: [],
            manpower_cost: 0,
            manpower_list: [],
            machine_cost: 0,
            machine_list: [],
            other_cost: 0,
            other_description: [],
            subcontractor_cost: 0,
            subcontractor_list: [],
          },
          project_status: response.project.project_status || '',
          desc: response.project.desc || '',
          master_costs: response.project.master_costs || {
            material_cost: 0,
            material_list: [],
            manpower_cost: 0,
            manpower_list: [],
            machine_cost: 0,
            machine_list: [],
            other_cost: 0,
            other_description: [],
            subcontractor_cost: 0,
            subcontractor_list: [],
          },
          invoice: response.project.invoice || {
            material_cost: 0,
            material_list: [],
            manpower_cost: 0,
            manpower_list: [],
            machine_cost: 0,
            machine_list: [],
            other_cost: 0,
            other_description: [],
            subcontractor_cost: 0,
            subcontractor_list: [],
          },
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setIsLoading(false);
      }
    };

    useEffect(() => {
      calculateCosts();
    }, [
      costView,
      formData.costs?.material_list,
      formData.costs?.manpower_list,
      formData.costs?.machine_list,
      formData.costs?.other_description,
      formData.costs?.subcontractor_list,
      formData.master_costs?.material_list,
      formData.master_costs?.manpower_list,
      formData.master_costs?.machine_list,
      formData.master_costs?.other_description,
      formData.master_costs?.subcontractor_list,
      formData.invoice?.material_list,
      formData.invoice?.manpower_list,
      formData.invoice?.machine_list,
      formData.invoice?.other_description,
      formData.invoice?.subcontractor_list,
    ]);

    useEffect(() => {
      const costs = costView === 'master' ? formData.master_costs :
                    costView === 'invoice' ? formData.invoice :
                    formData.costs;
      const total = (
        costs?.material_cost +
        costs?.manpower_cost +
        costs?.machine_cost +
        costs?.other_cost +
        costs?.subcontractor_cost
      ) || 0;
      setTotalCost(total);
    }, [
      costView,
      formData.costs.material_cost,
      formData.costs.manpower_cost,
      formData.costs.machine_cost,
      formData.costs.other_cost,
      formData.costs.subcontractor_cost,
      formData.master_costs?.material_list,
      formData.master_costs?.manpower_list,
      formData.master_costs?.machine_list,
      formData.master_costs?.other_description,
      formData.master_costs?.subcontractor_cost,
      formData.invoice?.material_list,
      formData.invoice?.manpower_list,
      formData.invoice?.machine_list,
      formData.invoice?.other_description,
      formData.invoice?.subcontractor_cost
    ]);
  
    const calculateCosts = () => {
      const costs = costView === 'master' ? formData.master_costs :
                    costView === 'invoice' ? formData.invoice :
                    formData.costs;

      const materialCost = costs.material_list?.reduce((total, item) => 
        total + (item?.amount * (item.material.unit_cost || 0)), 0) ?? 0;
      const manpowerCost = costs.manpower_list?.reduce((total, item) => 
        total + (item?.amount * (item.manpower.unit_cost || 0)), 0) ?? 0;
      const machineCost = costs.machine_list?.reduce((total, item) => 
        total + (item?.amount * (item.machine.unit_cost || 0)), 0) ?? 0;
      const otherCost = costs.other_description?.reduce((total, item) => 
        total + (item?.cost * item.amount), 0) ?? 0;
      const subcontractorCost = costs.subcontractor_list?.reduce((total, item) =>
        total + (item?.amount * (item.subcontractor.unit_cost || 0)), 0) ?? 0;
  
      setFormData((prev) => ({
        ...prev,
        [costView === 'master' ? 'master_costs' : costView === 'invoice' ? 'invoice' : 'costs']: {
          ...(costView === 'master' ? prev.master_costs : costView === 'invoice' ? prev.invoice : prev.costs),
          material_cost: materialCost,
          manpower_cost: manpowerCost,
          machine_cost: machineCost,
          other_cost: otherCost,
          subcontractor_cost: subcontractorCost,
        },
      }));
    };
  
    const calculateTotalCost = (): number => {
      return (
        formData.costs.material_cost +
        formData.costs.manpower_cost +
        formData.costs.machine_cost +
        formData.costs.other_cost +
        formData.costs.subcontractor_cost
      );
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const totalCost = calculateTotalCost();
    
      //console.log(formData)
      try {
        await updateProject(id as string, formData);
        navigate(`/projects/${id}`);
      } catch (error) {
        console.error('Error updating project:', error);
      }
    };
  
    if (isLoading) return <div>Loading...</div>;
  
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className="panel">
            <div className="flex justify-between flex-wrap gap-4 px-4">
              <div className="text-2xl font-bold tracking-wide text-gray-900">
                Project Edit - {project?.project_name} - {project?.customer_name.name}
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => navigate(`/projects/${id}`)} 
                  className="btn btn-outline-danger font-medium"
                >
                  <IconX className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-medium">
                  <IconSave className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                  Save
                </button>
              </div>
            </div>
  
            <hr className="border-white-light dark:border-[#1b2e4b] my-6" />
  
            <div className="flex justify-between lg:flex-row flex-col gap-6 flex-wrap px-4">
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold text-sm text-gray-700">No Project</label>
                    <input
                      type="text"
                      className="form-input font-bold text-lg"
                      value={formData.no_project}
                      onChange={(e) => setFormData({ ...formData, no_project: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm text-gray-700">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm text-gray-700">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                  <div>
                  <label className="block mb-2 font-semibold text-sm text-gray-700">Project Status</label>
                  <Select
                    value={{
                      value: formData.project_status,
                      label: formData.project_status.charAt(0).toUpperCase() + formData.project_status.slice(1),
                    }}
                    onChange={(option: SingleValue<{ value: string; label: string }>) => {
                      setFormData({
                        ...formData,
                        project_status: option?.value || '',
                      });
                    }}
                    options={[
                      { value: 'preparation', label: 'Preparation' },
                      { value: 'ongoing', label: 'Ongoing' },
                      { value: 'bastp', label: 'BASTP' },
                      { value: 'invoice', label: 'Invoice' },
                      { value: 'closing', label: 'Closing' },
                    ]}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-sm text-gray-700">Project Description</label>
                  <textarea
                    className="form-input"
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    rows={3}
                  ></textarea>
                </div>
                </div>
              </div>
              <div className="lg:w-1/3">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold text-sm text-gray-700">Project Nilai</label>
                    <div className="form-input bg-gray-100 font-bold text-lg">
                      {project?.nilai?.toLocaleString('id-ID') || 0}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm text-gray-700">Total Cost</label>
                    <div className="form-input bg-gray-100 font-bold text-lg">
                      {totalCost.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm text-gray-700">Gross Margin (Rp)</label>
                    <div className="form-input bg-gray-100 font-bold text-lg">
                      {project?.nilai ? (project.nilai - totalCost).toLocaleString('id-ID') : 0}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm text-gray-700">Gross Margin (%)</label>
                    <div className="form-input bg-gray-100 font-bold text-lg">
                      {project?.nilai ? ((project?.nilai - totalCost)/project?.nilai * 100).toFixed(1) : 0}
                    </div>
                  </div>
                  <CostRatioIndicator 
                    nilai={project?.nilai || 0} 
                    totalCost={totalCost} 
                  />
                </div>
              </div>
            </div>

            { userCanSeeMaster && (
            <div className="mt-8">
              <SegmentedControl
                value={costView}
                onChange={(value: string) => setCostView(value as CostView)}
                data={[
                  { label: 'As Sold', value: 'master' },
                  { label: 'Actual', value: 'actual' },
                  { label: 'Invoice', value: 'invoice' },
                ]}
                className="mb-4"
              />
            </div>
            )}
  
            <CostTable
              title="Material List"
              items={
                costView === 'master' ? formData.master_costs.material_list :
                costView === 'invoice' ? formData.invoice.material_list :
                formData.costs.material_list
              }
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  [costView === 'master' ? 'master_costs' : 
                   costView === 'invoice' ? 'invoice' : 'costs']: { 
                    ...(
                      costView === 'master' ? formData.master_costs :
                      costView === 'invoice' ? formData.invoice :
                      formData.costs
                    ), 
                    material_list: items 
                  }
                })
              }
              itemType="material"
              calculateCosts={calculateCosts}
            />
  
            <CostTable
              title="Manpower List"
              items={
                costView === 'master' ? formData.master_costs.manpower_list :
                costView === 'invoice' ? formData.invoice.manpower_list :
                formData.costs.manpower_list
              }
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  [costView === 'master' ? 'master_costs' : 
                   costView === 'invoice' ? 'invoice' : 'costs']: { 
                    ...(
                      costView === 'master' ? formData.master_costs :
                      costView === 'invoice' ? formData.invoice :
                      formData.costs
                    ), 
                    manpower_list: items 
                  }
                })
              }
              itemType="manpower"
              calculateCosts={calculateCosts}
            />
  
            <CostTable
              title="Machine List"
              items={
                costView === 'master' ? formData.master_costs.machine_list :
                costView === 'invoice' ? formData.invoice.machine_list :
                formData.costs.machine_list
              }
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  [costView === 'master' ? 'master_costs' : 
                   costView === 'invoice' ? 'invoice' : 'costs']: { 
                    ...(
                      costView === 'master' ? formData.master_costs :
                      costView === 'invoice' ? formData.invoice :
                      formData.costs
                    ), 
                    machine_list: items 
                  }
                })
              }
              itemType="machine"
              calculateCosts={calculateCosts}
            />
  
            <CostTable
              title="Misc List"
              items={
                costView === 'master' ? formData.master_costs.other_description :
                costView === 'invoice' ? formData.invoice.other_description :
                formData.costs.other_description
              }
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  [costView === 'master' ? 'master_costs' : 
                   costView === 'invoice' ? 'invoice' : 'costs']: { 
                    ...(
                      costView === 'master' ? formData.master_costs :
                      costView === 'invoice' ? formData.invoice :
                      formData.costs
                    ), 
                    other_description: items 
                  }
                })
              }
              itemType="description"
              calculateCosts={calculateCosts}
            />

            <CostTable
              title="Subcontractor List"
              items={
                costView === 'master' ? formData.master_costs.subcontractor_list :
                costView === 'invoice' ? formData.invoice.subcontractor_list :
                formData.costs.subcontractor_list
              }
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  [costView === 'master' ? 'master_costs' : 
                   costView === 'invoice' ? 'invoice' : 'costs']: { 
                    ...(
                      costView === 'master' ? formData.master_costs :
                      costView === 'invoice' ? formData.invoice :
                      formData.costs
                    ), 
                    subcontractor_list: items 
                  }
                })
              }
              itemType="subcontractor"
              calculateCosts={calculateCosts}
            />
          </div>
        </form>
      </div>
    );
  };
  
  export default ProjectEdit;