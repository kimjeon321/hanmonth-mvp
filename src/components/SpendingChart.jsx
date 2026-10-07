import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { spending } from '../data';

const CHART_COLOR = '#0f766e';

// 지역 소비 특징 차트: 카테고리별 소비 비율(%)을 가로 막대로 보여줍니다.
// 아래 표에서 전체 지역 평균과 비교할 수 있습니다.
export default function SpendingChart({ data }) {
  const keys = Object.keys(spending.categories);
  const all = Object.values(spending.regions);

  const rows = keys.map((key) => ({
    name: spending.categories[key],
    value: data[key],
    average: Math.round(all.reduce((sum, r) => sum + r[key], 0) / all.length),
  }));

  return (
    <div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 4 }}>
            <XAxis type="number" domain={[0, 50]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={44}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4a5a60', fontSize: 14 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--hover)' }}
              formatter={(v) => [`${v}%`, '소비 비율']}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
              }}
            />
            <Bar dataKey="value" fill={CHART_COLOR} radius={[0, 4, 4, 0]} barSize={22} isAnimationActive={false}>
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v) => `${v}%`}
                fill="#1b2a2f"
                fontSize={13}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="data-table small">
        <caption className="muted">표로 보기 (단위: %)</caption>
        <thead>
          <tr>
            <th>항목</th>
            {rows.map((r) => <th key={r.name}>{r.name}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>이 지역</td>
            {rows.map((r) => <td key={r.name}>{r.value}</td>)}
          </tr>
          <tr>
            <td className="muted">전체 평균</td>
            {rows.map((r) => <td key={r.name} className="muted">{r.average}</td>)}
          </tr>
        </tbody>
      </table>
      <p className="muted small">출처: {spending.source}</p>
    </div>
  );
}
