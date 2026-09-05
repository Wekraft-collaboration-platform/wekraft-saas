/**
 * Full-screen layout for the live meeting room.
 * Renders children in a fixed viewport overlay that hides the workspace
 * sidebar and header completely — no html/body reset needed in nested layouts.
 */
export default function MeetRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-auto"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
      }}
    >
      {children}
    </div>
  );
}
