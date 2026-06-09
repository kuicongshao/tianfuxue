"use client";

type Entity = {
  id: string;
  name: string;
  entity_type: string;
  confidence?: number;
};

type Relation = {
  id: string;
  source_name: string;
  target_name: string;
  relation_type: string;
  confidence?: number;
};

export function EntityBrowser({ entities, relations }: { entities: Entity[]; relations: Relation[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="glass rounded-lg p-5">
        <h2 className="text-lg font-semibold">实体浏览</h2>
        <div className="mt-4 flex max-h-80 flex-wrap gap-2 overflow-auto">
          {entities.map((entity) => (
            <span key={entity.id} className="rounded-md border border-violetline/20 bg-violetline/10 px-3 py-2 text-sm">
              {entity.name}
              <span className="ml-2 text-xs text-slate-400">{entity.entity_type}</span>
            </span>
          ))}
          {!entities.length && <div className="w-full rounded-md border border-white/10 p-8 text-center text-slate-500">暂无实体</div>}
        </div>
      </div>
      <div className="glass rounded-lg p-5">
        <h2 className="text-lg font-semibold">初步关系</h2>
        <div className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
          {relations.slice(0, 80).map((relation) => (
            <div key={relation.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <span className="text-cyanline">{relation.source_name}</span>
              <span className="mx-2 text-slate-500">{relation.relation_type}</span>
              <span className="text-jade">{relation.target_name}</span>
            </div>
          ))}
          {!relations.length && <div className="rounded-md border border-white/10 p-8 text-center text-slate-500">暂无关系</div>}
        </div>
      </div>
    </div>
  );
}
