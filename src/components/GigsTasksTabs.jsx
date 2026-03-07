import { ClipboardList, ListChecks } from 'lucide-react';

export default function GigsTasksTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('gigs')}
        className={`flex items-center gap-2 px-6 py-3 font-mono text-sm uppercase tracking-wider rounded-t-lg transition-all border-b-2 ${
          activeTab === 'gigs'
            ? 'bg-white text-orange-600 border-orange-500 shadow-sm'
            : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
        }`}
      >
        <ClipboardList size={18} />
        Gigs
      </button>
      <button
        onClick={() => onTabChange('tasks')}
        className={`flex items-center gap-2 px-6 py-3 font-mono text-sm uppercase tracking-wider rounded-t-lg transition-all border-b-2 ${
          activeTab === 'tasks'
            ? 'bg-white text-blue-600 border-blue-500 shadow-sm'
            : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
        }`}
      >
        <ListChecks size={18} />
        Tasks
      </button>
    </div>
  );
}