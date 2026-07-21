import React from 'react';

const GovAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default GovAdminGuard;
