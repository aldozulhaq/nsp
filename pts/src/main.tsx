import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client'

// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

// Tailwind css
import './tailwind.css';

// i18n (needs to be bundled)
import './i18n';

// Router
import { RouterProvider } from 'react-router-dom';
import router from './router/index';

// Redux
import { Provider } from 'react-redux';
import store from './store/index';


import UserProvider from './contexts/UserContext'
import OppProvider from './contexts/oppContext'
import CostumerProvider from './contexts/CustomerContext'
import UsersProvider from './contexts/UsersContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Suspense>
            <Provider store={store}>
                <OppProvider>
                    <CostumerProvider>    
                        <UserProvider>
                            <UsersProvider>
                                <RouterProvider router={router} />
                            </UsersProvider>
                        </UserProvider>
                    </CostumerProvider>
                </OppProvider>
            </Provider>
        </Suspense>
    </React.StrictMode>
);

