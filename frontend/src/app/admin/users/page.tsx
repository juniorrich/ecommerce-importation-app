'use client';

import { useEffect, useState } from 'react';
import { getUsers, updateUser } from '@/lib/api';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<(User & { isActive?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getUsers()
      .then((res) => setUsers(res.data.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (targetUser: User, newRole: 'customer' | 'admin') => {
    if (targetUser.id === user?.id) {
      toast.error('You cannot change your own role');
      return;
    }
    try {
      await updateUser(targetUser.id, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)));
      toast.success(`Role updated to ${newRole}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update role');
    }
  };

  const toggleActive = async (u: User & { isActive?: boolean }) => {
    if (u.id === user?.id) {
      toast.error('You cannot deactivate yourself');
      return;
    }
    const newStatus = u.isActive === false ? true : false;
    try {
      await updateUser(u.id, { isActive: newStatus });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, isActive: newStatus } : x)));
      toast.success(newStatus ? 'Account activated' : 'Account deactivated');
    } catch {
      toast.error('Could not update account');
    }
  };

  return (
    <div className="px-6 py-10">
      <AdminPageHeader title="Customers" />

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-espresso-700">
            <table className="w-full text-sm">
              <thead className="border-b border-espresso-700 bg-espresso-950">
                <tr className="text-left text-sand-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === user?.id;
                  return (
                    <tr key={u.id} className="border-b border-espresso-700 last:border-0">
                      <td className="px-4 py-3 text-ivory-200">
                        {u.name}
                        {isSelf && <span className="ml-2 text-xs text-sand-500">(you)</span>}
                      </td>
                      <td className="px-4 py-3 text-sand-400">{u.email}</td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <Badge tone="gold">{u.role}</Badge>
                        ) : (
                          <Select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value as 'customer' | 'admin')}
                            className="w-32 py-1.5 text-xs"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </Select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={u.isActive !== false ? 'harbor' : 'danger'}>
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {!isSelf && (
                          <button
                            onClick={() => toggleActive(u)}
                            className="text-sm text-sand-400 hover:text-gold-400"
                          >
                            {u.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="py-12 text-center text-sm text-sand-500">No customers yet</p>
            )}
          </div>

          <div className="mt-6 rounded border border-gold-600/40 bg-espresso-800 p-4 text-sm text-sand-400">
            <p className="text-ivory-200">Permission notes</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Only admins can reach /admin routes and admin-only endpoints</li>
              <li>You can't change your own role or deactivate yourself</li>
              <li>Customers who try to open admin routes see a restricted-area message</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
