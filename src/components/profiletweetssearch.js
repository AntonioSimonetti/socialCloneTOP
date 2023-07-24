import React, { useEffect, useState } from "react";
import { fetchUserTweetsIn } from "../firebaseUtils";
import heartsvg from "../img/heart-svgrepo-com.svg";
import commentsvg from "../img/chat-round-svgrepo-com.svg";
import rtsvg from "../img/refresh-svgrepo-com.svg";

const ProfileTweetsSearch = ({ documentId, user }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(5);

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

  return (
    <div className="componentButtonDiv">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="tweetsDiv">
          {displayedTweets.map((tweet) => (
            <div key={tweet.key} className="tweet">
              <div className="topTweetDiv">
                <h3>{user.name}</h3>
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
        {endIndex < tweets.length && (
          <button onClick={handleLoadMore}>Load More</button>
        )}
      </div>
    </div>
  );
};

export default ProfileTweetsSearch;
