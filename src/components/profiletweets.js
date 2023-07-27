import React, { useEffect, useState } from "react";
import { fetchUserTweets, toggleLike, toggleRt, auth } from "../firebaseUtils";
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
                      <p>{tweet.likes}</p>
                    </div>
                    <div
                      className="rtDiv"
                      onClick={() => handleToggleRt(tweet.key, tweet.userId)}
                    >
                      <img src={rtsvg} alt="rticon" />
                      <p>{tweet.rt}</p>
                    </div>
                    <div className="commentsDiv">
                      <img src={commentsvg} alt="commenticon" />
                      <p>{tweet.comments}</p>
                    </div>
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
                      <p>{tweet.likes}</p>
                    </div>
                    <div
                      className="rtDiv"
                      onClick={() => handleToggleRt(tweet.key, tweet.userId)}
                    >
                      <img src={rtsvg} alt="rticon" />
                      <p>{tweet.rt}</p>
                    </div>
                    <div className="commentsDiv">
                      <img src={commentsvg} alt="commenticon" />
                      <p>{tweet.comments}</p>
                    </div>
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

//gestire rt su utente loggato dei suoi tweet, massimo una volta? oppure piu' volte?
//gestire rt da altro utente adesso solo 1 volta sullo stesso tweet altrimenti lo rimuove.
//aggiungere logica rt a explore.
//creare elimina tweet da profileTweets
//MACRO FEATURE: EDIT PROFILE / COMMENTI / FOTO E VIDEO
