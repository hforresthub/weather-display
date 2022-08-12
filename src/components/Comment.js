import anonImage from '../images/anon.png'

const Comment = ({ element, index }) => {

	const checkDate = (date) => {
		try {
			if (!date) {
				return false
			}
			const test = new Date(date)
			return true
		} catch (err) {
			console.log('errored', err);
		}
	}

	return (
		<div className={`commentContainer${index} commentContainer`}>
			{element.comment.username === 'Anonymous' || element.comment.username === 'Weatherenews bot' ?
				<img src={anonImage} alt=""></img>
				:
				<img src={`${element.comment.picture}`} alt=""></img>
			}
			<div className="commented">
				<h3>{element.comment.username}:</h3>
				<p>commented at {checkDate(element.comment.date) ? new Date(element.comment.date).toLocaleString() : 'unknown time'}</p>
			</div>
			<p>{element.comment.comment}</p>
		</div>
	)
}

export default Comment