import React, { useContext } from "react";
import CustomizedMenus from "./DropDownButton";
import { AppContext } from "../AppContext";


export const Home = () => {
    const { state } = useContext(AppContext);
    console.log(state)
    return (
        <div className="App">
            <header className="App-header">
                <CustomizedMenus />
            </header>
        </div>
    )
}