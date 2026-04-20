import prisma from "@/lib/prisma";
import RolesManagementClient from "./RolesManagementClient";

export default async function RolesPage() {
  const rolesRaw = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { users: true } }
    }
  });

  const roles = rolesRaw.map(r => ({
    id: r.id.toString(),
    name: r.name,
    isActive: (r as any).isActive ?? true,
    userCount: (r as any)._count.users,
    createdAt: r.createdAt?.toISOString() ?? null,
  }));

  return (
    <div className="animate-in fade-in duration-700">
      <RolesManagementClient initialRoles={roles} />
    </div>
  );
}
