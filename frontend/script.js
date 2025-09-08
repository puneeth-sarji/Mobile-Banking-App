// Basic config
const API_BASE = 'http://localhost:5000/api';

// Simple storage for current user and latest receipt
function saveUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
function getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
function saveReceipt(data) { localStorage.setItem('receipt', JSON.stringify(data)); }
function getReceipt() { const r = localStorage.getItem('receipt'); return r ? JSON.parse(r) : null; }

// Auth actions
async function signup() {
    const name = document.getElementById('name').value.trim();
    const pin = document.getElementById('pin').value.trim();
    try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, pin })
        });
        const data = await res.json();
        document.getElementById('message').textContent = data.message || '';
        if (res.ok) { saveUser(data.user); window.location.href = 'dashboard.html'; }
    } catch (e) { console.error(e); }
}

async function login() {
    const name = document.getElementById('name').value.trim();
    const pin = document.getElementById('pin').value.trim();
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, pin })
        });
        const data = await res.json();
        document.getElementById('message').textContent = data.message || '';
        if (res.ok) { saveUser(data.user); window.location.href = 'dashboard.html'; }
    } catch (e) { console.error(e); }
}

// Dashboard
async function loadDashboard() {
    const user = getUser();
    if (!user) { window.location.href = 'login.html'; return; }
    document.getElementById('userInfo').innerHTML = `<strong>User:</strong> ${user.name}`;
    await refreshBalance();
}

async function refreshBalance() {
    const user = getUser();
    if (!user) return;
    try {
        const res = await fetch(`${API_BASE}/transactions/balance/${user.id}`);
        const data = await res.json();
        if (res.ok) { document.getElementById('balance').textContent = `₹ ${data.balance.toFixed(2)}`; }
    } catch (e) { console.error(e); }
}

async function loadStatement() {
    const user = getUser();
    if (!user) return;
    try {
        const res = await fetch(`${API_BASE}/transactions/statement/${user.id}`);
        const data = await res.json();
        const list = document.getElementById('statement');
        list.innerHTML = '';
        (data.transactions || []).forEach(t => {
            const li = document.createElement('li');
            const meta = t.merchant ? ` • ${t.merchant}` : (t.toUserId ? '' : '');
            li.innerHTML = `<span>${t.type}${meta}</span><span>₹ ${Number(t.amount).toFixed(2)}</span>`;
            list.appendChild(li);
        });
    } catch (e) { console.error(e); }
}

// Transaction page
function initTransactionPage() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'transfer';
    document.getElementById('txnTitle').textContent = type === 'bill' ? 'Bill Payment' : 'Transfer';
    // Toggle optional fields
    document.getElementById('recipientRow').style.display = type === 'transfer' ? 'block' : 'none';
    document.getElementById('merchantRow').style.display = type === 'bill' ? 'block' : 'none';
}

async function submitTransaction(event) {
    event.preventDefault();
    const user = getUser();
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'transfer';
    const amount = Number(document.getElementById('amount').value);
    const recipientName = document.getElementById('recipientName') ? document.getElementById('recipientName').value.trim() : '';
    const merchant = document.getElementById('merchant') ? document.getElementById('merchant').value.trim() : '';
    try {
        const res = await fetch(`${API_BASE}/transactions/transfer`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, type, amount, recipientName, merchant })
        });
        const data = await res.json();
        if (res.ok) { saveReceipt(data.receipt); window.location.href = 'receipt.html'; }
        else { alert(data.message || 'Transaction failed'); }
    } catch (e) { console.error(e); }
}

// Receipt
function loadReceipt() {
    const receipt = getReceipt();
    if (!receipt) { window.location.href = 'dashboard.html'; return; }
    const el = document.getElementById('receipt');
    el.innerHTML = `
		<div class="card">
			<p><strong>Transaction ID:</strong> ${receipt.transactionId}</p>
			<p><strong>Type:</strong> ${receipt.type}</p>
			<p><strong>Amount:</strong> ₹ ${Number(receipt.amount).toFixed(2)}</p>
			<p><strong>Date:</strong> ${new Date(receipt.date).toLocaleString()}</p>
			<p><strong>Balance After:</strong> ₹ ${Number(receipt.balanceAfter).toFixed(2)}</p>
		</div>
	`;
}


