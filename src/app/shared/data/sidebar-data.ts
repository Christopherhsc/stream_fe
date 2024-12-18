const getRandomImage = (): string =>
  `https://picsum.photos/40?random=${Math.floor(Math.random() * 1000)}`;

export const sidebarData = [
  {
    title: 'World of Warcraft',
    image: getRandomImage(),
    viewers: 0,
    subMenu: [
      {
        title: 'OnlyFangs',
        iconImage: getRandomImage(),
        headerImage: '/assets/onlyfangs.png',
        viewers: 0,
        url: '/onlyfangs',
      },
      {
        title: 'Method',
        iconImage: getRandomImage(),
        viewers: 0,
        url: '/method'
      },
    ],
  },
];
