import { getUsers } from "./actions";
import UserFilters from "./UserFilters";
import UserTable from "./UserTable";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    role?: string;
    profileType?: string;
  }>;
}) {
  const params = await searchParams;

  const result = await getUsers({
    page: parseInt(params.page || "1"),
    search: params.search,
    status: params.status,
    role: params.role,
    profileType: params.profileType,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">User Management</h1>
        <p className="mt-1 text-sm text-ink-500">
          Search, filter, and manage user accounts
        </p>
      </div>

      {/* Filters */}
      <UserFilters
        search={params.search || ""}
        status={params.status || "ALL"}
        role={params.role || "ALL"}
        profileType={params.profileType || "ALL"}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-sm text-ink-500">Total Users</div>
          <div className="text-2xl font-bold text-ink-900 mt-1">
            {result.pagination.totalCount}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-sm text-ink-500">Current Page</div>
          <div className="text-2xl font-bold text-ink-900 mt-1">
            {result.pagination.page} / {result.pagination.totalPages}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-sm text-ink-500">Per Page</div>
          <div className="text-2xl font-bold text-ink-900 mt-1">
            {result.pagination.limit}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="text-sm text-ink-500">Showing</div>
          <div className="text-2xl font-bold text-ink-900 mt-1">
            {result.users.length}
          </div>
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={result.users}
        pagination={result.pagination}
        currentPage={params.page || "1"}
      />
    </div>
  );
}
