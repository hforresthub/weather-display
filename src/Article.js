const Article = ({ element, index }) => {
	return (
		<div className={`article${index} article`} >
			<div className='title'>
				<h3 title={element.title}>
					{element.title}
				</h3>
				<img src={element.urlToImage} alt="testing" />
			</div>
			<p className='content'>{element.content}</p>
			<a href={element.url}>Read more</a>
		</div>
	)
}

export default Article