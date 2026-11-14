import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildAthleteOgHtml, escapeHtml, sanitizeUsername } from './ogAthleteHtml.js';

describe('ogAthleteHtml (Open Graph dinâmico para Athlete Pass)', () => {
  it('sanitiza handles e escapa HTML perigoso para prevenir XSS em meta tags', () => {
    assert.equal(sanitizeUsername('  @Bruno_Araujo! '), 'bruno_araujo');
    assert.equal(escapeHtml('"<script>alert(1)</script>&\''), '&quot;&lt;script&gt;alert(1)&lt;/script&gt;&amp;&#39;');

    const html = buildAthleteOgHtml({
      username: 'bruno',
      athlete: {
        username: 'bruno',
        full_name: 'Bruno "><script>alert(1)</script>',
        athlete_tag: 'Força & Corrida',
        total_workouts: 42,
        streak: 7,
        avatar_url: 'https://cdn.abfitness.app/avatar.jpg',
      },
    });

    assert.match(html, /property="og:title" content="Bruno &quot;&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt; \(@bruno\) · AB Fitness Athlete Pass"/);
    assert.match(html, /Força &amp; Corrida · 42 treinos · 7d streak/);
    assert.match(html, /property="og:image" content="https:\/\/cdn\.abfitness\.app\/avatar\.jpg"/);
    assert.ok(!html.includes('<script>alert(1)</script>'));
  });

  it('usa fallback seguro de imagem quando avatar_url não é https ou perfil não existe', () => {
    const html = buildAthleteOgHtml({
      username: 'atleta_novo',
      athlete: {
        username: 'atleta_novo',
        avatar_url: 'javascript:alert(1)',
      },
    });

    assert.match(html, /property="og:url" content="https:\/\/www\.abfitness\.app\/\?u=atleta_novo"/);
    assert.match(html, /property="og:image" content="https:\/\/www\.abfitness\.app\/coach\/ab-coach-wide\.jpg"/);
    assert.match(html, /Adiciona @atleta_novo no AB Fitness/);
  });

  it('gera meta tags padrão da app quando nenhum username é fornecido', () => {
    const html = buildAthleteOgHtml({});
    assert.match(html, /property="og:url" content="https:\/\/www\.abfitness\.app\/"/);
    assert.match(html, /<title>AB Fitness: treino, corrida e recuperação muscular<\/title>/);
  });
});
