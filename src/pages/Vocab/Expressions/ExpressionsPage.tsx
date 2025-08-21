import { Helmet } from 'react-helmet-async';

export function ExpressionsPage() {
  return (
    <>
      <Helmet>
        <title>Expressions - SarabaJa</title>
        <meta name="description" content="Understand expressions in their proper context. Learn how Japanese expressions change meaning based on usage." />
      </Helmet>
      
      <div className="vocab-page">
      <h2 className="page-title">Contextually Defined Expressions</h2>
      <p className="page-description">
        Understand expressions in their proper context. Learn how Japanese expressions change meaning based on usage.
      </p>
      
      <div className="content-section">
        <h3>Lorem Ipsum Content</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>
    </>
  );
} 