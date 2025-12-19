"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeStatus = exports.NodeType = void 0;
var NodeType;
(function (NodeType) {
    NodeType["SKILL"] = "SKILL";
    NodeType["REVISION"] = "REVISION";
    NodeType["MICRO_PRACTICE"] = "MICRO_PRACTICE";
})(NodeType || (exports.NodeType = NodeType = {}));
var NodeStatus;
(function (NodeStatus) {
    NodeStatus["PENDING"] = "PENDING";
    NodeStatus["IN_PROGRESS"] = "IN_PROGRESS";
    NodeStatus["COMPLETED"] = "COMPLETED";
    NodeStatus["SKIPPED"] = "SKIPPED";
})(NodeStatus || (exports.NodeStatus = NodeStatus = {}));
//# sourceMappingURL=path-node.interface.js.map