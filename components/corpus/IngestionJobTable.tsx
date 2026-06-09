"use client";

type Job = {
  id: string;
  job_type: string;
  status: string;
  target_type?: string;
  target_id?: string;
  source_path?: string;
  result?: Record<string, unknown>;
  created_at: string;
};

export function IngestionJobTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="glass rounded-lg p-5">
      <h2 className="text-lg font-semibold">导入与向量任务</h2>
      <div className="mt-4 max-h-80 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-2">类型</th>
              <th className="pb-2">状态</th>
              <th className="pb-2">目标</th>
              <th className="pb-2">结果</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-white/10">
                <td className="py-2">{job.job_type}</td>
                <td className="py-2 text-cyanline">{job.status}</td>
                <td className="py-2 text-slate-300">{job.target_type || job.source_path || "-"}</td>
                <td className="py-2 text-slate-400">{job.result ? JSON.stringify(job.result).slice(0, 90) : "-"}</td>
              </tr>
            ))}
            {!jobs.length && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  暂无任务
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
