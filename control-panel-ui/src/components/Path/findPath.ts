


export type Coordinates={
    x:number;
    y:number;
}
export type Node={
    x:number;
    y:number;
    parent: Node|null
}

export type Path={
    path:Node[]
}
type Obstacle = { x: number; y: number; r: number };


// export const findPath = (goal:Coordinates,start:Node,obstacles:Obstacle[])=> {
//     const path:Path = {path:[]};
//     path.path.push(start);
//     const stepSize = 5;
//     const maxIterations = 1000;
//     for(let i=0;i<=maxIterations;i++){
//         const random:Node = getRandomPointCheckIfGoal(obstacles);
//         const nearest =  getNearestNode(path.path,random);
//         const newNode = steer(nearest,random,stepSize);
//         path.path.push(newNode);
//
//
//         if (computeDistance(newNode, {x:goal.x,y:goal.y,parent:null}) < stepSize) {
//            console.log("goal Reached");
//             break;
//         }
//     }
//     return path;
// }
export const findPath = async (goal: Coordinates, start: Node, obstacles: Obstacle[]): Node[] => {
    const tree:Path = {path:[]};
    tree.path.push(start);
    const stepSize = 5;
    const maxIterations =10000;

    for (let i = 0; i <= maxIterations; i++) {
        const random: Node = getRandomPointCheckIfGoal(obstacles);
        const nearest = getNearestNode(tree.path, random);
        const newNode = steer(nearest, random, stepSize);

        tree.path.push(newNode);

        if (computeDistance(newNode, { x: goal.x, y: goal.y, parent: null }) < stepSize) {
            console.log("Goal Reached!");

            return reconstructPath(newNode);
        }
    }
console.log("No path")
    return [];
};


// { "x": 30, "y": 30, "r": 10
const getRandomPointCheckIfGoal = (obstacles: Obstacle[]): Node => {
    let safe = false;
    let randomPoint: Coordinates={x:0,y:0};
    while (!safe) {
        randomPoint = getRandomPoint();
        safe = true;
        for (const o of obstacles) {
            if (checkIfTouchObstacle(randomPoint, o)) {
                safe = false;
                break;
            }
        }
    }

    return { x: randomPoint.x, y: randomPoint.y, parent: null };
};

function getRandomPoint() {
    const randomCoord: Coordinates = {
        x : Math.floor(Math.random() * 501),
        y : Math.floor(Math.random() * 501)
    }
    return randomCoord
}


const checkIfTouchObstacle=(randomCoord:Coordinates,obstacle:Obstacle)=>{
        if (
            randomCoord.x > obstacle.x &&
            randomCoord.x < obstacle.x + obstacle.r &&
            randomCoord.y > obstacle.y &&
            randomCoord.y < obstacle.y + obstacle.r
        ){
            return true;
        }

    return false;
}


const computeDistance=(first:Node,second:Node)=>{
    const x=first.x-second.x;
    const y=first.y-second.y;
    return Math.sqrt((x*x)+(y*y));
}

function steer(from: Node, to: Node, stepSize: number): Node {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= stepSize) {
        return {
            x: to.x,
            y: to.y,
            parent: from,
        };
    }

    const theta = Math.atan2(dy, dx);
    const newX = from.x + stepSize * Math.cos(theta);
    const newY = from.y + stepSize * Math.sin(theta);

    return {
        x: newX,
        y: newY,
        parent: from,
    };
}


const getNearestNode =(path:Node[],randomNode:Node)=>{
    let nearest:Node = path[0];
    let minDist:number = computeDistance(path[0],randomNode);

    for (const point of path) {
        const distance = computeDistance(point, randomNode);
        if (distance < minDist) {
            minDist = distance;
            nearest = point;
        }
    }
    return nearest;
}

const reconstructPath = (endNode: Node): Node[] => {
    const path:Path ={path:[]};
    let current: Node | null = endNode;

    while (current !== null) {
        path.path.push(current);
        current = current.parent;
    }

    return path.path.reverse();
};


