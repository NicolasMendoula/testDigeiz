/* Racine de l'application */
import React from "react";
import Trajectoire from "./Trajectoire/Trajectoire";
const trajectoires = require('../../data/trajectoires.json');

const App = ()=>{   
    return (<div>
                <Trajectoire data={trajectoires}/>
            </div>);
}

export default App;