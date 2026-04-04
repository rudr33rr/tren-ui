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

beforeEach(() => {
	jest.clearAllMocks()
	window.confirm = jest.fn(() => true)
})

describe('PlanCardActions', () => {
	it('renders the actions trigger button', () => {
		render(<PlanCardActions planId={1} />)
		expect(screen.getByRole('button', { name: /plan actions/i })).toBeInTheDocument()
	})

	describe('delete', () => {
		it('shows confirm dialog when Delete is clicked', () => {
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			expect(window.confirm).toHaveBeenCalledWith('Delete this plan?')
		})

		it('calls deletePlan with the correct planId when confirmed', async () => {
			deletePlanMock.mockResolvedValue(undefined)
			render(<PlanCardActions planId={7} />)
			fireEvent.click(screen.getByText('Delete'))
			await waitFor(() => expect(deletePlanMock).toHaveBeenCalledWith(7))
		})

		it('does not call deletePlan when cancelled', () => {
			window.confirm = jest.fn(() => false)
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			expect(deletePlanMock).not.toHaveBeenCalled()
		})

		it('shows success toast after delete', async () => {
			deletePlanMock.mockResolvedValue(undefined)
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Plan deleted'))
		})

		it('calls router.refresh after successful delete', async () => {
			deletePlanMock.mockResolvedValue(undefined)
			render(<PlanCardActions planId={1} />)
			fireEvent.click(screen.getByText('Delete'))
			await waitFor(() => expect(refreshMock).toHaveBeenCalled())
		})

		it('shows error toast when deletePlan throws', async () => {
			deletePlanMock.mockRejectedValue(new Error('Server error'))
			render(<PlanCardActions planId={1} />)
			await act(async () => {
				fireEvent.click(screen.getByText('Delete'))
			})
			expect(toast.error).toHaveBeenCalledWith('Server error')
		})

		it('does not call router.refresh on error', async () => {
			deletePlanMock.mockRejectedValue(new Error('Server error'))
			render(<PlanCardActions planId={1} />)
			await act(async () => {
				fireEvent.click(screen.getByText('Delete'))
			})
			expect(refreshMock).not.toHaveBeenCalled()
		})
	})
})
