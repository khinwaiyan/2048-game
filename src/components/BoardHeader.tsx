import '../styles/boardHeader.styled.css';

type BoardHeaderProps = {
  resetGame: () => void;
  undo: () => void;
};

export const BoardHeader = ({ resetGame, undo }: BoardHeaderProps) => {
  return (
    <div className="header">
      <button onClick={resetGame}>New Game</button>
      <button onClick={undo}>Undo</button>
    </div>
  );
};
