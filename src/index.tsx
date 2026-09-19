import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components';
import { AppErrorBoundary, AppLoader } from '@/components';
import { persistor, store } from '@/redux';
import { AppRouter } from '@/router';
import { lightTheme } from '@/styled';
import '@/translations/i18n';
import 'react-toastify/dist/ReactToastify.css';
import '@/assets/css/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <ThemeProvider theme={lightTheme}>
      <PersistGate loading={<AppLoader />} persistor={persistor}>
        <AppErrorBoundary>
          <Suspense fallback={<AppLoader />}>
            <AppRouter />
          </Suspense>
        </AppErrorBoundary>
      </PersistGate>
    </ThemeProvider>
  </Provider>
);
