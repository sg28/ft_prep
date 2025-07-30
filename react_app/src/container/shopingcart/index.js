import React,{useEffect} from 'react';
import Header from "../../component/header";
import Category from '../../component/category';
import { useState } from 'react';

export default function ShopingCart(props={}){

    let [categorySelected, setCategorySelected] = useState("Men");
    
    // category selected
    useEffect(()=>{
        console.log('categorySelected ', categorySelected)
    },[categorySelected])


    // onload of shoping cart
    useEffect(()=>{
        console.log("onload shoping cart")
    },[])


    return(
        <div className='shoping-cart'>
            <div><Header/></div>
            <div>
                <Category
                   categorySelected={setCategorySelected} 
                />
            </div>
        </div>
    )
}