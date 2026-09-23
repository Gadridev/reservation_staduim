interface PolicyNoticeProps {
  title: string;
  children: string;
}

export function PolicyNotice({ title, children }: PolicyNoticeProps) {
  return (
    <div className="mb-9 rounded-[10px] border border-[#eddcb2] border-l-4 border-l-amber-deep bg-[#fff8ea] px-4 py-4 text-[13.5px] leading-relaxed">
      <p className="mb-1 text-[13px] font-bold uppercase tracking-wide text-ink">{title}</p>
      {children}
    </div>
  );
}
