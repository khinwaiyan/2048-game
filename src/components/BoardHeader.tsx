import '../styles/boardHeader.styled.css';
export const BoardHeader = () => {
  return (
    <div className="header">
      <button onClick={startNewGame}>New Game</button>
      <button onClick={startNewGame}>New Game</button>
    </div>
  );
};
