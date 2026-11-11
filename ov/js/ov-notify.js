// Open Vendetta : alerte sur le téléphone de Nils (appli ntfy abonnée au sujet). Jamais de nom ni de contact dans le message :
// un sujet ntfy.sh se lit par quiconque connaît son nom. Une alerte ratée ne bloque jamais l'envoi du visiteur.
import { NTFY_SUJET, GESTION_URL } from './ov-config.js';

export function notifier(message) {
  if (!NTFY_SUJET) return Promise.resolve();
  const url = 'https://ntfy.sh/' + NTFY_SUJET + '?title=' + encodeURIComponent('Open Vendetta') + '&click=' + encodeURIComponent(GESTION_URL);
  return fetch(url, { method: 'POST', body: message }).catch(() => {});
}
