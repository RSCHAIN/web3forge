// src/i18n/home.content.ts

export type Lang = "en" | "fr";

export type HomeFeature = {
  title: string;
  text: string;
};

export type HomeContent = {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaConsole: string;
  ctaDeploy: string;
  features: HomeFeature[];
  footer: string;
};

export const HOME_CONTENT: Record<Lang, HomeContent> = {
  en: {
    badge: "No-Code Smart Contract Platform",
    title: "Deploy and manage smart contracts.",
    highlight: "Securely. Professionally.",
    subtitle:
      "SafeNet3 is a professional Web3 console for deploying and managing smart contracts, from local environments to public networks.",
    ctaConsole: "Open Console",
    ctaDeploy: "New Deployment",
    features: [
      {
        title: "No-Code Deployment",
        text: "Deploy real Solidity smart contracts without managing boilerplate or infrastructure.",
      },
      {
        title: "Multi-Standard",
        text: "ERC20, ERC721, ERC1155 and modular security patterns.",
      },
      {
        title: "Any Network",
        text: "From local Anvil to public testnets and mainnets.",
      },
      {
        title: "Security-First",
        text: "Built around audited standards and explicit security flows.",
      },
    ],
    footer: "SECURE WEB3 DEPLOYMENT PLATFORM",
  },

  fr: {
    badge: "Plateforme No-Code de Smart Contracts",
    title: "Déployez et gérez des smart contracts.",
    highlight: "En toute sécurité. Professionnellement.",
    subtitle:
      "SafeNet3 est une console Web3 professionnelle pour déployer et gérer des smart contracts, du local aux réseaux publics.",
    ctaConsole: "Accéder à la console",
    ctaDeploy: "Nouveau déploiement",
    features: [
      {
        title: "Déploiement No-Code",
        text: "Déployez de vrais smart contracts Solidity sans gérer l’infrastructure ou le code répétitif.",
      },
      {
        title: "Multi-Standards",
        text: "ERC20, ERC721, ERC1155 et modules de sécurité avancés.",
      },
      {
        title: "Tous Réseaux",
        text: "Du réseau local Anvil aux testnets et mainnets publics.",
      },
      {
        title: "Sécurité d’abord",
        text: "Architecture pensée autour de standards audités et de flux explicites.",
      },
    ],
    footer: "PLATEFORME DE DÉPLOIEMENT WEB3 SÉCURISÉE",
  },
};
