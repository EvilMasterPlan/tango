// Mirrors the backend's tango/admin.js ADMIN_ROLE — purely a client-side
// gate (see RequireAdmin) so a signed-in non-admin gets bounced back to
// /home instead of ever rendering the admin hub. Not the actual security
// boundary: any admin-only endpoint the hub calls re-checks this itself
// server-side (verifyAdminRole), same as RequireAuth's own client-side
// login gate never being the thing that actually protects an API route.
export function isAdmin(user) {
  return Boolean(user?.roles?.includes('admin'));
}
