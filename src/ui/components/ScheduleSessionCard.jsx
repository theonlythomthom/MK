export default function ScheduleSessionCard({
  sess,
  fps,
  results,
  setResults,
  currentConsole,
  order = 0,
  getScheduleThemeId,
  getScheduleTrackPreview,
  getScheduleThemeHint,
  MatchCardComponent,
}) {
  const themeId = getScheduleThemeId(sess, currentConsole);
  const trackPreview = getScheduleTrackPreview(sess, 4);

  return (
    <section
      className={`schedule-session schedule-theme-${themeId}`}
      style={{ '--session-order': order }}
    >
      <div className="schedule-session-ribbon">
        <span className="schedule-session-ribbon-text">Runde {sess.round}</span>
      </div>

      <div className="schedule-session-body">
        <div className="schedule-session-head">
          <div className="schedule-session-head-main">
            <span className="schedule-session-mode">{sess.modeName}</span>
            {sess.totalRounds > 1 ? (
              <span className="schedule-session-round-chip">
                {sess.round}/{sess.totalRounds}
              </span>
            ) : null}
            <span className="schedule-session-theme-hint">
              {getScheduleThemeHint(themeId)}
            </span>
          </div>

          <span className="chip schedule-session-count-chip" style={{ fontSize: 9 }}>
            {sess.groups.length} Matches
          </span>
        </div>

        {trackPreview ? (
          <div className="schedule-session-trackline" title={trackPreview}>
            {trackPreview}
          </div>
        ) : null}

        <div className="schedule-matches">
          {sess.groups.map((g, gi) => (
            <MatchCardComponent
              key={g.id}
              group={g}
              idx={gi}
              fps={fps}
              results={results}
              setResults={setResults}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
