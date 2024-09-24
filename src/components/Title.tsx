import '../styles/title.styled.css';
type TitleProps = {
  score: number;
  bestScore: number;
};
export const Title = ({ score, bestScore }: TitleProps) => {
  return (
    <>
      <div className="title">2048</div>
      <div className="scoreboard">
        <div>Score: {score}</div>
        <div>Best: {bestScore}</div>
      </div>
    </>
  );
};
