import { createClient } from 'redis';

let client = null;

async function getRedisClient() {
    if (!client) {
        console.log('🔗 Creating new Redis client...');
        client = createClient({
            username: 'default',
            password: process.env.REDIS_DB_PASSWORD ,
            socket: {
                host: 'redis-14539.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
                port: 14539
            }
        });

        client.on('error', err => {
            console.error('❌ Redis Client Error:', err);
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

        if (!username) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required field: username' 
            });
        }

        // Get Redis client
        const redisClient = await getRedisClient();

        // If specific conversation ID is requested, return that conversation
        if (conversationId) {
            const conversationKey = `conversation:${username}:${conversationId}`;
            const conversationData = await redisClient.get(conversationKey);
            
            if (!conversationData) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Conversation not found' 
                });
            }

            const conversation = JSON.parse(conversationData);
            return res.status(200).json({ 
                success: true, 
                conversation 
            });
        }

        // Get user's conversation list
        const userConversationsKey = `conversations:${username}`;
        const conversationsListData = await redisClient.get(userConversationsKey);
        
        if (!conversationsListData) {
            return res.status(200).json({ 
                success: true, 
                conversations: [] 
            });
        }

        const conversationsList = JSON.parse(conversationsListData);

        // Get full conversation data for each conversation
        const fullConversations = [];
        
        for (const convSummary of conversationsList) {
            try {
                const conversationKey = `conversation:${username}:${convSummary.conversationId}`;
                const conversationData = await redisClient.get(conversationKey);
                
                if (conversationData) {
                    const fullConversation = JSON.parse(conversationData);
                    fullConversations.push(fullConversation);
                } else {
                    console.warn(`Conversation data not found for ID: ${convSummary.conversationId}`);
                }
            } catch (error) {
                console.error(`Error fetching conversation ${convSummary.conversationId}:`, error);
            }
        }

        // Sort by lastUpdated (most recent first)
        fullConversations.sort((a, b) => new Date(b.lastUpdated || b.timestamp) - new Date(a.lastUpdated || a.timestamp));

        console.log(`Retrieved ${fullConversations.length} conversations for user: ${username}`);

        res.status(200).json({ 
            success: true, 
            conversations: fullConversations 
        });

    } catch (error) {
        console.error('Error retrieving conversations:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve conversations',
            details: error.message 
        });
    }
}