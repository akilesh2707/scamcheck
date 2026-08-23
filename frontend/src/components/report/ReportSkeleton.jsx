export default function ReportSkeleton() {
  return (
    <div className="sc-container" style={{ padding: '48px 24px 96px' }}>
      <div className="sc-skeleton" style={{ height: 100, borderRadius: 16, marginBottom: 20 }} />
      <div className="sc-skeleton" style={{ height: 140, borderRadius: 16, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sc-skeleton" style={{ height: 100, borderRadius: 12 }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="sc-skeleton" style={{ height: 260, borderRadius: 16 }} />
        <div className="sc-skeleton" style={{ height: 260, borderRadius: 16 }} />
      </div>
    </div>
  );
}
