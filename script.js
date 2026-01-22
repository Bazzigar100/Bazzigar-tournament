// --- Show All Players & Teams ---
async function showAllPlayersAndTeams() {
	const today = getTodayDateStr();
	let html = '<b>All Booked Players & Teams (Today)</b><br><br>';
	// BR Matches
	html += '<b>BR MAP Matches</b><br>';
	for (let i = 0; i < brMatchTimes.length; i++) {
		const matchId = `${today}_match${i+1}`;
		try {
			const docSnap = await getDoc(doc(db, 'br_matches', matchId));
			if (docSnap.exists()) {
				const bookedSlots = docSnap.data().bookedSlots || [];
				if (bookedSlots.length > 0) {
					html += `Match ${i+1} (${brMatchTimes[i]}):<br>`;
					bookedSlots.forEach(b => {
						html += `Slot ${b.slot}: <b>${b.username}</b> (UID: ${b.uid})<br>`;
					});
				}
			}
		} catch {}
	}
	// CS Matches
	html += '<br><b>CS MAP Matches</b><br>';
	for (let i = 0; i < csMatchTimes.length; i++) {
		const matchId = `${today}_cs_match${i+1}`;
		try {
			const docSnap = await getDoc(doc(db, 'cs_matches', matchId));
			if (docSnap.exists()) {
				const bookedSlots = docSnap.data().bookedSlots || [];
				if (bookedSlots.length > 0) {
					html += `CS Match ${i+1} (${csMatchTimes[i]}):<br>`;
					bookedSlots.forEach(b => {
						html += `Slot ${b.slot}: <b>${b.username}</b> (UID: ${b.uid})<br>`;
					});
				}
			}
		} catch {}
	}
	const listDiv = document.getElementById('allPlayersList');
	if (listDiv) {
		listDiv.innerHTML = html;
		listDiv.style.display = 'block';
	}
}

document.addEventListener('DOMContentLoaded', function() {
	if (document.getElementById('showAllPlayersBtn')) {
		document.getElementById('showAllPlayersBtn').onclick = showAllPlayersAndTeams;
	}
	// ...existing code...
// --- CS MAP Daily Matches Logic ---
const csMatchTimes = ["13:00", "15:00", "17:00", "19:00", "20:00"];
const csSlots = 8;

function getCSMatchDetails(index) {
	if (index < 3) {
		return { entryFee: 100, winner: 400, highestKill: 100 };
	} else {
		return { entryFee: 200, winner: 600, highestKill: 150 };
	}
}

async function displayCSMatches() {
	const csDiv = document.getElementById('csMatches');
	if (!csDiv) return;
	const today = getTodayDateStr();
	let html = '';
	for (let i = 0; i < csMatchTimes.length; i++) {
		const matchId = `${today}_cs_match${i+1}`;
		const details = getCSMatchDetails(i);
		// Fetch booked slots for this match
		let bookedSlots = [];
		try {
			const docSnap = await getDoc(doc(db, 'cs_matches', matchId));
			if (docSnap.exists()) {
				bookedSlots = docSnap.data().bookedSlots || [];
			}
		} catch {}
		html += `<div style="margin-bottom:20px;padding:10px;border:1px solid #444;border-radius:8px;">
			<b>CS Match ${i+1} | Date: ${today} | Time: ${csMatchTimes[i]}</b><br>
			Entry Fee: ₹${details.entryFee}/player | Winner: ₹${details.winner} | Highest Team Kill: ₹${details.highestKill}<br>
			<div>Slots: `;
		for (let s = 1; s <= csSlots; s++) {
			const slotObj = bookedSlots.find(b => b.slot === s);
			if (slotObj) {
				html += `<span style='color:gray;font-size:0.9em;'>[${s}: ${slotObj.username}]</span> `;
			} else {
				html += `<button class='csSlotBtn' data-match='${matchId}' data-slot='${s}'>${s}</button> `;
			}
		}
		html += `</div></div>`;
	}
	csDiv.innerHTML = html;
	// Add event listeners for booking
	document.querySelectorAll('.csSlotBtn').forEach(btn => {
		btn.onclick = async function() {
			const matchId = this.getAttribute('data-match');
			const slotNum = parseInt(this.getAttribute('data-slot'), 10);
			const uid = prompt('Enter your UID:');
			const username = prompt('Enter your Username:');
			if (!uid || !username) return;
			// Fetch current booked slots
			let bookedSlots = [];
			try {
				const docSnap = await getDoc(doc(db, 'cs_matches', matchId));
				if (docSnap.exists()) {
					bookedSlots = docSnap.data().bookedSlots || [];
				}
			} catch {}
			if (bookedSlots.find(b => b.slot === slotNum)) {
				alert('Slot already booked!');
				return;
			}
			bookedSlots.push({ slot: slotNum, uid, username });
			await setDoc(doc(db, 'cs_matches', matchId), { bookedSlots }, { merge: true });
			document.getElementById('tournamentMsg').textContent = `Slot ${slotNum} booked for CS Match ${matchId.split('_')[2]}!`;
			setTimeout(displayCSMatches, 1000);
		};
	});
}

document.addEventListener('DOMContentLoaded', function() {
	if (document.getElementById('csMatches')) {
		displayCSMatches();
		setInterval(displayCSMatches, 120000);
	}
	// ...existing code...
// --- BR Map Daily Matches Logic ---
function getTodayDateStr() {
	const now = new Date();
	return now.toISOString().slice(0, 10);
}

const brMatchTimes = ["12:00", "14:00", "16:00", "18:00", "21:00"];
const brSlots = 48;
const brEntryFee = 100;
const brWinnerPrize = 1000;
const brHighestKill = 250;

async function displayBRMatches() {
	const brDiv = document.getElementById('brMatches');
	if (!brDiv) return;
	const today = getTodayDateStr();
	let html = '';
	for (let i = 0; i < brMatchTimes.length; i++) {
		const matchId = `${today}_match${i+1}`;
		// Fetch booked slots for this match
		let bookedSlots = [];
		try {
			const docSnap = await getDoc(doc(db, 'br_matches', matchId));
			if (docSnap.exists()) {
				bookedSlots = docSnap.data().bookedSlots || [];
			}
		} catch {}
		html += `<div style="margin-bottom:20px;padding:10px;border:1px solid #444;border-radius:8px;">
			<b>Match ${i+1} | Date: ${today} | Time: ${brMatchTimes[i]}</b><br>
			Entry Fee: ₹${brEntryFee} | Winner: ₹${brWinnerPrize} | Highest Kill: ₹${brHighestKill}<br>
			<div>Slots: `;
		for (let s = 1; s <= brSlots; s++) {
			const slotObj = bookedSlots.find(b => b.slot === s);
			if (slotObj) {
				html += `<span style='color:gray;font-size:0.9em;'>[${s}: ${slotObj.username}]</span> `;
			} else {
				html += `<button class='brSlotBtn' data-match='${matchId}' data-slot='${s}'>${s}</button> `;
			}
		}
		html += `</div></div>`;
	}
	brDiv.innerHTML = html;
	// Add event listeners for booking
	document.querySelectorAll('.brSlotBtn').forEach(btn => {
		btn.onclick = async function() {
			const matchId = this.getAttribute('data-match');
			const slotNum = parseInt(this.getAttribute('data-slot'), 10);
			const uid = prompt('Enter your UID:');
			const username = prompt('Enter your Username:');
			if (!uid || !username) return;
			// Fetch current booked slots
			let bookedSlots = [];
			try {
				const docSnap = await getDoc(doc(db, 'br_matches', matchId));
				if (docSnap.exists()) {
					bookedSlots = docSnap.data().bookedSlots || [];
				}
			} catch {}
			if (bookedSlots.find(b => b.slot === slotNum)) {
				alert('Slot already booked!');
				return;
			}
			bookedSlots.push({ slot: slotNum, uid, username });
			await setDoc(doc(db, 'br_matches', matchId), { bookedSlots }, { merge: true });
			document.getElementById('tournamentMsg').textContent = `Slot ${slotNum} booked for Match ${matchId.split('_')[1]}!`;
			setTimeout(displayBRMatches, 1000);
		};
	});
}

document.addEventListener('DOMContentLoaded', function() {
	if (document.getElementById('brMatches')) {
		displayBRMatches();
		setInterval(displayBRMatches, 120000);
	}
	// ...existing code...
// --- Slot Booking Logic ---
async function displaySlots() {
	const uid = 'demoUser'; // Replace with real tournament UID if needed
	const slotsDiv = document.getElementById('slotsDisplay');
	if (!slotsDiv) return;
	try {
		const docSnap = await getDoc(doc(db, 'tournaments', uid));
		if (docSnap.exists()) {
			const data = docSnap.data();
			const totalSlots = data.slots || 0;
			const bookedSlots = data.bookedSlots || [];
			let html = '';
			for (let i = 1; i <= totalSlots; i++) {
				if (bookedSlots.includes(i)) {
					html += `<span style="color:gray;">[${i}: Booked]</span> `;
				} else {
					html += `<button class="slotBtn" data-slot="${i}">Book Slot ${i}</button> `;
				}
			}
			slotsDiv.innerHTML = html;
			// Add event listeners for booking
			document.querySelectorAll('.slotBtn').forEach(btn => {
				btn.onclick = async function() {
					const slotNum = parseInt(this.getAttribute('data-slot'), 10);
					// Book slot: add to bookedSlots in Firebase
					const updatedBooked = [...bookedSlots, slotNum];
					await setDoc(doc(db, 'tournaments', uid), { bookedSlots: updatedBooked }, { merge: true });
					slotsDiv.innerHTML = 'Slot ' + slotNum + ' booked!';
					setTimeout(displaySlots, 1000);
				};
			});
		}
	} catch (err) {
		slotsDiv.innerHTML = 'Error loading slots.';
	}
}

// Start slot display on tournament form page
document.addEventListener('DOMContentLoaded', function() {
	if (document.getElementById('slotsDisplay')) {
		displaySlots();
		setInterval(displaySlots, 120000); // refresh every 2 minutes
	}
	// ...existing code...
// --- Auto Fetch Tournament Details ---
async function fetchAndDisplayTournamentDetails() {
	const uid = 'demoUser'; // Replace with real tournament UID if needed
	try {
		const docSnap = await getDoc(doc(db, 'tournaments', uid));
		if (docSnap.exists()) {
			const data = docSnap.data();
			if (document.getElementById('entryFee')) document.getElementById('entryFee').value = data.entryFee || '';
			if (document.getElementById('prizePool')) document.getElementById('prizePool').value = data.prizePool || '';
			if (document.getElementById('slots')) document.getElementById('slots').value = data.slots || '';
			if (document.getElementById('timing')) document.getElementById('timing').value = data.timing || '';
			if (document.getElementById('date')) document.getElementById('date').value = data.date || '';
			if (document.getElementById('uid')) document.getElementById('uid').value = data.uid || '';
			if (document.getElementById('customerName')) document.getElementById('customerName').value = data.customerName || '';
		}
	} catch (err) {
		// Optionally show error
	}
}

// Start auto-fetch on page load and every 2 minutes
document.addEventListener('DOMContentLoaded', function() {
	if (document.getElementById('tournamentForm')) {
		fetchAndDisplayTournamentDetails();
		setInterval(fetchAndDisplayTournamentDetails, 120000); // every 2 minutes
	}
	// ...existing code...
// --- Automated Daily Backup ---
function autoDailyBackup() {
	// Set backup time (e.g., 2:00 AM)
	const backupHour = 2;
	const backupMinute = 0;
	let lastBackupDate = localStorage.getItem('lastBackupDate') || '';
	setInterval(async () => {
		const now = new Date();
		const today = now.toISOString().slice(0, 10);
		if (
			now.getHours() === backupHour &&
			now.getMinutes() === backupMinute &&
			lastBackupDate !== today
		) {
			// Perform backup
			const userId = 'demoUser'; // Replace with real user id if available
			const data = {
				wallet: getWalletBalance(),
				coins: getCoinBalance(),
				details: getPlayingDetails()
			};
			try {
				await setDoc(doc(db, 'backups', userId), data);
				localStorage.setItem('lastBackupDate', today);
				if (document.getElementById('backupStatus')) {
					document.getElementById('backupStatus').textContent = 'Automated backup completed!';
				}
			} catch (err) {
				if (document.getElementById('backupStatus')) {
					document.getElementById('backupStatus').textContent = 'Automated backup failed!';
				}
			}
		}
	}, 60000); // Check every minute
}

// Start automated backup when app loads
document.addEventListener('DOMContentLoaded', function() {
	autoDailyBackup();
	// ...existing code...

// --- Firebase Cloud Integration ---
// Firebase SDK
// Use <script type="module"> in your HTML to enable these imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyBYFvkKoZxboH8lzgjHnls8gBbtUuMEKpg",
	authDomain: "tournament-app-81fe7.firebaseapp.com",
	projectId: "tournament-app-81fe7",
	storageBucket: "tournament-app-81fe7.firebasestorage.app",
	messagingSenderId: "525366768472",
	appId: "1:525366768472:web:b931cf20f303501258ab2d",
	measurementId: "G-XCGCDQP5Q9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const walletKey = 'walletBalance';
const coinKey = 'coinBalance';
const playingDetailsKey = 'playingDetails';
const adminSecret = 'admin123'; // Change for real use


function getWalletBalance() {
	return parseInt(localStorage.getItem(walletKey) || '0', 10);
}

function setWalletBalance(amount) {
	localStorage.setItem(walletKey, amount);
	if (document.getElementById('walletBalance')) {
		document.getElementById('walletBalance').textContent = `₹${amount}`;
	}
}

function getCoinBalance() {
	return parseInt(localStorage.getItem(coinKey) || '0', 10);
}

function setCoinBalance(amount) {
	localStorage.setItem(coinKey, amount);
	if (document.getElementById('coinBalance')) {
		document.getElementById('coinBalance').textContent = `${amount} Coins`;
	}
}

function getPlayingDetails() {
	return JSON.parse(localStorage.getItem(playingDetailsKey) || '[]');
}

function setPlayingDetails(details) {
	localStorage.setItem(playingDetailsKey, JSON.stringify(details));
}


document.addEventListener('DOMContentLoaded', function() {
	// Wallet page logic
	if (document.getElementById('walletBalance')) {
		setWalletBalance(getWalletBalance());
		setCoinBalance(getCoinBalance());
		document.getElementById('addMoneyBtn').onclick = function() {
			document.getElementById('paymentSection').style.display = 'block';
		};
		document.getElementById('showDetailsBtn').onclick = function() {
			const details = getPlayingDetails();
			const div = document.getElementById('playingDetails');
			div.style.display = 'block';
			div.innerHTML = details.length ? details.map(d => `<div>${d}</div>`).join('') : 'No playing details.';
		};
		document.getElementById('confirmAddBtn').onclick = function() {
			const amt = parseInt(document.getElementById('addAmount').value, 10);
			if (amt > 0) {
				setWalletBalance(getWalletBalance() + amt);
				setCoinBalance(getCoinBalance() + amt); // 1:1 deposit to coins
				document.getElementById('walletMsg').textContent = `₹${amt} and ${amt} Coins added!`;
			}
		};
		// Secret admin add money
		document.body.addEventListener('keydown', function(e) {
			if (e.ctrlKey && e.altKey && e.key === 'A') {
				document.getElementById('secretAddBtn').style.display = 'inline-block';
			}
		});
		document.getElementById('secretAddBtn').onclick = function() {
			const secret = prompt('Enter admin secret:');
			if (secret === adminSecret) {
				const amt = parseInt(prompt('Enter amount to add:'), 10);
				if (amt > 0) {
					setWalletBalance(getWalletBalance() + amt);
					setCoinBalance(getCoinBalance() + amt);
					document.getElementById('walletMsg').textContent = `Admin added ₹${amt} and ${amt} Coins!`;
				}
			} else {
				alert('Invalid secret!');
			}
		};
	}
// ...existing code ends here
	
	// Cloud backup logic (Firebase Firestore)
	document.addEventListener('DOMContentLoaded', function() {
		if (document.getElementById('backupBtn')) {
			document.getElementById('backupBtn').onclick = async function() {
				const userId = 'demoUser'; // Replace with real user id if available
				const data = {
					wallet: getWalletBalance(),
					details: getPlayingDetails()
				};
				try {
					await setDoc(doc(db, 'backups', userId), data);
					document.getElementById('backupStatus').textContent = 'Backup saved to cloud!';
				} catch (err) {
					document.getElementById('backupStatus').textContent = 'Cloud backup failed!';
				}
			};
			document.getElementById('restoreBtn').onclick = async function() {
				const userId = 'demoUser'; // Replace with real user id if available
				try {
					const docSnap = await getDoc(doc(db, 'backups', userId));
					if (docSnap.exists()) {
						const data = docSnap.data();
						setWalletBalance(data.wallet || 0);
						setPlayingDetails(data.details || []);
						document.getElementById('backupStatus').textContent = 'Data restored from cloud!';
					} else {
						document.getElementById('backupStatus').textContent = 'No cloud backup found!';
					}
				} catch (err) {
					document.getElementById('backupStatus').textContent = 'Cloud restore failed!';
				}
			};
		}
	});
	
// Auth forms (mock, no backend)
document.addEventListener('DOMContentLoaded', function() {
	if (document.getElementById('signInForm')) {
		document.getElementById('signInForm').onsubmit = function(e) {
			e.preventDefault();
			alert('Sign in successful! (Mock)');
			window.location.href = 'login.html';
		};
	}
	if (document.getElementById('loginForm')) {
		document.getElementById('loginForm').onsubmit = function(e) {
			e.preventDefault();
			alert('Login successful! (Mock)');
			window.location.href = 'index.html';
		};
	}
	if (document.getElementById('forgotPasswordForm')) {
		document.getElementById('forgotPasswordForm').onsubmit = function(e) {
			e.preventDefault();
			alert('Password reset link sent! (Mock)');
			window.location.href = 'login.html';
		};
	}
});

// --- Tournament Management Logic ---
document.addEventListener('DOMContentLoaded', function() {
	// Tournament form logic
	if (document.getElementById('tournamentForm')) {
		document.getElementById('tournamentForm').onsubmit = async function(e) {
			e.preventDefault();
			const entryFee = parseInt(document.getElementById('entryFee').value, 10);
			const prizePool = parseInt(document.getElementById('prizePool').value, 10);
			const slots = parseInt(document.getElementById('slots').value, 10);
			const timing = document.getElementById('timing').value;
			const date = document.getElementById('date').value;
			const uid = document.getElementById('uid').value.trim();
			const customerName = document.getElementById('customerName').value.trim();

			// Simple UID and name check (could be extended)
			if (!uid || !customerName) {
				document.getElementById('tournamentMsg').textContent = 'UID and Name are required!';
				return;
			}

			// Save tournament details to Firebase
			try {
				await setDoc(doc(db, 'tournaments', uid), {
					entryFee,
					prizePool,
					slots,
					timing,
					date,
					uid,
					customerName
				});
				document.getElementById('tournamentMsg').textContent = 'Tournament details updated!';
			} catch (err) {
				document.getElementById('tournamentMsg').textContent = 'Error updating tournament details!';
			}
		};
	}
}); 