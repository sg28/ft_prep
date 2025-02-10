import React from 'react';
import { useEffect, useState } from 'react';

function Count(){   

    let [counter, setcounter] = useState(0);

    return(
        <>
        <div>Count: {counter}</div>
        <div>
            <button
                onClick={()=>{
                    setcounter((prevCount)=>{
                        return prevCount+1;
                    })
                }}
            > Click Count</button>
        </div>
        </>
    )
}
export default Count;