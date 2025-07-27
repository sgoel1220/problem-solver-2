import { createClient } from 'redis';

let client = null;

async function getRedisClient() {
    if (!client) {
        client = createClient({
            username: 'default',
            password: process.env.REDIS_DB_PASSWORD || 'lszR39WjMD38qlsVs8Vw3kFOiSbVtRtD',
            socket: {
                host: 'redis-14539.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
                port: 14539
            }
        });

        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
    }
    return client;
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { 
            username, 
            conversationId, 
            timestamp, 
            interactions, 
            imageData, 
            model, 
            prompt 
        } = req.body;

        if (!username || !conversationId || !interactions) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: username, conversationId, interactions' 
            });
        }

        // Get Redis client
        const redisClient = await getRedisClient();

        // Create conversation object
        const conversation = {
            conversationId,
            username,
            timestamp: timestamp || new Date().toISOString(),
            interactions,
            imageData: imageData || null,
            model: model || 'unknown',
            prompt: prompt || '',
            lastUpdated: new Date().toISOString()
        };

        // Save individual conversation
        const conversationKey = `conversation:${username}:${conversationId}`;
        await redisClient.set(conversationKey, JSON.stringify(conversation));

        // Update user's conversation list
        const userConversationsKey = `conversations:${username}`;
        const existingConversations = await redisClient.get(userConversationsKey);
        
        let conversationsList = [];
        if (existingConversations) {
            conversationsList = JSON.parse(existingConversations);
        }

        // Check if conversation already exists in list
        const existingIndex = conversationsList.findIndex(
            conv => conv.conversationId === conversationId
        );

        const conversationSummary = {
            conversationId,
            timestamp: conversation.timestamp,
            lastUpdated: conversation.lastUpdated,
            interactionCount: interactions.length,
            model: conversation.model,
            preview: interactions[0]?.content?.substring(0, 100) || 'No content'
        };

        if (existingIndex >= 0) {
            // Update existing conversation in list
            conversationsList[existingIndex] = conversationSummary;
        } else {
            // Add new conversation to list
            conversationsList.push(conversationSummary);
        }

        // Sort by lastUpdated (most recent first)
        conversationsList.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

        // Save updated list
        await redisClient.set(userConversationsKey, JSON.stringify(conversationsList));

        console.log(`Conversation saved for user: ${username}, ID: ${conversationId}`);

        res.status(200).json({ 
            success: true, 
            conversationId,
            message: 'Conversation saved successfully'
        });

    } catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save conversation',
            details: error.message 
        });
    }
}