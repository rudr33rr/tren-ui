import { fireEvent, render, screen } from '@testing-library/react'
import { ExerciseSearch } from '@/features/exercises/components/exercise-search'

const replaceMock = jest.fn()
const useSearchParamsMock = jest.fn<URLSearchParams, []>()

jest.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: replaceMock,
	}),
	useSearchParams: () => useSearchParamsMock(),
}))

describe('ExerciseSearch', () => {
	const muscles = [
		{ id: 1, name: 'Chest' },
		{ id: 2, name: 'Back' },
	]

	beforeEach(() => {
		replaceMock.mockClear()
	})

	it('renders current search query in input default value', () => {
		useSearchParamsMock.mockReturnValue(new URLSearchParams('search=bench&type=strength'))

		render(<ExerciseSearch muscles={muscles} musclesError={false} />)

		expect(screen.getByPlaceholderText('Search exercises...')).toHaveValue('bench')
	})

	it('updates search param while preserving other params', () => {
		useSearchParamsMock.mockReturnValue(new URLSearchParams('type=strength'))

		render(<ExerciseSearch muscles={muscles} musclesError={false} />)

		fireEvent.change(screen.getByPlaceholderText('Search exercises...'), {
			target: { value: 'squat' },
		})

		expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('search=squat'))
		expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('type=strength'))
	})

	it('clears type param when user selects All Categories', () => {
		useSearchParamsMock.mockReturnValue(new URLSearchParams('type=cardio&search=row'))

		render(<ExerciseSearch muscles={muscles} musclesError={false} />)

		fireEvent.click(screen.getByRole('radio', { name: /all categories/i }))

		const lastCall = replaceMock.mock.calls.at(-1)?.[0] as string
		expect(lastCall).toContain('search=row')
		expect(lastCall).not.toContain('type=')
	})

	it('disables muscle select when musclesError is true', () => {
		useSearchParamsMock.mockReturnValue(new URLSearchParams(''))

		render(<ExerciseSearch muscles={muscles} musclesError />)

		expect(screen.getByRole('combobox')).toBeDisabled()
	})
})
