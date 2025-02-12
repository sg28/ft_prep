import { useEffect, useState } from "react";

export default function According_Sg() {
  let [count, setcount] = useState(0);
  let [data, setData] = useState([
    { id: "1", animal: "Animals are great", hide: true },
    { id: "2", animal: "humans are intelligent", hide: true },
    { id: "3", animal: "birds are nimble", hide: true },
  ]);

  let openCloseContent = (elem) => {
    setData((prevState) =>
      prevState.map((item) =>
        item.id === elem.id ? { ...item, hide: !item.hide } : item
      )
    );
  };

  return (
    <div>
      <div>Accordian</div>
      {data.map((e) => {
        return (
          <div key={e.id}>
            <div onClick={() => openCloseContent(e)}>{e.id}</div>
            <div>{e.hide ? "" : e.animal}</div>
          </div>
        );
      })}
    </div>
  );
}
