import React, { useRef, useEffect, useState } from "react";

// Types for bot and obstacle
type Vector2 = { x: number; y: number };
type Obstacle = { x: number; y: number; width: number; height: number };

const BOT_RADIUS = 15;
const LIDAR_RANGE = 100;
const LIDAR_RES = 10; // degrees between rays
const SAFE_DISTANCE = 30; // pixels

export default function CanvasSim() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [bot, setBot] = useState({ pos: { x: 100, y: 100 }, heading: 0 });
    const [goal, setGoal] = useState<Vector2>({ x: 400, y: 300 });
    const [obstacles] = useState<Obstacle[]>([
        { x: 200, y: 150, width: 50, height: 200 },
        { x: 350, y: 100, width: 100, height: 50 },
    ]);

    // Ray-rectangle intersection
    const rayHitsObstacle = (start: Vector2, angleDeg: number) => {
        const angle = (angleDeg * Math.PI) / 180;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        for (let r = 0; r < LIDAR_RANGE; r += 5) {
            const px = start.x + dx * r;
            const py = start.y + dy * r;

            for (const obs of obstacles) {
                if (
                    px > obs.x &&
                    px < obs.x + obs.width &&
                    py > obs.y &&
                    py < obs.y + obs.height
                ) {
                    return r;
                }
            }
        }
        return LIDAR_RANGE;
    };

    const steerTowardGoal = () => {
        const toGoal = Math.atan2(goal.y - bot.pos.y, goal.x - bot.pos.x) * (180 / Math.PI);
        let bestAngle = toGoal;
        let minCost = Infinity;

        for (let a = 0; a < 360; a += LIDAR_RES) {
            const dist = rayHitsObstacle(bot.pos, a);
            if (dist > SAFE_DISTANCE) {
                const cost = Math.abs(((a - toGoal + 540) % 360) - 180);
                if (cost < minCost) {
                    minCost = cost;
                    bestAngle = a;
                }
            }
        }

        const angleRad = (bestAngle * Math.PI) / 180;
        const speed = 1.5;
        setBot(prev => ({
            pos: {
                x: prev.pos.x + Math.cos(angleRad) * speed,
                y: prev.pos.y + Math.sin(angleRad) * speed,
            },
            heading: bestAngle,
        }));
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // Draw goal
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(goal.x, goal.y, 10, 0, 2 * Math.PI);
        ctx.fill();

        // Draw obstacles
        ctx.fillStyle = "gray";
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });

        // Draw bot
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(bot.pos.x, bot.pos.y, BOT_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        // Draw heading
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(bot.pos.x, bot.pos.y);
        ctx.lineTo(
            bot.pos.x + Math.cos((bot.heading * Math.PI) / 180) * BOT_RADIUS,
            bot.pos.y + Math.sin((bot.heading * Math.PI) / 180) * BOT_RADIUS
        );
        ctx.stroke();

        // Draw LIDAR
        // ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
        // for (let a = 0; a < 360; a += LIDAR_RES) {
        //     const r = rayHitsObstacle(bot.pos, a);
        //     const angle = (a * Math.PI) / 180;
        //     ctx.beginPath();
        //     ctx.moveTo(bot.pos.x, bot.pos.y);
        //     ctx.lineTo(bot.pos.x + Math.cos(angle) * r, bot.pos.y + Math.sin(angle) * r);
        //     ctx.stroke();
        // }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const loop = () => {
            steerTowardGoal();
            draw(ctx);
            requestAnimationFrame(loop);
        };

        loop();
    }, [bot, goal, obstacles]);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={400}
            style={{ border: "1px solid black", background: "fff" }}
            onClick={e => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                setGoal({ x, y });
            }}
        />
    );
}
