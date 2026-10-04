import { Cue } from './subtitles';
import { VideoChapter } from '../types/playerSettings';

export const SAMPLE_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const SAMPLE_VIDEO_TITLE = 'Big Buck Bunny (Demo)';

export const SAMPLE_CUES: Cue[] = [
  {
    start: 0.5,
    end: 4.0,
    text: 'Bem-vindo ao ClearView Studio!',
  },
  {
    start: 4.2,
    end: 8.5,
    text: 'Reprodutor de vídeo profissional com análise e recursos de estúdio.',
  },
  {
    start: 8.8,
    end: 13.0,
    text: 'Experimente os filtros de cor, o equalizador Web Audio e a exportação.',
  },
  {
    start: 13.5,
    end: 18.0,
    text: 'Use atalhos de teclado: Espaço para pausar, J e L para navegar.',
  },
];

export const SAMPLE_CHAPTERS: VideoChapter[] = [
  {
    title: 'Abertura',
    start: 0,
  },
  {
    title: 'Apresentação dos Recursos',
    start: 5,
  },
  {
    title: 'Demonstração Prática',
    start: 12,
  },
];
