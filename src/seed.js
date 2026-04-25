require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const Product = require('./models/Product');
const Staff = require('./models/Staff');

const products = [
  // ── FEATURED ──
  {
    name: 'Binchotan Wagyu',
    description:
      'A5 wagyu seared over binchotan charcoal, finished with smoked sea salt and charred shallot jus. Served with roasted bone marrow butter.',
    price: 6999,
    image:
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    ingredients: ['A5 Wagyu Beef', 'Smoked Sea Salt', 'Shallots', 'Bone Marrow', 'Black Pepper'],
    category: 'Mains',
  },

  // ── STARTERS ──
  {
    name: 'Heirloom Tomato Tartare',
    description:
      'Marinated heirloom tomatoes, smoked olive oil pearls, basil snow, and sourdough crostini.',
    price: 1499,
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Heirloom Tomatoes', 'Olive Oil', 'Fresh Basil', 'Sourdough', 'Sea Salt'],
    category: 'Starters',
  },
  {
    name: 'Truffle Burrata',
    description:
      'Creamy burrata, black truffle honey, toasted hazelnuts and micro basil on charred focaccia.',
    price: 1849,
    image:
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Burrata Cheese', 'Black Truffle', 'Honey', 'Hazelnuts', 'Focaccia'],
    category: 'Starters',
  },
  {
    name: 'Spicy Tuna Tartare',
    description:
      'Fresh ahi tuna with sriracha aioli, avocado mousse, sesame crisps, and micro shiso.',
    price: 1699,
    image:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Ahi Tuna', 'Sriracha', 'Avocado', 'Sesame Seeds', 'Shiso Leaves'],
    category: 'Starters',
  },
  {
    name: 'French Onion Soup',
    description:
      'Slow-caramelised onion broth gratinéed with Gruyère and thyme croutons. A Parisian classic.',
    price: 1199,
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Onions', 'Gruyère Cheese', 'Beef Broth', 'Thyme', 'Sourdough'],
    category: 'Starters',
  },

  // ── MAINS ──
  {
    name: 'Saffron Tagliatelle',
    description:
      'Hand-rolled saffron pasta, brown butter, confit egg yolk, and shaved Parmigiano 24-month.',
    price: 2349,
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Saffron Pasta', 'Brown Butter', 'Egg Yolk', 'Parmigiano Reggiano', 'Chives'],
    category: 'Mains',
  },
  {
    name: 'Charred Octopus',
    description:
      'Galician octopus over smoked potato purée with chorizo oil and preserved lemon gremolata.',
    price: 2699,
    image:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Galician Octopus', 'Potatoes', 'Chorizo', 'Lemon', 'Parsley', 'Paprika'],
    category: 'Mains',
  },
  {
    name: 'Pan-Seared Salmon',
    description:
      'Atlantic salmon with crispy skin, lemon beurre blanc, roasted asparagus, and dill oil.',
    price: 2499,
    image:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Atlantic Salmon', 'Butter', 'Lemon', 'Asparagus', 'Dill', 'Capers'],
    category: 'Mains',
  },
  {
    name: 'Lamb Rack',
    description:
      'Herb-crusted lamb rack with rosemary jus, pomme purée, and roasted baby carrots.',
    price: 3999,
    image:
      'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Lamb Rack', 'Rosemary', 'Thyme', 'Garlic', 'Potatoes', 'Baby Carrots'],
    category: 'Mains',
  },
  {
    name: 'Mushroom Risotto',
    description:
      'Arborio rice slow-stirred with porcini and shiitake, finished with truffle oil and aged parmesan.',
    price: 1999,
    image:
      'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Arborio Rice', 'Porcini Mushrooms', 'Shiitake', 'Truffle Oil', 'Parmesan'],
    category: 'Mains',
  },
  {
    name: 'Butter Chicken',
    description:
      'Tender tandoori chicken in a velvety tomato-cashew makhani gravy, served with garlic naan.',
    price: 1799,
    image:
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Chicken', 'Tomatoes', 'Cashews', 'Butter', 'Cream', 'Garam Masala', 'Naan'],
    category: 'Mains',
  },
  {
    name: 'Grilled Chicken Caesar',
    description:
      'Chargrilled chicken breast over crisp romaine, house-made caesar dressing, and parmesan shards.',
    price: 1599,
    image:
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Chicken Breast', 'Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
    category: 'Mains',
  },

  // ── DESSERTS ──
  {
    name: 'Dark Chocolate Soufflé',
    description:
      'Valrhona 70% soufflé with salted caramel core and vanilla bean crème anglaise on the side.',
    price: 1349,
    image:
      'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Valrhona Chocolate', 'Eggs', 'Salted Caramel', 'Vanilla Bean', 'Cream'],
    category: 'Desserts',
  },
  {
    name: 'Crème Brûlée',
    description:
      'Classic vanilla custard with a caramelised sugar crust, served with fresh berries.',
    price: 1149,
    image:
      'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Cream', 'Vanilla Bean', 'Egg Yolks', 'Sugar', 'Mixed Berries'],
    category: 'Desserts',
  },
  {
    name: 'Tiramisu',
    description:
      'Espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa powder.',
    price: 1249,
    image:
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Mascarpone', 'Espresso', 'Ladyfingers', 'Cocoa Powder', 'Eggs', 'Sugar'],
    category: 'Desserts',
  },

  // ── DRINKS ──
  {
    name: 'Mango Passion Cooler',
    description:
      'Fresh mango and passion fruit blended with lime, mint, and sparkling water.',
    price: 549,
    image:
      'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Mango', 'Passion Fruit', 'Lime', 'Mint', 'Sparkling Water'],
    category: 'Drinks',
  },
  {
    name: 'Espresso Martini',
    description:
      'Double-shot espresso shaken with vodka, Kahlúa, and vanilla syrup. Served ice-cold.',
    price: 899,
    image:
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    ingredients: ['Espresso', 'Vodka', 'Kahlúa', 'Vanilla Syrup'],
    category: 'Drinks',
  },
];

async function run() {
  try {
    await connectDB(process.env.MONGODB_URI);
    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`[seed] Inserted ${inserted.length} products`);

    // Seed default admin user
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await Staff.create({ username: 'admin', passwordHash });
      console.log('[seed] Created default admin user (admin / admin123)');
    } else {
      console.log('[seed] Staff already exists, skipping admin seed');
    }
  } catch (err) {
    console.error('[seed] Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
