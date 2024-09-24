import '../styles/board.styled.css';
export const Board = () => {
  return (
    <div className="grid-container">
      {grid.map((row, i) => (
        <div key={i} className="grid-row">
          {row.map((cell, j) => (
            <div key={j} className={`grid-cell value-${cell}`}>
              {cell !== 0 ? cell : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
