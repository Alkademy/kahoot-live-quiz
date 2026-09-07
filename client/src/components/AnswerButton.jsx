export default function AnswerButton({ index, text, disabled, onClick }) {
  return (
    <button
      className={`answer answer-${index}`}
      disabled={disabled}
      onClick={() => onClick(index)}
    >
      <span className="answer-mark">{["◆", "●", "▲", "■"][index]}</span>
      {text}
    </button>
  );
}
