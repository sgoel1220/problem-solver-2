import { createClient } from 'redis';

let client = null;

async function getRedisClient() {
    if (!client) {
        console.log('🔗 Creating new Redis client...');
        client = createClient({
            username: 'default',
            password: process.env.REDIS_DB_PASSWORD || 'lszR39WjMD38qlsVs8Vw3kFOiSbVtRtD',
            socket: {
                host: 'redis-14539.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
                port: 14539
            }
        });

        client.on('error', err => {
            console.error('❌ Redis Client Error:', err);
        });

        client.on('connect', () => {
            console.log('✅ Redis client connected');
        });

        client.on('ready', () => {
            console.log('✅ Redis client ready');
        });

        try {
            await client.connect();
            console.log('✅ Redis connection established');
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error);
            throw error;
        }
    }
    return client;
}

export default async function handler(req, res) {
    console.log('📨 Save conversation API called');
    console.log('📨 Method:', req.method);
    console.log('📨 Headers:', req.headers);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        console.log('✅ Handling CORS preflight');
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        console.log('❌ Invalid method:', req.method);
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        console.log('📦 Request body received:', req.body ? 'Yes' : 'No');
        
        const { 
            username, 
            conversationId, 
            timestamp, 
            interactions, 
            imageData, 
            model, 
            prompt 
        } = req.body;

        console.log('📦 Parsed data:');
        console.log('   - username:', username);
        console.log('   - conversationId:', conversationId);
        console.log('   - interactions count:', interactions?.length);
        console.log('   - has imageData:', !!imageData);
        console.log('   - model:', model);

        if (!username || !conversationId || !interactions) {
            console.log('❌ Missing required fields');
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