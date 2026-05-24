import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class AddHistoryDto {
  @ApiProperty({ example: '1161940' })
  @IsString()
  track_id: string;

  @ApiProperty({ example: 'In Tune (J. Glaze Remix)' })
  @IsString()
  track_name: string;

  @ApiProperty({ example: 'Kellee Maize' })
  @IsString()
  artist_name: string;

  @ApiProperty({ example: 'The Remixes (2015)' })
  @IsString()
  album_name: string;

  @ApiProperty({
    example: 'https://usercontent.jamendo.com?type=album&id=139585&width=300',
  })
  @IsString()
  album_image: string;

  @ApiProperty({
    example: 'https://prod-1.storage.jamendo.com/?trackid=1161940&format=mp31',
  })
  @IsString()
  audio: string;

  @ApiProperty({ example: 346 })
  @IsInt()
  @Min(1)
  duration: number;
}
