import '../styles/overlay.styled.css';

type OverlayProps = {
  message: string;
  resetGame: () => void;
};

export const Overlay = ({ message, resetGame }: OverlayProps) => {
  return (
    <div className="overlay">
      <h2>{message}</h2>
      <button onClick={resetGame}>Try again</button>
    </div>
  );
};
