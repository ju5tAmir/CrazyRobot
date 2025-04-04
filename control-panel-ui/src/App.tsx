import {Route, Routes} from "react-router-dom";
import Motor from "./components/Motor.tsx"
import {UTTTPage} from "./components/UTTT/UTTTpage.tsx";
import './App.css'
function App() {

  return (
    <>
        <Routes>
            <Route
                path="/RobotMovement"
                element={<>
                    <Motor/>
                </>}
            />

            <Route
                path="/tic-tac-toe"
                element={<>
                    {<UTTTPage/>}
                </>}
            />
            {/*<Canvas/>*/}
            {/*<Prm/>*/}
            {/*<CanvasSim/>*/}
        </Routes>

    </>)
}

export default App
