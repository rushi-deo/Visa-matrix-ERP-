import { Briefcase } from "lucide-react";

export default function HR() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage employee records, payroll, and HR operations
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4">
          <Briefcase className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* HR Stats Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total Employees</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          <p className="mt-2 text-xs text-gray-500">Data not yet loaded</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">New Hires (30d)</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          <p className="mt-2 text-xs text-gray-500">Data not yet loaded</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Open Positions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          <p className="mt-2 text-xs text-gray-500">Data not yet loaded</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          <p className="mt-2 text-xs text-gray-500">Data not yet loaded</p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            HR Module Coming Soon
          </h2>
          <p className="mt-2 text-gray-600">
            This section will include employee management, payroll processing,
            and HR analytics.
          </p>
          <div className="mt-6 space-y-2 text-left">
            <p className="text-sm font-medium text-gray-700">
              Features in development:
            </p>
            <ul className="ml-4 space-y-1 text-sm text-gray-600">
              <li>• Employee Directory</li>
              <li>• Payroll Management</li>
              <li>• Performance Reviews</li>
              <li>• Leave Management</li>
              <li>• Recruitment Tracking</li>
              <li>• HR Analytics & Reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
