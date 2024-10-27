import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconX from '../../components/Icon/IconX';
import IconSave from '../../components/Icon/IconSave';
import IconPlus from '../../components/Icon/IconPlus';
import { getProjectDetail, updateProject } from '../../controllers/projectsController';
import Select, { SingleValue } from 'react-select';

interface ItemOption {
  value: string;
  label: string;
  fullData: any;
}

interface MaterialItem {
  material: string;
  amount: number;
  unit_cost: number;
}

interface ManpowerItem {
  manpower: string;
  amount: number;
  unit_cost: number;
}

interface MachineItem {
  machine: string;
  amount: number;
  unit_cost: number;
}

interface OtherItem {
  description: string;
  cost: number;
  amount: number;
}

interface ProjectCosts {
  material_list: MaterialItem[];
  manpower_list: ManpowerItem[];
  machine_list: MachineItem[];
  material_cost: number;
  manpower_cost: number;
  machine_cost: number;
  other_cost: number;
  other_description: OtherItem[];
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
  customer_name: CustomerDetails;
  project_name: string;
}

interface FormData {
  no_project: string;
  start_date: string;
  end_date: string;
  costs: {
    material_list: MaterialItem[];
    manpower_list: ManpowerItem[];
    machine_list: MachineItem[];
    material_cost: number;
    manpower_cost: number;
    machine_cost: number;
    other_cost: number;
    other_description: OtherItem[];
  };
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
    calculateCosts: any;
    itemOptions?: ItemOption[];
    readOnlyTotal?: boolean;
}

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
      <div className="flex justify-between text-xs text-gray-500">
        <span>Cost to Nilai Ratio: {ratio.toFixed(1)}%</span>
        {ratio >= 100 && (
          <span className="text-red-500">Warning: Cost exceeds project value!</span>
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

const CostTable: React.FC<CostTableProps> = ({ title, items, onItemsChange, itemType, itemOptions, readOnlyTotal = false }) => {
    const addItem = () => {
      const newItem: any = {
        amount: 0,
      };
  
      if (itemType === 'description') {
        newItem.description = '';
        newItem.cost = 0;
      } else {
        newItem[itemType] = '';
      }

      if (!items) {
        onItemsChange([newItem]);
      } else {
        onItemsChange([...items, newItem]);
      }
    };
  
    const updateItem = (index: number, field: string, value: any) => {
      const newItems = [...items];
      if (itemType === 'description') {
        newItems[index][field] = value;
      } else {
        if (field === 'id') {
          newItems[index][itemType] = value;
        } else {
          newItems[index][field] = value;
        }
      }
      onItemsChange(newItems);
    };
  
    const removeItem = (index: number) => {
      onItemsChange(items.filter((_, i) => i !== index));
    };
  
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold uppercase">{title}</div>
        </div>
        <div className="table-responsive mt-4">
          <table className="table-striped w-full">
            <thead>
              <tr>
                <th className="w-16">No</th>
                <th className="w-128">
                  {itemType === 'description' ? 'Description' : `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ID`}
                </th>
                <th className="w-40">Cost</th>
                <th className="w-32">Amount</th>
                <th className="w-32">Total</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items && items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {itemType === 'description'?
                    (<input
                      type="text"
                      className="form-input"
                      value={itemType === 'description' ? item.description : item[itemType]._id}
                      onChange={(e) => updateItem(index, itemType === 'description' ? 'description' : itemType, e.target.value)}
                    />)
                    :
                    (
                    <Select
                    placeholder={"Insert " + itemType}
                    options={itemOptions}
                    value={itemOptions?.find(option => option.value === item[itemType]?._id) || null}
                    onChange={(option) => updateItem(index, itemType, option?.fullData || {})}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    isClearable
                    />)
                    }
                  </td>
                  <td>
                    <input
                      type="number"
                      className={itemType === 'description' ? "form-input": "form-input bg-gray-100"}
                      value={itemType === 'description' ? item.cost : item[itemType].unit_cost}
                      onChange={(e) => updateItem(index, 'cost', Number(itemType === 'description' ? e.target.value : item[itemType].unit_cost))}
                      disabled={itemType !== 'description'}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      value={item.amount ?? 0}
                      onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
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
          </table>
          <div className="flex justify-end mt-2">
            <button 
              type="button" 
              className="btn btn-primary btn-sm flex items-center space-x-1"
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
    const [formData, setFormData] = useState<FormData>({
      no_project: '',
      start_date: '',
      end_date: '',
      costs: {
        material_list: [],
        manpower_list: [],
        machine_list: [],
        material_cost: 0,
        manpower_cost: 0,
        machine_cost: 0,
        other_cost: 0,
        other_description: []
      }
    });

    const [materialOptions, setMaterialOptions] = useState<ItemOption[]>([]);
    const [manpowerOptions, setManpowerOptions] = useState<ItemOption[]>([]);
    const [machineOptions, setMachineOptions] = useState<ItemOption[]>([]);
  
    useEffect(() => {
      dispatch(setPageTitle('Project Edit'));
      fetchProject();
      fetchOptions();
    }, []);

    const fetchOptions = async () => {
      try {
        const allMaterials = await fetch('/api/project/materials').then(res => res.json());
        const allManpower = await fetch('/api/project/manpower').then(res => res.json());
        const allMachines = await fetch('/api/project/machines').then(res => res.json());

        const materials = allMaterials.map((material:any) => ({
          value: material._id,
          label: material.name,
          fullData: material
        }))

        const manpower = allManpower.map((manpower:any) => ({
          value: manpower._id,
          label: manpower.name,
          fullData: manpower
        }))

        const machines = allMachines.map((machine:any) => ({
          value: machine._id,
          label: machine.name,
          fullData: machine
        }))
        
        setMaterialOptions(materials);
        setManpowerOptions(manpower);
        setMachineOptions(machines);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
  
    // Calculate costs whenever lists change
    useEffect(() => {
      calculateCosts();
    }, [
      formData.costs.material_list,
      formData.costs.manpower_list,
      formData.costs.machine_list,
      formData.costs.other_description
    ]);
  
    const calculateCosts = () => {
      const materialCost = formData.costs.material_list?.reduce((total, item) => total + (item.amount * (item.material.unit_cost || 0)), 0) ?? 0;
      const manpowerCost = formData.costs.manpower_list?.reduce((total, item) => total + (item.amount * (item.manpower.unit_cost || 0)), 0) ?? 0;
      const machineCost = formData.costs.machine_list?.reduce((total, item) => total + (item.amount * (item.machine.unit_cost || 0)), 0) ?? 0;
      const otherCost = formData.costs.other_description?.reduce((total, item) => total + (item.cost * item.amount), 0) ?? 0;
    
      setFormData(prev => ({
        ...prev,
        costs: {
          ...prev.costs,
          material_cost: materialCost,
          manpower_cost: manpowerCost,
          machine_cost: machineCost,
          other_cost: otherCost
        }
      }));
    };
  
    const fetchProject = async () => {
      try {
        const response = await getProjectDetail(id as string);
        setProject(response.project);
        setFormData({
          no_project: response.project.no_project,
          start_date: response.project.start_date?.split('T')[0] || '',
          end_date: response.project.end_date?.split('T')[0] || '',
          costs: response.project.costs || {
            material_list: [],
            manpower_list: [],
            machine_list: [],
            material_cost: 0,
            manpower_cost: 0,
            machine_cost: 0,
            other_cost: 0,
            other_description: []
          }
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        setIsLoading(false);
      }
    };
  
    const calculateTotalCost = (): number => {
      return (
        formData.costs.material_cost +
        formData.costs.manpower_cost +
        formData.costs.machine_cost +
        formData.costs.other_cost
      );
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const totalCost = calculateTotalCost();
      
      if (totalCost > (project?.nilai || 0)) {
        alert('Total cost cannot exceed project nilai!');
        return;
      }
            
      try {
        await updateProject(id as string, formData);
        navigate(`/projects/${id}`);
      }
      catch (error) {
        console.error('Error updating project:', error);
      }

    };
  
    if (isLoading) return <div>Loading...</div>;
  
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className="panel">
            <div className="flex justify-between flex-wrap gap-4 px-4">
              <div className="text-2xl font-semibold uppercase">
                Project Edit - {project?.project_name} - {project?.customer_name.name}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary">
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
                    <label className="block mb-2">No Project</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.no_project}
                      onChange={(e) => setFormData({ ...formData, no_project: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block mb-2">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="lg:w-1/3">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Project Nilai</label>
                    <div className="form-input bg-gray-100">
                      {project?.nilai?.toLocaleString('id-ID') || 0}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Total Cost</label>
                    <div className="form-input bg-gray-100">
                      {calculateTotalCost().toLocaleString('id-ID')}
                    </div>
                  </div>
                  <CostRatioIndicator 
                    nilai={project?.nilai || 0} 
                    totalCost={calculateTotalCost()} 
                  />
                </div>
              </div>
            </div>
  
            <CostTable
              title="Material List"
              items={formData.costs.material_list}
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  costs: { 
                    ...formData.costs, 
                    material_list: items 
                  } 
                })
              }
              itemType="material"
              calculateCosts={calculateCosts}
              itemOptions={materialOptions}
            />
  
            <CostTable
              title="Manpower List"
              items={formData.costs.manpower_list}
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  costs: { 
                    ...formData.costs, 
                    manpower_list: items 
                  } 
                })
              }
              itemType="manpower"
              calculateCosts={calculateCosts}
              itemOptions={manpowerOptions}
            />
  
            <CostTable
              title="Machine List"
              items={formData.costs.machine_list}
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  costs: { 
                    ...formData.costs, 
                    machine_list: items 
                  } 
                })
              }
              itemType="machine"
              calculateCosts={calculateCosts}
              itemOptions={machineOptions}
            />
  
            <CostTable
              title="Misc List"
              items={formData.costs.other_description}
              onItemsChange={(items) => 
                setFormData({ 
                  ...formData, 
                  costs: { 
                    ...formData.costs, 
                    other_description: items 
                  } 
                })
              }
              itemType="description"
              calculateCosts={calculateCosts}
            />
          </div>
        </form>
      </div>
    );
  };
  
  export default ProjectEdit;