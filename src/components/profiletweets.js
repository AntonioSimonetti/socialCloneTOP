import React, { useEffect, useState } from "react";
import {
  fetchUserTweets,
  toggleLike,
  toggleRt,
  removeTweet,
  auth,
} from "../firebaseUtils";
import Comment from "./comment";
import heartsvg from "../img/heart-svgrepo-com.svg";
import commentsvg from "../img/chat-round-svgrepo-com.svg";
import rtsvg from "../img/refresh-svgrepo-com.svg";

const Profiletweets = (props) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(5);
  const { user } = props;
  const [userId, setUserId] = useState(null);

  const [selectedTweetId, setSelectedTweetId] = useState(null);

  useEffect(() => {
    if (selectedTweetId) {
      document.body.classList.add("comment-active");
    } else {
      document.body.classList.remove("comment-active");
    }
  }, [selectedTweetId]);

  const handleComment = (tweetId) => {
    console.log(tweetId.key);
    setSelectedTweetId((prevSelectedTweetId) => {
      // Verifica se il tweetId corrente è già presente nello stato
      const isTweetSelected = prevSelectedTweetId === tweetId.key;

      return isTweetSelected ? null : tweetId.key;
    });
  };
  console.log("41");
  useEffect(() => {
    fetchAllTweets();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    setUserId(user);
  }, [userId]);

  const fetchAllTweets = async () => {
    const allTweets = await fetchUserTweets(); // Recupera tutti i tweet
    setTweets(allTweets.reverse()); // Inverte l'ordine dei tweet
    setLoading(false);
  };

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

  const displayedTweets = tweets.slice(startIndex, endIndex);

  const handleToggleLike = async (tweetId, userId) => {
    console.log("handletogglelike executed");
    try {
      await toggleLike(tweetId, userId);
      const updatedTweets = await fetchUserTweets();

      // Aggiorna lo stato con i nuovi tweet
      setTweets(updatedTweets.reverse());
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
      fetchAllTweets();
    } catch (error) {
      console.error("errore durante l'aggiornamento dei rt del tweet:", error);
    }
  };

  const handleRemoveTweet = async (tweetId, userId) => {
    try {
      await removeTweet(tweetId, userId);
      const updatedTweets = await fetchUserTweets();

      // Aggiorna lo stato con i nuovi tweet
      setTweets(updatedTweets.reverse());
    } catch (error) {
      console.error("Errore durante la rimozione del tweet:", error);
    }
  };

  return (
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
                    <h3>Retweeted by {user.name}:</h3>
                    <h3>{tweet.name}</h3>
                    <p>idplaceholder</p>
                    <p>-</p>
                    <p>{tweet.date}</p>
                    <p>{tweet.timestamp}</p>
                    <button
                      onClick={() => handleRemoveTweet(tweet.key, tweet.userId)}
                    >
                      X
                    </button>
                  </div>

                  <div className="contentDiv">
                    <p>{tweet.content}</p>
                  </div>

                  <div className="reactionsDiv">
                    <div
                      className="likesDiv"
                      onClick={() => handleToggleLike(tweet.key, userId.uid)}
                    >
                      <img src={heartsvg} alt="likeicon" />
                      <p>{String(tweet.likes)}</p>
                    </div>
                    <div
                      className="rtDiv"
                      onClick={() => handleToggleRt(tweet.key, tweet.userId)}
                    >
                      <img src={rtsvg} alt="rticon" />
                      <p>{String(tweet.rt)}</p>
                    </div>
                    <div
                      className="commentsDiv"
                      onClick={() => handleComment(tweet, user)}
                    >
                      <img src={commentsvg} alt="commenticon" />
                      <p>{String(tweet.comments.length)}</p>
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
                    <h3>{user.name}</h3>
                    <p>idplaceholder</p>
                    <p>-</p>
                    <p>{tweet.date}</p>
                    <p>{tweet.timestamp}</p>
                    <button
                      onClick={() => handleRemoveTweet(tweet.key, tweet.userId)}
                    >
                      X
                    </button>
                  </div>

                  <div className="contentDiv">
                    <p>{tweet.content}</p>
                  </div>

                  <div className="reactionsDiv">
                    <div
                      className="likesDiv"
                      onClick={() => handleToggleLike(tweet.key, tweet.userId)}
                    >
                      <img src={heartsvg} alt="likeicon" />
                      <p>{String(tweet.likes)}</p>
                    </div>
                    <div
                      className="rtDiv"
                      onClick={() => handleToggleRt(tweet.key, tweet.userId)}
                    >
                      <img src={rtsvg} alt="rticon" />
                      <p>{String(tweet.rt)}</p>
                    </div>
                    <div
                      className="commentsDiv"
                      onClick={() => handleComment(tweet, user)}
                    >
                      <img src={commentsvg} alt="commenticon" />
                      <p>{String(tweet.comments.length)}</p>
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
        {endIndex < tweets.length && (
          <button onClick={handleLoadMore}>Load More</button>
        )}
      </div>
    </div>
  );
};

export default Profiletweets;
