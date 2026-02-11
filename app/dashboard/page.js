import { Suspense } from 'react';
import DashboardContent from './DashboardContent';

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="text-gray-900 dark:text-white text-xl">Loading dashboard...</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
