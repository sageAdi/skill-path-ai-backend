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
exports.CreateSkillDto = exports.SkillDifficulty = void 0;
const class_validator_1 = require("class-validator");
var SkillDifficulty;
(function (SkillDifficulty) {
    SkillDifficulty["BEGINNER"] = "BEGINNER";
    SkillDifficulty["INTERMEDIATE"] = "INTERMEDIATE";
    SkillDifficulty["ADVANCED"] = "ADVANCED";
})(SkillDifficulty || (exports.SkillDifficulty = SkillDifficulty = {}));
class CreateSkillDto {
    name;
    description;
    difficulty;
    category;
}
exports.CreateSkillDto = CreateSkillDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SkillDifficulty),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateSkillDto.prototype, "category", void 0);
//# sourceMappingURL=create-skill.dto.js.map