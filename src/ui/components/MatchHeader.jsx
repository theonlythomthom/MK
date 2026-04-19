export default function MatchHeader({ title, track, status = 'open' }) {
  return (
    <div className="match-head">
      <div className="match-head-left">
        <span className={`match-head-dot is-${status}`} />
        <span className="match-head-title">{title}</span>
      </div>
      <span className="match-track" title={track || ''}>
        {track || '—'}
      </span>
    </div>
  );
}
