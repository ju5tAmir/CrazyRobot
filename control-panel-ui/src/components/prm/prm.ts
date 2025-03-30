
export interface Point {
    x: number;
    y: number;
}

export interface Node {
    id: number;
    pos: Point;
    neighbors: number[];
    costs: number[];
}
export type Grid = {
    grid: number[][]
};


function isFree(grid: Grid, x: number, y: number): boolean {
    return (
        x >= 0 && y >= 0 && x < grid.grid[0].length && y < grid.grid.length && grid.grid[y][x] === 0
    );
}

function sampleNodes(grid: Grid, count: number): Node[] {
    const nodes: Node[] = [];
    let id = 0;
    while (nodes.length < count) {
        const x = Math.floor(Math.random() * 501);
        const y = Math.floor(Math.random() * 501);
        if (isFree(grid, x, y)) {
            nodes.push({ id, pos: { x, y }, neighbors: [], costs: [] });
            id++;
        }
    }
    return nodes;
}

function lineIsFree(grid: Grid, a: Point, b: Point): boolean {
    let x0 = a.x, y0 = a.y;
    let x1 = b.x, y1 = b.y;
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
        if (!isFree(grid, x0, y0)) return false;
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
    return true;
}
function dist(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function buildPRM(grid: Grid, nodes: Node[], maxNeighbors = 4): void {
    for (const node of nodes) {
        const distances = nodes
            .filter(n => n.id !== node.id)
            .map(n => ({ id: n.id, d: dist(node.pos, n.pos) }))
            .sort((a, b) => a.d - b.d);

        let added = 0;
        for (const { id, d } of distances) {
            const other = nodes.find(n => n.id === id)!;
            if (lineIsFree(grid, node.pos, other.pos)) {
                node.neighbors.push(id);
                node.costs.push(d);
                added++;
                if (added >= maxNeighbors) break;
            }
        }
    }
}
function dijkstra(nodes: Node[], startId: number, goalId: number): number[] {
    const distMap = new Map<number, number>();
    const prevMap = new Map<number, number | null>();
    const visited = new Set<number>();

    nodes.forEach(n => {
        distMap.set(n.id, Infinity);
        prevMap.set(n.id, null);
    });

    distMap.set(startId, 0);

    while (visited.size < nodes.length) {
        const unvisited = Array.from(distMap.entries())
            .filter(([id]) => !visited.has(id))
            .sort((a, b) => a[1] - b[1]);
        const [currentId, currentDist] = unvisited[0];
        if (currentId === goalId) break;

        const node = nodes.find(n => n.id === currentId)!;
        visited.add(currentId);

        node.neighbors.forEach((neighborId, i) => {
            if (visited.has(neighborId)) return;
            const alt = currentDist + node.costs[i];
            if (alt < distMap.get(neighborId)!) {
                distMap.set(neighborId, alt);
                prevMap.set(neighborId, currentId);
            }
        });
    }

    // Reconstruct path
    const path: number[] = [];
    let curr: number | null = goalId;
    while (curr !== null) {
        path.unshift(curr);
        curr = prevMap.get(curr)!;
    }

    return path;
}
function main(gridInit:Grid) {

    const nodes = sampleNodes(gridInit.grid, 50);

    const start: Node = { id: 1000, pos: { x: 2, y: 2 }, neighbors: [], costs: [] };
    const goal: Node = { id: 1001, pos: { x: 45, y: 45 }, neighbors: [], costs: [] };

    nodes.push(start);
    nodes.push(goal);

    buildPRM(grid, nodes);

    const path = dijkstra(nodes, start.id, goal.id);
    console.log("Path:");
    for (const id of path) {
        const { x, y } = nodes.find(n => n.id === id)!.pos;
        console.log(`(${x}, ${y})`);
    }
}

main();

