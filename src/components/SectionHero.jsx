import { useEffect, useState } from "react";

const baseText =
"/.@, .@ %. ( /. #. ,% / ( ( # # , #, , # % .( ,( ,((@ ( / (@ % ##( . . (% , % .( ,( ,((@ ( / (@ % ##( . .(% , % .( ,( ,((@ ( / (@ % ##( . .(% , % .( ,( ,((@ ( / (@ % ##( . .(% , % .( ,( ,((@ ( / (@ % ##( . . ";

function DataFlowLine({ phase = 0 }) {
  const [offset, setOffset] = useState(phase);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => (prev + 8) % baseText.length);
    }, 500); // nhịp pause

    return () => clearInterval(interval);
  }, []);

  const longText = baseText + baseText + baseText;

  const visible = longText.slice(offset, offset + 400);

  return <p className="data-line">{visible}</p>;
}
function DataFlow() {
  return (
    <div className="story-dataflow pointer-events-none mt-28 overflow-hidden relative">
      <DataFlowLine phase={0} />
      <DataFlowLine phase={20} />
      <DataFlowLine phase={40} />
    </div>
  );
}
