"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websiteController = exports.WebsiteController = void 0;
class WebsiteController {
    async analyze(req, res, next) {
        try {
            const { url } = req.body;
            if (!url) {
                const response = {
                    success: false,
                    error: { code: 'INVALID_INPUT', message: 'URL is required' },
                };
                res.status(400).json(response);
                return;
            }
            const response = {
                success: false,
                error: { code: 'NOT_IMPLEMENTED', message: 'Website analysis not yet implemented' },
            };
            res.status(501).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WebsiteController = WebsiteController;
exports.websiteController = new WebsiteController();
//# sourceMappingURL=website.controller.js.map