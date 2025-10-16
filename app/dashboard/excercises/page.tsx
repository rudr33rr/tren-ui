import { ExercisesList } from '@/components/exercises-list'

export default async function ExcersisesPage() {
	return (
		<>
			<h1 className='text-2xl font-medium'>Exercise Library</h1>
			<p>Browse and learn proper form for exercises</p>
			<ExercisesList />
		</>
	)
}
