import React, { useState, useEffect } from "react";
import { signOutUser } from "../firebase";
import {
  fetchFollowingUsersTweets,
  exploreTweets,
  toggleLike,
  toggleRt,
  addComment,
  auth,
} from "../firebaseUtils";
import "../styles/home.css";
import Comment from "./comment";
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
  const [showExplore, setShowExplore] = useState(false);
  const [exploreData, setExploreData] = useState(null);
  const [user, setUser] = useState(null);

  const [selectedTweetId, setSelectedTweetId] = useState(null);

  const handleToggleLike = async (tweetId, authorId) => {
    try {
      await toggleLike(tweetId, authorId);
      fetchTweets();
    } catch (error) {
      console.error(
        "Errore durante l'aggiornamento del like del tweet:",
        error
      );
    }
  };

  const handleToggleRt = async (tweetId, authorId) => {
    try {
      await toggleRt(tweetId, authorId);
      fetchTweets();
    } catch (error) {
      console.error("errore durante l'aggiornamento dei rt del tweet:", error);
    }
  };

  const handleToggleExplore = () => {
    setShowExplore((prevShowExplore) => !prevShowExplore);
    setStartIndex(0);
    setEndIndex(5);
  };

  const handleComment = (tweetId) => {
    console.log(tweetId.key);
    setSelectedTweetId((prevSelectedTweetId) => {
      // Verifica se il tweetId corrente è già presente nello stato
      const isTweetSelected = prevSelectedTweetId === tweetId.key;

      return isTweetSelected ? null : tweetId.key;
    });
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTweets = async () => {
    let tweetsData;
    if (showExplore) {
      tweetsData = await exploreTweets(exploreData);
      setExploreData(tweetsData);
    } else {
      tweetsData = await fetchFollowingUsersTweets();
    }

    setTweets(tweetsData);
    setDataLoaded(tweetsData.length > 0);
  };

  useEffect(() => {
    fetchTweets();
  }, [showExplore]);

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

  useEffect(() => {
    // Function to divide tweets into arrays based on date
    const divideTweetsByDate = (tweets) => {
      const tweetsByDate = {};
      tweets.forEach((tweet) => {
        const timestamp = new Date(tweet.timestamp);
        if (isNaN(timestamp)) {
          // Invalid date, skip this tweet
          return;
        }
        const dateKey = timestamp.toDateString();
        if (!tweetsByDate[dateKey]) {
          tweetsByDate[dateKey] = [];
        }
        tweetsByDate[dateKey].push(tweet);
      });
      return tweetsByDate;
    };

    // Divide tweets into arrays based on date
    const tweetsByDate = divideTweetsByDate(tweets);

    // Log each of the new arrays
    for (const dateKey in tweetsByDate) {
      console.log(`Tweets for date ${dateKey}:`, tweetsByDate[dateKey]);
    }
  }, [tweets]);

  useEffect(() => {
    const utente = auth.currentUser;
    setUser(utente);
  }, []);

  useEffect(() => {
    if (selectedTweetId) {
      document.body.classList.add("comment-active");
    } else {
      document.body.classList.remove("comment-active");
    }
  }, [selectedTweetId]);

  return (
    <div className="homepage">
      <div className="headerDiv">
        <p>Homepage Test</p>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={handleToggleExplore}>
          {" "}
          {showExplore ? "Following" : "Explore"}
        </button>
      </div>
      <div className="componentButtonDiv">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="tweetsDiv">
            {displayedTweets.map((tweet) => {
              if (tweet.retweeted) {
                // Contenuto del retweet
                return (
                  <div key={tweet.key} className="tweet">
                    <div className="topTweetDiv">
                      <h3>Retweeted by {tweet.rtName}: </h3>
                      <h3>{tweet.name}</h3>
                      <p>idplaceholder</p>
                      <p>-</p>
                      <p>{tweet.date}</p>
                      <p>{tweet.timestamp}</p>
                    </div>

                    <div className="contentDiv">
                      <p>{tweet.content}</p>
                    </div>

                    <div className="reactionsDiv">
                      <div
                        className="likesDiv"
                        onClick={() => handleToggleLike(tweet.key, user.uid)}
                      >
                        <img src={heartsvg} alt="likeicon" />
                        <p>{tweet.likes}</p>
                      </div>
                      <div
                        className="rtDiv"
                        onClick={() => handleToggleRt(tweet.key, tweet.userId)}
                      >
                        <img src={rtsvg} alt="rticon" />
                        <p>{tweet.rt}</p>
                      </div>
                      <div
                        className="commentsDiv"
                        onClick={() => handleComment(tweet, user)}
                      >
                        <img src={commentsvg} alt="commenticon" />
                        <p>{tweet.comments}</p>
                      </div>
                      {selectedTweetId === tweet.key && (
                        <Comment
                          onAllTweet={tweet}
                          setSelectedTweetId={setSelectedTweetId}
                        />
                      )}
                    </div>
                  </div>
                );
              } else {
                // Contenuto del tweet originale
                return (
                  <div key={tweet.key} className="tweet">
                    <div className="topTweetDiv">
                      <h3>{tweet.name}</h3>
                      <p>idplaceholder</p>
                      <p>-</p>
                      <p>{tweet.date}</p>
                      <p>{tweet.timestamp}</p>
                    </div>

                    <div className="contentDiv">
                      <p>{tweet.content}</p>
                    </div>

                    <div className="reactionsDiv">
                      <div
                        className="likesDiv"
                        onClick={() =>
                          handleToggleLike(tweet.key, tweet.userId)
                        }
                      >
                        <img src={heartsvg} alt="likeicon" />
                        <p>{tweet.likes}</p>
                      </div>
                      <div
                        className="rtDiv"
                        onClick={() => handleToggleRt(tweet.key, tweet.userId)}
                      >
                        <img src={rtsvg} alt="rticon" />
                        <p>{tweet.rt}</p>
                      </div>
                      <div
                        className="commentsDiv"
                        onClick={() => handleComment(tweet, user)}
                      >
                        <img src={commentsvg} alt="commenticon" />
                        <p>{tweet.comments.length}</p>
                      </div>
                      {selectedTweetId === tweet.key && (
                        <Comment
                          onAllTweet={tweet}
                          setSelectedTweetId={setSelectedTweetId}
                        />
                      )}
                    </div>
                  </div>
                );
              }
            })}
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
