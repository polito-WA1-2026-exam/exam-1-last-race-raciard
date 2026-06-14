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
     * Route is valid if:
     * 1. Starts and ends at assigned stations.
     * 2. Each segment exists on a line.
     * 3. Line changes only at interchange stations.
     */
    async validateRoute(route, currentGame) {
        const {startId, destinationId, startTime} = currentGame
        const currentTime = Date.now();
        
        // 90 seconds + 5 seconds grace period for network latency
        if ((currentTime - startTime) > 95000) {
            const err = new Error('Planning time exceeded');
            err.type = 'TIMEOUT';
            throw err;
        }

        if (!route || route.length === 0) return false;
        if (route[0].s1_id !== startId || route[route.length - 1].s2_id !== destinationId) return false;

        const adj = await this.networkDao.getAdjacencyList();
        let currentLineId = null;
        const usedLinks = new Set();

        for (let i = 0; i < route.length; i++) {
            const segment = route[i];
            
            // Link uniqueness check (undirected)
            const linkKey = [segment.s1_id, segment.s2_id].sort((a, b) => a - b).join('-');
            if (usedLinks.has(linkKey)) return false;
            usedLinks.add(linkKey);

            // Check if segment exists and find available lines
            const availableLines = (adj[segment.s1_id] || [])
                .filter(n => n.to === segment.s2_id)
                .map(n => n.lineId);

            if (availableLines.length === 0) return false;

            if (currentLineId === null) {
                // First segment, pick any available line
                currentLineId = availableLines[0];
            } else if (!availableLines.includes(currentLineId)) {
                // Line change. Is the current station an interchange?
                const interchangeLines = (adj[segment.s1_id] || [])
                    .map(n => n.lineId);
                const uniqueLines = [...new Set(interchangeLines)];
                
                if (uniqueLines.length < 2) return false; // Not an interchange
                
                // Change to one of the available lines for this segment
                currentLineId = availableLines[0];
            }

            // Ensure sequence: next segment s1 must be previous s2
            if (i > 0 && segment.s1_id !== route[i-1].s2_id) return false;
        }

        return true;
    }

    /**
     * Execute the route and apply random events.
     */
    async executeRoute(route, isValid) {
        if (!isValid) return { score: 0, steps: [] };

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

        return { score: Math.max(0, coins), steps };
    }
}

export default GameService;
