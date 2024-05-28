"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = void 0;
const jobber_shared_1 = require("@Akihira77/jobber-shared");
const buyer_route_1 = require("./routes/buyer.route");
const health_route_1 = require("./routes/health.route");
const seller_route_1 = require("./routes/seller.route");
const BUYER_BASE_PATH = "/api/v1/buyer";
const SELLER_BASE_PATH = "/api/v1/seller";
function appRoutes(app) {
    app.use("", (0, health_route_1.healthRoutes)());
    app.use(BUYER_BASE_PATH, jobber_shared_1.verifyGatewayRequest, (0, buyer_route_1.buyerRoutes)());
    app.use(SELLER_BASE_PATH, jobber_shared_1.verifyGatewayRequest, (0, seller_route_1.sellerRoutes)());
}
exports.appRoutes = appRoutes;
//# sourceMappingURL=routes.js.map