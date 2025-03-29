import React,{useState, useEffect} from "react";

export default function TrafficLight(){

    let[light,setLight] = useState("red");
    
    useEffect(()=>{
        console.log("light ", light)
        return (()=>{
            console.log("grabage collect")
            setLight("red")
        })
    },[])

    return(
        <div className="main_component">
            <div> Traffic Light</div>
            <div className="lights" style={{
                width: "25%",
                margin: "auto",
                padding: "5px",
                marginTop:"5px",
                borderRadius:"5px",
                border:"1px solid lightblue"
            }}>
                <div className="red" 
                style={
                    {
                        backgroundColor:"red",
                        border:"1px solid red",
                        borderRadius:"4px",
                        margin:"2px"
                    }
                }> 
                red </div>
                <div className="orange"
                style={
                    {
                        backgroundColor:"orange",
                        border:"1px solid orange",
                        borderRadius:"4px",
                        margin:"2px"
                    }
                }
                > oraange </div>
                <div className="green"
                    style={
                        {
                            backgroundColor:"green",
                            border:"1px solid green",
                            borderRadius:"4px",
                            margin:"2px"
                        }
                    }
                > green </div>
            </div>
        </div>
    )
}