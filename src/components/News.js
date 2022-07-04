import axios from 'axios'
import { useEffect, useState } from 'react'
import Article from './Article';
import Comment from './Comment';

// import backupNewsData from './backupData/backupNewsData.json'
import backupNewsData2 from './backupData/backupNewsData2.json'

//login import
import jwt_decode from "jwt-decode" //install jwt-decode

//firebase
import realtime from './firebase'
import { ref, onValue, push, update } from "firebase/database";

//firebase auth tests
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

//fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faArrowDown } from '@fortawesome/free-solid-svg-icons'

library.add(faBookmark, faArrowDown)

const News = ({ handleButtonClick, sectionToggles, myRef }) => {

	/* State variables */
	// user state variable
	const [user, setUser] = useState({ name: 'Anonymous', picture: `./images/favicon.png` })
	const [firebaseUser, setFirebaseUser] = useState({ displayName: 'Anonymous', photoURL: `./images/favicon.png` })

	// news state variables
	const [newsArticles, setNewsArticles] = useState(backupNewsData2.data)

	//firebase state variables
	const [users, setUsers] = useState([{}])
	const [savedArticles, setSavedArticles] = useState([])

	//current article and comments
	const [currentArticle, setCurrentArticle] = useState(null)
	const [currentComments, setCurrentComments] = useState([])
	const [currentComment, setCurrentComment] = useState('')

	/* Use Effects */
	// for news api data
	useEffect(() => {
		// news api
		// axios({
		// 	url: `https://newsapi.org/v2/everything?q=news&sortBy=popularity&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`,
		// 	method: 'GET',
		// 	dataResponse: 'json'
		// }).then((res) => {
		// 	// console.log(res.data.articles)
		// 	// console.log(JSON.stringify(res.data.articles))
		// 	setNewsArticles(res.data.articles)
		// })
		// NewsAPI
		axios({
			url: `https://api.thenewsapi.com/v1/news/all?locale=us,ca&language=en&api_token=${process.env.REACT_APP_NEWS_API_KEY_2}`,
			method: 'GET',
			dataResponse: 'json'
		}).then((res) => {
			// console.log(JSON.stringify(res.data.articles))
			setNewsArticles(res.data.data)
		})
		// console.log(JSON.stringify(newsArticles))
	}, [])

	useEffect(() => {
		/* global google */
		google.accounts.id.initialize({
			client_id: process.env.REACT_APP_GOOGLE_KEY,
			callback: handleCallbackResponse
		})

		google.accounts.id.renderButton(
			document.getElementById("signInDiv"),
			{
				theme: "outline", size: "large"
			}
		)

		//prompt for google login, annoying for testing
		google.accounts.id.prompt()

	}, [])


	//firebase
	// watch user data
	useEffect(() => {
		const userDb = ref(realtime, 'logins/')
		onValue(userDb, (snapshot) => {
			const myData = snapshot.val()
			const userArray = []
			for (let propertyName in myData) {
				// create a new local object for each loop iteration:
				const tempUser = {
					key: propertyName,
					userData: myData[propertyName]
				}
				if (myData[propertyName]) {
					userArray.push(tempUser)
				}
			}
			setUsers(userArray)
		})
	}, [firebaseUser])
	// watch saved article data
	useEffect(() => {
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
	}, [firebaseUser])
	// watch comment data for current article if one is selected
	useEffect(() => {
		if (currentArticle !== null) {
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
		//update user
		const savedDb = ref(realtime, `saved/${element.uuid}`)
		const testComment = {
			username: 'Weatherenews bot',
			picture: `../images/favicon.png`,
			comment: 'First!',
			date: new Date()
		}
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
				username: user.name,
				picture: user.picture,
				comment: currentComment,
				date: new Date()
			})
		}
		setCurrentComment('')
	}

	// google login setup functions
	function handleCallbackResponse(response) {
		const userObject = jwt_decode(response.credential)
		setUser(userObject)
		document.getElementById("signInDiv").hidden = true
		// update user on database
		if (userObject) {
			const currentLogin = userObject.jti
			const loginsDb = ref(realtime, `logins/${currentLogin}/`)
			const userLogin = {
				username: userObject.name,
				picture: userObject.picture,
				email: userObject.email,
				date: new Date()
			}
			update(loginsDb, userLogin)
		}

		//firebase auth
		const provider = new GoogleAuthProvider();
		const auth = getAuth();
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				const credential = GoogleAuthProvider.credentialFromResult(result);
				const token = credential.accessToken;
				// The signed-in user info.
				const tempUser = result.user;
				// console.log('firebase auth user: ', tempUser);
				setFirebaseUser(tempUser)
				// ...
			}).catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// console.log('firebaseerror: ', errorMessage);
				// The email of the user's account used.
				const email = error.customData.email;
				// The AuthCredential type that was used.
				const credential = GoogleAuthProvider.credentialFromError(error);
				// ...
			});
	}
	function handleSignout(event) {
		setUser({ name: 'Anonymous', picture: `./images/favicon.png` })
		document.getElementById("signInDiv").hidden = false
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

			{/* google login button */}
			<div className='googleLoginContainer'>
				<p id="signInDiv"></p>
				{user.name !== 'Anonymous' &&
					<button onClick={(e) => handleSignout(e)}>Sign out with Google</button>
				}
				{user.name !== 'Anonymous' &&
					<div>
						<img src={user.picture} alt=""></img>
						<h3>{user.name}</h3>
					</div>
				}
			</div>

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
								<label htmlFor="postComment">Comment as {user.name}</label>
								<input type="text" name="postComment" id="postComment" value={currentComment} onChange={handleCommentChange} />
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
		</div>
	)
}

export default News
