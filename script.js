class SocialNetwork {
    constructor() {
        this.users = new Map(); // Hash Table for Lookup
        this.graph = new Map(); 
        this.undoStack = [];    
        this.messageQueue = []; 
    }

    addUser(username) {
        if (!this.users.has(username)) {
            this.users.set(username, { username, joined: new Date() });
            this.graph.set(username, new Set());
            return true;
        }
        return false;
    }

    addFriend(u1, u2) {
        if (this.graph.has(u1) && this.graph.has(u2)) {
            this.graph.get(u1).add(u2);
            this.graph.get(u2).add(u1);
            return true;
        }
        return false;
    }

    
    findShortestPath(start, end) {
        if (!this.graph.has(start) || !this.graph.has(end)) return null;
        
        let queue = [[start]];
        let visited = new Set([start]);

        while (queue.length > 0) {
            let path = queue.shift();
            let node = path[path.length - 1];

            if (node === end) return path;

            for (let neighbor of this.graph.get(node)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }
        return null;
    }

    getSuggestions(user) {
        if (!this.graph.has(user)) return [];
        let friends = this.graph.get(user);
        let suggestions = new Map();

        friends.forEach(friend => {
            this.graph.get(friend).forEach(fof => {
                if (fof !== user && !friends.has(fof)) {
                    suggestions.set(fof, (suggestions.get(fof) || 0) + 1);
                }
            });
        });
        return [...suggestions.entries()].sort((a, b) => b[1] - a[1]);
    }

    getAllFriendships() {
        const friendships = [];
        for (let [user, friends] of this.graph) {
            friends.forEach(friend => {
                if (user < friend) { // Avoid duplicates by comparing strings
                    friendships.push(`${user} ↔ ${friend}`);
                }
            });
        }
        return friendships;
    }
}

// UI CONTROLLER 
const network = new SocialNetwork();

function handleAddUser() {
    const name = document.getElementById('username').value.trim();
    if (!name) {
        updateDisplay('userList', 'Please enter a username to add.');
        return;
    }
    if (network.addUser(name)) {
        updateDisplay('userList', Array.from(network.users.keys()).join(', '));
    } else {
        updateDisplay('userList', `User ${name} already exists.`);
    }
}

function handleAddFriend() {
    const u1 = document.getElementById('u1').value.trim();
    const u2 = document.getElementById('u2').value.trim();
    if (!u1 || !u2) {
        updateDisplay('graphDisplay', 'Enter both usernames to connect them.');
        return;
    }
    if (network.addFriend(u1, u2)) {
        updateDisplay('graphDisplay', `Connected ${u1} & ${u2}`);
        updateFriendshipsDisplay();
    } else {
        updateDisplay('graphDisplay', `Friendship failed. Make sure both ${u1} and ${u2} are added as users first.`);
    }
}

function handleSendMessage() {
    const content = document.getElementById('msgContent').value;
    network.messageQueue.push(content);
    network.undoStack.push(content);
    updateDisplay('messageLog', `Sent: ${content}<br>` + document.getElementById('messageLog').innerHTML);
}

function handleUndo() {
    if (network.undoStack.length > 0) {
        const removed = network.undoStack.pop();
        alert("Undid: " + removed);
    }
}

function handleBFS() {
    const start = document.getElementById('startPath').value;
    const end = document.getElementById('endPath').value;
    const path = network.findShortestPath(start, end);
    document.getElementById('pathResult').innerText = path ? `Path: ${path.join(' → ')}` : "No connection found.";
}

function handleSuggestions() {
    const user = document.getElementById('u1').value;
    const res = network.getSuggestions(user);
    updateDisplay('graphDisplay', `Suggestions for ${user}: ` + res.map(s => `${s[0]} (${s[1]} mutual)`).join(', '));
}

function updateDisplay(id, html) {
    document.getElementById(id).innerHTML = html;
}

function updateFriendshipsDisplay() {
    const friendships = network.getAllFriendships();
    const friendshipsHtml = friendships.length > 0 
        ? friendships.join('<br>')
        : 'No friendships yet.';
    updateDisplay('friendshipsList', friendshipsHtml);
}
