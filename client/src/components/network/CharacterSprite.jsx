// Character Assets Mapping
import player_idle from '../../assets/kenney_platformer-characters/PNG/Player/Poses/player_idle.png';
import player_walk1 from '../../assets/kenney_platformer-characters/PNG/Player/Poses/player_walk1.png';
import player_walk2 from '../../assets/kenney_platformer-characters/PNG/Player/Poses/player_walk2.png';
import player_cheer from '../../assets/kenney_platformer-characters/PNG/Player/Poses/player_cheer1.png';
import player_hurt from '../../assets/kenney_platformer-characters/PNG/Player/Poses/player_hurt.png';

import adventurer_idle from '../../assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_idle.png';
import adventurer_walk1 from '../../assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_walk1.png';
import adventurer_walk2 from '../../assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_walk2.png';
import adventurer_cheer from '../../assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_cheer1.png';
import adventurer_hurt from '../../assets/kenney_platformer-characters/PNG/Adventurer/Poses/adventurer_hurt.png';

import female_idle from '../../assets/kenney_platformer-characters/PNG/Female/Poses/female_idle.png';
import female_walk1 from '../../assets/kenney_platformer-characters/PNG/Female/Poses/female_walk1.png';
import female_walk2 from '../../assets/kenney_platformer-characters/PNG/Female/Poses/female_walk2.png';
import female_cheer from '../../assets/kenney_platformer-characters/PNG/Female/Poses/female_cheer1.png';
import female_hurt from '../../assets/kenney_platformer-characters/PNG/Female/Poses/female_hurt.png';

import soldier_idle from '../../assets/kenney_platformer-characters/PNG/Soldier/Poses/soldier_idle.png';
import soldier_walk1 from '../../assets/kenney_platformer-characters/PNG/Soldier/Poses/soldier_walk1.png';
import soldier_walk2 from '../../assets/kenney_platformer-characters/PNG/Soldier/Poses/soldier_walk2.png';
import soldier_cheer from '../../assets/kenney_platformer-characters/PNG/Soldier/Poses/soldier_cheer1.png';
import soldier_hurt from '../../assets/kenney_platformer-characters/PNG/Soldier/Poses/soldier_hurt.png';

import zombie_idle from '../../assets/kenney_platformer-characters/PNG/Zombie/Poses/zombie_idle.png';
import zombie_walk1 from '../../assets/kenney_platformer-characters/PNG/Zombie/Poses/zombie_walk1.png';
import zombie_walk2 from '../../assets/kenney_platformer-characters/PNG/Zombie/Poses/zombie_walk2.png';
import zombie_cheer from '../../assets/kenney_platformer-characters/PNG/Zombie/Poses/zombie_cheer1.png';
import zombie_hurt from '../../assets/kenney_platformer-characters/PNG/Zombie/Poses/zombie_hurt.png';

import zeb_idle from '../../assets/kenney_platformer-characters/PNG/Zeb/Poses/zeb_idle.png';
import zeb_walk1 from '../../assets/kenney_platformer-characters/PNG/Zeb/Poses/zeb_walk1.png';
import zeb_walk2 from '../../assets/kenney_platformer-characters/PNG/Zeb/Poses/zeb_walk2.png';

const CHARACTERS = {
  Player: { idle: player_idle, walk1: player_walk1, walk2: player_walk2, win: player_cheer, lose: player_hurt },
  Adventurer: { idle: adventurer_idle, walk1: adventurer_walk1, walk2: adventurer_walk2, win: adventurer_cheer, lose: adventurer_hurt },
  Female: { idle: female_idle, walk1: female_walk1, walk2: female_walk2, win: female_cheer, lose: female_hurt },
  Soldier: { idle: soldier_idle, walk1: soldier_walk1, walk2: soldier_walk2, win: soldier_cheer, lose: soldier_hurt },
  Zombie: { idle: zombie_idle, walk1: zombie_walk1, walk2: zombie_walk2, win: zombie_cheer, lose: zombie_hurt },
  Zeb: { idle: zeb_idle, walk1: zeb_walk1, walk2: zeb_walk2, win: zeb_idle, lose: zeb_idle },
};

/**
 * Renders an animated SVG character sprite that traverses along segments.
 * Calculates interpolation, bouncing effect, and flip orientation based on coordinates.
 * 
 * @param {object} props
 * @param {number} props.x - The starting X coordinate.
 * @param {number} props.y - The starting Y coordinate.
 * @param {number} [props.x2] - The destination X coordinate.
 * @param {number} [props.y2] - The destination Y coordinate.
 * @param {number} [props.progress=0] - The progress percentage along the path (0 to 1).
 * @param {string} [props.state='idle'] - The character animation state ('idle', 'walk', 'win', 'lose').
 * @param {number} [props.size=50] - The sprite size.
 * @param {string} [props.character='Player'] - The character type identifier.
 */
function CharacterSprite({ x, y, x2, y2, progress = 0, state = 'idle', size = 50, character = 'Player' }) {
  // Interpolated position
  const currentX = x2 !== undefined ? x + (x2 - x) * progress : x;
  const currentY = y2 !== undefined ? y + (y2 - y) * progress : y;

  let isFlipped = false;
  let bounce = 0;
  let animationFrame = 0;
  
  if (x2 !== undefined && y2 !== undefined) {
    const dx = x2 - x;
    const dy = y2 - y;
    isFlipped = dx < 0;
    
    if (state === 'walk') {
      const totalDistance = Math.sqrt(dx * dx + dy * dy);
      const traversed = totalDistance * progress;
      const pixelsPerStep = 30; 
      
      bounce = Math.abs(Math.sin(traversed / pixelsPerStep * Math.PI)) * -10;
      animationFrame = Math.floor(traversed / (pixelsPerStep / 1.5)) % 2;
    }
  }

  const isLost = state === 'lose';
  const isWinner = state === 'win';

  const getSprite = () => {
    const sprites = CHARACTERS[character] || CHARACTERS.Player;
    switch(state) {
      case 'walk': 
        return animationFrame === 0 ? sprites.walk1 : sprites.walk2;
      case 'win': return sprites.win;
      case 'lose': return sprites.lose;
      default: return sprites.idle;
    }
  };

  return (
    <g transform={`translate(${currentX}, ${currentY + bounce})`}>
      <g 
        className={isLost ? 'animate-fall' : isWinner ? 'animate-jump' : ''} 
        transform={`${isFlipped ? 'scale(-1, 1)' : ''} rotate(${isLost ? 90 : 0})`}
      >

        <image
          href={getSprite()}
          x={-size / 2}
          y={-size}
          width={size}
          height={size}
        />
      </g>
    </g>
  );
}

export default CharacterSprite;
export { CHARACTERS };
