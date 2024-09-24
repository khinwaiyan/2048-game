import '../styles/overlay.styled.css';
export const Overlay = () => {
  return (
    <div className="overlay">
      <h2>Game Over!</h2>
      <button onClick={startNewGame}>Try again</button>
    </div>
  );
};
