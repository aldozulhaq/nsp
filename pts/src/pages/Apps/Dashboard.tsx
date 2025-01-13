import { useState, Fragment, useEffect, useContext, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'flatpickr/dist/flatpickr.css';
import { setPageTitle } from '../../store/themeConfigSlice';
import { DataTable, DataTableColumn, DataTableSortStatus, useDataTableColumns } from 'mantine-datatable';
import { GetCustomerNameById, GetCustomers } from '../../controllers/customerController';
import { getProjects } from '../../controllers/projectsController';
import { NavLink } from 'react-router-dom';
import { ActionIcon, Button, Card, Checkbox, Group, MultiSelect, SegmentedControl, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import ProjectTable from '../Components/responsive-table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { t } from 'i18next';

interface Project {
    _id: string;
    no_project: string;
    start_date: string;
    end_date: string;
    project_name: string;
    nilai: number;
    deleted: boolean;
    costs: ProjectCosts;
    desc: string;
    project_status: string;
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
        description: String;
        cost: number;
        amount: number;
    }[];
    other_cost: number;
}

const formatCurrency = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1000000000) { // Billion
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (abs >= 1000000) { // Million
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (abs >= 1000) { // Thousand
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toFixed(0);
  }
};

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

const FormatDate = (date: any) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString('en-UK', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
};

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

interface ComparisonRange {
  id: string;
  startDate: string;
  endDate: string;
  color: string;
}

const ProjectLineChart = ({ projects }: { projects: Project[] }) => {
  const [filterType, setFilterType] = useState<'this-week' | 'this-month' | 'this-year' | 'custom'>('this-week');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [comparisons, setComparisons] = useState<ComparisonRange[]>([]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    switch (filterType) {
      case 'this-week': {
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);
        filtered = projects.filter(project => {
          const projectStartDate = new Date(project.start_date);
          const projectEndDate = new Date(project.end_date);
          const projectYear = project.no_project?.match(/Y(\d{4})/)?.[1];
          
          // Check if project duration overlaps with the week
          return (
            (projectStartDate <= endOfWeek && projectEndDate >= startOfWeek) ||
            (projectYear && parseInt(projectYear) === today.getFullYear())
          );
        });
        break;
      }
      case 'this-month': {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filtered = projects.filter(project => {
          const projectStartDate = new Date(project.start_date);
          const projectEndDate = new Date(project.end_date);
          const projectYear = project.no_project?.match(/Y(\d{4})/)?.[1];
          
          return (
            (projectStartDate <= endOfMonth && projectEndDate >= startOfMonth) ||
            (projectYear && parseInt(projectYear) === today.getFullYear())
          );
        });
        break;
      }
      case 'this-year': {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);
        filtered = projects.filter(project => {
          const projectStartDate = new Date(project.start_date);
          const projectEndDate = new Date(project.end_date);
          const projectYear = project.no_project?.match(/Y(\d{4})/)?.[1];
          
          return (
            (projectStartDate <= endOfYear && projectEndDate >= startOfYear) ||
            (projectYear && parseInt(projectYear) === currentYear)
          );
        });
        break;
      }
      case 'custom': {
        if (customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          filtered = projects.filter(project => {
            const projectStartDate = new Date(project.start_date);
            const projectEndDate = new Date(project.end_date);
            const projectYear = project.no_project?.match(/Y(\d{4})/)?.[1];
            
            return (
              (projectStartDate <= endDate && projectEndDate >= startDate) ||
              (projectYear && parseInt(projectYear) === startDate.getFullYear())
            );
          });
        }
        break;
      }
    }

    // Sort projects by start date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [projects, filterType, customDateRange]);

  const getProjectsInRange = useCallback((startDate: string, endDate: string) => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    
    const filteredProjects = projects.filter(project => {
      const projectStartDate = new Date(project.start_date);
      const projectEndDate = new Date(project.end_date);
      const projectYear = project.no_project?.match(/Y(\d{4})/)?.[1];
      const numericProjectYear = projectYear ? parseInt(projectYear) : null;
      
      return (
        (projectStartDate <= end && projectEndDate >= start) ||
        (numericProjectYear !== null && 
         numericProjectYear >= startYear && 
         numericProjectYear <= endYear)
      );
    });

    // Sort projects by start date
    return filteredProjects.sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [projects]);

  const handleAddComparison = useCallback(() => {
    if (comparisons.length >= CHART_COLORS.length) return;
    setComparisons([
      ...comparisons,
      {
        id: crypto.randomUUID(),
        startDate: '',
        endDate: '',
        color: CHART_COLORS[comparisons.length + 1],
      },
    ]);
  }, [comparisons]);

  const handleRemoveComparison = useCallback((id: string) => {
    setComparisons(comparisons.filter(comp => comp.id !== id));
  }, comparisons);

  const updateComparisonDates = useCallback((id: string, type: 'startDate' | 'endDate', date: string) => {
    setComparisons(
      comparisons.map(comp =>
        comp.id === id
          ? { ...comp, [type]: date }
          : comp
      )
    );
  }, [projects]);

  const calculateStats = useCallback((projectsList: Project[]) => {
    const totalNilai = projectsList.reduce((acc, project) => {
      const nilai = project?.nilai || 0;
      return acc + nilai;
    }, 0);

    const totalCost = projectsList.reduce((acc, project) => {
      const costs = project?.costs || {};
      return acc + 
        (costs.material_cost || 0) + 
        (costs.manpower_cost || 0) + 
        (costs.machine_cost || 0) + 
        (costs.other_cost || 0);
    }, 0);

    const projectStatusCount: { [key: string]: number } = {};
    projectsList.forEach(project => {
      const status = project?.project_status || "N/A";
      projectStatusCount[status] = (projectStatusCount[status] || 0) + 1;
    });

    const totalCostBreakdown: { [key: string]: number } = {
      'Material': 0,
      'Manpower': 0,
      'Machine': 0,
      'Misc': 0
    };

    projectsList.forEach(project => {
      const costs = project?.costs || {};
      totalCostBreakdown['Material'] += costs.material_cost || 0;
      totalCostBreakdown['Manpower'] += costs.manpower_cost || 0;
      totalCostBreakdown['Machine'] += costs.machine_cost || 0;
      totalCostBreakdown['Misc'] += costs.other_cost || 0;
    });

    return { totalNilai, totalCost, projectStatusCount, totalCostBreakdown };
  }, []);

  const calculateYAxisDomain = (filteredProjects: Project[]) => {
    const values = filteredProjects.map(project => project.nilai);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Add 10% padding to the top and bottom
    const padding = (maxValue - minValue) * 0.1;
    return [Math.max(0, minValue - padding), maxValue + padding];
  };

  return (
    <div className="w-full h-full">
      <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <SegmentedControl
          value={filterType}
          className="w-full sm:w-auto ml-5"
          onChange={(value) => setFilterType(value as typeof filterType)}
          data={[
              { label: 'This Week', value: 'this-week' },
              { label: 'This Month', value: 'this-month' },
              { label: 'This Year', value: 'this-year' },
              { label: 'Custom', value: 'custom' },
          ]}
          />
      </div>

      {filterType === 'custom' && (
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end ml-5">
          <div>
          <div className="text-sm mb-1">From</div>
          <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))} className="border rounded p-1 w-full" />
          </div>
          <div>
          <div className="text-sm mb-1">To</div>
          <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))} className="border rounded p-1 w-full" />
          </div>
      </div>
      )}

        <div className="p-5">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart>
              <XAxis 
                dataKey="start_date"
                tickFormatter={(value) => FormatDate(value)}
                type="category"
                allowDuplicatedCategory={false}
              />
              <YAxis 
                type="number" 
                domain={calculateYAxisDomain(filteredProjects)}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip
                formatter={(value: number) => [`${formatCurrency(value)}`, "Value"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                data={filteredProjects} 
                dataKey="nilai" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={3} 
                name="Main Range"
              />
              {comparisons.map((comparison, index) => {
                const comparisonData = comparison.startDate && comparison.endDate
                  ? getProjectsInRange(comparison.startDate, comparison.endDate)
                  : [];
                return (
                  <Line
                    key={comparison.id}
                    type="monotone"
                    data={comparisonData}
                    dataKey="nilai"
                    stroke={comparison.color}
                    strokeWidth={3}
                    name={`Comparison ${index + 1}`}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Card className="border-l-4 border-l-[#8884d8] bg-[#f8f9fa]">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-8">
            <div>
              <div className="text-xs text-gray-500">Total Nilai</div>
              <div className="font-bold">{calculateStats(filteredProjects).totalNilai.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Date Range</div>
              <div className="font-bold">
                {filteredProjects.length > 0 ? (
                  `${FormatDate(filteredProjects[0].start_date)} - ${FormatDate(filteredProjects[filteredProjects.length - 1].start_date)}`
                ) : (
                  'No data'
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Costs</div>
              <div>
                <span className="font-bold">Rp. {calculateStats(filteredProjects).totalCost.toLocaleString()}</span>
                <span className="ml-2 text-xs text-gray-500">(estimated)</span>
              </div>
              <div className='mt-5'>
                <span>Breakdown:</span>
                 {Object.entries(calculateStats(filteredProjects).totalCostBreakdown).map(([key, value]) => (
                    <div key={key} className="text-gray-700">
                    <span> {key}: Rp. {value.toLocaleString()} </span>
                    </div>
                    ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Project Status</div>
              <div>
                {Object.entries(calculateStats(filteredProjects).projectStatusCount).map(([status, count]) => (
                  <div key={status} className="mt-2">
                    <span className={`badge ${getProjectStatusColor(status)}`}>{status}</span> x{count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {comparisons.map((comparison, index) => (
        <Card key={comparison.id} className="border-l-4 mb-4 animate-slideDown" style={{ borderLeftColor: comparison.color }}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sm:gap-0">
            <Button
                variant="subtle"
                color="white"
                bg="red"
                className="w-full sm:w-auto"
                onClick={() => handleRemoveComparison(comparison.id)}
            >
                Remove
            </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-8">
            <div>
                <div className="text-xs text-gray-500">Total Nilai</div>
                <div className="font-bold">
                {calculateStats(getProjectsInRange(comparison.startDate, comparison.endDate)).totalNilai.toLocaleString()}
                </div>
            </div>
            <div>
                <div className="text-xs text-gray-500">Date Range</div>
                <div className="flex flex-col sm:flex-row gap-2 items-center font-bold">
                <input
                    type="date"
                    value={comparison.startDate}
                    onChange={(e) => updateComparisonDates(comparison.id, 'startDate', e.target.value)}
                    className="border rounded p-1 w-full"
                />
                <span className="text-gray-500 hidden sm:block">-</span>
                <input
                    type="date"
                    value={comparison.endDate}
                    onChange={(e) => updateComparisonDates(comparison.id, 'endDate', e.target.value)}
                    className="border rounded p-1 w-full"
                />
                </div>
            </div>
            <div>
                <div className="text-xs text-gray-500">Total Costs</div>
                <div>
                <span className="font-bold">
                    Rp. {calculateStats(getProjectsInRange(comparison.startDate, comparison.endDate)).totalCost.toLocaleString()}
                </span>
                <span className="ml-2 text-xs text-gray-500">(estimated)</span>
                </div>
                <div className="mt-5">
                <span>Breakdown:</span>
                {Object.entries(calculateStats(getProjectsInRange(comparison.startDate, comparison.endDate)).totalCostBreakdown).map(([key, value]) => (
                    <div key={key} className="text-gray-700">
                    <span>{key}: Rp. {value.toLocaleString()}</span>
                    </div>
                ))}
                </div>
            </div>
            <div>
                <div className="text-xs text-gray-500">Project Status</div>
                <div>
                {Object.entries(calculateStats(getProjectsInRange(comparison.startDate, comparison.endDate)).projectStatusCount).map(([status, count]) => (
                    <div key={status} className="mt-2">
                    <span className={`badge ${getProjectStatusColor(status)}`}>{status}</span> x{count}
                    </div>
                ))}
                </div>
            </div>
            </div>
        </Card>
        ))}

        <Card
            onClick={handleAddComparison}
            className={`hover:bg-gray-200 transition-colors flex justify-center items-center p-5 animate-slideDown ${
                comparisons.length >= CHART_COLORS.length ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            style={{
                display: comparisons.length < CHART_COLORS.length ? "flex" : "flex"
            }}
        >
            <div className="text-center text-gray-600">
                <div className="text-2xl font-semibold mb-1">+</div>
                <div className="text-sm">Add Comparison</div>
            </div>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = () => {
    const dispatch = useDispatch();

    const [initialProject, setInitialProject] = useState<Project[]>([]);
    const [allProject, setAllProject] = useState<Project[]>([]);

    useEffect(() => {
        dispatch(setPageTitle('Dashboard'));
        fetchInitialProjects();
    }, [dispatch]);

    const fetchInitialProjects = async () => {
        const data = await getProjects();
        setInitialProject(data.projects);
        setAllProject(data.projects);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="max-md:hidden"></div>
                </div>
            </div>
            <div className="mt-5 panel p-3 border-0">
                <div className="">
                    <ProjectLineChart projects={allProject} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;