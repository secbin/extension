import React, { useEffect, useState, useContext } from "react";
import CustomizedMenus from "./DropDownButton";
import { ConfigContext } from "../ConfigContext";

export const NewHome = () => {
    // const {securebin, dispatch} = useContext(ConfigContext)
    return (
        <div className="App">
            <header className="App-header">
                <CustomizedMenus />
            </header>
        </div>
    )
}
