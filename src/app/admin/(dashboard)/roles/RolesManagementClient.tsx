"use client";

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ShieldCheck, Users, Shield, Download, AlertTriangle } from 'lucide-react';
import { createRole, updateRole, deleteRole, toggleRoleStatus } from './actions';
import DataManagementToolbar from '@/components/admin/DataManagementToolbar';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

type Role = {
  id: string;
  name: string;
  isActive: boolean;
  userCount: number;
  createdAt: string | null;
};

export default function RolesManagementClient({ initialRoles }: { initialRoles: Role[] }) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setError("");
    setIsModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!roleName.trim()) return;
    setIsSaving(true);
    setError("");

    if (editingRole) {
      const res = await updateRole(editingRole.id, roleName.trim());
      if (res.success) {
        setRoles(roles.map(r => r.id === editingRole.id ? { ...r, name: roleName.trim() } : r));
        setIsModalOpen(false);
      } else {
        setError(res.error || "Something went wrong.");
      }
    } else {
      const res = await createRole(roleName.trim());
      if (res.success) {
        setRoles([...roles, { id: res.id!, name: roleName.trim(), isActive: true, userCount: 0, createdAt: new Date().toISOString() }]);
        setIsModalOpen(false);
      } else {
        setError(res.error || "Something went wrong.");
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (role: Role) => {
    if (role.userCount > 0) {
      alert(`Cannot delete "${role.name}" — ${role.userCount} user(s) are assigned. Deactivate it instead.`);
      return;
    }
    if (!confirm(`Delete role "${role.name}"? This action cannot be undone.`)) return;
    const res = await deleteRole(role.id);
    if (res.success) {
      setRoles(roles.filter(r => r.id !== role.id));
    } else {
      alert(res.error);
    }
  };

  const handleToggle = async (role: Role) => {
    const res = await toggleRoleStatus(role.id, role.isActive);
    if (res.success) {
      setRoles(roles.map(r => r.id === role.id ? { ...r, isActive: !r.isActive } : r));
    } else {
      alert(res.error);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const data = roles.map(r => ({ id: r.id, name: r.name, status: r.isActive ? 'Active' : 'Inactive', users: r.userCount }));
    const fname = `roles_${Date.now()}.${format}`;
    const content = format === 'json'
      ? "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
      : "data:text/csv;charset=utf-8," + encodeURIComponent(['ID,Name,Status,Users', ...data.map(r => `"${r.id}","${r.name}","${r.status}","${r.users}"`)].join('\n'));
    const el = document.createElement('a');
    el.setAttribute("href", content);
    el.setAttribute("download", fname);
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Roles Management</h1>
          <p className="text-sm text-slate-500 font-medium">Create and manage user access roles across the platform core.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Role</span>
        </button>
      </div>

      {/* Toolbar */}
      <DataManagementToolbar
        onSearch={setSearchQuery}
        onFilterChange={() => {}}
        filterOptions={[]}
        onExport={handleExport as any}
        onImport={() => alert("Role import pending.")}
        dataCount={filteredRoles.length}
        itemName="roles"
      />

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Role Identity</th>
                <th className="px-6 py-4 text-center">Assigned Users</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRoles.map((role) => (
                <tr key={role.id} className={cn(
                  "transition-colors group",
                  role.isActive ? "hover:bg-slate-50 dark:hover:bg-slate-800/40" : "opacity-60 bg-slate-50/30 dark:bg-slate-900/10"
                )}>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center border transition-all",
                        role.isActive
                          ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      )}>
                        <ShieldCheck className={cn("h-5 w-5", role.isActive ? "text-blue-600" : "text-slate-400")} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-[13px]">{role.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Role ID: {role.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{role.userCount}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleToggle(role)}
                        className={cn(
                          "relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          role.isActive ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          role.isActive ? "translate-x-5" : "translate-x-0"
                        )} />
                      </button>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider mt-1.5 transition-colors",
                        role.isActive ? "text-green-600" : "text-slate-400"
                      )}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEdit(role)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        title="Edit Role"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
                        disabled={role.userCount > 0}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          role.userCount > 0
                            ? "text-slate-200 dark:text-slate-800 cursor-not-allowed opacity-30"
                            : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        )}
                        title={role.userCount > 0 ? "Cannot delete: Users assigned" : "Delete Role"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRoles.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">No Roles Matched</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusted your search or add a new role.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingRole ? 'Edit Role' : 'Add New Role'}
                  </h2>
                  <p className="text-xs text-slate-500">Role name must be unique across the platform.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Role Name</label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors text-sm font-medium"
                    placeholder="e.g. Super Admin, Editor, Moderator..."
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    autoFocus
                  />
                </div>
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!roleName.trim() || isSaving}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSaving ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
