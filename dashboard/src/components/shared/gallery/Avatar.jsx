import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ avatarUrl, onAvatarClick, loading }) => {
  const imageNumber = avatarUrl.split('/').pop().split('.')[0]; 
  const [imageError, setImageError] = useState(false); 

  return (
    <div className="g-avatar ml-2">
      <div className="w-full">
        <div className="bg-sub-black rounded-md shadow-xl duration-300 hover:scale-105 dark:hover:bg-gray-700 hover:bg-gray-200 sm:p-3 p-2">
          <div className="w-full sm:mb-3 mb-2">
            {loading || imageError ? (
              <div className="bg-gray-200 rounded-full shadow-xl h-28 w-28 animate-pulse"></div>
            ) : (
              <img
              className="w-full shadow-md rounded-full"
              src={avatarUrl}
              alt={`Avatar ${imageNumber}`}
              aria-label={`Avatar ${imageNumber}`}
              width={500} 
              height={500}
              onError={() => setImageError(true)}
              onClick={onAvatarClick}
            />
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            {loading || imageError  ? (
              <div className="bg-gray-200 rounded-full h-6 w-6 animate-pulse"></div>
            ) : (
              <a
                href={avatarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:h-7 h-6 p-1.5 rounded-full bg-white bg-opacity-20 fill-main-white hover:bg-green hover:fill-main-black"
                title="Download avatar image"
              >
                <svg className="h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g>
                    <path d="M0,0h24v24H0V0z" fill="none"></path>
                  </g>
                  <g>
                    <path d="M18,2h-8L4,8v12c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V4C20,2.9,19.1,2,18,2z M12,17l-4-4h3V9.02L13,9v4h3L12,17z"></path>
                  </g>
                </svg>
              </a>
            )}
            <span>
              {loading || imageError ? (
                <div className="bg-gray-200 rounded-full h-6 w-6 animate-pulse"></div>
              ) : (
                `#${imageNumber}`
              )}
            </span> 
          </div>
        </div>
      </div>
    </div>
  );
};

Avatar.propTypes = {
  avatarUrl: PropTypes.string.isRequired,
  onAvatarClick: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default Avatar;
