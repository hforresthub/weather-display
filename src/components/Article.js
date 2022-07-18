const Article = ({ element, index }) => {
	return (
		<div className={`article${index} article`} >
			<div className='title'>
				<h3 title={element.title}>
					{element.title ? element.title : 'No title available'}
				</h3>
				<img src={element.image_url} onError={(e) => {e.target.src=require(`../images/backupImage.png`)}} alt={`Image related to ${element.title}`} />
			</div>
			<p className='content'>{element.description ? element.description : 'No description available'}</p>
			{/* do not create read more button for threads */}
			{element.url !== undefined ? <a href={element.url}>Read more</a> : ''}
		</div>
	)
}

export default Article