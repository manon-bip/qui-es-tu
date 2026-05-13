// ── Configuration ───────────────────────────────────────────

// Images de fond pour chaque question
const BACKGROUND_IMAGES = {
  1: 'images/question-1.webp',
  2: 'images/question-2.webp',
  3: 'images/question-3.webp',
  4: 'images/question-4.webp',
  5: 'images/question-5.webp'
};

// Images de résultat pour chaque profil
const PROFILE_IMAGES = {
  A: 'images/Oui.png',
  B: 'images/Oui.png',
  C: 'images/Oui.png',
  D: 'images/Oui.png',
  E: 'images/Oui.png'
};

// Données des profils
const PROFILES = {
  A: {
    name: 'Bruyant·e'/*,
    desc: 'A',*/
  },
  B: {
    name: 'Nerveux·se'/*,
    desc: 'B'*/
  },
  C: {
    name: 'Collant·e'/*,
    desc: 'C'*/
  },
  D: {
    name: 'Susceptible'/*,
    desc: 'C'*/
  },
  E: {
    name: 'Bizarre'/*,
    desc: 'C'*/
  }
};

// ── État du quizz ────────────────────────────────────────────

// Calcul automatique du nombre de questions
const totalQuestions = document.querySelectorAll('.step').length;

// Initialisation automatique des scores à partir des profils définis
const scores = Object.keys(PROFILES).reduce((acc, profile) => {
  acc[profile] = 0;
  return acc;
}, {});

let currentStep = 1;
let stepAnswered = {}; // mémoriser le choix par étape

// ── Fonctions utilitaires ────────────────────────────────────

function updateProgress(step) {
  const pct = ((step - 1) / totalQuestions) * 100;
  // Tu peux utiliser cette valeur pour une barre de progression si tu veux
  console.log(`Progression: ${pct}%`);
}

function changeBackground(step) {
  const backgroundImage = BACKGROUND_IMAGES[step];
  if (backgroundImage) {
    const imgElement = document.querySelector('.duotone-filter img, .duotone-filter video');
    if (imgElement && imgElement.tagName === 'IMG') {
      imgElement.src = backgroundImage;
    }
  }
}

function goToStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const next = document.querySelector('[data-step="' + n + '"]');
  if (next) {
    next.classList.add('active');
    currentStep = n;
    updateProgress(n);
    changeBackground(n); // Changer l'image de fond

    // Restaurer la sélection si déjà répondu
    if (stepAnswered[n]) {
      const btn = next.querySelector('[data-profile="' + stepAnswered[n] + '"]');
      if (btn) btn.classList.add('selected');
      const nextBtn = document.getElementById('next-' + n);
      if (nextBtn) nextBtn.classList.add('enabled');
    }
  }
}

function getDominantProfile() {
  // Trouver tous les profils avec le score maximum
  const maxScore = Math.max(...Object.values(scores));
  const topProfiles = Object.entries(scores)
    .filter(([_, score]) => score === maxScore)
    .map(([profile, _]) => profile);

  // Si égalité, choisir aléatoirement parmi les ex-aequo
  if (topProfiles.length > 1) {
    const randomIndex = Math.floor(Math.random() * topProfiles.length);
    return topProfiles[randomIndex];
  }

  return topProfiles[0];
}

function showResult() {
  // Masquer toutes les étapes
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

  // Calculer le profil dominant avec gestion des égalités
  const profile = getDominantProfile();
  const data = PROFILES[profile];

  // Afficher le nom et la description
  document.querySelectorAll('.result-profile-name').forEach(el => {
    el.textContent = data.name;
  });
  /*document.getElementById('result-profile-desc').textContent = data.desc;*/

  // ── MISE À JOUR DU SRC DE L'IMAGE ──
  const profileImage = document.getElementById('result-profile-image');
  if (profileImage && PROFILE_IMAGES[profile]) {
    profileImage.src = PROFILE_IMAGES[profile];
    profileImage.alt = `Image du profil ${data.name}`;
    profileImage.style.display = 'block'; // Afficher l'image
  } else if (profileImage) {
    // Si pas d'image définie pour ce profil, cacher l'élément
    profileImage.style.display = 'none';
  }

  // Afficher la section résultats
  document.getElementById('result-screen').style.display = 'flex';

  // Sauvegarder dans localStorage pour print.html
  localStorage.setItem('quizz-results', JSON.stringify({
    profile,
    scores,
    name: data.name,
    desc: data.desc
  }));
}

// ── Gestion des clics sur les choix ─────────────────────────

document.querySelectorAll('.step').forEach(step => {
  const stepNum = parseInt(step.dataset.step);
  const choices = step.querySelectorAll('.choice');
  const btnNext = step.querySelector('.btn-next');

  choices.forEach(choice => {
    choice.addEventListener('click', () => {
      // Déselectionner les autres
      choices.forEach(c => c.classList.remove('selected'));
      choice.classList.add('selected');

      const profile = choice.dataset.profile;

      // Annuler le vote précédent si on change de réponse
      if (stepAnswered[stepNum]) {
        scores[stepAnswered[stepNum]]--;
      }
      scores[profile]++;
      stepAnswered[stepNum] = profile;

      // Activer le bouton suivant
      btnNext.classList.add('enabled');
    });
  });

  // Bouton suivant
  btnNext.addEventListener('click', () => {
    if (!stepAnswered[stepNum]) return;
    if (stepNum < totalQuestions) {
      goToStep(stepNum + 1);
    } else {
      showResult();
    }
  });
});

// ── Ouvrir print.html dans un nouvel onglet ─────────────────

const btnOpenPrint = document.getElementById('btn-open-print');
if (btnOpenPrint) {
  btnOpenPrint.addEventListener('click', () => {
    window.open('print.html');
  });
}

// ── Initialisation ──────────────────────────────────────────

// Charger l'image de fond de la première question
changeBackground(1);

console.log(`Quiz initialisé avec ${totalQuestions} questions`);
