import React,{useEffect} from 'react';
import { useState } from 'react';
import Header from "../../component/shopingCart/header";
import Category from '../../component/shopingCart/category';

import Men from '../../component/shopingCart/ItemContainer/Men';
import Women from '../../component/shopingCart/ItemContainer/Women';


 
export default function ShopingCart(props={}){

    let [categorySelected, setCategorySelected] = useState({key: 1, name: 'Men'});
    
    function loadItemComponent() {
        if (categorySelected.name === 'Men') {
            return <Men />;
        } else if (categorySelected.name === 'Women') {
            return <Women />;
        } else if (categorySelected.name === 'Children') {
            return <div>Children's products coming soon.</div>;
        } else if (categorySelected.name === 'Bags') {
            return <div>Bags products coming soon.</div>;
        } else if (categorySelected.name === 'Shoes') {
            return <div>Shoes products coming soon.</div>;
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
        console.log("onload shoping cart, categorySelected ", categorySelected)
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