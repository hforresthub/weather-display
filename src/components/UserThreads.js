import { useEffect, useState } from 'react'
import UserThread from './UserThread';
import Comment from './Comment';
import anonImage from '../images/anon.png'

//firebase
import realtime from './firebase'
import { ref, onValue, push } from "firebase/database";

//fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faArrowDown } from '@fortawesome/free-solid-svg-icons'

library.add(faBookmark, faArrowDown)

const UserThreads = ({ handleButtonClick, sectionToggles, myRef, firebaseUser }) => {

	/* State variables */
	//firebase state variables
	const [userThreads, setUserThreads] = useState([])

	// for posting a new user thread
	const [currentThread, setCurrentThread] = useState('')
	const [currentThreadTitle, setCurrentThreadTitle] = useState('')

	// currently selected thread to view comments of
	const [currentUserThread, setCurrentUserThread] = useState(null)
	// holds current threads comments
	const [currentUserThreadComment, setCurrentUserThreadComment] = useState([])
	const [currentUserThreadComments, setCurrentUserThreadComments] = useState([])

	// watch user threads
	useEffect(() => {
		if (firebaseUser !== null) {
			const createdDb = ref(realtime, 'created/')
			onValue(createdDb, (snapshot) => {
				const myData = snapshot.val()
				const savedArray = []
				for (let propertyName in myData) {
					// create a new local object for each loop iteration:
					const tempArticle = {
						key: propertyName,
						userData: myData[propertyName],
						uuid: propertyName
					}
					if (myData[propertyName]) {
						savedArray.push(tempArticle)
					}
				}
				setUserThreads(savedArray)
			})
		}
	}, [firebaseUser])

	//thread functions
	// watch comment data for current user thread if one is selected
	useEffect(() => {
		if (currentUserThread !== null && firebaseUser !== null) {
			const commentsDb = ref(realtime, `created/${currentUserThread.uuid}/comments/`)
			onValue(commentsDb, (snapshot) => {
				const myData = snapshot.val()
				const commentArray = []
				for (let propertyName in myData) {
					// create a new local object for each loop iteration:
					const userComment = {
						key: propertyName,
						comment: myData[propertyName]
					}
					if (myData[propertyName]) {
						commentArray.push(userComment)
					}
				}
				setCurrentUserThreadComments(commentArray)
			})
		}
	}, [currentUserThread, firebaseUser])

	//form thread title change handler
	const handleThreadTitleChange = (event) => {
		event.preventDefault()
		setCurrentThreadTitle(event.target.value)
	}
	//form thread change handler
	const handleThreadChange = (event) => {
		event.preventDefault()
		setCurrentThread(event.target.value)
	}
	//form submit for thread post
	const handleThreadSubmit = (event) => {
		event.preventDefault()
		if (currentThreadTitle !== '' && currentThread !== '') {
			//save article to db
			const createdDb = ref(realtime, `created/`)
			const testComment = {
				username: 'Weatherenews bot',
				picture: `../images/favicon.png`,
				comment: 'First!',
				date: new Date()
			}
			const newThread = {
				title: currentThreadTitle,
				description: currentThread,
				image_url: `../images/backupImage.png`
			}
			const tempSavedArticle = {
				article: newThread,
				comments: [testComment],
			}
			push(createdDb, tempSavedArticle)
		}
		setCurrentThreadTitle('')
		setCurrentThread('')
	}
	//thread comments
	const handleUserThreadButtonClick = (element) => (event) => {
		setCurrentUserThread(element)
	}
	//form comment change handler
	const handleUserThreadCommentChange = (event) => {
		event.preventDefault()
		setCurrentUserThreadComment(event.target.value)
	}
	//form submit for comment
	const handleUserThreadCommentSubmit = (event) => {
		event.preventDefault()
		if (currentUserThreadComment !== '') {
			const commentsDb = ref(realtime, `created/${currentUserThread.uuid}/comments/`)
			push(commentsDb, {
				username: firebaseUser.displayName,
				picture: firebaseUser.photoURL,
				comment: currentUserThreadComment,
				date: new Date()
			})
		}
		setCurrentUserThreadComment('')
	}

	return (
		<div className='news'>
			{/* creating threads */}
			<div className='googleLoginContainer'>
				{firebaseUser !== null &&
					<div>
						<div className="newThread">
							<form onSubmit={handleThreadSubmit}>
								<label htmlFor="postThread">
									<h3>
										Create new user thread
									</h3>
								</label>
								<p>Title:</p>
								<input name="postThreadTitle" id="postThreadTitle" value={currentThreadTitle} onChange={handleThreadTitleChange} />
								<p>Text:</p>
								<textarea name="postThread" id="postThread" value={currentThread} onChange={handleThreadChange} />
								<button type="button" onClick={handleThreadSubmit}>Post Thread</button>
							</form>
						</div>
					</div>
				}
			</div>

			{/* user threads */}
			<div ref={myRef[4]}></div>
			{userThreads.length !== 0 ?
				<div className='newsContainer'>
					<button onClick={handleButtonClick(4)}>{sectionToggles[4] ? 'Hide ' : 'Show '} User Threads </button>
					{sectionToggles[4] ?
						<div className='newsToggleContainer'>
							<h2>User Threads: </h2>
							<div className='usersThreads'>
								{userThreads.map((element, index) => {
									return (
										<div className={`articleContainer${index} articleContainer`} key={index}>
											<UserThread element={element.userData.article} index={index} />
											{
												currentUserThread !== null && element.uuid === currentUserThread.uuid
													?
													//comments
													<button className='fontIcon'>
														<FontAwesomeIcon icon="fa-solid fa-arrow-down" />
													</button>
													:
													<button className='saveIcon' onClick={handleUserThreadButtonClick(element)}>Comments</button>
											}
										</div>
									)
								})}
							</div>
						</div>
						:
						''
					}
				</div>
				:
				'No user threads available atm, possibly because you are not logged in'
			}

			{/* current article comments */}
			{currentUserThread !== null ?
				<div className='commentsContainer'>
					{sectionToggles[4] ?
						<div className='commentsToggleContainer'>
							<h2>Current User Thread: </h2>
							<div className="currentArticle">
								<UserThread element={currentUserThread.userData.article} index={0} />
							</div>
							<h2>Current Comments: </h2>
							<form onSubmit={handleUserThreadCommentSubmit}>
								<label htmlFor="postComment">
									<p>
										Comment as
									</p>
									<div className="userCard">
										{firebaseUser === null ?
											<img src={anonImage} alt=""></img>
											:
											<img src={`${firebaseUser.photoURL}`} alt=""></img>
										}
										{firebaseUser === null ?
											<p>{'Anonymous'}:</p>
											:
											<p>{firebaseUser.displayName}:</p>
										}
									</div>
								</label>
								<textarea name="postComment" id="postComment" value={currentUserThreadComment} onChange={handleUserThreadCommentChange} />
								<button type="button" onClick={handleUserThreadCommentSubmit}>Post Comment</button>
							</form>
							{currentUserThreadComments.length !== 0 ?
								<div className='articleComments'>
									{currentUserThreadComments.map((element, index) => {
										return (
											<Comment element={element} index={index} key={index} />
										)
									})}
								</div>
								:
								'No comments yet'
							}
						</div>
						:
						''
					}
				</div>
				:
				'No current user thread available atm'
			}
		</div>
	)
}

export default UserThreads
