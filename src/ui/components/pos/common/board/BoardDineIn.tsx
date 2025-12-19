import BoardHeaderDineIn from "./BoardHeaderDineIn";
import BoardFooterDineIn from "./BoardFooterDineIn";
import BoardContentDineIn from "./BoardContentDineIn";


const BoardDineIn = () => {
  return (
    <section className="w-full h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <BoardHeaderDineIn />
      </div>

      {/* Content & Footer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <BoardContentDineIn  />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-background">
          <BoardFooterDineIn />
        </div>
      </div>
    </section>
  );
};

export default BoardDineIn;
