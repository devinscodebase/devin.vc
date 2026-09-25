import { getImage } from 'astro:assets';

import avatarSource from '../assets/devin-avatar.jpg';

export interface Avatar {
  src: string;
  srcSet: string;
}

export async function getAvatar(): Promise<Avatar> {
  const image = await getImage({ src: avatarSource, width: 36, height: 36, format: 'webp', densities: [1, 2, 3] });
  return { src: image.src, srcSet: image.srcSet.attribute };
}
