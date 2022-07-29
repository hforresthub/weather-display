import './styles/App.scss';
import { useEffect, useState, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import Weather from './components/Weather';
import News from './components/News';
import UserThreads from './components/UserThreads';

// import backupNewsData from './backupData/backupNewsData.json'
import backupNewsData2 from './components/backupData/backupNewsData2.json'

//firebase
import realtime from './components/firebase'
import { ref, onValue, push, update } from "firebase/database";

//firebase auth tests
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut, onAuthStateChanged } from "firebase/auth";

//fontawesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudSunRain, faCommentDots, faNewspaper } from '@fortawesome/free-solid-svg-icons'

library.add(faCloudSunRain, faNewspaper, faCommentDots)

function App() {

	// news state variables
	const [newsArticles, setNewsArticles] = useState(backupNewsData2.data)
	const [currentArticle, setCurrentArticle] = useState(null)
	//firebase state variables
	const [savedArticles, setSavedArticles] = useState([])

	// user state variable
	const [user, setUser] = useState({ name: 'Anonymous', picture: `./images/favicon.png` })
	const [firebaseUser, setFirebaseUser] = useState(null)

	// button variables
	const myRef = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]

	// toggle variables
	const [sectionToggles, setSectionToggles] = useState([true, true, true, true, true, true])

	// button functions
	const handleButtonClick = (index) => (event) => {
		setSectionToggles((prev) => prev.map((toggle, toggleIndex) => ((toggleIndex === index) ? !toggle : toggle)))
	}
	const executeScroll = (index) => () => {
		return myRef[index].current.scrollIntoView()
	}

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

	return (
		<Router>
			<div className='App'>
				<nav>
					<ul>
						<li>
							<Link to="/">
								<FontAwesomeIcon icon="fa-solid fa-cloud-sun-rain" /><span> Weather</span>
							</Link>
						</li>
						<li>
							<Link to="/News">
								<FontAwesomeIcon icon="fa-solid fa-newspaper" /><span> News</span>
							</Link>
						</li>
						<li>
							<Link to="/Threads">
								<FontAwesomeIcon icon="fa-solid fa-comment-dots" /><span> Threads</span>
							</Link>
						</li>
					</ul>
				</nav>
				<header>
					<img src={require(`./images/sky.png`)} alt="Clouds" className='skyBanner' />
					<h1>Weatherenews</h1>
				</header>
				<div className="container">
					{/* google login button */}
					<div className='googleLoginContainer'>
						{firebaseUser !== null ?
							<button onClick={(e) => handleSignout(e)}>Sign out with Google</button>
							:
							<button type="button" onClick={handleFirebaseLogin}>Google login</button>
						}
						{firebaseUser !== null &&
							<div>
								<div className='loginCard'>
									<img src={firebaseUser.photoURL} alt=""></img>
									<h3>{firebaseUser.displayName}</h3>
								</div>
							</div>
						}
					</div>


					<Routes>
						<Route exact path="/"
							element={<Weather handleButtonClick={handleButtonClick} sectionToggles={sectionToggles} myRef={myRef} />}
						>
						</Route>
						<Route exact path="/News"
							element={<News handleButtonClick={handleButtonClick} sectionToggles={sectionToggles} myRef={myRef} firebaseUser={firebaseUser}
								savedArticles={savedArticles}
								setSavedArticles={setSavedArticles}
								currentArticle={currentArticle}
								setCurrentArticle={setCurrentArticle}
								newsArticles={newsArticles}
								setNewsArticles={setNewsArticles}
							/>}
						>
						</Route>
						<Route exact path="/Threads"
							element={<UserThreads handleButtonClick={handleButtonClick} sectionToggles={sectionToggles} myRef={myRef} firebaseUser={firebaseUser} />}
						>
						</Route>
					</Routes>

				</div>
				<footer>
					<img src={require(`./images/lowerSky.png`)} alt="Clouds" className='skyBanner' />
				</footer>
			</div>
		</Router>
	);
}

export default App;
