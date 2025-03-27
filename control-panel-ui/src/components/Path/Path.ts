// function RRTCanvas({ nodes, path, obstacles }) {
//     return (
//         <canvas width={500} height={500} ref={canvasRef => {
//         const ctx = canvasRef.getContext('2d');
//
//         // Draw obstacles
//         for (let o of obstacles) {
//             ctx.beginPath();
//             ctx.arc(o.x, o.y, o.r, 0, 2 * Math.PI);
//             ctx.fillStyle = 'gray';
//             ctx.fill();
//         }
//
//         // Draw tree
//         for (let n of nodes) {
//             if (n.parent >= 0) {
//                 const parent = nodes[n.parent];
//                 ctx.beginPath();
//                 ctx.moveTo(parent.x, parent.y);
//                 ctx.lineTo(n.x, n.y);
//                 ctx.strokeStyle = 'lightblue';
//                 ctx.stroke();
//             }
//         }
//
//         // Draw path
//         ctx.beginPath();
//         for (let i = 0; i < path.length - 1; i++) {
//             ctx.moveTo(path[i].x, path[i].y);
//             ctx.lineTo(path[i+1].x, path[i+1].y);
//         }
//         ctx.strokeStyle = 'red';
//         ctx.lineWidth = 2;
//         ctx.stroke();
//     }} />
// );
// }
