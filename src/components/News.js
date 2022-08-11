import axios from 'axios'
import { useEffect, useState } from 'react'
import Article from './Article';
import Comment from './Comment';
import anonImage from '../images/anon.png'


//firebase
import realtime from './firebase'
import { ref, onValue, push, update } from "firebase/database";

//fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faArrowDown } from '@fortawesome/free-solid-svg-icons'

library.add(faBookmark, faArrowDown)

const News = ({ handleButtonClick, sectionToggles, myRef, firebaseUser, savedArticles, setSavedArticles, currentArticle, setCurrentArticle, newsArticles, setNewsArticles }) => {

	/* State variables */

	//current article and comments

	const [currentComments, setCurrentComments] = useState([])
	const [currentComment, setCurrentComment] = useState('')


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
				// count number of comments for each saved article
				savedArray.forEach(element => {
					element.userData.numComments = Object.keys(element.userData.comments).length
					// console.log(element.userData.numComments);
				})
				// sort to show most recently saved articles first
				savedArray.sort((current, next) => {
					if (current.userData.comments[0].date > next.userData.comments[0].date) {
						return -1
					} else {
						return 1
					}
				})
				setSavedArticles(savedArray)
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
								<article className='newsArticles'>
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
								</article>
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
													<button className='saveIcon' onClick={handleCommentsButtonClick(element.userData.article)}>{element.userData.numComments} Comment{element.userData.numComments > 1 ? 's' : ''}</button>
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
				<p>No saved news available atm, possibly because you are not logged in</p>
			}

			{/* current article comments */}
			{currentArticle !== null ?
				<div className='commentsContainer'>
					{sectionToggles[3] ?
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
								<p>No comments yet</p>
							}
						</div>
						:
						''
					}
				</div>
				:
				<p>No current article available atm</p>
			}

		</div>
	)
}

export default News
