/**
 * @description Represents a single track returned by Jamendo API
 * @example
 * ```json
 * {
 *   "id": "168",
 *   "name": "J'm'e FPM",
 *   "duration": 183,
 *   "artist_id": "7",
 *   "artist_name": "TriFace",
 *   "artist_idstr": "triface",
 *   "album_name": "Premiers Jets",
 *   "album_id": "24",
 *   "license_ccurl": "",
 *   "position": 1,
 *   "releasedate": "2004-12-17",
 *   "album_image": "https://usercontent.jamendo.com?type=album&id=24&width=300&trackid=168",
 *   "audio":
 *   "https://prod-1.storage.jamendo.com/?trackid=168&format=mp31&from=L2F6mQzem95MGMslx02ASg%3D%3D%7CljtHLwh064eFDefKDvmhBA%3D%3D",
 *   "audiodownload": "https://prod-1.storage.jamendo.com/download/track/168/mp32/",
 *   "prourl": "",
 *   "shorturl": "https://jamen.do/t/168",
 *   "shareurl": "https://www.jamendo.com/track/168",
 *   "audiodownload_allowed": true,
 *   "content_id_free": false,
 *   "image": "https://usercontent.jamendo.com?type=album&id=24&width=300&trackid=168"
 * },
 * ```
 */
export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  artist_idstr: string;
  album_name: string;
  album_id: string;
  license_ccurl: string;
  position: number;
  releasedate: string;
  album_image: string;
  audio: string;
  audiodownload: string;
  prourl: string;
  shorturl: string;
  shareurl: string;
  image: string;
  audiodownload_allowed: boolean;
  content_id_free: boolean;
  waveform?: string;
}

/**
 * @description Represents a single album returned by Jamendo API
 * @example
 * ```json
 * {
 *   "id": "24",
 *   "name": "Premiers Jets",
 *   "releasedate": "2004-12-17",
 *   "artist_id": "7",
 *   "artist_name": "TriFace",
 *   "image": "https://usercontent.jamendo.com?type=album&id=24&width=300",
 *   "zip": "https://storage.jamendo.com/download/a24/mp32/",
 *   "shorturl": "https://jamen.do/l/a24",
 *   "shareurl": "https://www.jamendo.com/list/a24",
 *   "zip_allowed": true
 * },
 * ```
 */
export interface JamendoAlbum {
  id: string;
  name: string;
  releasedate: string;
  artist_id: string;
  artist_name: string;
  image: string;
  zip: string;
  shorturl: string;
  shareurl: string;
  zip_allowed: boolean;
}

/**
 * @description Represents a single track within an album response from Jamendo API.
 */
export interface JamendoAlbumTrack {
  id: string;
  position: string;
  name: string;
  duration: string;
  license_ccurl: string;
  audio: string;
  audiodownload: string;
  audiodownload_allowed: boolean;
}

/**
 * @description Represents an album with its tracks from Jamendo /albums/tracks endpoint.
 */
export interface JamendoAlbumWithTracks extends JamendoAlbum {
  track_id: string;
  tracks: JamendoAlbumTrack[];
}

/**
 * @description Represents a single artist returned by Jamendo API
 * @example
 * ```json
 * {
 *    "id": "5",
 *    "name": "Both",
 *    "website": "http://www.both-world.com",
 *    "joindate": "2004-07-04",
 *    "image": "https://usercontent.jamendo.com?type=artist&id=5&width=300",
 *    "shorturl": "https://jamen.do/a/5",
 *    "shareurl": "https://www.jamendo.com/artist/5"
 *  },
 *  ```
 */
export interface JamendoArtist {
  id: string;
  name: string;
  website: string;
  joindate: string;
  image: string;
  shorturl: string;
  shareurl: string;
}

/** @description Represents a single track within an artist response from Jamendo `/artists/tracks` endpoint. */
export interface JamendoArtistTrack {
  id: string;
  name: string;
  album_name: string;
  album_id: string;
  image: string;
  audio: string;
  audiodownload: string;
  audiodownload_allowed: boolean;
  duration?: number;
  position?: number;
  releasedate?: string;
  license_ccurl?: string;
}

/** @description Represents an artist with its tracks from Jamendo `/artists/tracks` endpoint. */
export interface JamendoArtistWithTracks extends JamendoArtist {
  tracks: JamendoArtistTrack[];
}

/** @description Represents a single album within an artist response from Jamendo `/artists/albums` endpoint. */
export interface JamendoArtistAlbum {
  id: string;
  name: string;
  releasedate: string;
  image: string;
}

/** @description Represents an artist with its albums from Jamendo `/artists/albums` endpoint. */
export interface JamendoArtistWithAlbums extends JamendoArtist {
  albums: JamendoArtistAlbum[];
}

/**
 * @description Generic wrapper for all Jamendo API list responses
 * @example
 * ```json
 * {
 *   "headers": {
 *     "status": "success",
 *     "code": 0,
 *     "error_message": "",
 *     "warnings": "",
 *     "results_count": 2,
 *     "next": "https://api.jamendo.com/v3.0/artists?client_id=<your_cliemt_id>=json&limit=2&offset=2"
 *   },
 *   "results": []
 * }
 */
export interface JamendoResponse<T> {
  headers: {
    status: string;
    code: number;
    error_message: string;
    warnings: string;
    results_count: number;
    next?: string;
  };
  results: T[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    results_count: number;
    next: string | null;
  };
}
