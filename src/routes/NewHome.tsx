import React, { useEffect, useState, useContext } from "react";
import CustomizedMenus from "./DropDownButton";
import { AppContext } from "../AppContext";


export const NewHome = () => {
    const { state, dispatch } = useContext(AppContext);
    console.log(state)
    return (
        <div className="App">
            {/*<h1>{{state}}</h1>*/}
            <header className="App-header">
                <CustomizedMenus />
            </header>
        </div>
    )
}