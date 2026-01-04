
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Copy, 
  ChevronRight, 
  ChevronDown, 
  Box, 
  Eye, 
  Palette, 
  Camera, 
  Film, 
  Layers, 
  Sun, 
  Monitor, 
  MapPin,
  Check, 
  Braces, 
  Sparkles, 
  MessageSquare, 
  Loader2, 
  X, 
  Plus 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types & Data Structures ---

type FieldType = 'select' | 'slider' | 'chips' | 'input';

interface Field {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  halfWidth?: boolean;
  noCustom?: boolean;
}

interface Category {
  id: string;
  label: string;
  icon: any;
  sections?: { label: string; fields: Field[] }[];
  fields?: Field[];
  chips?: { positive: string[]; negative: string[] };
}

// --- Component Props Interfaces ---

interface ArchitectLabelProps {
  children?: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

interface FieldLabelProps {
  children?: React.ReactNode;
  className?: string;
}

interface SelectFieldProps {
  label: string;
  value: any;
  options?: string[];
  onChange: (val: string) => void;
  onAddCustom: (val: string) => void;
  allowCustom?: boolean;
}

interface SliderFieldProps {
  label: string;
  value: any;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (val: any) => void;
}

interface InputFieldProps {
  label: string;
  value: any;
  onChange: (val: string) => void;
}

interface ChipItemProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  variant?: 'positive' | 'negative';
  key?: React.Key;
}

interface AccordionItemProps {
  category: Category;
  selections: Record<string, any>;
  customOptions: Record<string, string[]>;
  onUpdateField: (id: string, value: any) => void;
  onToggleChip: (id: string, label: string) => void;
  onAddCustomOption: (fieldKey: string, value: string) => void;
  isOpen: boolean;
  onToggleAccordion: () => void;
  isActive: boolean;
  onToggleActive: () => void;
  key?: React.Key;
}

const CATEGORIES: Category[] = [
  {
    id: 'dimensions',
    label: 'Dimensions & Format',
    icon: Box,
    fields: [
      { id: 'aspect_ratio', label: 'ASPECT RATIO', type: 'select', options: ['None', '1:1', '16:9', '9:16', '4:3', '3:2', '2.39:1'], halfWidth: true },
      { id: 'quality', label: 'QUALITY', type: 'select', options: ['None', 'Standard', 'High', 'Ultra'], halfWidth: true },
      { id: 'width', label: 'WIDTH', type: 'input', halfWidth: true },
      { id: 'height', label: 'HEIGHT', type: 'input', halfWidth: true },
    ]
  },
  {
    id: 'style',
    label: 'Style Preset',
    icon: Palette,
    fields: [
      { id: 'medium', label: 'MEDIUM', type: 'select', options: ['None', 'Oil Painting', 'Digital Art', 'Photography', 'Watercolor', 'Sketch'], halfWidth: true },
      { id: 'style_name', label: 'STYLE', type: 'select', options: ['None', 'Aerial / Drone', 'Black and White', 'Blue Hour', 'Bokeh', 'Cinematic', 'Documentary / Candid', 'Editorial / Photoshoot', 'Environmental Portrait', 'Film Still', 'Golden Hour', 'HDR', 'High Contrast', 'Infrared', 'Lifestyle', 'Lomography', 'Macro / Detail', 'Old iPhone', 'Polaroid', 'Product Hero', 'Retro', 'Sepia', 'Soft Focus', 'Still Life / Flat Lay', 'Tilt-Shift', 'Timelapse', 'Ultraviolet', 'Vintage Photo'], halfWidth: true },
    ]
  },
  {
    id: 'camera',
    label: 'Camera & Composition',
    icon: Camera,
    fields: [
      { id: 'camera_type', label: 'CAMERA TYPE', type: 'select', options: ['None', '360 camera (panoramic, immersive)', 'AI camera (smart, auto-enhanced)', 'Blackmagic Pocket Cinema Camera 6K', 'Blackmagic URSA Mini Pro 12K', 'DJI Mavic 3 (drone camera)', 'DJI Osmo Pocket (portable gimbal)', 'DSLR (digital single-lens reflex)', 'Fujifilm GFX100 (medium format)', 'Fujifilm X-T5 (APS-C mirrorless)', 'GoPro HERO12 Black (action camera)', 'GoPro Max (360 action cam)', 'IMAX camera (ultra-wide, blockbuster)', 'Nikon D6 (pro DSLR)', 'Nikon F6 (classic film SLR)', 'Nikon Z9 (flagship mirrorless)', 'Panasonic GH6 (hybrid mirrorless)', 'Panasonic S1H (cinema mirrorless)', 'RED Helium 8K (legendary cinema)', 'RED Komodo (compact cinema)', 'RED V-Raptor (high-end cinema)', 'SLR (film single-lens reflex)', 'Sony Alpha 1 (flagship mirrorless)', 'Sony Alpha 7R V (high-res full-frame)', 'Sony FX6 (cinema line)', 'Sony Venice (digital cinema camera)', 'action camera (GoPro, sports)', 'body camera (POV, documentary)', 'box camera (early 20th century style)', 'bridge camera (hybrid zoom)', 'camcorder (video, home movies)', 'cinema camera (professional movie making)', 'dashcam (in-car, wide angle)', 'default (auto/any camera)', 'digital back (pro, modular studio)', 'disposable camera (lo-fi, retro)', 'drone camera (aerial, birds-eye)', 'field camera (large format outdoor)', 'film camera (general analog)', 'folding camera (vintage portable)', 'handheld camcorder (retro video)', 'holographic camera (sci-fi, virtual capture)', 'infrared camera (night vision, special effect)', 'instant camera (Polaroid, Instax style)', 'large format (fine art, tilt/shift)', 'medium format (pro, ultra high-res)', 'mirrorless (compact, digital interchangeable lens)', 'modular camera system (customizable pro)', 'night vision camera (low-light scenes)', 'old handheld camera (vintage, shaky aesthetic)', 'old iPhone camera (retro digital look)', 'old phone camera (lo-fi, nostalgic)', 'panoramic camera (wide landscapes)', 'pinhole camera (experimental, soft focus)', 'point and shoot (compact, easy use)', 'rangefinder (classic street photography)', 'robotic camera (automated, shaky aesthetic)', 'security camera (CCTV, fisheye)', 'smartphone camera (modern, casual)', 'stereo camera (3D, VR)', 'studio camera (broadcast, TV)', 'subminiature camera (spy, tiny format)', 'super 8 camera (home movies, film grain)', 'surveillance camera (hidden, covert)', 'thermal camera (heat vision, IR effect)', 'tilt-shift camera (architectural, creative DOF)', 'toy camera (Holga, Diana, quirky looks)', 'toy digital camera (kids, low-fi)', 'twin-lens reflex (TLR, vintage)', 'underwater camera (diving, marine shots)', 'vhs camcorder (analog video aesthetic)', 'webcam (lo-fi, candid)'], halfWidth: true },
      { id: 'lens_type', label: 'LENS TYPE', type: 'select', options: ['None', 'Anamorphic 40mm', 'Catadioptric 250mm', 'Cinema 50mm', 'Crystal 28mm', 'Defocus 100mm', 'Dual 35mm', 'Fisheye 8mm', 'Infrared 720nm', 'Macro 100mm', 'Micro 5mm', 'Mirror 500mm', 'Periscope 24mm', 'Perspective Control 24mm', 'Pinhole 35mm', 'Plastic 35mm', 'Portrait 85mm', 'Prime 135mm', 'Prime 35mm', 'Prime 85mm', 'Rectilinear 24mm', 'Soft Focus 80mm', 'Split Diopter 50mm', 'Standard 50mm', 'Super Telephoto 300mm', 'Superzoom 18–200mm', 'Telephoto 85mm', 'Tilt-Shift 90mm', 'Toy 22mm', 'Ultra Wide 14mm', 'Ultraviolet 365nm', 'Vintage 35mm', 'Wide 24mm', 'Zoom 24–70mm'], halfWidth: true },
      { id: 'shot_type', label: 'SHOT TYPE', type: 'select', options: ['None', 'POV', 'Aerial', 'Bird\'s Eye', 'Close-Up', 'Cowboy', 'Crane', 'Cross', 'Crowd', 'Cut-In', 'Cutaway', 'Detail', 'Dolly', 'Drone', 'Dutch Angle', 'Establishing', 'Extreme Close-Up', 'Extreme Wide', 'Freeze Frame', 'Full', 'Group', 'High Angle', 'Insert', 'Insert Detail', 'Isometric', 'Long', 'Low Angle', 'Macro', 'Medium', 'Medium Close-Up', 'Medium Long', 'Mirror', 'Mirror Image', 'Motion Blur', 'Objective', 'Over-the-Shoulder', 'Panorama', 'Panoramic', 'Point-of-View', 'Profile', 'Pull-Out', 'Push-In', 'Reaction', 'Reflection', 'Reverse Angle', 'Slow Motion', 'Split Screen', 'Static', 'Still', 'Subjective', 'Three Shot', 'Tilted', 'Time-Lapse', 'Top-Down', 'Tracking', 'Two Shot', 'Very Wide', 'Wide', 'Worm\'s Eye'], halfWidth: true },
      { id: 'composition', label: 'COMPOSITION', type: 'select', options: ['None', 'C-pattern', 'L-curve', 'S-curve', 'Z-pattern', 'asymmetry', 'background interest', 'balance', 'bird\'s eye perspective', 'breathing room', 'centered composition', 'closed composition', 'clutter', 'converging lines', 'cropping', 'diagonal method', 'dynamic symmetry', 'eye line', 'eye-level perspective', 'figure to ground', 'fill the frame', 'foreground interest', 'frame within a frame', 'framing', 'golden ratio', 'golden spiral', 'high horizon', 'implied lines', 'isolated subject', 'juxtaposition', 'layering', 'leading lines', 'low horizon', 'minimalism', 'negative space', 'odds rule', 'open composition', 'pattern', 'positive space', 'pyramid composition', 'repetition', 'rhythm', 'rule of thirds', 'symmetry', 'texture', 'tight crop', 'triangular composition', 'vanishing point', 'visual flow', 'visual weight', 'worm\'s eye perspective'], halfWidth: true },
      { id: 'dof', label: 'DEPTH OF FIELD', type: 'select', options: ['None', 'keep original', 'background blur', 'background in focus', 'bokeh background', 'deep depth of field', 'everything in focus', 'focus stacking', 'foreground blur', 'foreground in focus', 'infinite depth of field', 'macro focus', 'medium depth of field', 'rack focus', 'selective focus', 'shallow depth of field', 'sharp background, blurred foreground', 'sharp foreground, blurred background', 'split focus', 'subject in focus', 'tilt-shift effect', 'ultra shallow depth of field', 'very deep depth of field', 'very shallow depth of field'], halfWidth: true },
      { id: 'blur_style', label: 'BLUR STYLE', type: 'select', options: ['None', 'Bokeh', 'Motion Blur', 'Gaussian'], halfWidth: true },
    ]
  },
  {
    id: 'video',
    label: 'Video & Motion',
    icon: Film,
    fields: [
      { id: 'duration', label: 'DURATION (S)', type: 'select', options: ['2', '4', '8', '16'], halfWidth: true },
      { id: 'fps', label: 'FPS', type: 'select', options: ['24', '30', '60'], halfWidth: true, noCustom: true },
      { id: 'cam_motion', label: 'CAMERA MOTION', type: 'select', options: ['None', 'Dolly In', 'Dolly Out', 'Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Zoom In', 'Zoom Out'], halfWidth: true },
      { id: 'motion_dir', label: 'MOTION DIRECTION', type: 'select', options: ['None', 'Left', 'Right', 'Up', 'Down', 'Forward', 'Backward'], halfWidth: true },
      { id: 'interpolation', label: 'FRAME INTERPOLATION', type: 'select', options: ['Disabled', 'Enabled'], halfWidth: true, noCustom: true },
    ]
  },
  {
    id: 'material',
    label: 'Material',
    icon: Layers,
    fields: [
      { id: 'made_of', label: 'MADE OUT OF', type: 'select', options: ['None', 'Metal', 'Glass', 'Wood', 'Plastic', 'Stone'], halfWidth: true },
      { id: 'secondary_mat', label: 'SECONDARY MATERIAL', type: 'select', options: ['None', 'Leather', 'Gold', 'Rubber'], halfWidth: true },
    ]
  },
  {
    id: 'lighting',
    label: 'Lighting',
    icon: Sun,
    fields: [
      { 
        id: 'lighting_style', 
        label: 'LIGHTING STYLE', 
        type: 'select', 
        options: [
          'None', 
          'Golden Hour Sunlight', 
          'Midday Direct Sun', 
          'Overcast Daylight', 
          'Window Daylight', 
          'Backlit Sun', 
          'Dappled Natural Light', 
          'Blue Hour Ambient Light', 
          'Sunset Silhouette Light', 
          'Fog or Haze Diffused Light', 
          'Moonlight', 
          'Streetlight Illumination', 
          'Neon or Signage Light', 
          'Available Night Light', 
          'Softbox Studio Lighting', 
          'Hard Directional Light', 
          'Three-Point Lighting', 
          'Practical Lamp Lighting', 
          'Rim or Edge Lighting', 
          'Low-Key Lighting', 
          'High-Key Lighting'
        ], 
        halfWidth: true 
      },
    ]
  },
  {
    id: 'color',
    label: 'Color Grading',
    icon: Monitor,
    fields: [
      { id: 'color_grade', label: 'COLOR GRADE', type: 'select', options: ['None', 'Agfa Ultra', 'Autumn Tones', 'Black And White', 'Bleach Bypass', 'Blockbuster', 'Blue Hour', 'Cinema Verité', 'Cinematic', 'Cinematic Blue', 'Cinematic Green', 'Cinematic Teal-Orange', 'Classic Sepia', 'Cool Matte', 'Cool Shadows, Warm Highlights', 'Cool Tones', 'Cross-Processed', 'Cyan Tint', 'Day For Night', 'De-Saturated Blues', 'Default (no Specific Color Grading)', 'Desaturated', 'Dramatic', 'Dreamy', 'Duotone', 'Earthy', 'Ektar 100', 'Emerald Green', 'Ethereal', 'Faded', 'Film Grain', 'Film Noir', 'Fuji Classic Chrome', 'Fuji Provia', 'Fuji Velvia', 'Fujifilm Eterna', 'Giallo', 'Golden Hour', 'HDR', 'High Contrast Black And White', 'Icy Blue', 'Icy Whites', 'Infrared', 'Infrared False Color', 'Instax', 'Kodachrome', 'Kodak 2383', 'Lomo', 'Low Contrast Black And White', 'Lush Greens', 'Magenta Dream', 'Matte', 'Monochrome', 'Moody', 'Muted', 'Muted Vintage', 'Neon', 'Neon Glow', 'Night Blue', 'Old Hollywood', 'Orange And Teal', 'Pastel', 'Pastel Neon', 'Polaroid', 'Portra 400', 'Portra 800', 'Purple Haze', 'Rec2020', 'Rec709', 'Red And Cyan', 'Retro', 'Rustic', 'SDR', 'Sepia', 'Split Toning', 'Spring Bloom', 'Sunset Glow', 'Teal And Orange', 'Technicolor', 'Tritone', 'Ultra-Vivid', 'Ultraviolet', 'Vintage Film', 'Vivid', 'Vivid Pop', 'Warm Highlights, Cool Shadows', 'Warm Matte', 'Warm Tones', 'Washed Film', 'Washed Out', 'Xpro', 'Yellow And Blue'], halfWidth: true },
    ]
  },
  {
    id: 'location',
    label: 'Setting & Location',
    icon: MapPin,
    fields: [
      { id: 'era', label: 'ERA', type: 'select', options: ['None', 'Prehistoric', 'Ancient', 'Medieval', 'Industrial', 'Modern', 'present day', 'Cyberpunk'], halfWidth: true },
      { id: 'environment', label: 'ENVIRONMENT', type: 'select', options: ['None', 'Abandoned Building', 'Abandoned Mine', 'Airport', 'Alien Planet', 'Alleyway', 'Alpine', 'American City', 'Ancient Ruins', 'Any', 'Arcade', 'Archipelago', 'Arctic', 'Arena', 'Asteroid Belt', 'Astral Garden', 'Astral Plane', 'Atlantis', 'Aurora', 'Badlands', 'Bamboo Grove', 'Beach', 'Black Hole', 'Bog', 'Botanical Garden', 'Bridge', 'Busy Crosswalk', 'Canyon', 'Castle', 'Catacombs', 'Cathedral', 'Cave', 'Chakra Temple', 'Chinese Woods', 'Circus', 'City', 'City Park', 'Cliff', 'Cliffs By The Sea', 'Clockwork World', 'Coast', 'Concert Hall', 'Coral Reef', 'Cosmic Nebula', 'Crater', 'Creek', 'Crypt', 'Crystal Cavern', 'Crystal Fields', 'Cyberspace', 'Data Center', 'Deep Space', 'Desert', 'Digital World', 'Dimension Rift', 'Docks', 'Dream World', 'Dreamscape', 'Dunes', 'Dystopian City', 'Enchanted Castle', 'Enchanted Forest', 'Energy Field', 'Energy Vortex', 'European City', 'Exoplanet', 'Fae Realm', 'Field', 'Field Of Dreams', 'Field Of Flowers', 'Floating Island', 'Flying City', 'Foggy Moor', 'Forest', 'Fortress', 'Frozen Wasteland', 'Garden', 'Glacier', 'Grassland', 'Hamlet', 'Harbor', 'Haunted Woods', 'Healing Springs', 'Hill', 'Holographic Simulation', 'Ice Cave', 'Infinite Hallway', 'Island', 'Japanese Woods', 'Jungle', 'Kaleidoscopic Landscape', 'Labyrinth', 'Lagoon', 'Lake', 'Library', 'Luminescent Cave', 'Lunar Landscape', 'Magical Forest', 'Market Street', 'Marketplace', 'Marsh', 'Martian Desert', 'Maze', 'Meadow', 'Megacity', 'Memory Landscape', 'Mesa', 'Metropolis', 'Mirror Dimension', 'Monastery', 'Moon Base', 'Moonlit Night', 'Mountains', 'Museum', 'Mystic Lake', 'Mystical Grove', 'Oasis', 'Ocean', 'Old City', 'Orchard', 'Original Worlds Only', 'Palace', 'Parallel Universe', 'Pine Forest', 'Playground', 'Polar Night'], halfWidth: true },
      { id: 'weather', label: 'WEATHER', type: 'select', options: ['None', 'Clear Sky', 'Sunny', 'Partly Cloudy', 'Overcast', 'Foggy', 'Misty', 'Light Rain', 'Heavy Rain', 'Thunderstorm', 'Snow', 'Sleet', 'Hail', 'Windy', 'Hazy', 'Dust Storm'], halfWidth: true },
      { id: 'season', label: 'SEASON', type: 'select', options: ['None', 'Spring', 'Summer', 'Autumn', 'Winter'], halfWidth: true },
      { id: 'atmosphere', label: 'ATMOSPHERE / MOOD', type: 'select', options: ['None', 'Abandoned', 'Abstract', 'Adventurous', 'Afternoon', 'Airy', 'Alien', 'Alive', 'Ambient', 'Ancient', 'Angelic', 'Apocalyptic', 'Arid', 'Autumnal', 'Beautiful', 'Bleak', 'Blissful', 'Bold', 'Breezy', 'Bright', 'Brutal', 'Calm', 'Candid', 'Carefree', 'Celebratory', 'Celestial', 'Chaotic', 'Charming', 'Cheerful', 'Chilly', 'Cold', 'Colorful', 'Comforting', 'Contemplative', 'Cool', 'Cozy', 'Cosmic', 'Creepy', 'Crisp', 'Crystalline', 'Dark', 'Dawn', 'Deadly', 'Default (neutral Mood)', 'Delicate', 'Desolate', 'Dewy', 'Dramatic', 'Dreamy', 'Dreary', 'Dry', 'Dusty', 'Eerie', 'Elegant', 'Electrifying', 'Enchanting', 'Epic', 'Ethereal', 'Evening', 'Exciting', 'Exotic', 'Expressive', 'Festive', 'Foggy', 'Foreboding', 'Forgotten', 'Fresh', 'Friendly', 'Futuristic', 'Ghostly', 'Gloomy', 'Grand', 'Haunting', 'Hazy', 'Heavenly', 'Heroic', 'Hopeful', 'Hot', 'Humid', 'Hypnotic', 'Intense', 'Intimate', 'Invigorating', 'Inviting', 'Isolated', 'Joyful', 'Lonely', 'Magical', 'Melancholic', 'Mild', 'Misty', 'Moody', 'Mysterious', 'Mystical', 'Noble', 'Nostalgic', 'Ominous', 'Optimistic', 'Otherworldly', 'Passionate', 'Peaceful', 'Pensive', 'Playful', 'Powerful', 'Protected', 'Psychedelic', 'Rainy', 'Refreshing', 'Restless', 'Romantic', 'Sad', 'Safe', 'Secretive', 'Serene', 'Shadowy', 'Smoky', 'Soft', 'Somber', 'Spooky', 'Stifling', 'Still', 'Stormy', 'Surreal', 'Suspenseful', 'Tenebrous', 'Tense', 'Timeless', 'Timid', 'Tranquil', 'Uplifting', 'Warm', 'Welcoming', 'Windy', 'Wistful'], halfWidth: true },
    ]
  },
  {
    id: 'enhancements',
    label: 'Enhancements',
    icon: Sparkles,
    fields: [
      { id: 'upscale_factor', label: 'UPSCALE FACTOR', type: 'slider', min: 1, max: 4, step: 1, unit: 'x', halfWidth: true },
    ],
    chips: {
      positive: [
        'Prevent Deformities',
        'Keep Typographic Details',
        'Quality Booster',
        'Enhance Reflections',
        'Keep Key Details'
      ],
      negative: []
    }
  },
  {
    id: 'hyperrealism',
    label: 'Hyperrealism Features',
    icon: Eye,
    chips: {
      positive: ['Amateur Photography', 'Captured On Android Phone', 'Boring Reality', 'Candid', '23 Mm Focal Length', 'Detailed Realism', 'Washed Out', 'Add Tiny Imperfections', 'Slight JPEG Artifacts', 'Grain In Dark Areas', 'Overexposed', 'Underexposed', 'Unpolished'],
      negative: ['No Intense Colors', 'No Intense Filters', 'No Cinematic Vibe', 'No Background Blur', 'No Perfect Composition', 'Do Not Exactly Center Subject', 'No Vignette', 'Retain Structural Fidelity', 'Retain Logo Accuracy', 'Retain Text Accuracy']
    }
  },
];

// ArchitectLabel: Basic styling for left-column headers and global header text.
const ArchitectLabel = ({ children, className = "", isActive = false }: ArchitectLabelProps) => (
  <label className={`text-sm font-semibold tracking-tight uppercase transition-colors duration-300 ${isActive ? 'text-white' : 'text-zinc-600'} ${className}`}>
    {children}
  </label>
);

const FieldLabel = ({ children, className = "" }: FieldLabelProps) => (
  <label className={`block text-[11px] font-bold text-white uppercase tracking-[2px] ${className}`}>
    {children}
  </label>
);

// --- Sub-components ---

const SelectField = ({ label, value, options, onChange, onAddCustom, allowCustom = true }: SelectFieldProps) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const allOptions = allowCustom ? [...(options || []), '+Custom'] : (options || []);

  const handleSelectChange = (val: string) => {
    if (val === '+Custom') {
      setIsCustomMode(true);
      setCustomValue('');
    } else {
      setIsCustomMode(false);
      onChange(val);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onAddCustom(customValue.trim());
      setIsCustomMode(false);
    } else {
      setIsCustomMode(false);
    }
  };

  if (isCustomMode) {
    return (
      <div className="flex flex-col gap-1.5 w-full animate-in fade-in slide-in-from-top-1 duration-200">
        <FieldLabel>{label}</FieldLabel>
        <div className="relative flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            placeholder="Enter custom value..."
            className="w-full bg-black/60 border border-purple-500/40 rounded-lg px-4 py-3 text-sm text-purple-300 outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-500"
          />
          <button 
            onClick={handleCustomSubmit}
            className="p-3 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsCustomMode(false)}
            className="p-3 bg-zinc-900 text-zinc-500 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative group">
        <select
          value={value || 'None'}
          onChange={(e) => handleSelectChange(e.target.value)}
          className={`w-full bg-black/60 border rounded-lg px-4 py-3 text-sm transition-all appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-purple-500/50 ${
            value && value !== 'None' && value !== 'Disabled'
              ? 'border-purple-500/40 text-purple-300'
              : 'border-zinc-600 text-white group-hover:border-zinc-500'
          }`}
        >
          {allOptions.map(opt => (
            <option 
              key={opt} 
              value={opt} 
              className={opt === '+Custom' ? 'font-bold' : ''}
            >
              {opt === '+Custom' ? 'Custom Entry' : opt}
            </option>
          ))}
        </select>
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${value && value !== 'None' && value !== 'Disabled' ? 'text-purple-400' : 'text-zinc-600'}`}>
          {value && value !== 'None' && value !== 'Disabled' ? <Check className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>
    </div>
  );
};

const SliderField = ({ label, value, min, max, step, unit, onChange }: SliderFieldProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <FieldLabel>{label}</FieldLabel>
    <div className="flex items-center gap-4 px-1 py-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || min}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm font-mono text-purple-400 min-w-[3ch]">{value || min}{unit}</span>
    </div>
  </div>
);

const InputField = ({ label, value, onChange }: InputFieldProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <FieldLabel>{label}</FieldLabel>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value..."
      className="w-full bg-black/60 border border-zinc-600 rounded-lg px-4 py-3 text-sm text-zinc-300 outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-500"
    />
  </div>
);

const ChipItem = ({ label, isSelected, onToggle, variant = 'positive' }: ChipItemProps) => (
  <button
    onClick={onToggle}
    className={`px-3 py-2 rounded-lg text-[11px] font-medium border transition-all text-left truncate max-w-full ${
      isSelected 
        ? variant === 'positive' 
          ? 'bg-purple-600/10 border-purple-500/40 text-purple-300'
          : 'bg-[#b83a1a]/10 border-[#b83a1a]/40 text-[#b83a1a]'
        : 'bg-zinc-900 border-zinc-600 text-white hover:border-zinc-500'
    }`}
  >
    {label}
  </button>
);

const AccordionItem = ({ category, selections, customOptions, onUpdateField, onToggleChip, onAddCustomOption, isOpen, onToggleAccordion, isActive, onToggleActive }: AccordionItemProps) => {
  const Icon = category.icon;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleActive();
  };

  return (
    <div className={`mb-4 border rounded-2xl overflow-hidden transition-all duration-300 bg-zinc-950/40 backdrop-blur-sm ${isActive ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'border-zinc-600'}`}>
      <div 
        onClick={onToggleAccordion}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900/40 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div 
            onClick={handleCheckboxClick}
            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${isActive ? 'bg-purple-600/20 border-purple-500' : 'border-zinc-600 bg-zinc-900 hover:border-zinc-700'}`}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center ${isActive ? 'bg-purple-600' : 'bg-transparent'}`}>
              {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </div>
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
          <span className={`text-sm font-semibold tracking-tight uppercase ${isActive ? 'text-white' : 'text-zinc-600'}`}>{category.label}</span>
        </div>
        <ChevronDown className={`text-zinc-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="p-6 pt-2 border-t border-zinc-900/50">
          {!isActive && (
            <div className="mb-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[10px] text-zinc-600 uppercase tracking-widest text-center">
              Category deactivated. Check the box above to include these attributes in your JSON.
            </div>
          )}
          <div className={!isActive ? 'opacity-30 pointer-events-none grayscale' : ''}>
            {category.fields && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {category.fields.map(field => {
                  const fieldKey = `${category.id}-${field.id}`;
                  const val = selections[fieldKey];
                  const fieldCustomOptions = customOptions[fieldKey] || [];
                  const combinedOptions = [...(field.options || []), ...fieldCustomOptions];

                  return (
                    <div key={field.id} className={field.halfWidth ? 'col-span-1' : 'col-span-2'}>
                      {field.type === 'select' && (
                        <SelectField 
                          label={field.label} 
                          value={val} 
                          options={combinedOptions} 
                          onChange={(v) => onUpdateField(fieldKey, v)} 
                          onAddCustom={(v) => onAddCustomOption(fieldKey, v)}
                          allowCustom={!field.noCustom}
                        />
                      )}
                      {field.type === 'slider' && (
                        <SliderField 
                          label={field.label} 
                          value={val} 
                          min={field.min} 
                          max={field.max} 
                          step={field.step} 
                          unit={field.unit}
                          onChange={(v) => onUpdateField(fieldKey, v)} 
                        />
                      )}
                      {field.type === 'input' && (
                        <InputField 
                          label={field.label} 
                          value={val} 
                          onChange={(v) => onUpdateField(fieldKey, v)} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {category.chips && (
              <div className="space-y-6 mt-4">
                {category.chips.positive && category.chips.positive.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                      <span className="text-lg">+</span> POSITIVE ADDS
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {category.chips.positive.map(label => (
                        <ChipItem 
                          key={label} 
                          label={label} 
                          isSelected={!!selections[`${category.id}-pos-${label}`]} 
                          onToggle={() => onToggleChip(`${category.id}-pos-${label}`, label)} 
                        />
                      ))}
                    </div>
                  </div>
                )}
                {category.chips.negative && category.chips.negative.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#b83a1a] uppercase tracking-[2px] mb-4 flex items-center gap-2">
                      <span className="text-lg">⦸</span> NEGATIVE ADDS
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {category.chips.negative.map(label => (
                        <ChipItem 
                          key={label} 
                          label={label} 
                          variant="negative"
                          isSelected={!!selections[`${category.id}-neg-${label}`]} 
                          onToggle={() => onToggleChip(`${category.id}-neg-${label}`, label)} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [customOptions, setCustomOptions] = useState<Record<string, string[]>>({});
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [natCopied, setNatCopied] = useState(false);

  const toggleCategoryActive = (catId: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
        setOpenAccordions(prevOpen => {
          const nextOpen = new Set(prevOpen);
          nextOpen.delete(catId);
          return nextOpen;
        });
      } else {
        next.add(catId);
        setOpenAccordions(prevOpen => {
          const nextOpen = new Set(prevOpen);
          nextOpen.add(catId);
          return nextOpen;
        });
      }
      return next;
    });
  };

  const toggleAccordion = (catId: string) => {
    setOpenAccordions(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const updateField = (id: string, value: any) => {
    setSelections(prev => {
      const next = { ...prev };
      if (value === 'None' || value === 'Disabled' || value === '') {
        delete next[id];
      } else {
        next[id] = value;
      }
      return next;
    });
  };

  const addCustomOption = (fieldKey: string, value: string) => {
    setCustomOptions(prev => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), value]
    }));
    updateField(fieldKey, value);
  };

  const toggleChip = (id: string, label: string) => {
    setSelections(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = label;
      return next;
    });
  };

  const generatedJson = useMemo(() => {
    const visualAttributes: any = {};
    const features: any = { positive: [], negative: [] };

    Object.entries(selections).forEach(([key, value]) => {
      const catId = key.split('-')[0];
      if (activeCategories.has(catId)) {
        if (key.includes('-pos-')) {
          features.positive.push(value);
        } else if (key.includes('-neg-')) {
          features.negative.push(value);
        } else {
          const fieldId = key.split('-').slice(1).join('-');
          const catName = CATEGORIES.find(c => c.id === catId)?.label.toUpperCase() || catId.toUpperCase();
          if (!visualAttributes[catName]) visualAttributes[catName] = {};
          visualAttributes[catName][fieldId.toUpperCase()] = value;
        }
      }
    });

    const output: any = {
      ...(positivePrompt.trim() && { POSITIVE_PROMPT: positivePrompt }),
      ...(negativePrompt.trim() && { NEGATIVE_PROMPT: negativePrompt }),
      ...(features.positive.length > 0 && { ENHANCEMENTS_POS: features.positive }),
      ...(features.negative.length > 0 && { ENHANCEMENTS_NEG: features.negative }),
      ...(Object.keys(visualAttributes).length > 0 && { ATTRIBUTES: visualAttributes })
    };

    return JSON.stringify(output, null, 2);
  }, [positivePrompt, negativePrompt, selections, activeCategories]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyNatToClipboard = () => {
    navigator.clipboard.writeText(naturalLanguage);
    setNatCopied(true);
    setTimeout(() => setNatCopied(false), 2000);
  };

  const generateNaturalLanguage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Convert the following structured image generation configuration (JSON) into a descriptive, natural language prompt suitable for a professional AI image generator.

Instructions for conversion:
1. THE CORE: Start with the 'POSITIVE_PROMPT' as the primary subject.
2. ATTRIBUTES: Integrate all 'ATTRIBUTES' (lighting, camera, style, etc.) as seamless descriptive details.
3. POSITIVE CHIPS: Layer in 'ENHANCEMENTS_POS' values to enrich the scene quality.
4. NEGATIVE CONSTRAINTS: Crucially, you MUST incorporate the 'NEGATIVE_PROMPT' and all values from 'ENHANCEMENTS_NEG'. Append these clearly at the end of the prompt under a "Negative Prompt:" or "Exclusions:" heading, ensuring all user-provided exclusions are listed.

The final output should be a cohesive technical-artistic brief that includes both the positive vision and the explicit negative constraints provided in the data.

JSON DATA:
${generatedJson}`,
        config: {
          systemInstruction: "You are an expert AI prompt engineer. Your task is to take structured technical JSON configurations for image generation and turn them into natural, flowing, yet highly specific prompts. You must ensure that all fields in the JSON, including the negative prompt and negative enhancements, are represented in the final text. Do not output anything other than the prompt text itself."
        }
      });
      setNaturalLanguage(response.text?.trim() || 'Failed to generate prompt.');
    } catch (error) {
      console.error("Error generating natural language prompt:", error);
      setNaturalLanguage("Error generating prompt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasPromptText = positivePrompt.length > 0 || negativePrompt.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Selectable Attributes and Prompts (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Prompts Area */}
          <div className={`space-y-6 bg-zinc-900/30 border p-8 rounded-[32px] backdrop-blur-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 ${hasPromptText ? 'border-white' : 'border-zinc-600'}`}>
            <div>
              <ArchitectLabel className="mb-4" isActive={positivePrompt.trim().length > 0}>Positive Prompt</ArchitectLabel>
              <textarea
                value={positivePrompt}
                onChange={(e) => setPositivePrompt(e.target.value)}
                placeholder="Describe your image in detail..."
                className={`w-full bg-black/40 border rounded-2xl p-6 text-zinc-100 h-32 focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-500 text-base leading-relaxed custom-scrollbar ${positivePrompt.trim().length > 0 ? 'border-white' : 'border-zinc-600'}`}
              />
            </div>
            <div>
              <ArchitectLabel className="mb-4" isActive={negativePrompt.trim().length > 0}>Negative Prompt</ArchitectLabel>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to exclude (e.g. blurry, low quality, deformed)..."
                className={`w-full bg-black/40 border rounded-2xl p-6 text-zinc-100 h-24 focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-zinc-500 text-base leading-relaxed custom-scrollbar ${negativePrompt.trim().length > 0 ? 'border-white' : 'border-zinc-600'}`}
              />
            </div>
          </div>

          {/* Attributes Accordions Area */}
          <div className="space-y-2">
            {CATEGORIES.map(category => (
              <AccordionItem
                key={category.id}
                category={category}
                selections={selections}
                customOptions={customOptions}
                isOpen={openAccordions.has(category.id)}
                isActive={activeCategories.has(category.id)}
                onToggleAccordion={() => toggleAccordion(category.id)}
                onToggleActive={() => toggleCategoryActive(category.id)}
                onUpdateField={updateField}
                onAddCustomOption={addCustomOption}
                onToggleChip={toggleChip}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Live JSON Preview and Natural Language Result (lg:col-span-5) */}
        <div className="lg:col-span-5 sticky top-10 space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-[32px] flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl h-auto transition-all duration-300">
            <div className="px-8 py-6 flex justify-between items-center bg-purple-600">
              {/* Header matches button size and boldness */}
              <ArchitectLabel className="text-white !text-base !font-bold tracking-wide" isActive={true}>Live JSON Preview</ArchitectLabel>
              <div className="bg-white/20 p-2 rounded-xl">
                <Braces className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="p-8 bg-black/60 code-font text-[13px] overflow-visible">
              <pre className="text-zinc-400 whitespace-pre-wrap break-words">
                {generatedJson.split('\n').map((line, i) => {
                  if (line.includes(':')) {
                    const [key, val] = line.split(':');
                    return (
                      <div key={i} className="mb-0.5">
                        <span className="text-white font-medium uppercase tracking-tight">{key}:</span>
                        <span className="text-purple-400">{val}</span>
                      </div>
                    );
                  }
                  return <div key={i} className="text-zinc-700">{line}</div>;
                })}
              </pre>
            </div>

            <div className="p-8 space-y-3 mt-auto flex flex-col">
              <button
                onClick={copyToClipboard}
                className={`w-full max-w-[85%] mx-auto flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] uppercase tracking-wide ${
                  copied 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'bg-purple-600 text-white hover:bg-purple-500 shadow-xl shadow-purple-900/30'
                }`}
              >
                {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                <span className="text-white">{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>
              
              <button
                onClick={generateNaturalLanguage}
                disabled={isGenerating}
                className="w-full max-w-[85%] mx-auto flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] bg-[#ffd22e] text-black hover:bg-[#eac02a] shadow-xl shadow-yellow-900/10 disabled:opacity-50 uppercase tracking-wide"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                Generate Natural Prompt
              </button>
            </div>
          </div>

          {/* Natural Language Output Box */}
          { (naturalLanguage || isGenerating) && (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-[32px] overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="px-8 py-5 flex justify-between items-center border-b border-zinc-800/80 bg-[#ffd22e]">
                {/* Header matches button size and boldness */}
                <ArchitectLabel className="!text-black !text-base !font-bold tracking-wide" isActive={true}>Natural Language Prompt</ArchitectLabel>
                <button 
                  onClick={copyNatToClipboard}
                  className="text-black hover:opacity-70 transition-opacity"
                >
                  {natCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-8 bg-black/40 text-zinc-200 text-sm leading-relaxed min-h-[100px]">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-3 text-white uppercase tracking-wider text-[11px]">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Architect is reformulating your prompt...
                  </div>
                ) : (
                  <div className="space-y-6 flex flex-col">
                    <p className="whitespace-pre-wrap">{naturalLanguage}</p>
                    <button
                      onClick={copyNatToClipboard}
                      className="w-full max-w-[85%] mx-auto flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] bg-[#ffd22e] text-black hover:bg-[#eac02a] shadow-xl shadow-yellow-900/10 uppercase tracking-wide"
                    >
                      {natCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {natCopied ? 'Copied Prompt' : 'Copy Natural Prompt'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
