import "./style.css";
import axios from 'axios';
import { z } from 'zod';

const BASE_URL: string = 'http://localhost:8080';

interface Team {
  id: number;
  name: string;
  players: Player[];
}

interface Player {
  id: number;
  name: string;
}

let selectedTeam: Team | null = null;
const teams: Team[] = [];
const players: Player[] = [];

function fetchTeams(): void {
  axios.get<Team[]>(`${BASE_URL}/api/teams`)
    .then((response) => {
      teams.length = 0;
      teams.push(...response.data);
      renderTeams();
    })
    .catch((error) => {
      console.error("Error fetching teams:", error);
    });
}

function selectTeam(team: Team): void {
  selectedTeam = team;
  fetchPlayers(team.id);
}

const PlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
});

function fetchPlayers(teamId: number): void {
  axios.get<Player[]>(`${BASE_URL}/api/teams/${teamId}/players`)
    .then((response) => {
      const playersData: Player[] = response.data;
      const parsedPlayers: Player[] = playersData.map((player) => PlayerSchema.parse(player));
      players.length = 0;
      players.push(...parsedPlayers);
      renderPlayers(); // Render players after fetching them
    })
    .catch((error) => {
      console.error("Error fetching players:", error);
    });
}

function renderTeams(filterValue?: string): void {
  const teamsList: HTMLElement | null = document.getElementById('teams-list');
  
  if (teamsList) {
    teamsList.innerHTML = '';

    teams.forEach((team) => {
      const teamItem: HTMLLIElement = document.createElement('li');
      teamItem.textContent = team.name;
      teamItem.addEventListener('click', () => selectTeam(team));
      teamsList.appendChild(teamItem);
    });
  }
}

function renderPlayers(): void {
  const playersList: HTMLElement | null = document.getElementById('players-list');
  const userId = "user123"; // Set the user ID here
  const playerId = 3455; // Set the player ID here

  if (playersList) {
    playersList.innerHTML = '';

    players.forEach((player) => {
      const playerItem: HTMLLIElement = document.createElement('li');
      playerItem.textContent = player.name;

      const voteButton: HTMLButtonElement = document.createElement('button');
      voteButton.textContent = 'Vote';
      voteButton.addEventListener('click', () => voteForPlayer(player.id, userId, playerId));

      playerItem.appendChild(voteButton);
      playersList.appendChild(playerItem);
    });
  } else {
    console.error('Element with id "players-list" not found.');
  }
}

function voteForPlayer(playerId: number, userId: string, playerIdToVote: number): void {
  axios.post(`${BASE_URL}/api/votes/${playerId}`, { userId })
    .then(() => {
      console.log('Vote registered!');
    })
    .catch((error) => {
      console.error('Error voting:', error);
    });
}

function init(): void {
  const teamFilterInput: HTMLInputElement | null = document.getElementById('teamFilter') as HTMLInputElement;

  if (teamFilterInput) {
    teamFilterInput.addEventListener('input', () => {
      fetchTeams();
    });
  }

  fetchTeams();
}

init();