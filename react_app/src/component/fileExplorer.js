import React from "react";
export default function FileExplorer() {
  let d = [
    {
      id: 1,
      name: "README.md",
    },
    {
      id: 2,
      name: "Documents",
      children: [
        {
          id: 3,
          name: "Word.doc",
        },
        {
          id: 4,
          name: "Powerpoint.ppt",
        },
      ],
    },
    {
      id: 5,
      name: "Downloads",
      children: [
        {
          id: 6,
          name: "unnamed.txt",
        },
        {
          id: 7,
          name: "Misc",
          children: [
            {
              id: 8,
              name: "foo.txt",
            },
            {
              id: 9,
              name: "bar.txt",
            },
          ],
        },
      ],
    },
  ];
  return (
    <div>
      <h1>File Explorer</h1>
      <ul>
        {d.map((item) => (
          <li key={item.id}>
            {item.name}
            {/* <div>
                {isArray(d[item]) ?
                <button>Open</button>: null    
            }
            </div> */}
          </li>
        ))}
      </ul>
    </div>
  );
}
