import { Router } from 'express';
import prisma from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { getAIResponse } from '../utils/ai.js';
import { logger } from '../otp/logger.js';
import upload from '../utils/upload.js';
import fs from 'fs';
import path from 'path';
const router = Router();
router.use(requireAuth);
// ── Helpers ──────────────────────────────────────────────────────────────────
function buildFileContext(files) {
    if (!files || files.length === 0)
        return '';
    const parts = [];
    for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.txt', '.csv', '.json', '.md'].includes(ext)) {
            try {
                const content = fs.readFileSync(file.path, 'utf-8').substring(0, 5000);
                parts.push(`\n---\nAttached file "${file.originalname}":\n${content}\n---`);
            }
            catch {
                parts.push(`\n[Attached file: ${file.originalname}]`);
            }
        }
        else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
            parts.push(`\n[Attached image: ${file.originalname}]`);
        }
        else {
            parts.push(`\n[Attached file: ${file.originalname} (${file.mimetype})]`);
        }
    }
    return parts.join('');
}
async function createAttachments(messageId, files) {
    if (!files || files.length === 0)
        return;
    await prisma.attachment.createMany({
        data: files.map((f) => ({
            messageId,
            fileName: f.originalname,
            mimeType: f.mimetype,
            fileSize: f.size,
            storagePath: f.filename,
        })),
    });
}
// Standard include for fetching conversation with messages + attachments
const messagesInclude = {
    messages: {
        include: { attachments: true },
        orderBy: { createdAt: 'asc' },
    },
};
// ── GET /api/chats — List standalone conversations ──────────────────────────
router.get('/chats', async (req, res, next) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: { userId: req.userId, projectId: null },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
        });
        res.json({ success: true, conversations });
    }
    catch (err) {
        next(err);
    }
});
// ── POST /api/chats — Create standalone conversation ────────────────────────
router.post('/chats', upload.array('files', 5), async (req, res, next) => {
    try {
        const { message, model, solution } = req.body;
        if (!message || typeof message !== 'string' || !message.trim()) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }
        const content = message.trim();
        const selectedModel = typeof model === 'string' ? model : undefined;
        const selectedSolution = typeof solution === 'string' ? solution : undefined;
        const files = req.files || [];
        const fileContext = buildFileContext(files);
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        // Create conversation + user message
        const conversation = await prisma.conversation.create({
            data: {
                userId: req.userId,
                title,
                messages: { create: { role: 'user', content } },
            },
        });
        // Create attachments for user message
        const userMsg = await prisma.message.findFirst({
            where: { conversationId: conversation.id, role: 'user' },
        });
        if (userMsg && files.length > 0) {
            await createAttachments(userMsg.id, files);
        }
        // Get AI response (routes to ESG API if solution is brew-esg-1.2)
        const aiReply = await getAIResponse([{ role: 'user', content: content + fileContext }], selectedModel, selectedSolution);
        // Save assistant message
        await prisma.message.create({
            data: { conversationId: conversation.id, role: 'assistant', content: aiReply },
        });
        // Return full conversation with messages
        const full = await prisma.conversation.findUnique({
            where: { id: conversation.id },
            include: messagesInclude,
        });
        logger.info('CHATS', `New chat "${title}" for user ${req.userId}`);
        res.status(201).json({ success: true, conversation: full });
    }
    catch (err) {
        next(err);
    }
});
// ── GET /api/projects/:projectId/conversations ──────────────────────────────
router.get('/projects/:projectId/conversations', async (req, res, next) => {
    try {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.userId },
        });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        const conversations = await prisma.conversation.findMany({
            where: { projectId },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
        });
        res.json({ success: true, conversations });
    }
    catch (err) {
        next(err);
    }
});
// ── POST /api/projects/:projectId/conversations ─────────────────────────────
router.post('/projects/:projectId/conversations', upload.array('files', 5), async (req, res, next) => {
    try {
        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const { message, model, solution } = req.body;
        if (!message || typeof message !== 'string' || !message.trim()) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.userId },
        });
        if (!project) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        const content = message.trim();
        const selectedModel = typeof model === 'string' ? model : undefined;
        const selectedSolution = typeof solution === 'string' ? solution : undefined;
        const files = req.files || [];
        const fileContext = buildFileContext(files);
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        // Create conversation + user message
        const conversation = await prisma.conversation.create({
            data: {
                userId: req.userId,
                projectId,
                title,
                messages: { create: { role: 'user', content } },
            },
        });
        // Create attachments
        const userMsg = await prisma.message.findFirst({
            where: { conversationId: conversation.id, role: 'user' },
        });
        if (userMsg && files.length > 0) {
            await createAttachments(userMsg.id, files);
        }
        // Get AI response
        const aiReply = await getAIResponse([{ role: 'user', content: content + fileContext }], selectedModel, selectedSolution);
        await prisma.message.create({
            data: { conversationId: conversation.id, role: 'assistant', content: aiReply },
        });
        // Update project timestamp
        await prisma.project.update({
            where: { id: projectId },
            data: { updatedAt: new Date() },
        });
        const full = await prisma.conversation.findUnique({
            where: { id: conversation.id },
            include: messagesInclude,
        });
        logger.info('CONVERSATIONS', `New conversation "${title}" in project "${project.name}"`);
        res.status(201).json({ success: true, conversation: full });
    }
    catch (err) {
        next(err);
    }
});
// ── GET /api/conversations/:id ──────────────────────────────────────────────
router.get('/conversations/:id', async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: messagesInclude,
        });
        if (!conversation || conversation.userId !== req.userId) {
            res.status(404).json({ success: false, message: 'Conversation not found' });
            return;
        }
        res.json({ success: true, conversation });
    }
    catch (err) {
        next(err);
    }
});
// ── POST /api/conversations/:id/messages ────────────────────────────────────
router.post('/conversations/:id/messages', upload.array('files', 5), async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { content: msgContent, model, solution } = req.body;
        if (!msgContent || typeof msgContent !== 'string' || !msgContent.trim()) {
            res.status(400).json({ success: false, message: 'Message content is required' });
            return;
        }
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: { orderBy: { createdAt: 'asc' }, select: { role: true, content: true } },
            },
        });
        if (!conversation || conversation.userId !== req.userId) {
            res.status(404).json({ success: false, message: 'Conversation not found' });
            return;
        }
        const trimmedContent = msgContent.trim();
        const files = req.files || [];
        const fileContext = buildFileContext(files);
        // Save user message
        const userMsg = await prisma.message.create({
            data: { conversationId: id, role: 'user', content: trimmedContent },
        });
        if (files.length > 0) {
            await createAttachments(userMsg.id, files);
        }
        // Build history for AI context
        const history = [
            ...conversation.messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: trimmedContent + fileContext },
        ];
        const selectedModel = typeof model === 'string' ? model : undefined;
        const selectedSolution = typeof solution === 'string' ? solution : undefined;
        const aiReply = await getAIResponse(history, selectedModel, selectedSolution);
        // Save assistant message
        const assistantMsg = await prisma.message.create({
            data: { conversationId: id, role: 'assistant', content: aiReply },
        });
        // Touch conversation updatedAt
        await prisma.conversation.update({
            where: { id },
            data: { updatedAt: new Date() },
        });
        // Return full user message with attachments
        const userMsgFull = await prisma.message.findUnique({
            where: { id: userMsg.id },
            include: { attachments: true },
        });
        res.json({ success: true, messages: [userMsgFull, assistantMsg] });
    }
    catch (err) {
        next(err);
    }
});
// ── PUT /api/conversations/:id — Rename conversation ────────────────────────
router.put('/conversations/:id', async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { title } = req.body;
        if (!title || typeof title !== 'string' || !title.trim()) {
            res.status(400).json({ success: false, message: 'Title is required' });
            return;
        }
        const conversation = await prisma.conversation.findUnique({ where: { id } });
        if (!conversation || conversation.userId !== req.userId) {
            res.status(404).json({ success: false, message: 'Conversation not found' });
            return;
        }
        const updated = await prisma.conversation.update({
            where: { id },
            data: { title: title.trim().substring(0, 200) },
        });
        res.json({ success: true, conversation: updated });
    }
    catch (err) {
        next(err);
    }
});
// ── DELETE /api/conversations/:id ───────────────────────────────────────────
router.delete('/conversations/:id', async (req, res, next) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const conversation = await prisma.conversation.findUnique({ where: { id } });
        if (!conversation || conversation.userId !== req.userId) {
            res.status(404).json({ success: false, message: 'Conversation not found' });
            return;
        }
        await prisma.conversation.delete({ where: { id } });
        logger.info('CONVERSATIONS', `Deleted conversation "${conversation.title}"`);
        res.json({ success: true, message: 'Conversation deleted' });
    }
    catch (err) {
        next(err);
    }
});
export default router;
