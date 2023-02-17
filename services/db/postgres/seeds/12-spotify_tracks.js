exports.seed = async knex => {
  console.log('Starting to seed spotify_tracks.js entries...');
  await knex('spotify_tracks').insert([
    // quagsirus & Leonz - Sussy Eurobeat
    {
      id: '3pHoVHKe79RIbbb7IgFe12',
      name: 'Sussy Eurobeat',
      href: 'https://api.spotify.com/v1/tracks/3pHoVHKe79RIbbb7IgFe12',
      external_urls: { spotify: 'https://open.spotify.com/track/3pHoVHKe79RIbbb7IgFe12' },
      track_number: 1,
      preview_url:
        'https://p.scdn.co/mp3-preview/68f7e42c02d2125f2abb43245069691ed4c12c94?cid=d4cd13e4c7c94af6b464547a2c6d348f',
      uri: 'spotify:track:3pHoVHKe79RIbbb7IgFe12',
      explicit: false,
      duration_ms: 145072,
      external_ids: { isrc: 'SE6QE2130620' },
      album: {
        artists: [
          {
            name: 'quagsirus',
            external_url: 'https://open.spotify.com/artist/72aHua2WAtA6kmEr2g4QVO',
            type: 'artist',
          },
          {
            name: 'Leonz',
            external_url: 'https://open.spotify.com/artist/5WY1yCgtVHWjKPI5nwLSue',
            type: 'artist',
          },
        ],
        images: [
          {
            width: 640,
            height: 640,
            url: 'https://i.scdn.co/image/ab67616d0000b2737be02c4cfb7b1abc0c51ee43',
          },
        ],
      },
      artists: [
        {
          name: 'quagsirus',
          external_url: 'https://open.spotify.com/artist/72aHua2WAtA6kmEr2g4QVO',
          type: 'artist',
        },
        {
          name: 'Leonz',
          external_url: 'https://open.spotify.com/artist/5WY1yCgtVHWjKPI5nwLSue',
          type: 'artist',
        },
      ],
    },

    // Tevvez - Legend
    {
      id: '05EG9LwFCVjkoYEWzsrHHO',
      name: 'Legend',
      href: 'https://api.spotify.com/v1/tracks/05EG9LwFCVjkoYEWzsrHHO',
      external_urls: { spotify: 'https://open.spotify.com/track/05EG9LwFCVjkoYEWzsrHHO' },
      track_number: 9,
      preview_url:
        'https://p.scdn.co/mp3-preview/70b11fde510fd0e80b938b56f9e30d77f33c4c90?cid=d4cd13e4c7c94af6b464547a2c6d348f',
      uri: 'spotify:track:05EG9LwFCVjkoYEWzsrHHO',
      explicit: false,
      duration_ms: 189679,
      external_ids: { isrc: 'QZNWW2022779' },
      album: {
        artists: [
          {
            name: 'Tevvez',
            external_url: 'https://open.spotify.com/artist/3ZaPFQ05J5qSM5I3Smbp44',
            type: 'artist',
          },
        ],
        images: [
          {
            width: 640,
            height: 640,
            url: 'https://i.scdn.co/image/ab67616d0000b273174e964b6fdf664e564b4f62',
          },
        ],
      },
      artists: [
        {
          name: 'Tevvez',
          external_url: 'https://open.spotify.com/artist/3ZaPFQ05J5qSM5I3Smbp44',
          type: 'artist',
        },
      ],
    },

    // Fasion - Dansez
    {
      id: '5nRnv3yfYLJrnCdaXmWtGD',
      name: 'Dansez',
      href: 'https://api.spotify.com/v1/tracks/5nRnv3yfYLJrnCdaXmWtGD',
      external_urls: { spotify: 'https://open.spotify.com/track/5nRnv3yfYLJrnCdaXmWtGD' },
      track_number: 3,
      preview_url: null,
      uri: 'spotify:track:5nRnv3yfYLJrnCdaXmWtGD',
      explicit: false,
      duration_ms: 189825,
      external_ids: { isrc: 'SE5Q51800344' },
      album: {
        artists: [
          {
            name: 'Fasion',
            external_url: 'https://open.spotify.com/artist/5uhPMkoNEzwhbfAw5UzAUg',
            type: 'artist',
          },
        ],
        images: [
          {
            width: 640,
            height: 640,
            url: 'https://i.scdn.co/image/ab67616d0000b273af7b213ac80e720bd5d33f98',
          },
        ],
      },
      artists: [
        {
          name: 'Fasion',
          external_url: 'https://open.spotify.com/artist/5uhPMkoNEzwhbfAw5UzAUg',
          type: 'artist',
        },
      ],
    },
  ]);

  console.log('Seeding spotify_tracks.js has been finished!');
};
