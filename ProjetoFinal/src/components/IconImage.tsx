import React from 'react';
import { Image, ImageStyle, ViewStyle } from 'react-native';

export type IconImageType = 
  | 'celebration' 
  | 'stats' 
  | 'sparkles' 
  | 'trophy' 
  | 'puzzle' 
  | 'star' 
  | 'error' 
  | 'bulb'
  | 'input'
  | 'output';

interface IconImageProps {
  type: IconImageType;
  size?: number;
  style?: ImageStyle | ViewStyle;
  marginRight?: number;
}

const iconUrls: Record<IconImageType, string> = {
  celebration: 'https://img.icons8.com/?size=100&id=gmaT28RFMt6O&format=png&color=000000',
  stats: 'https://img.icons8.com/?size=100&id=aIRVSXFZTfi5&format=png&color=000000',
  sparkles: 'https://img.icons8.com/?size=100&id=pPSwsHvu2NfZ&format=png&color=000000',
  trophy: 'https://img.icons8.com/?size=100&id=11997&format=png&color=000000',
  puzzle: 'https://img.icons8.com/?size=100&id=P9lRIVRzfyTU&format=png&color=000000',
  star: 'https://img.icons8.com/?size=100&id=8ggStxqyboK5&format=png&color=000000',
  error: 'https://img.icons8.com/?size=100&id=11997&format=png&color=000000',
  bulb: 'https://img.icons8.com/?size=100&id=mlgyCrKCW0fI&format=png&color=000000',
  input: 'https://img.icons8.com/?size=100&id=zexuQUcm590L&format=png&color=000000',
  output: 'https://img.icons8.com/?size=100&id=FWJYa8vdduXB&format=png&color=000000',
};

export default function IconImage({ 
  type, 
  size = 16, 
  style,
  marginRight = 4,
}: IconImageProps) {
  return (
    <Image
      source={{ uri: iconUrls[type] }}
      style={[
        { 
          width: size, 
          height: size,
          marginRight,
        }, 
        style
      ]}
      resizeMode="contain"
    />
  );
}

