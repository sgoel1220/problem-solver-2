module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { username, password } = req.body;
    const expectedUsername = process.env.USERNAME || process.env.USER;
    const expectedPassword = process.env.PASSWORD;
    const key = process.env.OPEN_ROUTER_KEY;


    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
    }

    if (username === expectedUsername && password === expectedPassword) {
        res.status(200).json({ success: true, message: 'Authentication successful' , key});
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};
