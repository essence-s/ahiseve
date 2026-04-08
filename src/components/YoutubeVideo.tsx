import { useState } from 'react';

interface YoutubeVideoProps {
  videoId: string;
  title?: string;
}

export default function YoutubeVideo({
  videoId,
  title = 'Video',
}: YoutubeVideoProps) {
  const [showVideo, setShowVideo] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoSrc = `https://www.youtube.com/embed/${videoId}`;

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  return (
    <div className='project-video'>
      {!showVideo ? (
        <>
          <img
            className='project-video__image'
            src={thumbnailUrl}
            alt={title}
          />
          <button
            className='project-video__play-btn'
            aria-label='Reproducir video'
            onClick={handlePlayClick}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z' />
            </svg>
          </button>
        </>
      ) : (
        <iframe
          src={`${videoSrc}?autoplay=1&controls=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1`}
          title={title}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      )}
    </div>
  );
}
