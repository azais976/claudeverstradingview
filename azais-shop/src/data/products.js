export const categories = [
  { id: 'hauts', label: 'Hauts', description: 'T-shirts, chemises & pulls', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85', gender: null },
  { id: 'bas', label: 'Bas', description: 'Pantalons, jeans & shorts', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=85', gender: null },
  { id: 'couvre-chef', label: 'Couvre-Chef', description: 'Casquettes & bonnets', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=85', gender: null },
  { id: 'chaussures-homme', label: 'Chaussures Homme', description: 'Sneakers & boots homme', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85', gender: 'homme' },
  { id: 'chaussures-femme', label: 'Chaussures Femme', description: 'Sneakers & boots femme', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85', gender: 'femme' },
  { id: 'ceintures', label: 'Ceintures', description: 'Ceintures cuir & fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=85', gender: null },
  { id: 'sous-vetements-homme', label: 'Sous-vêtements Homme', description: 'Boxers & slips premium', image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=85', gender: 'homme' },
  { id: 'sous-vetements-femme', label: 'Sous-vêtements Femme', description: 'Lingerie & ensembles', image: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=600&q=85', gender: 'femme' },
]

export const products = [
  // ── Hauts ──────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Tee Crew Neck Blanc Oversize',
    category: 'hauts', price: 32, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=85',
  },
  {
    id: 2,
    name: 'Chemise Oxford Loose Fit',
    category: 'hauts', price: 69, originalPrice: 89, tag: 'Promo',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=85',
  },
  {
    id: 3,
    name: 'Hoodie Fleece Premium Noir',
    category: 'hauts', price: 89, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=85',
  },
  {
    id: 4,
    name: 'Sweat Crewneck Essential Gris',
    category: 'hauts', price: 65, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=85',
  },
  {
    id: 5,
    name: 'Polo Piqué Regular Blanc',
    category: 'hauts', price: 55, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=85',
  },
  {
    id: 6,
    name: 'Veste Bomber Satin Kaki',
    category: 'hauts', price: 129, originalPrice: 159, tag: 'Promo',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=85',
  },

  // ── Bas ────────────────────────────────────────────────────────────────
  {
    id: 7,
    name: 'Jean Straight Leg Noir',
    category: 'bas', price: 85, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=85',
  },
  {
    id: 8,
    name: 'Pantalon Cargo Kaki Multi-Poches',
    category: 'bas', price: 79, originalPrice: 99, tag: 'Promo',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=85',
  },
  {
    id: 9,
    name: 'Short Terry Éponge Gris',
    category: 'bas', price: 49, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=85',
  },
  {
    id: 10,
    name: 'Jogging Tech Slim Anthracite',
    category: 'bas', price: 75, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=85',
  },
  {
    id: 11,
    name: 'Jean Baggy Délavé Vintage',
    category: 'bas', price: 95, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=85',
  },

  // ── Couvre-Chef ────────────────────────────────────────────────────────
  {
    id: 12,
    name: 'Cap Snapback Brodé Noir',
    category: 'couvre-chef', price: 38, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=85',
  },
  {
    id: 13,
    name: 'Bonnet Ribbed Côtelé Beige',
    category: 'couvre-chef', price: 29, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=85',
  },
  {
    id: 14,
    name: 'Bob Bucket Hat Denim Wash',
    category: 'couvre-chef', price: 42, originalPrice: 55, tag: 'Promo',
    image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&q=85',
  },
  {
    id: 15,
    name: 'Chapeau Panama Tressé Raffia',
    category: 'couvre-chef', price: 48, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=85',
  },

  // ── Chaussures Homme (Nike Air TN) ────────────────────────────────────
  {
    id: 16,
    name: 'Nike Air Max TN Triple Black',
    category: 'chaussures-homme', price: 135, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85',
    source: 'external', orderUrl: 'https://www.airtn.fr/',
  },
  {
    id: 17,
    name: 'Nike Air Max TN Triple White',
    category: 'chaussures-homme', price: 135, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=600&q=85',
    source: 'external', orderUrl: 'https://www.airtn.fr/',
  },
  {
    id: 18,
    name: 'Nike Air Max TN University Red',
    category: 'chaussures-homme', price: 140, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=85',
    source: 'external', orderUrl: 'https://www.airtn.fr/',
  },
  {
    id: 19,
    name: 'Nike Air Max TN Photo Blue',
    category: 'chaussures-homme', price: 140, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=600&q=85',
    source: 'external', orderUrl: 'https://www.airtn.fr/',
  },
  {
    id: 20,
    name: 'Nike Air Max TN Volt Black',
    category: 'chaussures-homme', price: 145, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=85',
    source: 'external', orderUrl: 'https://www.airtn.fr/',
  },
  {
    id: 21,
    name: 'Nike Air Max TN University Gold',
    category: 'chaussures-homme', price: 145, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=85',
    source: 'external', orderUrl: 'https://www.airtn.fr/',
  },
  {
    id: 22,
    name: 'Nike Air Max TN Hyper Blue',
    category: 'chaussures-homme', price: 150, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=85',
    source: 'external', orderUrl: 'https://www.airtn.fr/',
  },
  {
    id: 23,
    name: 'Nike Air Max TN OG Black Lime',
    category: 'chaussures-homme', price: 160, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=85',
    source: 'external', orderUrl: 'https://www.airtn.fr/',
  },

  // ── Chaussures Femme ──────────────────────────────────────────────────
  {
    id: 24,
    name: 'Sneaker Plateforme Chunky Blanc',
    category: 'chaussures-femme', price: 125, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 25,
    name: 'Boot Ankle Cuir Verni Noir',
    category: 'chaussures-femme', price: 149, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 26,
    name: 'Mule Square Toe Beige',
    category: 'chaussures-femme', price: 89, originalPrice: 110, tag: 'Promo',
    image: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 27,
    name: 'Sneaker Rétro Runner Rose Blush',
    category: 'chaussures-femme', price: 119, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 28,
    name: 'Talon Bloc Carré Camel',
    category: 'chaussures-femme', price: 135, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 29,
    name: 'Sandales Strass Dorées',
    category: 'chaussures-femme', price: 95, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },

  // ── Ceintures ─────────────────────────────────────────────────────────
  {
    id: 30,
    name: 'Ceinture Cuir Pleine Fleur Noire',
    category: 'ceintures', price: 49, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 31,
    name: 'Ceinture Tressée Braided Marron',
    category: 'ceintures', price: 39, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 32,
    name: 'Ceinture Boucle Dorée Premium',
    category: 'ceintures', price: 59, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 33,
    name: 'Ceinture Réversible Bicolore',
    category: 'ceintures', price: 52, originalPrice: 68, tag: 'Promo',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },

  // ── Sous-vêtements Homme ──────────────────────────────────────────────
  {
    id: 34,
    name: 'Pack 3 Boxers Modal Stretch',
    category: 'sous-vetements-homme', price: 38, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 35,
    name: 'Slip Bambou Soft Touch Noir',
    category: 'sous-vetements-homme', price: 19, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1611911813383-67769b37a149?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 36,
    name: 'Boxer Long Daily Comfort Gris',
    category: 'sous-vetements-homme', price: 24, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 37,
    name: 'Pack 5 Slips Coton Essentiels',
    category: 'sous-vetements-homme', price: 48, originalPrice: 62, tag: 'Promo',
    image: 'https://images.unsplash.com/photo-1611911813383-67769b37a149?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },

  // ── Sous-vêtements Femme ──────────────────────────────────────────────
  {
    id: 38,
    name: 'Soutien-gorge Balconnet Dentelle',
    category: 'sous-vetements-femme', price: 39, originalPrice: null, tag: 'Nouveau',
    image: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 39,
    name: 'Set Bralette & Culotte Noir',
    category: 'sous-vetements-femme', price: 58, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a66?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 40,
    name: 'Culotte Taille Haute Seamless',
    category: 'sous-vetements-femme', price: 22, originalPrice: null, tag: null,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
  {
    id: 41,
    name: 'Bralette Triangle Sans Armatures Nude',
    category: 'sous-vetements-femme', price: 29, originalPrice: 39, tag: 'Promo',
    image: 'https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=600&q=85',
    source: 'external', orderUrl: 'https://hipobuy.com/',
  },
]
