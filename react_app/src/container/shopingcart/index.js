import React,{useEffect} from 'react';
import Header from "../../component/header";


export default function ShopingCart(props={}){


    // onload of shoping cart
    useEffect(()=>{
        console.log("onload shoping cart")
    },[])


    return(
        <div><Header/></div>
    )
}