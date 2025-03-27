import {useEffect, useRef, useState} from "react";
import {findPath,Node} from "./findPath.ts";
type Point = { x: number; y: number };
export const Canvas = () => {
    const [path,setPath]= useState<Node[]>([]);
    const canvasRef = useRef(null)
    const data= {
        "start":{"x":16,"y":3,"parent":null},
        "goal":{"x":355,"y":250},
        "nodes": [{ "x": 0, "y": 0, "parent": -1 }, { "x": 5, "y": 5, "parent": 0 }],
        "obstacles": [{ "x": 30, "y": 30, "r": 10 },{"x": 123, "y": 30, "r": 10},{"x": 123, "y": 200, "r": 10},{"x": 300, "y": 250, "r": 10},{"x":123, "y": 150, "r": 10}],
        "path": [{ "x": 0, "y": 0 }, { "x": 5, "y": 5 }]
    }

const drawObstacles =(obstacleList:any,ctx:any)=> {
    for (const o of obstacleList) {
            ctx.beginPath();
            //ctx.arc(o.x, o.y, o.r, 0, 2 * Math.PI);
        ctx.fillRect(o.x, o.y, o.r, o.r);
            ctx.fillStyle = 'gray';
            ctx.fill();
        }
}

    const drawPath = (ctx: CanvasRenderingContext2D, path: any[]) => {
        if (path.length === 0) return;

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y); // Start point

        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y); // Connect to next node
        }

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const drawInterestPoints = (start: Point, goal: Point, ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "red";
        ctx.fillRect(start.x, start.y, 5, 5);

        ctx.fillStyle = "green";
        ctx.fillRect(goal.x, goal.y, 5, 5);
    };


    const draw = (ctx, frameCount:number) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
        ctx.fill()
    }
    useEffect(() => {
        calculatePath();
    }, []);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        let animationFrameId: number;
        const render = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawObstacles(data.obstacles, context);
            drawInterestPoints(data.start, data.goal, context);
            if (path.length > 0) {
                drawPath(context, path);
            }

            animationFrameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [path]); // <- depends on path



    // useEffect(() => {
    //     const canvas = canvasRef.current
    //     const context = canvas.getContext('2d')
    //     let frameCount = 0
    //     let animationFrameId:number
    //     calculatePath();
    //     drawPath(context,path);
    //     console.log(path);
    //     //Our draw came here
    //     const render = () => {
    //         frameCount++
    //         //draw(context, frameCount)
    //         drawObstacles(data.obstacles,context)
    //         drawInterestPoints(data.start,data.goal,context);
    //         animationFrameId = window.requestAnimationFrame(render)
    //     }
    //     render()
    //
    //     return () => {
    //         window.cancelAnimationFrame(animationFrameId)
    //     }
    // }, [path])


    const calculatePath = async ()=>{
       const path = await findPath(data.goal,data.start,data.obstacles);
       setPath(path);
    }



    return(
        <div>
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                style={{border: "1px solid black"}}
            />

        </div>
    )
}

