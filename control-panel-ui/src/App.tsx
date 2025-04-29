import {Route, Routes} from "react-router-dom";
import {UTTTPage} from "./components/UTTT/UTTTpage.tsx";
import './App.css'
import {ControlMotor} from "./components/Movement/ControlMotor.tsx";
function App() {

  return (
    <>
        <Routes>
            <Route
                path="/RobotMovement"
                element={<>
                    <ControlMotor/>
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
