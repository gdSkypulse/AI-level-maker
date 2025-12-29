import { SegmentType, LevelSegment, GDObject } from '../types';

// GD Object IDs
const ID = {
  BLOCK: 1,
  SPIKE: 8,
  SHIP_PORTAL: 13,
  CUBE_PORTAL: 12,
  JUMP_PAD: 35,
  JUMP_RING: 36,
  SAW: 1705,
  SLAB: 40,
  BG_EFFECT: 1000 // Just a placeholder for logic, not a real ID used often
};

const GRID_UNIT = 30; // 1 block is 30 units
const GROUND_Y = 0; // The visual ground line is technically at y=0 but gameplay usually starts slightly higher or we just treat y=0 as bottom

// Helper to format object map to GD string
const objToString = (obj: GDObject): string => {
  let str = '';
  // 1:id, 2:x, 3:y
  str += `1,${obj.id},2,${obj.x},3,${obj.y}`;
  
  // Add extra properties if any
  for (const key in obj) {
    if (key !== 'id' && key !== 'x' && key !== 'y') {
      str += `,${key},${obj[key]}`;
    }
  }
  return str + ';';
};

/**
 * Builds the raw level string from a list of segments.
 * This function acts as the "Compiler" from our abstract Segment language to GD Native.
 */
export const buildLevelData = (segments: LevelSegment[], levelName: string): string => {
  let objects: GDObject[] = [];
  let currentX = 150; // Start a bit away from the wall
  let currentY = 0; // Ground level (block coords, so 0 is first row usually)
  
  // Add start position
  // Level settings usually in header, but we focus on objects here.
  
  // Process Segments
  segments.forEach((seg) => {
    switch (seg.type) {
      case SegmentType.START_PAD:
        objects.push({ id: ID.BLOCK, x: currentX, y: currentY });
        objects.push({ id: ID.BLOCK, x: currentX + 30, y: currentY });
        objects.push({ id: ID.BLOCK, x: currentX + 60, y: currentY });
        currentX += 90;
        break;

      case SegmentType.BASIC_SPIKE:
        // A single spike
        objects.push({ id: ID.SPIKE, x: currentX + 30, y: currentY });
        // Add floor below spike if needed, or just assume ground
        currentX += 90; // Spacing after jump
        break;

      case SegmentType.DOUBLE_SPIKE:
        objects.push({ id: ID.SPIKE, x: currentX + 15, y: currentY });
        objects.push({ id: ID.SPIKE, x: currentX + 45, y: currentY });
        currentX += 120;
        break;

      case SegmentType.TRIPLE_SPIKE:
        objects.push({ id: ID.SPIKE, x: currentX, y: currentY });
        objects.push({ id: ID.SPIKE, x: currentX + 30, y: currentY });
        objects.push({ id: ID.SPIKE, x: currentX + 60, y: currentY });
        currentX += 180; // Hard jump, needs run up
        break;

      case SegmentType.PLATFORM_JUMP:
        // A block in the air
        const height = (seg.yOffset || 1) * 30;
        objects.push({ id: ID.BLOCK, x: currentX, y: currentY + height });
        objects.push({ id: ID.BLOCK, x: currentX + 30, y: currentY + height });
        currentX += 90;
        break;

      case SegmentType.STAIRS_UP:
        // 3 blocks rising
        for (let i = 0; i < 3; i++) {
            objects.push({ id: ID.BLOCK, x: currentX + (i * 30), y: currentY + (i * 30) });
        }
        currentX += 90;
        currentY += 60; // We ended higher
        break;

      case SegmentType.STAIRS_DOWN:
        // 3 blocks falling
        for (let i = 0; i < 3; i++) {
            objects.push({ id: ID.BLOCK, x: currentX + (i * 60), y: currentY - (i * 30) });
        }
        currentX += 180;
        currentY -= 60;
        if (currentY < 0) currentY = 0;
        break;

      case SegmentType.SHIP_GATE:
        // Portal
        objects.push({ id: ID.SHIP_PORTAL, x: currentX, y: currentY + 30 });
        currentX += 60;
        // Roof and Floor obstacles
        for(let i=0; i<5; i++) {
             objects.push({ id: ID.BLOCK, x: currentX + (i*30), y: 0 }); // Floor
             objects.push({ id: ID.BLOCK, x: currentX + (i*30), y: 210 }); // Roof
             
             if (i === 2) {
                 objects.push({ id: ID.BLOCK, x: currentX + (i*30), y: 90 }); // Mid obstacle
             }
        }
        currentX += 150;
        objects.push({ id: ID.CUBE_PORTAL, x: currentX, y: 30 });
        currentX += 60;
        break;
        
      case SegmentType.SHIP_STRAIGHT:
        objects.push({ id: ID.SHIP_PORTAL, x: currentX, y: currentY + 30 });
        currentX += 60;
        for(let i=0; i<10; i++) {
             objects.push({ id: ID.SPIKE, x: currentX + (i*30), y: 0 }); // Spikes floor
             objects.push({ id: ID.SPIKE, x: currentX + (i*30), y: 240, 32: 1 }); // Spikes roof (flipped?) - Property 32 is scale/rotation sometimes, but simplified here
        }
        currentX += 300;
        objects.push({ id: ID.CUBE_PORTAL, x: currentX, y: 30 });
        currentX += 60;
        break;

      case SegmentType.REST_AREA:
        // Just flat ground
        currentX += 120;
        break;
      
      case SegmentType.GHOST_JUMP:
          objects.push({ id: ID.JUMP_PAD, x: currentX, y: currentY});
          currentX += 150;
          break;
    }
  });

  // End wall to signify finish
  for(let i=0; i<10; i++) {
      objects.push({ id: ID.BLOCK, x: currentX, y: i * 30 });
  }

  // Compile string
  // Header details: kA13 is music offset, kA6 background color index, etc.
  // This is a minimal valid header for a level string.
  const objectString = objects.map(objToString).join('');
  
  return `kS38,1,kA13,0,kA15,0,kA16,0,kA14,,kA6,0,kA7,0,kA17,0,kA18,0,kK,0,kL,0,kM,0,kA2,0,kA3,0,kA8,0,kA4,0,kA9,0,kA10,0,kA22,0,kA23,0,kA24,0,kA45,0,kA43,0,kA41,0,kA42,0,kA44,0,kA11,0;${objectString}`;
};

/**
 * Wraps the level string in an XML format compatible with .gmd files (GDShare/GMD Manager).
 */
export const wrapInGMD = (levelString: string, levelName: string): string => {
  return `<?xml version="1.0"?>
<plist version="1.0" gjver="2.0">
<dict>
	<k>kCEK</k><i>4</i>
	<k>k2</k><s>${levelName}</s>
	<k>k4</k><s>${levelString}</s>
	<k>k13</k><t />
	<k>k21</k><i>2</i>
	<k>k50</k><i>24</i>
</dict>
</plist>`;
};
