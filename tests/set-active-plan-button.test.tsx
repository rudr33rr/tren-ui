import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SetActivePlanButton } from '@/components/plans/set-active-plan-button'
import { toast } from 'sonner'

const refreshMock = jest.fn()

jest.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: refreshMock }),
}))

const setActivePlanMock = jest.fn()
const deactivatePlanMock = jest.fn()

jest.mock('@/data/plans.actions', () => ({
	setActivePlan: (...args: unknown[]) => setActivePlanMock(...args),
	deactivatePlan: (...args: unknown[]) => deactivatePlanMock(...args),
}))

jest.mock('sonner', () => ({
	toast: { success: jest.fn(), error: jest.fn() },
}))

beforeEach(() => {
	jest.clearAllMocks()
})

describe('SetActivePlanButton', () => {
	describe('label', () => {
		it('shows "Set as active" when plan is not active', () => {
			render(<SetActivePlanButton planId={1} isActive={false} />)
			expect(screen.getByRole('button', { name: /set as active/i })).toBeInTheDocument()
		})

		it('shows "Deactivate" when plan is active', () => {
			render(<SetActivePlanButton planId={1} isActive={true} />)
			expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument()
		})

		it('is enabled initially', () => {
			render(<SetActivePlanButton planId={1} isActive={false} />)
			expect(screen.getByRole('button')).toBeEnabled()
		})

		it('is disabled while request is in-flight', async () => {
			setActivePlanMock.mockReturnValue(new Promise(() => {}))
			render(<SetActivePlanButton planId={1} isActive={false} />)
			fireEvent.click(screen.getByRole('button'))
			expect(await screen.findByRole('button')).toBeDisabled()
		})
	})

	describe('activation', () => {
		it('calls setActivePlan with planId when not active', async () => {
			setActivePlanMock.mockResolvedValue(undefined)
			render(<SetActivePlanButton planId={3} isActive={false} />)
			fireEvent.click(screen.getByRole('button', { name: /set as active/i }))
			await waitFor(() => expect(setActivePlanMock).toHaveBeenCalledWith(3))
		})

		it('shows success toast after activation', async () => {
			setActivePlanMock.mockResolvedValue(undefined)
			render(<SetActivePlanButton planId={3} isActive={false} />)
			fireEvent.click(screen.getByRole('button', { name: /set as active/i }))
			await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Plan set as active'))
		})
	})

	describe('deactivation', () => {
		it('calls deactivatePlan with planId when active', async () => {
			deactivatePlanMock.mockResolvedValue(undefined)
			render(<SetActivePlanButton planId={3} isActive={true} />)
			fireEvent.click(screen.getByRole('button', { name: /deactivate/i }))
			await waitFor(() => expect(deactivatePlanMock).toHaveBeenCalledWith(3))
		})

		it('shows success toast after deactivation', async () => {
			deactivatePlanMock.mockResolvedValue(undefined)
			render(<SetActivePlanButton planId={3} isActive={true} />)
			fireEvent.click(screen.getByRole('button', { name: /deactivate/i }))
			await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Plan deactivated'))
		})
	})

	describe('shared behaviour', () => {
		it('calls router.refresh after successful toggle', async () => {
			setActivePlanMock.mockResolvedValue(undefined)
			render(<SetActivePlanButton planId={3} isActive={false} />)
			fireEvent.click(screen.getByRole('button', { name: /set as active/i }))
			await waitFor(() => expect(refreshMock).toHaveBeenCalled())
		})
	})

	describe('error handling', () => {
		it('shows error toast when activation fails', async () => {
			setActivePlanMock.mockRejectedValue(new Error('Update failed'))
			render(<SetActivePlanButton planId={3} isActive={false} />)
			await act(async () => {
				fireEvent.click(screen.getByRole('button', { name: /set as active/i }))
			})
			expect(toast.error).toHaveBeenCalledWith('Update failed')
		})

		it('shows error toast when deactivation fails', async () => {
			deactivatePlanMock.mockRejectedValue(new Error('Update failed'))
			render(<SetActivePlanButton planId={3} isActive={true} />)
			await act(async () => {
				fireEvent.click(screen.getByRole('button', { name: /deactivate/i }))
			})
			expect(toast.error).toHaveBeenCalledWith('Update failed')
		})

		it('does not call router.refresh on error', async () => {
			setActivePlanMock.mockRejectedValue(new Error('Update failed'))
			render(<SetActivePlanButton planId={3} isActive={false} />)
			await act(async () => {
				fireEvent.click(screen.getByRole('button', { name: /set as active/i }))
			})
			expect(refreshMock).not.toHaveBeenCalled()
		})
	})
})
