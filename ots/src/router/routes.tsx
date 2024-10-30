import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
const Index = lazy(() => import('../pages/Apps/Dashboard'));
const NotFound = lazy(() => import('../pages/Apps/404'));
const CustomerTable = lazy(() => import('../pages/Apps/CustomerTable'))
const UserTable = lazy(() => import('../pages/Apps/UsersTable'))
const Archives = lazy(() => import('../pages/Apps/Archives'))
const Handover = lazy(() => import('../pages/Apps/Handover'))
const Tabs = lazy(() => import('../pages/Components/Tabs'));
const Accordians = lazy(() => import('../pages/Components/Accordians'));
const Modals = lazy(() => import('../pages/Components/Modals'));
const Cards = lazy(() => import('../pages/Components/Cards'));
const Carousel = lazy(() => import('../pages/Components/Carousel'));
const Countdown = lazy(() => import('../pages/Components/Countdown'));
const Counter = lazy(() => import('../pages/Components/Counter'));
const SweetAlert = lazy(() => import('../pages/Components/SweetAlert'));
const Timeline = lazy(() => import('../pages/Components/Timeline'));
const Notification = lazy(() => import('../pages/Components/Notification'));
const MediaObject = lazy(() => import('../pages/Components/MediaObject'));
const ListGroup = lazy(() => import('../pages/Components/ListGroup'));
const PricingTable = lazy(() => import('../pages/Components/PricingTable'));
const LightBox = lazy(() => import('../pages/Components/LightBox'));
const Alerts = lazy(() => import('../pages/Elements/Alerts'));
const Avatar = lazy(() => import('../pages/Elements/Avatar'));
const Badges = lazy(() => import('../pages/Elements/Badges'));
const Breadcrumbs = lazy(() => import('../pages/Elements/Breadcrumbs'));
const Buttons = lazy(() => import('../pages/Elements/Buttons'));
const Buttongroups = lazy(() => import('../pages/Elements/Buttongroups'));
const Colorlibrary = lazy(() => import('../pages/Elements/Colorlibrary'));
const DropdownPage = lazy(() => import('../pages/Elements/DropdownPage'));
const Infobox = lazy(() => import('../pages/Elements/Infobox'));
const Jumbotron = lazy(() => import('../pages/Elements/Jumbotron'));
const Loader = lazy(() => import('../pages/Elements/Loader'));
const Pagination = lazy(() => import('../pages/Elements/Pagination'));
const Popovers = lazy(() => import('../pages/Elements/Popovers'));
const Progressbar = lazy(() => import('../pages/Elements/Progressbar'));
const Tooltip = lazy(() => import('../pages/Elements/Tooltip'));
const Treeview = lazy(() => import('../pages/Elements/Treeview'));
const Typography = lazy(() => import('../pages/Elements/Typography'));
const Tables = lazy(() => import('../pages/Tables'));
const Basic = lazy(() => import('../pages/DataTables/Basic'));
const Advanced = lazy(() => import('../pages/DataTables/Advanced'));
const Skin = lazy(() => import('../pages/DataTables/Skin'));
const OrderSorting = lazy(() => import('../pages/DataTables/OrderSorting'));
const MultiColumn = lazy(() => import('../pages/DataTables/MultiColumn'));
const MultipleTables = lazy(() => import('../pages/DataTables/MultipleTables'));
const AltPagination = lazy(() => import('../pages/DataTables/AltPagination'));
const Checkbox = lazy(() => import('../pages/DataTables/Checkbox'));
const RangeSearch = lazy(() => import('../pages/DataTables/RangeSearch'));
const Export = lazy(() => import('../pages/DataTables/Export'));
const ColumnChooser = lazy(() => import('../pages/DataTables/ColumnChooser'));
const Profile = lazy(() => import('../pages/Users/Profile'));
const AccountSetting = lazy(() => import('../pages/Users/AccountSetting'));
const LoginBoxed = lazy(() => import('../pages/Authentication/LoginBoxed'));
const Error = lazy(() => import('../components/Error'));
const FormBasic = lazy(() => import('../pages/Forms/Basic'));
const FormInputGroup = lazy(() => import('../pages/Forms/InputGroup'));
const FormLayouts = lazy(() => import('../pages/Forms/Layouts'));
const Validation = lazy(() => import('../pages/Forms/Validation'));
const InputMask = lazy(() => import('../pages/Forms/InputMask'));
const Select2 = lazy(() => import('../pages/Forms/Select2'));
const Touchspin = lazy(() => import('../pages/Forms/TouchSpin'));
const CheckBoxRadio = lazy(() => import('../pages/Forms/CheckboxRadio'));
const Switches = lazy(() => import('../pages/Forms/Switches'));
const Wizards = lazy(() => import('../pages/Forms/Wizards'));
const FileUploadPreview = lazy(() => import('../pages/Forms/FileUploadPreview'));
const QuillEditor = lazy(() => import('../pages/Forms/QuillEditor'));
const MarkDownEditor = lazy(() => import('../pages/Forms/MarkDownEditor'));
const DateRangePicker = lazy(() => import('../pages/Forms/DateRangePicker'));
const Clipboard = lazy(() => import('../pages/Forms/Clipboard'));

const checkUserAuthentication = () => {
    return localStorage.getItem("token")?true:false
}

function CheckUserRolePermission(role:string) {
    const uRole = localStorage.getItem("role")
    // if admin or dev or role is same as user role
    if(uRole == "admin_ots" || uRole == "admin" || uRole == role || uRole == "dev") {
        return true
    } else
    return false
}

function PrivateRouteOTS({ children }:any) {
    const isAuthenticated = checkUserAuthentication();
    return isAuthenticated && CheckUserRolePermission("user_ots") ? children : <Navigate to="/login" />;
}

function PrivateRoute({ children }:any) {
    const isAuthenticated = checkUserAuthentication();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }:any) {
    const isAuthenticated = checkUserAuthentication();
    return isAuthenticated && CheckUserRolePermission("") ? children : <Navigate to="/login" />;
}

function PublicRoute({children}:any) {
    const isAuthenticated = checkUserAuthentication();
    return !isAuthenticated ? children : <Navigate to="/" />;
}

const routes = [
    // dashboard
    {
        path: '/',
        element: 
        <PrivateRouteOTS>
            <Index />
        </PrivateRouteOTS>,
    },
    {
        path: '/Customers',
        element:
        <PrivateRouteOTS>
            <CustomerTable />
        </PrivateRouteOTS>
    },
    {
        path: '/Users',
        element:
        <AdminRoute>
            <UserTable />
        </AdminRoute>
    },
    {
        path: '/Archives',
        element:
        <PrivateRouteOTS>
            <Archives />
        </PrivateRouteOTS>
    },
    {
        path: '/Handover',
        element:
        <PrivateRouteOTS>
            <Handover />
        </PrivateRouteOTS>
    },
    // Users page
    {
        path: '/users/profile',
        element: 
        <PrivateRouteOTS>
            <Profile />
        </PrivateRouteOTS>,
    },
    //Authentication
    {
        path: '/login',
        element: 
        <PublicRoute>
            <LoginBoxed />
        </PublicRoute>,
        layout: 'blank',
    },
    //404
    {
        path: '*',
        element: 
            <NotFound />,
        layout: 'blank',
    },
];

export { routes };
