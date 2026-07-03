function VideoModal({ videoId, onClose }) {
  return (
    <div className="video-modal" onClick={onClose}>
      <div
        className="video-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Premiere Video"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export default VideoModal;
