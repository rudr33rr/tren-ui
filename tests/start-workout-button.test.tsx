import { act, fireEvent, render, screen } from '@testing-library/react'
import { StartWorkoutButton } from '@/components/workout-session/start-workout-button'

const pushMock = jest.fn()

jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: pushMock }),
}))

beforeEach(() => {
	jest.clearAllMocks()
})

describe('StartWorkoutButton', () => {
	it('renders "Start workout" button', () => {
		render(<StartWorkoutButton workoutId={1} />)
		expect(screen.getByRole('button', { name: /start workout/i })).toBeInTheDocument()
	})

	it('is enabled initially', () => {
		render(<StartWorkoutButton workoutId={1} />)
		expect(screen.getByRole('button', { name: /start workout/i })).toBeEnabled()
	})

	it('navigates to the correct session URL on click', async () => {
		render(<StartWorkoutButton workoutId={42} />)
		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: /start workout/i }))
		})
		expect(pushMock).toHaveBeenCalledWith('/workout-session/42')
	})
})
