import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../../app/AppContext";
import { getApiErrorMessage } from "../../lib/api";
import { getProjectSummary, type ProjectSummaryResponse } from "../../api/dashboard";
import { cn } from "../../lib/cn";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "../../components/ui/Skeleton";

export function DashboardPage() {
  const { selection } = useAppContext();
  const [data, setData] = useState<ProjectSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selection.workspace || !selection.project) return;
    setLoading(true);
    getProjectSummary(selection.workspace.id, selection.project.id)
      .then((d) => setData(d))
      .catch((e) => toast.error(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selection.workspace, selection.project]);

  const completion = useMemo(() => {
    if (!data) return 0;
    if (!data.totalTasks) return 0;
    return Math.round((data.doneTasks / data.totalTasks) * 100);
  }, [data]);

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      <motion.div className="text-left" variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
        <div className="text-xl font-semibold text-white">Dashboard</div>
        <div className="text-sm text-white/60">Progress, signals, and momentum</div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Total tasks" value={String(data?.totalTasks ?? 0)} loading={loading} />
        <Card title="Done" value={String(data?.doneTasks ?? 0)} loading={loading} />
        <Card title="Completion" value={`${completion}%`} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Panel title="Progress Overview (Burn-up)" className="h-full">
            {loading ? (
              <Skeleton className="h-[300px] w-full mt-4 rounded-xl" />
            ) : data?.progressChart && data.progressChart.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.progressChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#ffffff30" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff30" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1C1E24", borderColor: "#ffffff10", borderRadius: "8px", color: "#fff", fontSize: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <Area type="monotone" dataKey="total" name="Total Tasks" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="done" name="Completed Tasks" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorDone)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-white/60">No progress data available</div>
            )}
          </Panel>
        </div>
        
        <div className="flex flex-col gap-4 lg:col-span-1">
          <Panel title="By status" className="flex-1">
            <KeyValueGrid map={data?.tasksByStatus ?? {}} loading={loading} emptyLabel="No data" />
          </Panel>
          <Panel title="By priority" className="flex-1">
            <KeyValueGrid map={data?.tasksByPriority ?? {}} loading={loading} emptyLabel="No data" />
          </Panel>
        </div>
      </div>

    </motion.div>
  );
}

function Card({ title, value, loading }: { title: string; value: string; loading?: boolean }) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="rounded-2xl border border-white/5 bg-[#16181D] p-5 shadow-sm"
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-white/40">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">
        {loading ? <Skeleton className="h-8 w-16" /> : value}
      </div>
    </motion.div>
  );
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className={cn("rounded-2xl border border-white/5 bg-[#16181D] p-5 shadow-sm", className)}
    >
      <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">{title}</div>
      {children}
    </motion.div>
  );
}

function KeyValueGrid({ map, emptyLabel, loading }: { map: Record<string, number>; emptyLabel: string; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-[68px] rounded-2xl" />
        <Skeleton className="h-[68px] rounded-2xl" />
        <Skeleton className="h-[68px] rounded-2xl" />
        <Skeleton className="h-[68px] rounded-2xl" />
      </div>
    );
  }

  const entries = Object.entries(map ?? {});
  if (!entries.length) return <div className="text-sm text-white/60">{emptyLabel}</div>;
  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(([k, v]) => (
        <motion.div 
          key={k} 
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
          className={cn("rounded-xl border border-white/5 bg-[#1A1C20] p-3 transition-colors")}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{k.replaceAll("_", " ")}</div>
          <div className="mt-1 text-lg font-semibold text-white/90">{v}</div>
        </motion.div>
      ))}
    </div>
  );
}

