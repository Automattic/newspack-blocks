export default function save({ attributes }) {
	const { heading, link } = attributes;
	return (
		<header className="page-header">
			{heading && <h1 className="page-title">{heading}</h1>}
			{link && (
				<a href={link}>
					और पढ़ें <i className="read_more_arrow" />
				</a>
			)}
		</header>
	);
}
