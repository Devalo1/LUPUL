const Navbar = () => {
  return (
    <header
      className="navbar-container"
      style={{
        zIndex: 2, // Lower z-index to ensure Navbar is below the HomePage overlay
      }}
    >
      {/* Add your Navbar content here */}
    </header>
  );
};

export default Navbar;