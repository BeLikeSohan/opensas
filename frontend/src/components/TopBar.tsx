function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a className="brand" href="/">
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <rect width="30" height="30" rx="8" fill="#16181D" />
            <path
              d="M8 13l7-4 7 4-7 4-7-4z"
              fill="none"
              stroke="#F6F5F1"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M11 15v4.5c0 1 1.8 2 4 2s4-1 4-2V15"
              fill="none"
              stroke="#F6F5F1"
              strokeWidth="1.8"
            />
          </svg>
          <span>ভর্তি ২০২৭</span>
        </a>
        <nav className="nav" aria-label="প্রধান মেনু">
          <a href="/" aria-current="page">
            শ্রেণিসমূহ
          </a>
        </nav>
      </div>
    </header>
  );
}

export default TopBar;
