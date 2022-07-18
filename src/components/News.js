import axios from 'axios'
import { useEffect, useState } from 'react'
import Article from './Article';
import UserThread from './UserThread';
import Comment from './Comment';
import anonImage from '../images/anon.png'

// import backupNewsData from './backupData/backupNewsData.json'
import backupNewsData2 from './backupData/backupNewsData2.json'

//firebase
import realtime from './firebase'
import { ref, onValue, push, update } from "firebase/database";

//firebase auth tests
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut, onAuthStateChanged } from "firebase/auth";

//fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faArrowDown } from '@fortawesome/free-solid-svg-icons'

library.add(faBookmark, faArrowDown)

const News = ({ handleButtonClick, sectionToggles, myRef }) => {

	/* State variables */
	// user state variable
	const [user, setUser] = useState({ name: 'Anonymous', picture: `./images/favicon.png` })
	const [firebaseUser, setFirebaseUser] = useState(null)

	// news state variables
	const [newsArticles, setNewsArticles] = useState(backupNewsData2.data)

	//firebase state variables
	const [savedArticles, setSavedArticles] = useState([])
	const [userThreads, setUserThreads] = useState([])

	//current article and comments
	const [currentArticle, setCurrentArticle] = useState(null)
	const [currentComments, setCurrentComments] = useState([])
	const [currentComment, setCurrentComment] = useState('')

	// for posting a new user thread
	const [currentThread, setCurrentThread] = useState('')
	const [currentThreadTitle, setCurrentThreadTitle] = useState('')

	// currently selected thread to view comments of
	const [currentUserThread, setCurrentUserThread] = useState(null)
	// holds current threads comments
	const [currentUserThreadComment, setCurrentUserThreadComment] = useState([])
	const [currentUserThreadComments, setCurrentUserThreadComments] = useState([])

	/* Use Effects */
	// for news api data
	useEffect(() => {
		// NewsAPI
		// axios({
		// 	url: `https://api.thenewsapi.com/v1/news/all?locale=us,ca&language=en&api_token=${process.env.REACT_APP_NEWS_API_KEY_2}`,
		// 	method: 'GET',
		// 	dataResponse: 'json'
		// }).then((res) => {
		// 	// console.log(JSON.stringify(res.data.articles))
		// 	setNewsArticles(res.data.data)
		// })
		// console.log(JSON.stringify(newsArticles))
	}, [])

	//firebase user login
	// previously logged in
	useEffect(() => {
		const auth = getAuth();

		onAuthStateChanged(auth, (tempUser) => {
			if (tempUser) {
				// console.log("current user? ", tempUser);
				const currentLogin = tempUser.uid
				const firebaseLoginsDb = ref(realtime, `firebaseLogins/${currentLogin}/`)
				const userLogin = {
					username: tempUser.displayName,
					picture: tempUser.photoURL,
					email: tempUser.email,
					date: new Date()
				}
				update(firebaseLoginsDb, userLogin)
				setFirebaseUser(tempUser)
			} else {
			}
		});
	}, [])
	// button login
	const handleFirebaseLogin = () => {
		//firebase auth
		const provider = new GoogleAuthProvider();
		const auth = getAuth();
		signInWithRedirect(auth, provider)
	}
	function handleSignout(event) {
		setUser({ name: 'Anonymous', picture: `./images/favicon.png` })
		setFirebaseUser(null)
		setSavedArticles([])
		setCurrentArticle(null)

		//firebase auth logout
		const auth = getAuth();
		signOut(auth).then(() => {
			// console.log('Logged out');
		}).catch((error) => {

		})
	}
	//firebase get redirect
	useEffect(() => {
		const auth = getAuth();
		getRedirectResult(auth)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				// The signed-in user info.
				const tempUser = result.user;
				// console.log('firebase auth user: ', tempUser);
				// log their login to firebase, updates existing login for same user
				if (tempUser) {
					const currentLogin = tempUser.uid
					const firebaseLoginsDb = ref(realtime, `firebaseLogins/${currentLogin}/`)
					const userLogin = {
						username: tempUser.displayName,
						picture: tempUser.photoURL,
						email: tempUser.email,
						date: new Date()
					}
					update(firebaseLoginsDb, userLogin)
				}
				setFirebaseUser(tempUser)
				// ...
			}).catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// console.log('firebaseerror: ', errorMessage);
				// The email of the user's account used.
				// const email = error.customData.email;
				// The AuthCredential type that was used.
				const credential = GoogleAuthProvider.credentialFromError(error);
				// ...
			});
	}, [])

	// watch saved articles
	useEffect(() => {
		if (firebaseUser !== null) {
			const savedDb = ref(realtime, 'saved/')
			onValue(savedDb, (snapshot) => {
				const myData = snapshot.val()
				const savedArray = []
				for (let propertyName in myData) {
					// create a new local object for each loop iteration:
					const tempArticle = {
						key: propertyName,
						userData: myData[propertyName]
					}
					if (myData[propertyName]) {
						savedArray.push(tempArticle)
					}
				}
				setSavedArticles(savedArray)
			})
		}
	}, [firebaseUser])
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
	// watch comment data for current article if one is selected
	useEffect(() => {
		if (currentArticle !== null && firebaseUser !== null) {
			const commentsDb = ref(realtime, `saved/${currentArticle.uuid}/comments/`)
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
				setCurrentComments(commentArray)
			})
		}
	}, [currentArticle, firebaseUser])

	//firebase button functions
	//save button
	const handleSaveButtonClick = (element) => (event) => {
		//save article to db
		const savedDb = ref(realtime, `saved/${element.uuid}`)
		const testComment = {
			username: 'Weatherenews bot',
			picture: `../images/favicon.png`,
			comment: 'First!',
			date: new Date()
		}
		console.log("element ", element);
		const tempSavedArticle = {
			article: element,
			comments: [testComment],
		}
		update(savedDb, tempSavedArticle)
	}
	//read comments button
	const handleCommentsButtonClick = (element) => (event) => {
		setCurrentArticle(element)
	}
	//form comment change handler
	const handleCommentChange = (event) => {
		event.preventDefault()
		setCurrentComment(event.target.value)
	}
	//form submit for comment
	const handleCommentSubmit = (event) => {
		event.preventDefault()
		if (currentComment !== '') {
			const commentsDb = ref(realtime, `saved/${currentArticle.uuid}/comments/`)
			push(commentsDb, {
				username: firebaseUser.displayName,
				picture: firebaseUser.photoURL,
				comment: currentComment,
				date: new Date()
			})
		}
		setCurrentComment('')
	}

	//thread functions
	// watch comment data for current user thread if one is selected
	useEffect(() => {
		if (currentUserThread !== null && firebaseUser !== null) {
			console.log("current comments: ", currentUserThread.uuid);
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
	}, [currentArticle, firebaseUser])

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
				comment: currentComment,
				date: new Date()
			})
		}
		setCurrentUserThreadComment('')
	}


	return (
		<div className='news'>
			<div ref={myRef[2]}></div>

			{/* News Feed */}
			{
				newsArticles.length !== 0 ?
					<div className='newsContainer'>
						<button onClick={handleButtonClick(2)}>{sectionToggles[2] ? 'Hide ' : 'Show '} News </button>
						{sectionToggles[2] ?
							<div className='newsToggleContainer'>
								<h2>News Feed: </h2>
								<div className='newsArticles'>
									{newsArticles.map((element, index) => {
										return (
											<div className={`articleContainer${index} articleContainer`} key={index}>
												<Article element={element} index={index} />
												{
													savedArticles.filter(savedElement => {
														return (savedElement.userData.article.uuid === element.uuid)
													}).length > 0
														?
														//saved
														<button className='fontIcon'>
															<FontAwesomeIcon icon="fa-solid fa-bookmark" />
														</button>
														:
														(savedArticles.length !== 0 ?
															<button className='saveIcon' onClick={handleSaveButtonClick(element)}>Save</button>
															:
															<p>Login to Save</p>
														)
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
					'No news available atm'
			}

			{/* saved news */}
			<div ref={myRef[3]}></div>
			{savedArticles.length !== 0 ?
				<div className='newsContainer'>
					<button onClick={handleButtonClick(3)}>{sectionToggles[3] ? 'Hide ' : 'Show '} Saved News </button>
					{sectionToggles[3] ?
						<div className='newsToggleContainer'>
							<h2>Saved News Articles: </h2>
							<div className='newsArticles'>
								{savedArticles.map((element, index) => {
									return (
										<div className={`articleContainer${index} articleContainer`} key={index}>
											<Article element={element.userData.article} index={index} />
											{
												currentArticle !== null && element.userData.article.uuid === currentArticle.uuid
													?
													//comments
													<button className='fontIcon'>
														<FontAwesomeIcon icon="fa-solid fa-arrow-down" />
													</button>
													:
													<button className='saveIcon' onClick={handleCommentsButtonClick(element.userData.article)}>Comments</button>
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
				'No saved news available atm, possibly because you are not logged in'
			}

			{/* current article comments */}
			<div ref={myRef[4]}></div>
			{currentArticle !== null ?
				<div className='commentsContainer'>
					<button onClick={handleButtonClick(4)}>{sectionToggles[4] ? 'Hide ' : 'Show '} Current Comments </button>
					{sectionToggles[4] ?
						<div className='commentsToggleContainer'>
							<h2>Current Article: </h2>
							<div className="currentArticle">
								<Article element={currentArticle} index={0} />
							</div>
							<h2>Current Comments: </h2>
							<form onSubmit={handleCommentSubmit}>
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
								<textarea name="postComment" id="postComment" value={currentComment} onChange={handleCommentChange} />
								<button type="button" onClick={handleCommentSubmit}>Post Comment</button>
							</form>
							{currentComments.length !== 0 ?
								<div className='articleComments'>
									{currentComments.map((element, index) => {
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
				'No current article available atm'
			}

			{/* google login button */}
			<div className='googleLoginContainer'>
				{firebaseUser !== null ?
					<button onClick={(e) => handleSignout(e)}>Sign out with Google</button>
					:
					<button type="button" onClick={handleFirebaseLogin}>Google login</button>
				}
				{firebaseUser !== null &&
					<div>
						<div>
							<img src={firebaseUser.photoURL} alt=""></img>
							<h3>{firebaseUser.displayName}</h3>
						</div>
						<div className="newThread">
							<form onSubmit={handleThreadSubmit}>
								<label htmlFor="postThread">
									<h3>
										Create new article
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
			<div ref={myRef[5]}></div>
			{userThreads.length !== 0 ?
				<div className='newsContainer'>
					<button onClick={handleButtonClick(5)}>{sectionToggles[5] ? 'Hide ' : 'Show '} User Threads </button>
					{sectionToggles[5] ?
						<div className='newsToggleContainer'>
							<h2>User Threads: </h2>
							<div className='usersThreads'>
								{userThreads.map((element, index) => {
									return (
										<div className={`articleContainer${index} articleContainer`} key={index}>
											<UserThread element={element.userData.article} index={index} />
											{
												currentUserThread !== null && element.userData.article.uuid === currentUserThread.uuid
													?
													//comments
													<button className='fontIcon'>
														<FontAwesomeIcon icon="fa-solid fa-arrow-down" />
													</button>
													:
													<button className='saveIcon' onClick={handleUserThreadButtonClick(element.userData.article)}>Comments</button>
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
				'No saved news available atm, possibly because you are not logged in'
			}

			{/* current article comments */}
			<div ref={myRef[5]}></div>
			{currentUserThread !== null ?
				<div className='commentsContainer'>
					<button onClick={handleButtonClick(5)}>{sectionToggles[5] ? 'Hide ' : 'Show '} Current Comments </button>
					{sectionToggles[5] ?
						<div className='commentsToggleContainer'>
							<h2>Current Article: </h2>
							<div className="currentArticle">
								<UserThread element={currentUserThread} index={0} />
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
										console.log("comments ", currentUserThreadComments);
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

export default News
