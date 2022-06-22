import anonImage from '../images/anon.png'

const Comment = ({ element, index }) => {
	return (
		<div className={`commentContainer${index} commentContainer`}>
			{element.comment.username === 'Anonymous' || element.comment.username === 'Weatherenews bot' ?
				<img src={anonImage} alt=""></img>
				:
				<img src={`${element.comment.picture}`} alt=""></img>
			}
			<h3>{element.comment.username}:</h3>
			<p>{element.comment.comment}</p>
		</div>
	)
}

export default Comment