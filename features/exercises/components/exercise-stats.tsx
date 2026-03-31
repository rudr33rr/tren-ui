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

const intensityConfig = {
	avgIntensity: { label: 'Avg intensity (RPE)', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

function formatDuration(sec: number) {
	const m = Math.floor(sec / 60)
	const s = sec % 60
	return m > 0 ? `${m}m ${s}s` : `${s}s`
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

	const hasIntensity = history.some(h => h.avgIntensity != null)

	return (
		<div className='space-y-4'>
			<div className='grid grid-cols-3 gap-3'>
				<div className='rounded-lg border p-4 text-center'>
					<p className='text-2xl font-semibold tabular-nums'>{history.length}</p>
					<p className='mt-1 text-xs opacity-60'>Sessions</p>
				</div>
				<div className='rounded-lg border p-4 text-center'>
					<p className='text-2xl font-semibold tabular-nums'>{prLabel}</p>
					<p className='mt-1 text-xs opacity-60'>{prDescription}</p>
				</div>
				<div className='rounded-lg border p-4 text-center'>
					<p className='text-sm font-semibold leading-tight'>{lastDate}</p>
					<p className='mt-1 text-xs opacity-60'>Last session</p>
				</div>
			</div>

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

			{hasIntensity && (
				<StatChart
					title='Average intensity (RPE)'
					config={intensityConfig}
					data={history}
					dataKey='avgIntensity'
				/>
			)}
		</div>
	)
}
