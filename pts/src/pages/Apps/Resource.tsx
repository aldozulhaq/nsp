import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { DataTable } from 'mantine-datatable';
import { ActionIcon, Button, Modal, TextInput, NumberInput, SegmentedControl, Stack } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import Swal from 'sweetalert2';
import { setPageTitle } from '../../store/themeConfigSlice';
import { createResource, getAllResources, updateResource, deleteResource } from '../../controllers/MMMController';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import IconEdit from '../../components/Icon/IconEdit';
import IconTrash from '../../components/Icon/IconTrash';

type ResourceType = 'materials' | 'manpower' | 'machines';

const ResourceManagement = () => {
    const dispatch = useDispatch();

    // States
    const [resources, setResources] = useState([]);
    const [initialResources, setInitialResources] = useState([]);
    const [nameQuery, setNameQuery] = useState('');
    const [debouncedNameQuery] = useDebouncedValue(nameQuery, 200);
    const [currentResource, setCurrentResource] = useState<ResourceType>('materials');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedResource, setSelectedResource] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        unit_cost: 0,
        stock: 0,
    });

    // Fetch initial data
    useEffect(() => {
        dispatch(setPageTitle('Resource Management'));
        fetchResources();
    }, [dispatch, currentResource]);

    const fetchResources = async () => {
        try {
            const data = await getAllResources(currentResource);
            setInitialResources(data);
            setResources(data);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch resources', 'error');
        }
    };

    // Filter resources based on search
    useEffect(() => {
        setResources(
            initialResources.filter((resource: any) =>
                debouncedNameQuery === '' || resource.name.toLowerCase().includes(debouncedNameQuery.trim().toLowerCase())
            )
        );
    }, [debouncedNameQuery, initialResources]);

    // Modal handlers
    const openCreateModal = () => {
        setModalMode('create');
        setSelectedResource(null);
        setFormData({ name: '', unit_cost: 0, stock: 0 });
        setIsModalOpen(true);
    };

    const openEditModal = (resource: any) => {
        setModalMode('edit');
        setSelectedResource(resource);
        setFormData({ name: resource.name, unit_cost: resource.unit_cost, stock: resource.stock });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || formData.unit_cost <= 0 || formData.stock <= 0) {
            Swal.fire('Validation Error', 'Please fill all fields correctly', 'warning');
            return;
        }

        try {
            if (modalMode === 'create') {
                await createResource(currentResource, formData);
                Swal.fire('Created!', 'Resource added successfully', 'success');
            } else {
                await updateResource(currentResource, selectedResource._id, formData);
                Swal.fire('Updated!', 'Resource updated successfully', 'success');
            }
            setIsModalOpen(false);
            fetchResources();
        } catch (error) {
            Swal.fire('Error', 'Failed to save resource', 'error');
        }
    };

    const getResourceTitle = (resource: ResourceType) => {
        return resource.charAt(0).toUpperCase() + resource.slice(1);
    };

    const handleDelete = async (id: string) => {
        Swal.fire({
            title: 'Confirm Deletion',
            text: 'Are you sure you want to delete this item?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteResource(currentResource, id);
                    fetchResources();
                    Swal.fire('Deleted!', 'Resource has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete resource', 'error');
                }
            }
        });
    };

    // Table columns
    const columns = [
        {
            accessor: 'name',
            title: 'Name',
            filter: (
                <TextInput
                    label="Name"
                    description="Show resources whose names include the specified text"
                    placeholder="Search names..."
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
        },
        { accessor: 'stock', title: 'Stock', render: (data: any) => <span>{data.stock}</span> },
        { accessor: 'unit_cost', title: 'Unit Cost (Rp)', render: (data: any) => <span>{data.unit_cost.toLocaleString('id-ID')}</span> },
        { accessor: 'total_value', title: 'Total Value (Rp)', render: (data: any) => <span>{(data.stock * data.unit_cost).toLocaleString('id-ID')}</span> },
        {
            accessor: 'actions',
            title: 'Actions',
            render: (data: any) => (
                <div className="flex gap-2">
                    <ActionIcon onClick={() => openEditModal(data)} color="blue">
                        <IconEdit />
                    </ActionIcon>
                    <ActionIcon onClick={() => handleDelete(data._id)} color="red">
                        <IconTrash />
                    </ActionIcon>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Resource Management</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <Button onClick={openCreateModal} color="blue">
                        Add New {getResourceTitle(currentResource)}
                    </Button>
                    <SegmentedControl
                        value={currentResource}
                        onChange={(value: ResourceType) => setCurrentResource(value)}
                        data={[
                            { label: 'Materials', value: 'materials' },
                            { label: 'Manpower', value: 'manpower' },
                            { label: 'Machines', value: 'machines' },
                        ]}
                    />
                </div>
            </div>

            <div className="mt-5 panel p-0 border-0 overflow-hidden">
                <div className="table-responsive">
                    <div className="datatables">
                        <DataTable
                            className="whitespace-nowrap"
                            columns={columns}
                            records={resources}
                            idAccessor="_id"
                            highlightOnHover
                            striped
                            withColumnBorders
                        />
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? `Add New ${getResourceTitle(currentResource)}` : `Edit ${getResourceTitle(currentResource)}`}
            >
                <Stack>
                    <TextInput
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        error={formData.name === '' ? 'Name is required' : null}
                    />
                    <NumberInput
                        label="Stock"
                        value={formData.stock}
                        onChange={(value) => setFormData({ ...formData, stock: value || 0 })}
                        required
                        error={formData.stock <= 0 ? 'Stock must be greater than 0' : null}
                    />
                    <NumberInput
                        label="Unit Cost"
                        value={formData.unit_cost}
                        onChange={(value) => setFormData({ ...formData, unit_cost: value || 0 })}
                        required
                        error={formData.unit_cost <= 0 ? 'Unit cost must be greater than 0' : null}
                    />
                    <Button onClick={handleSubmit} color="blue">
                        {modalMode === 'create' ? 'Create' : 'Save Changes'}
                    </Button>
                </Stack>
            </Modal>
        </div>
    );
};

export default ResourceManagement;
