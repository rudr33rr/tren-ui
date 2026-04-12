import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { PlanCardActions } from '@/components/plans/plan-card-actions'
import { toast } from 'sonner'

const refreshMock = jest.fn()

jest.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: refreshMock }),
}))

const deletePlanMock = jest.fn()
jest.mock('@/data/plans.actions', () => ({
	deletePlan: (...args: unknown[]) => deletePlanMock(...args),
}))

jest.mock('sonner', () => ({
	toast: { success: jest.fn(), error: jest.fn() },
}))

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

describe('PlanCardActions', () => {
	it('renders the actions trigger button', () => {
		render(<PlanCardActions planId={1} />)
		expect(screen.getByRole('button', { name: /plan actions/i })).toBeInTheDocument()
	})

	describe('delete', () => {
		it('opens confirm dialog when Delete is clicked', () => {
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			expect(screen.getByRole('alertdialog')).toBeInTheDocument()
		})

		it('calls deletePlan with the correct planId when confirmed', async () => {
			deletePlanMock.mockResolvedValue(undefined)
			render(<PlanCardActions planId={7} />)
			fireEvent.click(screen.getByText('Delete'))
			fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
			await waitFor(() => expect(deletePlanMock).toHaveBeenCalledWith(7))
		})

		it('does not call deletePlan when cancelled', () => {
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
			expect(deletePlanMock).not.toHaveBeenCalled()
		})

		it('shows success toast after delete', async () => {
			deletePlanMock.mockResolvedValue(undefined)
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
			await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Plan deleted'))
		})

		it('calls router.refresh after successful delete', async () => {
			deletePlanMock.mockResolvedValue(undefined)
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
			await waitFor(() => expect(refreshMock).toHaveBeenCalled())
		})

		it('shows error toast when deletePlan throws', async () => {
			deletePlanMock.mockRejectedValue(new Error('Server error'))
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			await act(async () => {
				fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
			})
			await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server error'))
		})

		it('does not call router.refresh on error', async () => {
			deletePlanMock.mockRejectedValue(new Error('Server error'))
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			await act(async () => {
				fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
			})
			expect(refreshMock).not.toHaveBeenCalled()
		})
	})
})
