import { getPlatformUsers } from "./actions";
import UserManagementClient from "./UserManagementClient";

export default async function UsersPage() {
  const res = await getPlatformUsers();
  const initialUsers = res.success ? res.data : [];

  return (
    <div className="container mx-auto py-6">
      <UserManagementClient initialUsers={initialUsers as any} />
    </div>
  );
}
