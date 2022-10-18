const UserThread = ({ element, index }) => {
	return (
		<div className={`article${index} article`} >
			<div className='title'>
				<h3 title={element.title}>
					{element.title ? element.title : 'No title available'}
				</h3>
				<img src={element.image_url} onError={(e) => {e.target.src=require(`../images/threadsBackupImage.png`)}} alt={`Image related to ${element.title}`} />
			</div>
			<p className='content'>{element.description ? element.description : 'No description available'}</p>
		</div>
	)
}

export default UserThread