import React from 'react';

interface PageContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, description, children }) => {
  return (
    <div>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {children}
    </div>
  );
};

export default PageContainer;