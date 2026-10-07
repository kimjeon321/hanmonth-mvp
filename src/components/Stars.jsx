// 별점 표시 (예: ★★★★☆)
export default function Stars({ value }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`별점 ${value}점`}>
      {'★'.repeat(full)}
      <span className="stars-empty">{'★'.repeat(5 - full)}</span>
    </span>
  );
}
