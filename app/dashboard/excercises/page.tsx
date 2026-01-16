import { ExercisesList } from '@/components/exercises-list'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Search } from 'lucide-react'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function ExcersisesPage() {
	return (
		<>
			<h1 className='text-2xl font-medium'>Exercise Library</h1>
			<p>Browse and learn proper form for exercises</p>
			<div className='flex gap-2'>
				<InputGroup>
					<InputGroupInput placeholder='Search...' />
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
				</InputGroup>
				<Select>
					<SelectTrigger>
						<SelectValue placeholder='muscle' />
					</SelectTrigger>
				</Select>
			</div>
			<ExercisesList />
		</>
	)
}
