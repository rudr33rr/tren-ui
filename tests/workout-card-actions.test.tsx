import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WorkoutCardActions } from '@/components/workouts/workout-card-actions'

const refreshMock = jest.fn()

jest.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: refreshMock }),
}))

const deleteWorkoutMock = jest.fn()
jest.mock('@/data/workouts.actions', () => ({
	deleteWorkout: (...args: unknown[]) => deleteWorkoutMock(...args),
}))

jest.mock('sonner', () => ({
	toast: { success: jest.fn(), error: jest.fn() },
}))

// Mock Radix DropdownMenu to avoid portal/pointer-event complexity
jest.mock('@/components/ui/dropdown-menu', () => ({
	DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DropdownMenuItem: ({
		children,
		onSelect,
		disabled,
		className,
	}: {
		children: React.ReactNode
		onSelect?: () => void
		disabled?: boolean
		className?: string
	}) => (
		<div role='menuitem' onClick={onSelect} aria-disabled={disabled} className={className}>
			{children}
		</div>
	),
}))

// Mock AlertDialog — renders content only when open=true
const AlertDialogContext = React.createContext(false)
jest.mock('@/components/ui/alert-dialog', () => {
	const React = require('react')
	const AlertDialogContext = React.createContext(false)
	return {
		AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
			<AlertDialogContext.Provider value={open}>
				<div>{children}</div>
			</AlertDialogContext.Provider>
		),
		AlertDialogContent: ({ children }: { children: React.ReactNode }) => {
			const open = React.useContext(AlertDialogContext)
			return open ? <div role='alertdialog'>{children}</div> : null
		},
		AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
		AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
		AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
		AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
			<button onClick={onClick}>{children}</button>
		),
	}
})

beforeEach(() => {
	jest.clearAllMocks()
})

describe('WorkoutCardActions', () => {
	describe('edit link', () => {
		it('renders a link to the edit page for the given workoutId', () => {
			render(<WorkoutCardActions workoutId={42} />)
			const link = screen.getByRole('link', { name: /edit/i })
			expect(link).toHaveAttribute('href', '/dashboard/workouts/edit/42')
		})
	})

	describe('delete', () => {
		it('opens confirm dialog when Delete is clicked', () => {
			render(<WorkoutCardActions workoutId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			expect(screen.getByRole('alertdialog')).toBeInTheDocument()
		})

		it('calls deleteWorkout with the correct workoutId when confirmed', async () => {
			deleteWorkoutMock.mockResolvedValue(undefined)
			render(<WorkoutCardActions workoutId={7} />)

			fireEvent.click(screen.getByText('Delete'))
			fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

			await waitFor(() => {
				expect(deleteWorkoutMock).toHaveBeenCalledWith(7)
			})
		})

		it('does not call deleteWorkout when confirm is cancelled', async () => {
			render(<WorkoutCardActions workoutId={1} />)

			fireEvent.click(screen.getByText('Delete'))
			fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

			expect(deleteWorkoutMock).not.toHaveBeenCalled()
		})

		it('shows error toast when deleteWorkout throws', async () => {
			const { toast } = require('sonner')
			deleteWorkoutMock.mockRejectedValue(new Error('Server error'))
			render(<WorkoutCardActions workoutId={1} />)

			fireEvent.click(screen.getByText('Delete'))

			await act(async () => {
				fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
			})

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith('Server error')
			})
		})

		it('calls router.refresh after successful delete', async () => {
			deleteWorkoutMock.mockResolvedValue(undefined)
			render(<WorkoutCardActions workoutId={1} />)

			fireEvent.click(screen.getByText('Delete'))
			fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

			await waitFor(() => {
				expect(refreshMock).toHaveBeenCalled()
			})
		})
	})
})
