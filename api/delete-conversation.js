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
        const { username, conversationId } = req.body;

        if (!username || !conversationId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: username, conversationId' 
            });
        }

        // Get Redis client
        const redisClient = await getRedisClient();

        // Delete the conversation data
        const conversationKey = `conversation:${username}:${conversationId}`;
        const deletedCount = await redisClient.del(conversationKey);

        if (deletedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Conversation not found' 
            });
        }

        // Update user's conversation list by removing the deleted conversation
        const userConversationsKey = `conversations:${username}`;
        const conversationsListData = await redisClient.get(userConversationsKey);
        
        if (conversationsListData) {
            const conversationsList = JSON.parse(conversationsListData);
            
            // Filter out the deleted conversation
            const updatedList = conversationsList.filter(
                conv => conv.conversationId !== conversationId
            );

            // Save the updated list
            if (updatedList.length > 0) {
                await redisClient.set(userConversationsKey, JSON.stringify(updatedList));
            } else {
                // If no conversations left, delete the list key
                await redisClient.del(userConversationsKey);
            }
        }

        console.log(`Conversation deleted for user: ${username}, ID: ${conversationId}`);

        res.status(200).json({ 
            success: true, 
            message: 'Conversation deleted successfully',
            conversationId 
        });

    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete conversation',
            details: error.message 
        });
    }
}