export default function AnswerReview({ entries = [] }) {
  return (
    <section className="answer-review" aria-labelledby="answer-review-title">
      <h2 id="answer-review-title">Answer review</h2>
      <div className="answer-review-list">
        {entries.map((entry, index) => (
          <article
            className={`answer-review-item ${entry.correct ? "is-correct" : "is-incorrect"}`}
            key={entry.questionId}
          >
            <p className="answer-review-number">Question {index + 1}</p>
            <h3>{entry.question}</h3>
            <dl>
              <div>
                <dt>Your answer</dt>
                <dd>{entry.selectedAnswer ?? "No answer"}</dd>
              </div>
              <div>
                <dt>Correct answer</dt>
                <dd>{entry.correctAnswer}</dd>
              </div>
            </dl>
            <p className="answer-review-status" aria-label={entry.correct ? "Correct" : "Incorrect"}>
              <span aria-hidden="true">{entry.correct ? "✓" : "✗"}</span>
              {entry.correct ? "Correct" : "Incorrect"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
