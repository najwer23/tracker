import { RouterProvider, createHashRouter } from 'react-router-dom';
import { ScrollToTop } from './ScrollToTop';
import { Home } from '../pages/home/Home';

export const router = createHashRouter([
  {
    path: '/',
    element: (
      <>
        <ScrollToTop />
        <Home />
        {/* <ScrollRestoration /> */}
      </>
    ),
  },
]);

export const RouterHash = () => <RouterProvider router={router} />;
