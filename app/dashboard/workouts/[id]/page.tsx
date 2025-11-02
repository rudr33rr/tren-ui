export default function WokrkoutPage(props: unknown) {
	const { params } = props as { params: { id: number } }
	return <div>{params.id}</div>
}
