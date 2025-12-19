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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentController = void 0;
const common_1 = require("@nestjs/common");
const assessment_service_1 = require("./assessment.service");
const start_assessment_dto_1 = require("./dto/start-assessment.dto");
const submit_assessment_dto_1 = require("./dto/submit-assessment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AssessmentController = class AssessmentController {
    assessmentService;
    constructor(assessmentService) {
        this.assessmentService = assessmentService;
    }
    async startAssessment(user, startAssessmentDto) {
        return this.assessmentService.startAssessment(user.id, startAssessmentDto);
    }
    async submitAssessment(user, submitAssessmentDto) {
        return this.assessmentService.submitAssessment(user.id, submitAssessmentDto);
    }
    async getAssessment(user, id) {
        return this.assessmentService.getAssessment(id, user.id);
    }
};
exports.AssessmentController = AssessmentController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_assessment_dto_1.StartAssessmentDto]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "startAssessment", null);
__decorate([
    (0, common_1.Post)('submit'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_assessment_dto_1.SubmitAssessmentDto]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "submitAssessment", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "getAssessment", null);
exports.AssessmentController = AssessmentController = __decorate([
    (0, common_1.Controller)('assessment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [assessment_service_1.AssessmentService])
], AssessmentController);
//# sourceMappingURL=assessment.controller.js.map