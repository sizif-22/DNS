"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import { ArcDiagram } from "@/components/public/ArcDiagram";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ShieldCheck, ShieldAlert, Activity, GitCommit, Target, BarChart2 } from "lucide-react";

export default function PlayerPublicProfile() {
    const params = useParams();
    const playerId = params.playerId as Id<"users">;

    const user = useQuery(api.users.getUserById, { userId: playerId });
    const profile = useQuery(api.engineProfiles.getProfileByPlayerId, { playerId });

    if (user === undefined || profile === undefined) {
        return (
            <div className="min-h-screen bg-dns-bg text-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-dns-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-dns-bg text-white flex items-center justify-center">
                <p className="text-white/40">Player not found</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-dns-bg text-white p-8">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-white/60 mt-4">No engine profile data available for this player yet.</p>
            </div>
        );
    }

    const formatFeatureName = (str: string) => {
        return str.replace(/_/g, " ").replace("p90", "per 90").replace("pct", "%").replace("iqr", "variance");
    };

    const radarData = Object.entries(profile.coreFeatures || {}).map(([key, value]) => ({
        subject: formatFeatureName(key).substring(0, 15) + (key.length > 15 ? "..." : ""),
        fullMark: 100,
        val: value,
        originalName: formatFeatureName(key)
    }));

    return (
        <div className="min-h-screen bg-dns-bg text-white selection:bg-dns-blue/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-dns-blue/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-dns-green/5 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 lg:p-12 space-y-8">
                
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold uppercase tracking-widest text-dns-green">
                                {profile.unit}
                            </span>
                            {profile.matchCount >= 3 ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Reliable Data ({profile.matchCount} matches)
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400">
                                    <ShieldAlert className="w-3.5 h-3.5" /> Low Reliability ({profile.matchCount} matches)
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                            {profile.playerName}
                        </h1>
                        <p className="text-lg text-white/50 mt-2 font-medium">Scout Engine Profile Report</p>
                    </div>
                </div>

                {/* Top Section: Archetype Arc & Profile radar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Arc Diagram Card */}
                    <div className="bg-white/2 border border-white/4 rounded-2xl p-6 backdrop-blur-xl flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 self-start w-full relative z-10 mb-6 flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#A855F7]" /> Top Archetype
                        </h2>
                        
                        <div className="text-center relative z-10 mb-4">
                            <h3 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-dns-green bg-clip-text text-transparent">{profile.topArchetype}</h3>
                            <p className="text-sm text-white/50 mt-1">Primary playstyle match</p>
                        </div>
                        
                        <div className="w-full flex-1 relative z-10">
                            <ArcDiagram archetypes={profile.archetypes} />
                        </div>
                    </div>

                    {/* Radar Chart Card */}
                    <div className="bg-white/2 border border-white/4 rounded-2xl p-6 backdrop-blur-xl flex flex-col relative overflow-hidden group">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 w-full relative z-10 mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-dns-blue" /> Core Profile
                        </h2>
                        <div className="flex-1 w-full relative z-10 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                    <PolarGrid stroke="#ffffff15" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#ffffff60", fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                    <Radar
                                        name="Value"
                                        dataKey="val"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        fill="#3B82F6"
                                        fillOpacity={0.2}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0f0f13", borderColor: "#ffffff10", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}
                                        labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px", fontSize: "12px", textTransform: "capitalize" }}
                                        labelFormatter={(_, payload) => payload?.[0]?.payload?.originalName || ""}
                                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Context Features & Twins */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Context Features */}
                    <div className="lg:col-span-2 bg-white/2 border border-white/4 rounded-2xl p-6 backdrop-blur-xl">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-dns-green" /> Contextual Metrics
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(profile.contextFeatures || {}).map(([key, value]) => (
                                <div key={key} className="bg-black/30 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                                    <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2 line-clamp-1" title={formatFeatureName(key)}>
                                        {formatFeatureName(key)}
                                    </p>
                                    <p className="text-xl font-bold text-white">
                                        {String(value)}
                                        {key.includes('pct') ? <span className="text-xs text-white/30 ml-1">%</span> : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Statistical Twins */}
                    <div className="bg-white/2 border border-white/4 rounded-2xl p-6 backdrop-blur-xl">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                            <GitCommit className="w-4 h-4 text-[#F59E0B]" /> Statistical Twins
                        </h2>
                        <div className="space-y-3">
                            {profile.twins?.map((twin: { player_name: string; similarity: number; context: unknown }, i: number) => {
                                const nameMatch = twin.player_name.match(/(.+) \[(\d{4})\/(\d{4})\]/);
                                const displayName = nameMatch ? `${nameMatch[1]} (${nameMatch[2]}/${nameMatch[3].slice(2)})` : twin.player_name;
                                
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-linear-to-r from-white/3 to-transparent border border-white/3 hover:border-white/10 transition-colors group">
                                        <div>
                                            <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{displayName}</p>
                                            <div className="w-32 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full bg-linear-to-r from-amber-500/50 to-amber-400" 
                                                    style={{ width: `${twin.similarity}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-white/40 mb-0.5">Similarity</p>
                                            <p className="text-sm font-bold text-amber-400">{twin.similarity}%</p>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {(!profile.twins || profile.twins.length === 0) && (
                                <p className="text-sm text-white/40 text-center py-4">No twins found</p>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
