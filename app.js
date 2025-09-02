// Load CSV and render roster by week
const csvFile = 'roster_info.csv';
const weekSelect = document.getElementById('week-select');
const rosterContainer = document.getElementById('roster-container');

// Helper: Parse CSV string to array of objects
function parseCSV(data) {
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.match(/("[^"]*"|[^,]+)/g).map(v => v.replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
    return obj;
  });
}

// Helper: Group by key
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}

// Fetch CSV and initialize
fetch(csvFile)
  .then(res => res.text())
  .then(text => {
    const roster = parseCSV(text);
    const weeks = [...new Set(roster.map(p => p.week))].sort((a, b) => a - b);
    weeks.forEach(week => {
      const opt = document.createElement('option');
      opt.value = week;
      opt.textContent = `Week ${week}`;
      weekSelect.appendChild(opt);
    });
    weekSelect.value = weeks[0];
    renderRoster(roster, weeks[0]);
    weekSelect.addEventListener('change', () => {
      renderRoster(roster, weekSelect.value);
    });
  });

function renderRoster(roster, week) {
  const filtered = roster.filter(p => p.week === week);
  const bySide = groupBy(filtered, 'team_side');
  rosterContainer.innerHTML = '';
  ['Offense', 'Defense', 'Special Teams'].forEach(side => {
    if (!bySide[side]) return;
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = `<div class="section-title">${side}</div>`;
    const byPosition = groupBy(bySide[side], 'position');
    Object.keys(byPosition).forEach(pos => {
      const posDiv = document.createElement('div');
      posDiv.className = 'position';
      posDiv.innerHTML = `<div class="position-title">${pos}</div>`;
      const playersDiv = document.createElement('div');
      playersDiv.className = 'players';
      byPosition[pos].forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
          <img src="${player.headshot_url}" alt="${player.player_name}">
          <div class="player-name">${player.player_name}</div>
          <div class="player-info">#${player.jersey_number} | ${player.position}</div>
        `;
        playersDiv.appendChild(card);
      });
      posDiv.appendChild(playersDiv);
      section.appendChild(posDiv);
    });
    rosterContainer.appendChild(section);
  });
}
