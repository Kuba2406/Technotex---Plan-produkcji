// ============================================================
// pages/index.tsx – Main application page
//
// Serves the existing vanilla-JS frontend as-is.
// The actual UI is rendered by public/app.js and public/data.js.
// ============================================================

import type { NextPage } from 'next';
import Head from 'next/head';
import Script from 'next/script';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Technotex – Plan produkcji</title>
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      {/* App shell – mirrors public/index.html structure exactly */}
      <div id="app">
        {/* Sidebar navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>Technotex</h1>
            <p>Plan produkcji</p>
          </div>
          <nav className="nav">
            <a className="nav-item" data-view="artykuly"      href="#artykuly">1. Artykuły</a>
            <a className="nav-item" data-view="zlecenia"      href="#zlecenia">2. Zlecenia produkcyjne</a>
            <a className="nav-item" data-view="snowalnia"     href="#snowalnia">3. Snowalnia</a>
            <a className="nav-item" data-view="klejarnia"     href="#klejarnia">4. Klejarnia</a>
            <a className="nav-item" data-view="magazyn"       href="#magazyn">5. Magazyn osnów</a>
            <a className="nav-item" data-view="przewlekalnia" href="#przewlekalnia">6. Przewlekalnia</a>
            <a className="nav-item" data-view="tkalnia"       href="#tkalnia">7. Tkalnia</a>
            <a className="nav-item" data-view="obecnosci"     href="#obecnosci">8. Obecności</a>
            <a className="nav-item" data-view="ustawienia"    href="#ustawienia">9. Ustawienia</a>
          </nav>
        </aside>

        {/* Main content – rendered by app.js */}
        <main className="main-content" id="main-content"></main>
      </div>

      {/* Modal overlay */}
      <div id="modal-overlay" className="modal-overlay hidden">
        <div id="modal-content"></div>
      </div>

      {/*
        Load data.js before app.js.
        data.js initialises the 'state' global and then
        asynchronously loads from the backend API.
        app.js renders the UI using that state.
      */}
      <Script src="/data.js" strategy="beforeInteractive" />
      <Script src="/app.js"  strategy="beforeInteractive" />
    </>
  );
};

export default Home;
