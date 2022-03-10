import React, { useEffect, useState, useContext } from "react";
import CustomizedMenus from "./DropDownButton";
import { AppContext } from "../AppContext";


export const NewHome = () => {
    const { state, dispatch } = useContext(AppContext);

    return (
        <div className="App">
            <header className="App-header">
                <CustomizedMenus />
            </header>
        </div>
    )
}