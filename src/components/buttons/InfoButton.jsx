import React from 'react';

const InfoButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-3 py-1 rounded-md text-sm font-medium transition-colors"
    >
      Nutrition Info
    </button>
  );
};

export default InfoButton;