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

        if (route[0] !== startId)
            return 'ROUTE DOES NOT START AT ASSIGNED STATION';

        if (route[route.length - 1] !== destinationId)
            return 'ROUTE DOES NOT REACH DESTINATION';

        const adj = await this.networkDao.getAdjacencyList();
        const stations = await this.networkDao.getStations();
        const nameOf = (id) => stations.find(s => s.id === id)?.name ?? `#${id}`;

        let currentLineId = null;
        const usedLinks = new Set();

        for (let i = 0; i < route.length - 1; i++) {
            const s1 = route[i];
            const s2 = route[i+1];

            const linkKey = [s1, s2].sort((a, b) => a - b).join('-');
            if (usedLinks.has(linkKey))
                return `DUPLICATE LINK: ${nameOf(s1)} ↔ ${nameOf(s2)}`;
            usedLinks.add(linkKey);

            const availableLines = (adj[s1] || [])
                .filter(n => n.to === s2)
                .map(n => n.lineId);

            if (availableLines.length === 0)
                return `NO TRACK FROM ${nameOf(s1)} TO ${nameOf(s2)}`;

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
    async executeRoute(route, failReason, currentGame) {
        if (!route || route.length === 0) {
            return {
                isInvalid: true,
                score: 0,
                steps: [],
                failReason: failReason || 'EMPTY ROUTE SUBMITTED'
            };
        }

        const { startId } = currentGame;
        const adj = await this.networkDao.getAdjacencyList();
        const stations = await this.networkDao.getStations();
        const events = await this.gameDao.getEvents();
        const nameOf = (id) => stations.find(s => s.id === id)?.name ?? `#${id}`;

        const steps = [];
        let coins = 20;
        let currentLineId = null;
        const usedLinks = new Set();

        // Check if the route starts at a completely wrong station. If so, fail on the very first segment.
        if (failReason === 'ROUTE DOES NOT START AT ASSIGNED STATION') {
            return {
                isInvalid: true,
                score: 0,
                steps: [{
                    from: route[0],
                    to: route[1] || route[0],
                    event: { description: 'ROUTE DOES NOT START AT ASSIGNED STATION', effect: 0 },
                    coins: 0,
                    lineId: null,
                    isFailed: true
                }],
                failReason
            };
        }

        for (let i = 0; i < route.length - 1; i++) {
            const s1 = route[i];
            const s2 = route[i+1];

            // 1. Duplicate link check
            const linkKey = [s1, s2].sort((a, b) => a - b).join('-');
            if (usedLinks.has(linkKey)) {
                steps.push({
                    from: s1,
                    to: s2,
                    event: { description: `DUPLICATE LINK: ${nameOf(s1)} ↔ ${nameOf(s2)}`, effect: 0 },
                    coins: 0,
                    lineId: null,
                    isFailed: true
                });
                return {
                    isInvalid: true,
                    score: 0,
                    steps,
                    failReason: failReason || `DUPLICATE LINK: ${nameOf(s1)} ↔ ${nameOf(s2)}`
                };
            }
            usedLinks.add(linkKey);

            // 2. Track check
            const availableLines = (adj[s1] || [])
                .filter(n => n.to === s2)
                .map(n => n.lineId);

            if (availableLines.length === 0) {
                steps.push({
                    from: s1,
                    to: s2,
                    event: { description: 'CRITICAL ERROR: NO TRACK DETECTED', effect: -20 },
                    coins: 0,
                    lineId: null,
                    isFailed: true
                });
                return {
                    isInvalid: true,
                    score: 0,
                    steps,
                    failReason: failReason || `NO TRACK FROM ${nameOf(s1)} TO ${nameOf(s2)}`
                };
            }

            // Resolve lineId
            if (currentLineId === null || !availableLines.includes(currentLineId)) {
                currentLineId = availableLines[0];
            }

            // Valid step - apply random event and progress
            const event = events[Math.floor(Math.random() * events.length)];
            coins += event.effect;
            steps.push({
                from: s1,
                to: s2,
                event,
                coins: Math.max(0, coins),
                lineId: currentLineId,
                isFailed: false
            });
        }

        // If the route was structurally valid but didn't reach the final destination
        if (failReason === 'ROUTE DOES NOT REACH DESTINATION') {
            return {
                isInvalid: true,
                score: 0,
                steps,
                failReason
            };
        }

        return {
            isInvalid: false,
            score: Math.max(0, coins),
            steps,
            failReason: null
        };
    }
}

export default GameService;
