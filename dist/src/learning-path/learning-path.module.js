"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningPathModule = void 0;
const common_1 = require("@nestjs/common");
const learning_path_controller_1 = require("./learning-path.controller");
const learning_path_service_1 = require("./learning-path.service");
const ai_module_1 = require("../ai/ai.module");
const progress_module_1 = require("../progress/progress.module");
let LearningPathModule = class LearningPathModule {
};
exports.LearningPathModule = LearningPathModule;
exports.LearningPathModule = LearningPathModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_module_1.AIModule, progress_module_1.ProgressModule],
        controllers: [learning_path_controller_1.LearningPathController],
        providers: [learning_path_service_1.LearningPathService],
        exports: [learning_path_service_1.LearningPathService],
    })
], LearningPathModule);
//# sourceMappingURL=learning-path.module.js.map