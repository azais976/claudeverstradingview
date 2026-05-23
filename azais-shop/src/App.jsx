import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import Products from './components/Products'
import Banner from './components/Banner'
import Footer from './components/Footer'
import Cart from './components/Cart'
import { CartProvider } from './context/CartContext'
import './App.css'

function ScrollAnimator() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return null
}

export default function App() {
  return (
    <CartProvider>
      <ScrollAnimator />
      <Navbar />
      <Cart />
      <main>
        <Hero />
        <Categories />
        <Products />
        <Banner />
      </main>
      <Footer />
    </CartProvider>
  )
}
