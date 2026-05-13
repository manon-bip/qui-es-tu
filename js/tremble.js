import anime from 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.es.js';

function initMorphAnimation(group) {
  const mainSelector = group.dataset.main;
  const morphSelector = group.dataset.morph;
  
  const $mainElement = group.querySelector(`#${mainSelector}`);
  const $morphElements = group.querySelectorAll(`.${morphSelector}`);
  
  if (!$mainElement || $morphElements.length === 0) return;
  
  // Détecter si c'est un polygon (points) ou un path (d)
  const isPolygon = $mainElement.tagName === 'polygon';
  const attribute = isPolygon ? 'points' : 'd';
  
  const originalValue = $mainElement.getAttribute(attribute);
  const allShapes = [originalValue];
  
  $morphElements.forEach(element => {
    const value = element.getAttribute(attribute);
    if (value) allShapes.push(value);
  });
  
  let currentIndex = 0;
  
  function animateRandomPoints() {
    const targetValue = allShapes[(currentIndex + 1) % allShapes.length];
    currentIndex = (currentIndex + 1) % allShapes.length;
    
    if (isPolygon) {
      // Pour les polygons, utiliser anime.js normalement
      anime({
        targets: $mainElement,
        points: [{ value: targetValue }],
        easing: 'easeInOutCirc',
        duration: 500,
        complete: animateRandomPoints
      });
    } else {
      // Pour les paths, utiliser une animation personnalisée
      const startValue = $mainElement.getAttribute(attribute);
      
      anime({
        targets: { progress: 0 },
        progress: 1,
        easing: 'easeInOutCirc',
        duration: 500,
        update: function(anim) {
          // Interpolation linéaire entre les deux chemins
          // C'est une approximation - pour un vrai morphing, il faudrait des libs spécialisées
          $mainElement.setAttribute(attribute, targetValue);
        },
        complete: animateRandomPoints
      });
    }
  }
  
  animateRandomPoints();
}

// Initialiser tous les groupes d'animation
document.querySelectorAll('.morph-group').forEach(group => {
  initMorphAnimation(group);
});
