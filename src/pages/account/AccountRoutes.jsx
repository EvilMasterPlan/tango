import { Navigate, Route, Routes } from 'react-router-dom';
import StartPage from '@/pages/account/Start/Page';
import LoginPage from '@/pages/account/Login/Page';
import SignupPage from '@/pages/account/Signup/Page';
import VerifyPage from '@/pages/account/Verify/Page';
import ResetRequestPage from '@/pages/account/Reset/Request/Page';
import ResetConfirmPage from '@/pages/account/Reset/Confirm/Page';
import RampartPage from '@/pages/account/Rampart/Page';

function AccountRoutes() {
  return (
    <Routes>
      <Route path="start" element={<StartPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="verify" element={<VerifyPage />} />
      <Route path="reset/request" element={<ResetRequestPage />} />
      <Route path="reset/confirm" element={<ResetConfirmPage />} />
      <Route path="rampart" element={<RampartPage />} />
      <Route path="*" element={<Navigate to="/account/start" replace />} />
    </Routes>
  );
}

export default AccountRoutes;
