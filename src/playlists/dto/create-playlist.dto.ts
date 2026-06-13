import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ example: 'My Coding Chill Mix' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Tracks for coding relaxation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
