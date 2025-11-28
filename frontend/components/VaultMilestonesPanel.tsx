'use client';

interface Milestone {
  id: string;
  name: string;
  max: number;
  progress: number;
  reward: string;
}

export function VaultMilestonesPanel({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <h3 className="text-2xl font-bold mb-4">🏦 Vault Milestones</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((m) => (
          <div key={m.id} className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{m.name}</div>
              <div className="text-xs text-gray-400">{m.progress}/{m.max}</div>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded">
              <div
                className="h-2 bg-green-500 rounded"
                style={{ width: `${Math.min(100, Math.round((m.progress / m.max) * 100))}%` }}
              />
            </div>
            <div className="text-xs text-gray-300 mt-2">🎁 {m.reward}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
