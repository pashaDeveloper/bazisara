import React from "react";

const Company = ({ ...props }) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M4 21V5.5C4 4.12 5.12 3 6.5 3h7C14.88 3 16 4.12 16 5.5V9h1.5c1.38 0 2.5 1.12 2.5 2.5V21h-2v-9.5c0-.28-.22-.5-.5-.5H16v10h-4v-4H8v4zm4-12h2V7H8zm0 4h2v-2H8zm4-4h2V7h-2zm0 4h2v-2h-2z"
      />
    </svg>
  );
};

export default Company;
