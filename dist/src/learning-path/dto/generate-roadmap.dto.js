"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateRoadmapResponseDto = exports.RoadmapSkillNode = exports.GenerateRoadmapDto = void 0;
const class_validator_1 = require("class-validator");
class GenerateRoadmapDto {
    assessmentId;
    targetRole;
}
exports.GenerateRoadmapDto = GenerateRoadmapDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateRoadmapDto.prototype, "assessmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateRoadmapDto.prototype, "targetRole", void 0);
class RoadmapSkillNode {
    skillId;
    skillName;
    order;
    estimatedWeeks;
    priority;
    resources;
    milestones;
}
exports.RoadmapSkillNode = RoadmapSkillNode;
class GenerateRoadmapResponseDto {
    learningPathId;
    targetRole;
    totalEstimatedWeeks;
    nodes;
    recommendations;
    createdAt;
}
exports.GenerateRoadmapResponseDto = GenerateRoadmapResponseDto;
//# sourceMappingURL=generate-roadmap.dto.js.map