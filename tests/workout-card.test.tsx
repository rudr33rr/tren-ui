import { render, screen } from '@testing-library/react'
import { WorkoutCard } from '@/components/workouts/workout-card'
import type { WorkoutCardData } from '@/types/workout.types'

jest.mock('@/components/workout-session/start-workout-button', () => ({
	StartWorkoutButton: () => <button>Start</button>,
}))

jest.mock('@/components/workouts/workout-card-actions', () => ({
	WorkoutCardActions: () => <div data-testid='workout-card-actions' />,
}))

const base: WorkoutCardData = {
	id: 1,
	name: 'Push Day',
	exerciseCount: 4,
}

describe('WorkoutCard', () => {
	it('renders the workout name', () => {
		render(<WorkoutCard workout={base} />)
		expect(screen.getByText('Push Day')).toBeInTheDocument()
	})

	it('renders exercise count', () => {
		render(<WorkoutCard workout={base} />)
		expect(screen.getByText('4 exercises')).toBeInTheDocument()
	})

	it('renders 0 exercises correctly', () => {
		render(<WorkoutCard workout={{ ...base, exerciseCount: 0 }} />)
		expect(screen.getByText('0 exercises')).toBeInTheDocument()
	})

	it('hides exercise count when exerciseCount is null', () => {
		render(<WorkoutCard workout={{ ...base, exerciseCount: null as unknown as number }} />)
		expect(screen.queryByText(/exercises/)).not.toBeInTheDocument()
	})

	it('renders workout card actions', () => {
		render(<WorkoutCard workout={base} />)
		expect(screen.getByTestId('workout-card-actions')).toBeInTheDocument()
	})
})
