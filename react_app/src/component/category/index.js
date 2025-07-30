import React from 'react';
import { useState } from 'react';
import "./category.css";

export default function Category(props){

    let [category, setCatagory] = useState([
        { key: 1, name: 'Men' },
        { key: 2, name: 'Women' },
        { key: 3, name: 'Children' },
        { key: 4, name: 'Bags' },
        { key: 5, name: 'Shoes' }
    ]);

    return(
        <div className='category-main-container'>
            <div className='category'>{category.map((elem)=>{
                return (
                    <div className='category-elem' key={elem.key}>
                        <span className='category-elem-text'>{elem.name}</span>
                    </div>
                )
            })}
            </div>
        </div>
    )
}