import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';

import SuspenseLoader from 'src/components/SuspenseLoader';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Pages

const Overview = Loader(lazy(() => import('../content/overview')));

// Status

const Status404 = Loader(
  lazy(() => import('../content/pages/Status/Status404'))
);
const Status500 = Loader(
  lazy(() => import('../content/pages/Status/Status500'))
);
const StatusComingSoon = Loader(
  lazy(() => import('../content/pages/Status/ComingSoon'))
);
const StatusMaintenance = Loader(
  lazy(() => import('../content/pages/Status/Maintenance'))
);
const PrivacyPolicy = Loader(lazy(() => import('../content/privacyPolicy')));
const baseRoutes = [
  {
    path: '/',
    element: <Overview />
  },
  {
    path: 'privacy-policy',
    element: <PrivacyPolicy />
  },
  {
    path: 'overview',
    element: <Navigate to="/" replace />
  },
  {
    path: '*',
    element: <Status404 />
  },
  {
    path: 'status',
    children: [
      {
        path: '500',
        element: <Status500 />
      },
      {
        path: 'maintenance',
        element: <StatusMaintenance />
      },
      {
        path: 'coming-soon',
        element: <StatusComingSoon />
      }
    ]
  },
  {
    path: '*',
    element: <Status404 />
  }
];

export default baseRoutes;
