import MatchHeader from './MatchHeader.jsx';

export default function CompactPlacementCard({
  group,
  idx,
  fps,
  results,
  setResults,
  status = 'open',
  fpShort,
  fpLines,
  updateGroupPlacementState,
}) {
  const playerIds = (group?.fps) || [];
  const columnSize = Math.max(1, Math.ceil(playerIds.length / 2));
  const columns = [];
  for (let start = 0; start < playerIds.length; start += columnSize) {
    columns.push(playerIds.slice(start, start + columnSize));
  }

  const groupResults = results[group.id] || {};
  const placements = groupResults.placements || {};

  return (
    <div className="match-box-strong">
      <MatchHeader title={`Match ${idx + 1}`} track={group.track} status={status} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))`,
          gap: 6,
        }}
      >
        {columns.map((column, columnIndex) => (
          <div
            key={`compact_col_${columnIndex}`}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {column.map((fid) => {
              const fp = fps.find((f) => f.id === fid);
              const pl = placements[fid] ?? '';
              const pc =
                pl === 1
                  ? '#c8960a'
                  : pl === 2
                    ? '#888'
                    : pl === 3
                      ? '#9a5000'
                      : 'var(--muted)';
              const takenInline = playerIds
                .filter((id) => id !== fid)
                .map((id) => placements[id])
                .filter(Boolean);

              return (
                <div
                  key={fid}
                  className={`placement-row${pl ? ' is-selected' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 4px',
                    borderBottom: '1.5px solid #d9ddea',
                  }}
                >
                  {pl ? (
                    <span style={{ fontFamily: 'var(--fd)', fontSize: 10, color: pc, minWidth: 14 }}>
                      {pl}.
                    </span>
                  ) : null}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fp ? fpShort(fp) : '?'}
                    </div>
                    {fp && fpLines(fp).length > 0 ? (
                      <div style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1.2 }}>
                        {fpLines(fp).join(' · ')}
                      </div>
                    ) : null}
                  </div>
                  <select
                    className={`placement-select${pl ? ' is-filled' : ''}`}
                    style={{
                      width: 40,
                      fontSize: 10,
                      padding: '2px',
                      border: '1px solid var(--bord2)',
                      borderRadius: 3,
                      background: '#fff',
                    }}
                    value={pl}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateGroupPlacementState(
                        setResults,
                        group,
                        {
                          placements: {
                            ...(placements || {}),
                            [fid]: v ? parseInt(v, 10) : null,
                          },
                        },
                        !!v,
                      );
                    }}
                  >
                    <option value="">–</option>
                    {playerIds.map((_, i) => {
                      const rank = i + 1;
                      const disabled = takenInline.includes(rank);
                      return (
                        <option key={rank} value={rank} disabled={disabled}>
                          {rank}.{disabled ? '✗' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
