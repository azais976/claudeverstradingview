export const categories = [
  { id: 'hauts', label: 'Hauts', description: 'T-shirts, chemises & pulls', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
  { id: 'bas', label: 'Bas', description: 'Pantalons, jeans & shorts', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80' },
  { id: 'couvre-chef', label: 'Couvre-Chef', description: 'Casquettes & bonnets', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80' },
  { id: 'chaussures', label: 'Chaussures', description: 'Sneakers & boots', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
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
  // Chaussures — collection Nike Air TN via airtn.fr
  { id: 13, name: 'Nike Air TN Triple Black', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 14, name: 'Nike Air TN Triple White', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 15, name: 'Nike Air TN University Red', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80&sat=-100&hue=0', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 16, name: 'Nike Air TN Photo Blue', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 17, name: 'Nike Air TN Volt Black', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 18, name: 'Nike Air TN University Gold', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 19, name: 'Nike Air TN Hyper Blue', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 20, name: 'Nike Air TN Persian Violet', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 21, name: 'Nike Air TN Infrared', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 22, name: 'Nike Air TN OG Black/Lime', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 23, name: 'Nike Air TN SE Camo', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
  { id: 24, name: 'Nike Air TN Plus White Red', category: 'chaussures', price: null, originalPrice: null, image: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=500&q=80', tag: 'Airtn.fr', source: 'airtn', orderUrl: 'https://www.airtn.fr/' },
]
