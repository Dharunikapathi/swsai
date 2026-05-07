"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("../prisma/client"));
const router = (0, express_1.Router)();
// GET /api/notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await client_1.default.notification.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await client_1.default.notification.update({
            where: { id: req.params.id },
            data: { isRead: true }
        });
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update notification' });
    }
});
// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res) => {
    try {
        await client_1.default.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});
// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
    try {
        await client_1.default.notification.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map