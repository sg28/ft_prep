import React,{useEffect} from 'react';
import { useState } from 'react';
import Header from "../../component/shopingCart/header";
import Category from '../../component/shopingCart/category';

import Men from '../../component/shopingCart/ItemContainer/Men';
import Women from '../../component/shopingCart/ItemContainer/Women';

const styles = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
    },
    headerSection: {
        marginBottom: "20px",
    },
    categorySection: {
        marginBottom: "30px",
    },
    itemsSection: {
        minHeight: "400px",
    },
    comingSoon: {
        textAlign: "center",
        fontSize: "18px",
        color: "#666",
        padding: "50px 20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        margin: "20px 0",
    },
};
 
export default function ShopingCart(props={}){

    let [categorySelected, setCategorySelected] = useState({key: 1, name: 'Men'});
    
    function loadItemComponent() {
        if (categorySelected.name === 'Men') {
            return <Men />;
        } else if (categorySelected.name === 'Women') {
            return <Women />;
        } else if (categorySelected.name === 'Children') {
            return <div style={styles.comingSoon}>Children's products coming soon.</div>;
        } else if (categorySelected.name === 'Bags') {
            return <div style={styles.comingSoon}>Bags products coming soon.</div>;
        } else if (categorySelected.name === 'Shoes') {
            return <div style={styles.comingSoon}>Shoes products coming soon.</div>;
        } else {
            return null;
        }
    }

    useEffect(()=>{
        console.log('categorySelected ', categorySelected)
    },[categorySelected])

    useEffect(()=>{
        console.log("onload shoping cart, categorySelected ", categorySelected)
    },[])

    return(
        <div className='shoping-cart' style={styles.container}>
            <div style={styles.headerSection}><Header/></div>
            <div style={styles.categorySection}>
                <Category
                   onCategorySelect={setCategorySelected} 
                />
            </div>
            <div style={styles.itemsSection}>{loadItemComponent()}</div>
        </div>
    )
}