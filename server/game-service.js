class GameService {
    constructor(networkDao, gameDao) {
        this.networkDao = networkDao;
        this.gameDao = gameDao;
    }

    /**
     * Pick a random start and destination station with min 3 stops distance.
     */
    async getRandomStations() {
        const stations = await this.networkDao.getStations();
        const adj = await this.networkDao.getAdjacencyList();

        let start, destination;
        let attempts = 0;

        while (attempts < 100) {
            start = stations[Math.floor(Math.random() * stations.length)];
            
            // BFS to find all stations at distance >= 3
            const distances = {};
            const queue = [start.id];
            distances[start.id] = 0;

            while (queue.length > 0) {
                const curr = queue.shift();
                const neighbors = adj[curr] || [];
                for (const neighbor of neighbors) {
                    if (distances[neighbor.to] === undefined) {
                        distances[neighbor.to] = distances[curr] + 1;
                        queue.push(neighbor.to);
                    }
                }
            }

            const candidates = stations.filter(s => distances[s.id] >= 3);
            if (candidates.length > 0) {
                destination = candidates[Math.floor(Math.random() * candidates.length)];
                break;
            }
            attempts++;
        }

        return { start, destination };
    }

    /**
     * Validate a route.
     * Returns null when valid, or a human-readable reason string when invalid.
     */
    async validateRoute(route, currentGame) {
        const {startId, destinationId, startTime} = currentGame;
        const currentTime = Date.now();

        if ((currentTime - startTime) > 95000) {
            const err = new Error('Planning time exceeded');
            err.type = 'TIMEOUT';
            throw err;
        }

        if (!route || route.length === 0)
            return 'EMPTY ROUTE SUBMITTED';

        if (route[0].s1_id !== startId)
            return 'ROUTE DOES NOT START AT ASSIGNED STATION';

        if (route[route.length - 1].s2_id !== destinationId)
            return 'ROUTE DOES NOT REACH DESTINATION';

        const adj = await this.networkDao.getAdjacencyList();
        const stations = await this.networkDao.getStations();
        const nameOf = (id) => stations.find(s => s.id === id)?.name ?? `#${id}`;

        let currentLineId = null;
        const usedLinks = new Set();

        for (let i = 0; i < route.length; i++) {
            const segment = route[i];

            if (i > 0 && segment.s1_id !== route[i-1].s2_id)
                return `DISCONNECTED SEGMENT AT ${nameOf(segment.s1_id)}`;

            const linkKey = [segment.s1_id, segment.s2_id].sort((a, b) => a - b).join('-');
            if (usedLinks.has(linkKey))
                return `DUPLICATE LINK: ${nameOf(segment.s1_id)} ↔ ${nameOf(segment.s2_id)}`;
            usedLinks.add(linkKey);

            const availableLines = (adj[segment.s1_id] || [])
                .filter(n => n.to === segment.s2_id)
                .map(n => n.lineId);

            if (availableLines.length === 0)
                return `NO TRACK FROM ${nameOf(segment.s1_id)} TO ${nameOf(segment.s2_id)}`;

            if (currentLineId === null || !availableLines.includes(currentLineId)) {
                currentLineId = availableLines[0];
            }
        }

        return null; // valid
    }

    /**
     * Execute the route and apply random events.
     * failReason is null when valid, or a reason string when invalid.
     */
    async executeRoute(route, failReason) {
        if (failReason !== null) return { isInvalid: true, score: 0, steps: [], failReason };

        const events = await this.gameDao.getEvents();
        let coins = 20;
        const steps = [];

        for (const segment of route) {
            const event = events[Math.floor(Math.random() * events.length)];
            coins += event.effect;
            steps.push({
                segment,
                event,
                coins: Math.max(0, coins)
            });
        }

        return { isInvalid: false, score: Math.max(0, coins), steps, failReason: null };
    }
}

export default GameService;
