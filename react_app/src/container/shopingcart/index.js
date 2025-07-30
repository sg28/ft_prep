import React,{useEffect} from 'react';
import { useState } from 'react';
import Header from "../../component/header";
import Category from '../../component/category';
import Men from '../../component/ItemContainer/Men';
import Women from '../../component/ItemContainer/Women';

export default function ShopingCart(props={}){

    let [categorySelected, setCategorySelected] = useState("Men");
    
    function loadItemComponent() {
        if (categorySelected.name === 'Men') {
            console.log('Men selected')
            return <Men />;
        } else if (categorySelected.name === 'Women') {
            return <Women />;
        } else {
            return null;
        }
    }

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
                   onCategorySelect={setCategorySelected} 
                />
            </div>
            <div>{loadItemComponent()}</div>
        </div>
    )
}