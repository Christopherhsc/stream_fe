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
        iconImage: getRandomImage(),
        headerImage: '/assets/onlyfangs.png',
        viewers: 32,
        url: '/onlyfangs',
      },
      {
        title: 'Method',
        iconImage: getRandomImage(),
        viewers: 15,
        url: '/dashboard/stats'
      },
    ],
  },
];
