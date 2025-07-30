import React,{useEffect} from 'react';
import Header from "../../component/header";
import Category from '../../component/category';

export default function ShopingCart(props={}){


    // onload of shoping cart
    useEffect(()=>{
        console.log("onload shoping cart")
    },[])


    return(
        <div className='shoping-cart'>
            <div><Header/></div>
            <div><Category/></div>
        </div>
    )
}