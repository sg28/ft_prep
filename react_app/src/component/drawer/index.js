import React,{useEffect, useState} from "react";

function Drawer(props){
    const { isOpen = false } = props;
    return(
        <div className="drawer-container" style={{
            position: 'fixed',
            top: 0,
            left: isOpen ? 0 : '-600px',
            width: '600px',
            height: '100vh',
            zIndex: 9999,
            backgroundColor: 'white',
            boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.15)',
            overflowY: 'auto',
            borderLeft: '1px solid #e0e0e0',
            transition: 'left 0.3s ease-in-out'
        }}>
            <div style={{padding:'20px'}}>
                <div style={{display:'flex', justifyContent:'space-between', }}>
                    <div>""</div> <span>X</span>
                </div>
                <p>Shoping Cart</p>
            </div>
        </div>
    )
}
export default Drawer;