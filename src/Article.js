const Article = ({ element, index }) => {
	return (
		<div className={`article${index}`} >
			<div className='title'>
				<h2>
					{element.title}
				</h2>
				<img src={element.urlToImage} alt="testing" />
			</div>
			<p className='content'>{element.content}</p>
			<a href={element.url}>Read more</a>
		</div>
	)
}

export default Article