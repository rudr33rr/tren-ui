'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart'
import type { ExerciseTrackingType, ExerciseWeightType } from '@/types/exercise.types'

export type SessionPoint = {
	date: string
	maxWeight?: number
	totalVolume?: number
	maxReps?: number
	maxDuration?: number
	avgIntensity?: number
}

type Props = {
	trackingType: ExerciseTrackingType
	weightType: ExerciseWeightType
	history: SessionPoint[]
}

const weightConfig = {
	maxWeight: { label: 'Max weight (kg)', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

const volumeConfig = {
	totalVolume: { label: 'Volume (kg)', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

const repsConfig = {
	maxReps: { label: 'Max reps', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

const durationConfig = {
	maxDuration: { label: 'Duration', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

function formatDuration(sec: number) {
	const m = Math.floor(sec / 60)
	const s = sec % 60
	return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function intensityColor(value: number) {
	if (value <= 3) return 'oklch(0.72 0.17 145)'
	if (value <= 6) return 'oklch(0.78 0.17 95)'
	if (value <= 8) return 'oklch(0.6 0.22 20)'
	return 'oklch(0.5 0.22 15)'
}

function intensityLabel(value: number) {
	if (value <= 3) return 'Easy'
	if (value <= 6) return 'Moderate'
	if (value <= 8) return 'Hard'
	return 'Max effort'
}

function IntensityGauge({ value }: { value: number }) {
	const r = 58
	const cx = 88
	const cy = 76
	const arcLength = Math.PI * r
	const filled = Math.min(value / 10, 1) * arcLength
	const color = intensityColor(value)

	return (
		<div className='flex flex-col rounded-lg border p-4'>
			<p className='text-xs opacity-55'>Avg intensity</p>
			<div className='flex flex-1 flex-col items-center justify-center pt-1'>
				<svg viewBox='0 0 176 100' className='w-full'>
					<path
						d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
						fill='none'
						stroke='currentColor'
						strokeOpacity={0.1}
						strokeWidth={11}
						strokeLinecap='round'
					/>
					<path
						d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
						fill='none'
						stroke={color}
						strokeWidth={11}
						strokeLinecap='round'
						strokeDasharray={`${filled} ${arcLength}`}
					/>
					<text
						x={cx}
						y={cy - 9}
						textAnchor='middle'
						dominantBaseline='auto'
						fontSize={24}
						fontWeight={700}
						fill='currentColor'
					>
						{value.toFixed(1)}
					</text>
					<text
						x={cx}
						y={cy + 1}
						textAnchor='middle'
						dominantBaseline='hanging'
						fontSize={10}
						fill='currentColor'
						opacity={0.45}
					>
						/ 10 RPE
					</text>
				</svg>
				<p className='text-[11px] font-semibold' style={{ color }}>
					{intensityLabel(value)}
				</p>
			</div>
		</div>
	)
}

function StatTile({
	value,
	label,
	small,
}: {
	value: string | number
	label: string
	small?: boolean
}) {
	return (
		<div className='flex flex-col items-center justify-center rounded-lg border p-4 text-center'>
			<p
				className={
					small
						? 'text-sm font-semibold leading-tight'
						: 'text-2xl font-semibold tabular-nums'
				}
			>
				{value}
			</p>
			<p className='mt-1 text-xs opacity-55'>{label}</p>
		</div>
	)
}

function StatChart({
	title,
	config,
	data,
	dataKey,
	yTickFormatter,
}: {
	title: string
	config: ChartConfig
	data: SessionPoint[]
	dataKey: keyof SessionPoint
	yTickFormatter?: (value: number) => string
}) {
	const color = `var(--color-${dataKey})`

	return (
		<section className='rounded-lg border p-4'>
			<h3 className='mb-3 text-sm font-medium opacity-70'>{title}</h3>
			<ChartContainer config={config} className='h-[240px] w-full'>
				<AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
					<defs>
						<linearGradient id={`fill-${dataKey}`} x1='0' y1='0' x2='0' y2='1'>
							<stop offset='0%' stopColor={color} stopOpacity={0.25} />
							<stop offset='100%' stopColor={color} stopOpacity={0.02} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray='3 3' vertical={false} />
					<XAxis
						dataKey='date'
						tick={{ fontSize: 11 }}
						tickLine={false}
						axisLine={false}
						interval='preserveStartEnd'
					/>
					<YAxis
						width={yTickFormatter ? 52 : 40}
						tick={{ fontSize: 11 }}
						tickLine={false}
						axisLine={false}
						tickFormatter={yTickFormatter}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<Area
						type='monotone'
						dataKey={dataKey as string}
						stroke={color}
						strokeWidth={2}
						fill={`url(#fill-${dataKey})`}
						dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
						activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
					/>
				</AreaChart>
			</ChartContainer>
		</section>
	)
}

export function ExerciseStats({ trackingType, weightType, history }: Props) {
	if (history.length === 0) {
		return (
			<p className='text-sm opacity-60'>
				No sessions recorded yet. Complete a workout with this exercise to see your stats.
			</p>
		)
	}

	const isWeighted = weightType === 'weighted'
	const isReps = trackingType === 'reps'

	const lastDate = history[history.length - 1]?.date

	const pr =
		isWeighted && isReps
			? Math.max(...history.map(h => h.maxWeight ?? 0))
			: isReps
				? Math.max(...history.map(h => h.maxReps ?? 0))
				: Math.max(...history.map(h => h.maxDuration ?? 0))

	const prLabel =
		isWeighted && isReps ? `${pr} kg` : isReps ? `${pr}` : formatDuration(pr)

	const prDescription =
		isWeighted && isReps ? 'PR (weight)' : isReps ? 'PR (reps)' : 'PR (duration)'

	const intensitySessions = history.filter(h => h.avgIntensity != null)
	const avgRPE =
		intensitySessions.length > 0
			? intensitySessions.reduce((sum, h) => sum + (h.avgIntensity ?? 0), 0) /
				intensitySessions.length
			: null

	return (
		<div className='space-y-4'>
			{avgRPE != null ? (
				<div className='grid grid-cols-2 gap-3'>
					<div className='flex h-full flex-col gap-3'>
						<div className='grid grid-cols-2 gap-3'>
							<StatTile value={history.length} label='Sessions' />
							<StatTile value={prLabel} label={prDescription} />
						</div>
						<div className='flex flex-1 flex-col items-center justify-center rounded-lg border p-4 text-center'>
							<p className='text-sm font-semibold leading-tight'>{lastDate ?? '—'}</p>
							<p className='mt-1 text-xs opacity-55'>Last session</p>
						</div>
					</div>
					<IntensityGauge value={avgRPE} />
				</div>
			) : (
				<div className='grid grid-cols-3 gap-3'>
					<StatTile value={history.length} label='Sessions' />
					<StatTile value={prLabel} label={prDescription} />
					<StatTile value={lastDate ?? '—'} label='Last session' small />
				</div>
			)}

			{isWeighted && isReps && (
				<>
					<StatChart
						title='Max weight per session'
						config={weightConfig}
						data={history}
						dataKey='maxWeight'
					/>
					<StatChart
						title='Total volume per session'
						config={volumeConfig}
						data={history}
						dataKey='totalVolume'
					/>
				</>
			)}

			{!isWeighted && isReps && (
				<StatChart
					title='Max reps per session'
					config={repsConfig}
					data={history}
					dataKey='maxReps'
				/>
			)}

			{!isReps && (
				<StatChart
					title='Max duration per session'
					config={durationConfig}
					data={history}
					dataKey='maxDuration'
					yTickFormatter={formatDuration}
				/>
			)}
		</div>
	)
}
