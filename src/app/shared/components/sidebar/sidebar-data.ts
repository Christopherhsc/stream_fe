const getRandomImage = (): string =>
  `https://picsum.photos/40?random=${Math.floor(Math.random() * 1000)}`;

export const sidebarData = [
  {
    title: 'World of Warcraft',
    image: getRandomImage(),
    viewers: 47,
    subMenu: [
      {
        title: 'OnlyFangs',
        image: getRandomImage(),
        viewers: 32,
        url: '/dashboard/stats'
      },
      {
        title: 'Method',
        image: getRandomImage(),
        viewers: 15,
        url: '/dashboard/stats'
      },
    ],
  },
  {
    title: 'TrackMania',
    image: getRandomImage(),
    viewers: 12,
  },
  {
    title: 'League of Legends',
    image: getRandomImage(),
    viewers: 3,
  },
];
