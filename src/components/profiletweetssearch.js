import React, { useEffect, useState } from "react";
import { fetchUserTweetsIn, toggleLike, toggleRt } from "../firebaseUtils";
import heartsvg from "../img/heart-svgrepo-com.svg";
import commentsvg from "../img/chat-round-svgrepo-com.svg";
import rtsvg from "../img/refresh-svgrepo-com.svg";
import Comment from "./comment";
import ShowImage from "./showimage";

const ProfileTweetsSearch = ({ documentId, user }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(5);
  const [selectedTweetId, setSelectedTweetId] = useState(null);
  const [viewingImage, setViewingImage] = useState(false);

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

  useEffect(() => {
    fetchUserTweetsIn(documentId).then((userTweets) => {
      // Passa l'ID del documento a fetchUserTweets
      setTweets(userTweets.reverse());
      setLoading(false);
    });
  }, [documentId]);

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

  const handleToggleLike = async (tweetId, authorId) => {
    try {
      await toggleLike(tweetId, authorId);
      const updatedTweets = await fetchUserTweetsIn(documentId);
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
      fetchUserTweetsIn(documentId).then((userTweets) => {
        // Passa l'ID del documento a fetchUserTweets
        setTweets(userTweets.reverse());
        setLoading(false);
      });
    } catch (error) {
      console.error("errore durante l'aggiornamento dei rt del tweet:", error);
    }
  };

  const handleViewImage = (tweet) => {
    console.log("View Image button clicked for tweet:", tweet);
    setViewingImage(true);
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
              console.log(tweet);
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
                    <div className="commentsDiv">
                      <img
                        src={commentsvg}
                        alt="commenticon"
                        onClick={() => handleComment(tweet, user)}
                      />
                      <p>{String(tweet.comments.length)}</p>
                    </div>

                    {selectedTweetId === tweet.key && (
                      <Comment
                        onAllTweet={tweet}
                        setSelectedTweetId={setSelectedTweetId}
                      />
                    )}
                  </div>
                  {tweet.imageUrl && (
                    <div className="imageButton">
                      <p
                        onClick={() => handleViewImage(tweet)}
                        className="fakeButton"
                      >
                        View Image
                      </p>

                      {viewingImage && (
                        <ShowImage
                          onClose={() => setViewingImage(false)}
                          tweet={tweet}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            } else {
              // Contenuto del tweet originale
              console.log(tweet);

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
                  {tweet.imageUrl && (
                    <div className="imageButton">
                      <p
                        onClick={() => handleViewImage(tweet)}
                        className="fakeButton"
                      >
                        View Image
                      </p>

                      {viewingImage && (
                        <ShowImage
                          onClose={() => setViewingImage(false)}
                          tweet={tweet}
                        />
                      )}
                    </div>
                  )}
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

export default ProfileTweetsSearch;
