"use client";

export function FieldList({
  fields,
  selectedId,
  onSelect,
}: {
  fields: any[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {fields.map((field) => (
        <div
          key={field.id}
          onClick={() => onSelect(field.id)}
          className={`border rounded-lg p-3 cursor-pointer ${
            selectedId === field.id
              ? "border-blue-500"
              : "border-zinc-700"
          }`}
        >
          <p className="font-medium">{field.label}</p>
          <p className="text-xs text-zinc-500">{field.type}</p>
        </div>
      ))}
    </div>
  );
}