import { getStraightPath } from './straight.js';
import { getCurvedPath } from './curved.js';
import { getSShapedPath } from './s-shaped.js';
import { getLBentPath } from './l-bent.js';

const PathCalculators = {
    straight: getStraightPath,
    curved: getCurvedPath,
    "s-shaped": getSShapedPath,
    "l-bent": getLBentPath,
};

export { PathCalculators };
//# sourceMappingURL=index.js.map
