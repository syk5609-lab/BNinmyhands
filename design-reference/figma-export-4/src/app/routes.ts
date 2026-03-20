import { createBrowserRouter } from 'react-router';
import { Dashboard } from './pages/Dashboard';
import { CoinDetail } from './pages/CoinDetail';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Account } from './pages/Account';
import { Community } from './pages/Community';
import { Admin } from './pages/Admin';

export const router = createBrowserRouter([
  { path: '/', Component: Dashboard },
  { path: '/coin/:symbol', Component: CoinDetail },
  { path: '/login', Component: Login },
  { path: '/signup', Component: Signup },
  { path: '/account', Component: Account },
  { path: '/community', Component: Community },
  { path: '/admin', Component: Admin },
]);
