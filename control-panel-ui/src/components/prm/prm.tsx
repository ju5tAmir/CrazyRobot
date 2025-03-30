import {useEffect, useRef} from "react";




export const Prm = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        const grid = buildGrid();
        console.log(grid);
        drawFilledBlocks(grid,context);


    }, []);
    const drawFilledBlocks = (
        grid: Grid,
        ctx: CanvasRenderingContext2D,
        cellSize: number = 1
    ) => {
        const numRows = grid.grid.length;
        const numCols = grid.grid[0].length;

        for (let y = 0; y < numRows; y++) {
            for (let x = 0; x < numCols; x++) {
                if (grid.grid[y][x] === 1) {
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
    };

    const buildGrid = (): Grid => {
        const grid = Array.from({ length: 500 }, () => Array(500).fill(0));
        const rectWidth = 10;
        const rectHeight = 3;

        for (let y = 0; y < 500 - rectHeight; y += 30) {
            const x = y; // x shifts with y
            if (x + rectWidth >= 500) continue; // skip if rectangle won't fit

            for (let dy = 0; dy < rectHeight; dy++) {
                for (let dx = 0; dx < rectWidth; dx++) {
                    grid[y + dy][x + dx] = 1;
                }
            }
        }

        return { grid };
    };



    return (
        <div>
            <canvas ref={canvasRef}
                    width={500}
                    height={500}
                    style={{border: "1px solid black"}}>
            </canvas>
        </div>
    )

}