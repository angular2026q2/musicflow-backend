import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PlaylistTrackDto {
  @ApiPropertyOptional({ example: '1161940' })
  @IsString()
  @IsNotEmpty()
  track_id: string;

  @ApiPropertyOptional({ example: 'In Tune' })
  @IsString()
  @IsNotEmpty()
  track_name: string;

  @ApiPropertyOptional({ example: 'Kellee Maize' })
  @IsString()
  @IsNotEmpty()
  artist_name: string;

  @ApiPropertyOptional({ example: 'The Remixes' })
  @IsString()
  @IsNotEmpty()
  album_name: string;

  @ApiPropertyOptional({
    example: 'https://usercontent.jamendo.com?type=albumm&139585&width=300',
  })
  @IsString()
  @IsNotEmpty()
  album_image: string;

  @ApiPropertyOptional({
    example: 'https://prod-1.storage.jamendo.com/?trackid=1161940&format=mp31',
  })
  @IsString()
  @IsNotEmpty()
  audio: string;

  @ApiPropertyOptional({ example: 346 })
  @IsInt()
  @Min(1)
  duration: number;
}

export class UpdatePlaylistDto {
  @ApiPropertyOptional({ example: 'My Updated Mix' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: [PlaylistTrackDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaylistTrackDto)
  tracks?: PlaylistTrackDto[];
}
