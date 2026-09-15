const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      phone: '0200000000',
      role: 'admin',
    });

    // Create customer user
    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@example.com',
      password: 'customer123',
      phone: '0240000000',
      role: 'customer',
      address: {
        street: '12 Independence Ave',
        city: 'Accra',
        region: 'Greater Accra',
        country: 'Ghana',
      },
    });

    // Sample products
    const products = [
      {
        name: 'Samsung Galaxy A55',
        description: 'Latest Samsung mid-range smartphone with excellent camera and battery life. Imported from South Korea.',
        price: 3200,
        compareAtPrice: 3800,
        category: 'Electronics',
        stock: 25,
        originCountry: 'South Korea',
        importationStatus: 'available',
        customsStatus: 'cleared',
        warehouseLocation: 'Accra Main Warehouse',
        isFeatured: true,
        images: [{ url: 'https://via.placeholder.com/400x400?text=Samsung+A55' }],
        createdBy: admin._id,
      },
      {
        name: 'Nike Air Force 1',
        description: 'Classic white sneakers. Authentic Nike product imported from USA.',
        price: 850,
        compareAtPrice: 1100,
        category: 'Fashion',
        stock: 40,
        originCountry: 'USA',
        importationStatus: 'available',
        customsStatus: 'cleared',
        warehouseLocation: 'Accra Main Warehouse',
        isFeatured: true,
        images: [{ url: 'https://via.placeholder.com/400x400?text=Nike+AF1' }],
        createdBy: admin._id,
      },
      {
        name: 'Apple AirPods Pro 2',
        description: 'Active noise cancellation wireless earbuds. Imported from China/USA.',
        price: 1450,
        category: 'Electronics',
        stock: 15,
        originCountry: 'China',
        importationStatus: 'available',
        customsStatus: 'cleared',
        warehouseLocation: 'Accra Main Warehouse',
        isFeatured: false,
        images: [{ url: 'https://via.placeholder.com/400x400?text=AirPods+Pro' }],
        createdBy: admin._id,
      },
      {
        name: 'Organic Shea Butter 500g',
        description: 'Pure unrefined shea butter from Northern Ghana. Premium quality.',
        price: 45,
        category: 'Beauty',
        stock: 100,
        originCountry: 'Ghana',
        importationStatus: 'available',
        customsStatus: 'cleared',
        warehouseLocation: 'Accra Main Warehouse',
        isFeatured: true,
        images: [{ url: 'https://via.placeholder.com/400x400?text=Shea+Butter' }],
        createdBy: admin._id,
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise cancelling headphones. Imported from Japan.',
        price: 2800,
        compareAtPrice: 3200,
        category: 'Electronics',
        stock: 8,
        originCountry: 'Japan',
        importationStatus: 'available',
        customsStatus: 'cleared',
        warehouseLocation: 'Accra Main Warehouse',
        isFeatured: true,
        images: [{ url: 'https://via.placeholder.com/400x400?text=Sony+XM5' }],
        createdBy: admin._id,
      },
    ];

    await Product.insertMany(products);

    console.log('✅ Data seeded successfully!');
    console.log('Admin: admin@example.com / admin123');
    console.log('Customer: customer@example.com / customer123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
