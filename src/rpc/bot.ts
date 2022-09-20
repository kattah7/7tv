import fetch from "node-fetch";


const HOSTNAME = "http://localhost:5007"


exports.joinChannelByUsername = async (username) => {
    const r = await fetch(`${HOSTNAME}/bot/join?username=${encodeURIComponent(username)}`, {
        method: 'POST',
    });
    const b = await r.json();
    return b;
};