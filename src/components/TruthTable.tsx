export const TruthTable = ({ expression, headers, rows }) => {
  if (!headers) return null;

  const lastIdx = headers.length - 1;

  const colClass = (header, idx) => {
    if (idx === lastIdx) return "last-col";
    if (header.length <= 2 && /^[a-z]/.test(header)) return "var-col";
    return "";
  };

  return (
    <div className="result">
      <div className="expr-label">{expression}</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className={colClass(h, i)}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const isTrue = cell === "T" || cell === "V";
                  return (
                    <td key={ci} className={isTrue ? "val-t" : "val-f"}>
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
