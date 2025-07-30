import React from "react";
import { useEffect, useState } from "react";
import Button from '@mui/material/Button';

function Count() {
  let [counter, setcounter] = useState(0);

  return (
    <>
      <div>Count: {counter}</div>
      <div>
        <Button variant="contained" color="success"
          onClick={() => {
            setcounter((prevCount) => {
              return prevCount + 1;
            });
          }}
          
        >
          [ + ]
        </Button>
        <Button variant="contained" color="danger"
          onClick={() => {
            setcounter((prevCount) => {
              return prevCount - 1;
            });
          }}
          
        >
          {" "}
          [ - ]
        </Button>
      </div>
    </>
  );
}
export default Count;
