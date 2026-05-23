export const categories = [
  { id: 'hauts', label: 'Hauts', description: 'T-shirts, chemises & pulls', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', gender: null },
  { id: 'bas', label: 'Bas', description: 'Pantalons, jeans & shorts', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', gender: null },
  { id: 'couvre-chef', label: 'Couvre-Chef', description: 'Casquettes & bonnets', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80', gender: null },
  { id: 'chaussures-homme', label: 'Chaussures Homme', description: 'Sneakers & boots homme', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', gender: 'homme' },
  { id: 'chaussures-femme', label: 'Chaussures Femme', description: 'Sneakers & boots femme', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80', gender: 'femme' },
  { id: 'ceintures', label: 'Ceintures', description: 'Ceintures cuir & fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', gender: null },
  { id: 'sous-vetements-homme', label: 'Sous-vêtements Homme', description: 'Boxers & slips premium', image: 'https://images.unsplash.com/photo-1589363460779-cd717d02e12b?w=600&q=80', gender: 'homme' },
  { id: 'sous-vetements-femme', label: 'Sous-vêtements Femme', description: 'Lingerie & ensembles', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', gender: 'femme' },
]

export const products = [
  // Hauts
  { id: 1, name: 'T-Shirt Essentiel', category: 'hauts', price: 29, originalPrice: null, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', tag: null },
  { id: 2, name: 'Chemise Lin Blanc', category: 'hauts', price: 69, originalPrice: 89, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80', tag: 'Promo' },
  { id: 3, name: 'Hoodie Oversize', category: 'hauts', price: 89, originalPrice: null, image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&q=80', tag: 'Nouveau' },
  { id: 4, name: 'Pull Col Rond', category: 'hauts', price: 59, originalPrice: null, image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&q=80', tag: null },
  // Bas
  { id: 5, name: 'Jean Slim Noir', category: 'bas', price: 79, originalPrice: null, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80', tag: null },
  { id: 6, name: 'Chino Beige', category: 'bas', price: 65, originalPrice: 85, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80', tag: 'Promo' },
  { id: 7, name: 'Short Cargo', category: 'bas', price: 49, originalPrice: null, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=500&q=80', tag: 'Nouveau' },
  { id: 8, name: 'Jogging Premium', category: 'bas', price: 75, originalPrice: null, image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&q=80', tag: null },
  // Couvre-chef
  { id: 9, name: 'Casquette Snapback', category: 'couvre-chef', price: 35, originalPrice: null, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80', tag: null },
  { id: 10, name: 'Bonnet Laine Doux', category: 'couvre-chef', price: 29, originalPrice: null, image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80', tag: 'Nouveau' },
  { id: 11, name: 'Bucket Hat Coton', category: 'couvre-chef', price: 39, originalPrice: 49, image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&q=80', tag: 'Promo' },
  { id: 12, name: 'Chapeau Paille', category: 'couvre-chef', price: 45, originalPrice: null, image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500&q=80', tag: null },
  // Chaussures Homme — Nike Air TN via fournisseur 1
  { id: 13, name: 'Nike Air TN Triple Black', category: 'chaussures-homme', price: 135, originalPrice: null, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', tag: 'Nouveau', source: 'external', orderUrl: 'https://www.airtn.fr/' },
  { id: 14, name: 'Nike Air TN Triple White', category: 'chaussures-homme', price: 135, originalPrice: null, image: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://www.airtn.fr/' },
  { id: 15, name: 'Nike Air TN University Red', category: 'chaussures-homme', price: 140, originalPrice: null, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://www.airtn.fr/' },
  { id: 16, name: 'Nike Air TN Photo Blue', category: 'chaussures-homme', price: 140, originalPrice: null, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://www.airtn.fr/' },
  { id: 17, name: 'Nike Air TN Volt Black', category: 'chaussures-homme', price: 145, originalPrice: null, image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://www.airtn.fr/' },
  { id: 18, name: 'Nike Air TN University Gold', category: 'chaussures-homme', price: 145, originalPrice: null, image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://www.airtn.fr/' },
  // Chaussures Femme — via fournisseur 2
  { id: 19, name: 'Sneaker Plateforme Blanc', category: 'chaussures-femme', price: 125, originalPrice: null, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80', tag: 'Nouveau', source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 20, name: 'Boot Chunky Noir', category: 'chaussures-femme', price: 149, originalPrice: null, image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 21, name: 'Mule Slide Premium', category: 'chaussures-femme', price: 89, originalPrice: 109, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500&q=80', tag: 'Promo', source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 22, name: 'Sneaker Rétro Rose', category: 'chaussures-femme', price: 119, originalPrice: null, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 23, name: 'Talon Bloc Camel', category: 'chaussures-femme', price: 135, originalPrice: null, image: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  // Ceintures — via fournisseur 2
  { id: 24, name: 'Ceinture Cuir Noir', category: 'ceintures', price: 45, originalPrice: null, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 25, name: 'Ceinture Tissée Marron', category: 'ceintures', price: 39, originalPrice: null, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&q=80', tag: 'Nouveau', source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 26, name: 'Ceinture Logo Métal', category: 'ceintures', price: 55, originalPrice: null, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 27, name: 'Ceinture Réversible', category: 'ceintures', price: 49, originalPrice: 65, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&q=80', tag: 'Promo', source: 'external', orderUrl: 'https://hipobuy.com/' },
  // Sous-vêtements Homme — via fournisseur 2
  { id: 28, name: 'Pack 3 Boxers Premium', category: 'sous-vetements-homme', price: 35, originalPrice: null, image: 'https://images.unsplash.com/photo-1589363460779-cd717d02e12b?w=500&q=80', tag: 'Nouveau', source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 29, name: 'Slip Modal Stretch', category: 'sous-vetements-homme', price: 18, originalPrice: null, image: 'https://images.unsplash.com/photo-1611911813383-67769b37a149?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 30, name: 'Boxer Long Coton', category: 'sous-vetements-homme', price: 22, originalPrice: null, image: 'https://images.unsplash.com/photo-1589363460779-cd717d02e12b?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 31, name: 'Pack 5 Slips Essentiels', category: 'sous-vetements-homme', price: 45, originalPrice: 60, image: 'https://images.unsplash.com/photo-1611911813383-67769b37a149?w=500&q=80', tag: 'Promo', source: 'external', orderUrl: 'https://hipobuy.com/' },
  // Sous-vêtements Femme — via fournisseur 2
  { id: 32, name: 'Soutien-gorge Push-Up', category: 'sous-vetements-femme', price: 35, originalPrice: null, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', tag: 'Nouveau', source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 33, name: 'Ensemble Dentelle Noir', category: 'sous-vetements-femme', price: 55, originalPrice: null, image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a66?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 34, name: 'Culotte Taille Haute', category: 'sous-vetements-femme', price: 22, originalPrice: null, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', tag: null, source: 'external', orderUrl: 'https://hipobuy.com/' },
  { id: 35, name: 'Bralette Coton Doux', category: 'sous-vetements-femme', price: 29, originalPrice: 38, image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a66?w=500&q=80', tag: 'Promo', source: 'external', orderUrl: 'https://hipobuy.com/' },
]
