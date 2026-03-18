interface Props {
  title: string;
}

export function PlaceholderPage({ title }: Props) {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">{title}</h1>
      <p className="text-muted-foreground text-sm">This section is under development.</p>
      <div className="mt-8 border border-border border-dashed rounded-lg p-12 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Content for "{title}" will appear here.</span>
      </div>
    </div>
  );
}
