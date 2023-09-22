import "../styles/showimage.css";

function ShowImage({ onClose, tweet }) {
  // Estrai l'estensione del file dall'URL multimediale
  const fileExtension = tweet.imageUrl
    .split(".")
    .pop()
    .split("-")[0] // Rimuovi tutto dopo il primo trattino (-)
    .toLowerCase();
  // Verifica se l'URL contiene un prefisso che indica che è un video
  const isVideo = tweet.imageUrl.includes("/videos");

  if (isVideo) {
    return (
      <div className="videoDiv">
        <button onClick={onClose}>X</button>
        <video controls>
          <source src={tweet.imageUrl} type={`video/${fileExtension}`} />
          Il tuo browser non supporta la riproduzione di video.
        </video>
      </div>
    );
  } else {
    // Altrimenti, assume che sia un'immagine
    return (
      <div className="imageDiv">
        <button onClick={onClose}>X</button>
        <img src={tweet.imageUrl} alt="tweet" />
      </div>
    );
  }
}

export default ShowImage;
