import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import FinishWorkoutButton from '@/components/workout-session/finish-workout-button'
import { useWorkoutSessionStore } from '@/stores/workout-session.store'
import { toast } from 'sonner'

const replaceMock = jest.fn()

jest.mock('next/navigation', () => ({
	useRouter: () => ({ replace: replaceMock }),
}))

const saveSessionMock = jest.fn()
jest.mock('@/data/session.actions', () => ({
	saveSession: (...args: unknown[]) => saveSessionMock(...args),
}))

jest.mock('sonner', () => ({
	toast: { success: jest.fn(), error: jest.fn() },
}))

beforeEach(() => {
	jest.clearAllMocks()
	useWorkoutSessionStore.getState().clear()
})

describe('FinishWorkoutButton', () => {
	describe('initial state', () => {
		it('renders "Finish workout" button', () => {
			render(<FinishWorkoutButton workoutId='1' />)
			expect(screen.getByRole('button', { name: /finish workout/i })).toBeInTheDocument()
		})

		it('is enabled when canSave is true', () => {
			render(<FinishWorkoutButton workoutId='1' canSave={true} />)
			expect(screen.getByRole('button', { name: /finish workout/i })).toBeEnabled()
		})

		it('is disabled when canSave is false', () => {
			render(<FinishWorkoutButton workoutId='1' canSave={false} />)
			expect(screen.getByRole('button', { name: /finish workout/i })).toBeDisabled()
		})

		it('is disabled while request is in-flight', async () => {
			saveSessionMock.mockReturnValue(new Promise(() => {})) // never resolves
			render(<FinishWorkoutButton workoutId='1' />)
			fireEvent.click(screen.getByRole('button', { name: /finish workout/i }))
			expect(await screen.findByRole('button', { name: /finish workout/i })).toBeDisabled()
		})
	})

	describe('canSave guard', () => {
		it('does not call saveSession when canSave is false', () => {
			render(<FinishWorkoutButton workoutId='1' canSave={false} />)
			fireEvent.click(screen.getByRole('button', { name: /finish workout/i }))
			expect(saveSessionMock).not.toHaveBeenCalled()
		})
	})

	describe('save flow', () => {
		beforeEach(() => {
			saveSessionMock.mockResolvedValue({ sessionId: 99 })
		})

		it('calls saveSession with parsed workoutId and store exercises', async () => {
			render(<FinishWorkoutButton workoutId='5' />)
			fireEvent.click(screen.getByRole('button', { name: /finish workout/i }))
			await waitFor(() =>
				expect(saveSessionMock).toHaveBeenCalledWith({ workoutId: 5, exercises: [] }),
			)
		})

		it('navigates to the summary page after save', async () => {
			render(<FinishWorkoutButton workoutId='5' />)
			fireEvent.click(screen.getByRole('button', { name: /finish workout/i }))
			await waitFor(() =>
				expect(replaceMock).toHaveBeenCalledWith('/workout-session/summary/99'),
			)
		})

		it('clears the session store after save', async () => {
			useWorkoutSessionStore.setState({ activeWorkoutId: 5 })
			render(<FinishWorkoutButton workoutId='5' />)
			fireEvent.click(screen.getByRole('button', { name: /finish workout/i }))
			await waitFor(() =>
				expect(useWorkoutSessionStore.getState().activeWorkoutId).toBeNull(),
			)
		})
	})

	describe('error handling', () => {
		it('shows toast error when saveSession throws', async () => {
			saveSessionMock.mockRejectedValue(new Error('Save failed'))
			render(<FinishWorkoutButton workoutId='5' />)
			await act(async () => {
				fireEvent.click(screen.getByRole('button', { name: /finish workout/i }))
			})
			expect(toast.error).toHaveBeenCalledWith('Save failed')
		})

		it('does not navigate on error', async () => {
			saveSessionMock.mockRejectedValue(new Error('Save failed'))
			render(<FinishWorkoutButton workoutId='5' />)
			await act(async () => {
				fireEvent.click(screen.getByRole('button', { name: /finish workout/i }))
			})
			expect(replaceMock).not.toHaveBeenCalled()
		})
	})
})
