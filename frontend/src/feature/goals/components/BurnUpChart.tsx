import { useMemo } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Goal } from '../types/Goal';
import type { Task } from '../../schedule/types/Task';
import { fmtHours } from '../../dashboard/utils/statsFormat';
import { fmtDay } from '../utils/goalProgress';
import { buildBurnUp, type BurnUpPoint } from '../utils/burnUp';

interface BurnUpChartProps {
    goal: Goal;
    records: Task[];
    today: string;
}

const AXIS_TICK = { fill: 'var(--color-secondary)', fontSize: 12 };
const PACE_COLOR = 'var(--color-secondary)';

// fmtHours takes minutes, the chart works in hours
const hours = (h: number) => fmtHours(h * 60);

interface BurnUpTooltipProps {
    active?: boolean;
    payload?: readonly { payload?: BurnUpPoint }[];
    color: string;
}

function BurnUpTooltip({ active, payload, color }: BurnUpTooltipProps) {
    const point = payload?.[0]?.payload;
    if (!active || !point) return null;
    return (
        <div className="bg-background rounded-xl px-3 py-2 text-sm shadow-lg flex flex-col gap-1 min-w-36">
            <span className="font-semibold">{fmtDay(point.date)}</span>
            <span className="flex items-center gap-2 text-secondary">
                <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                Logged <span className="ml-auto tabular-nums text-text-main">{point.logged != null ? hours(point.logged) : '–'}</span>
            </span>
            {point.expected != null && (
                <span className="flex items-center gap-2 text-secondary">
                    <span className="w-3 border-t-2 border-dashed border-secondary" />
                    Ideal <span className="ml-auto tabular-nums text-text-main">{hours(point.expected)}</span>
                </span>
            )}
        </div>
    );
}

export function BurnUpChart({ goal, records, today }: BurnUpChartProps) {
    const points = useMemo(() => buildBurnUp(goal, records, today), [goal, records, today]);
    const hasPace = goal.deadline != null;
    const target = goal.target_minutes / 60;
    const showToday = points.some(p => p.date === today) && points[points.length - 1].date !== today;
    // category colors are hex without "#"; goals without one use the progress tone
    const color = goal.categories ? `#${goal.categories.color}` : 'var(--color-progress)';

    return (
        <div className="flex flex-col gap-4">
            {hasPace && (
                <ul className="flex flex-wrap gap-x-6 gap-y-2 list-none text-sm text-secondary">
                    <li className="flex items-center gap-2">
                        <span className="w-4 h-0.5 rounded-full" style={{ backgroundColor: color }} />Logged
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-4 border-t-2 border-dashed border-secondary" />Ideal pace
                    </li>
                </ul>
            )}

            <div className="h-70 w-full">
                <ResponsiveContainer>
                    <ComposedChart data={points} margin={{ top: 20, right: 16, bottom: 0, left: 0 }}
                        accessibilityLayer>
                        <CartesianGrid vertical={false} stroke="var(--color-border)" />
                        <XAxis dataKey="date" tickFormatter={fmtDay} tick={AXIS_TICK} tickLine={false} axisLine={false}
                            interval="preserveStartEnd" minTickGap={40} tickMargin={8} />
                        {/* the target always fits, with some air above it for its label */}
                        <YAxis tickFormatter={(h: number) => `${h}h`} tick={AXIS_TICK} tickLine={false} axisLine={false}
                            width={44} allowDecimals={false} domain={[0, (max: number) => Math.ceil(Math.max(max, target) * 1.1)]} />

                        <ReferenceLine y={target} stroke="var(--color-text-main)" strokeOpacity={0.35}
                            label={{ value: `Target ${fmtHours(goal.target_minutes)}`, position: 'insideTopRight', fill: 'var(--color-text-main)', fontSize: 12, fontWeight: 600 }} />
                        {showToday && (
                            <ReferenceLine x={today} stroke="var(--color-secondary)" strokeOpacity={0.4}
                                label={{ value: 'Today', position: 'insideTopLeft', fill: 'var(--color-secondary)', fontSize: 11 }} />
                        )}

                        <Tooltip content={({ active, payload }) => <BurnUpTooltip active={active} payload={payload} color={color} />}
                            cursor={{ stroke: 'var(--color-text-main)', strokeOpacity: 0.5 }} />

                        {hasPace && (
                            <Line dataKey="expected" type="linear" stroke={PACE_COLOR} strokeWidth={1.5} strokeDasharray="4 4"
                                dot={false} activeDot={{ r: 4, fill: PACE_COLOR, stroke: 'var(--color-surface)', strokeWidth: 2 }} isAnimationActive={false} />
                        )}
                        <Area dataKey="logged" type="linear" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.1}
                            dot={false} activeDot={{ r: 5, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
