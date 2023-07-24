import React, { useState, useEffect } from "react";
import { signOutUser } from "../firebase";
import { fetchFollowingUsersTweets } from "../firebaseUtils";
import "../styles/home.css";
import heartsvg from "../img/heart-svgrepo-com.svg";
import commentsvg from "../img/chat-round-svgrepo-com.svg";
import rtsvg from "../img/refresh-svgrepo-com.svg";

function Homepage() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(5);
  const [displayedTweets, setDisplayedTweets] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchTweets = async () => {
      const tweetsData = await fetchFollowingUsersTweets();

      // Uniamo tutti i tweet in un unico array e ordiniamoli in base al timestamp
      const allTweets = tweetsData.reduce(
        (acc, userTweets) => acc.concat(userTweets),
        []
      );
      allTweets.sort((a, b) => a.timestamp - b.timestamp); // Ordiniamo in ordine crescente per ottenere i tweet più recenti per primi

      setTweets(allTweets.reverse());
      setDataLoaded(allTweets.length > 0);
    };

    fetchTweets();
  }, []);

  const handleLoadMore = () => {
    if (endIndex < tweets.length) {
      setStartIndex(startIndex + 5);
      setEndIndex(endIndex + 5);
    }
  };

  const handleGoBack = () => {
    if (startIndex >= 5) {
      setStartIndex(startIndex - 5);
      setEndIndex(endIndex - 5);
    }
  };

  useEffect(() => {
    const displayedTweetsSlice = tweets.slice(startIndex, endIndex);
    setDisplayedTweets(displayedTweetsSlice);
  }, [tweets, startIndex, endIndex]);

  return (
    <div className="homepage">
      <div className="headerDiv">
        <p>Homepage Test</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="componentButtonDiv">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="tweetsDiv">
            {displayedTweets.map((tweet) => (
              <div key={tweet.key} className="tweet">
                <div className="topTweetDiv">
                  <h3>{tweet.name}</h3>
                  <p>idplaceholder</p>
                  <p>-</p>
                  <p>{tweet.timestamp}</p>
                </div>

                <div className="contentDiv">
                  <p>{tweet.content}</p>
                </div>

                <div className="reactionsDiv">
                  <div className="likesDiv">
                    <img src={heartsvg} alt="likeicon" />
                    <p>{tweet.likes}</p>
                  </div>
                  <div className="rtDiv">
                    <img src={rtsvg} alt="rticon" />
                    <p>{tweet.rt}</p>
                  </div>
                  <div className="commentsDiv">
                    <img src={commentsvg} alt="commenticon" />
                    <p>{tweet.comments}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="buttonsDiv">
          {startIndex >= 5 && <button onClick={handleGoBack}>Go Back</button>}
          {endIndex < tweets.length &&
            dataLoaded && ( // Assicurati che i dati siano stati caricati prima di mostrare il pulsante "Load More"
              <button onClick={handleLoadMore}>Load More</button>
            )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;

//render buttonsDiv da controllare
//aggiungere keyvalue per il nome anche a usertweets collection
