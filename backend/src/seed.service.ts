import { Injectable } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { MenuService } from './menu/menu.service';
import { BlogService } from './blog/blog.service';

const SEED_PRODUCTS = [
  {
    slug: 'farine-mais-audycook',
    name: { fr: 'Farine de maïs séchée AUDYCOOK', en: 'AUDYCOOK Dried Corn Flour' },
    description: {
      fr: "Préparez une bouillie délicieuse et saine en quelques minutes. Issue de maïs sélectionné, séché au soleil et finement moulu.",
      en: 'Make a delicious, healthy porridge in minutes. Sun-dried, finely ground, hand-selected corn.',
    },
    category: { fr: 'Farine', en: 'Flour' },
    price: 12.0,
    image:
      'https://static.readdy.ai/image/a808dc7181425b7ee1ae1c223286d53e/8cf9a95106fdcbbdbf9fb114f1eea8ed.jpeg',
    badge: 'bestseller',
    in_stock: true,
    sort_order: 1,
  },
  {
    slug: 'eru',
    name: { fr: 'Eru – prêt à consommer', en: 'Eru – ready to eat' },
    description: {
      fr: "Plat traditionnel camerounais à base de feuilles d'eru et waterfufu. Prêt à consommer après réchauffage.",
      en: 'Traditional Cameroonian dish made of eru leaves and waterfufu. Ready to eat after reheating.',
    },
    category: { fr: 'Légumes', en: 'Vegetables' },
    price: 15.0,
    image:
      'https://storage.readdy-site.link/project_files/6be4b7b4-1518-4d9c-a52c-202afa74d196/68f43d85-73a1-4ec0-ad7c-3ce4c709fc42_WhatsApp-Image-2026-03-20-at-22.57.37.jpeg',
    badge: 'new',
    in_stock: true,
    sort_order: 2,
  },
  {
    slug: 'koki',
    name: { fr: 'Koki – prêt à consommer', en: 'Koki – ready to eat' },
    description: {
      fr: 'Gâteau traditionnel camerounais à base de haricots noirs cuit à la vapeur, prêt après réchauffage.',
      en: 'Traditional Cameroonian black-eyed bean cake, steamed and ready after reheating.',
    },
    category: { fr: 'Spécialités', en: 'Specialties' },
    price: 10.0,
    image:
      'https://storage.readdy-site.link/project_files/6be4b7b4-1518-4d9c-a52c-202afa74d196/c2e52480-6960-4de7-9f5b-ba62d81f4220_WhatsApp-Image-2026-03-20-at-22.57.37-2.jpeg',
    badge: 'new',
    in_stock: true,
    sort_order: 3,
  },
  {
    slug: 'ndole-pack',
    name: { fr: 'Ndolé – pack familial', en: 'Ndolé – family pack' },
    description: {
      fr: 'Notre fierté nationale : ndolé aux arachides, viande et crevettes. Recette de grand-mère.',
      en: "Our national pride: ndolé with peanuts, beef and shrimp — grandma's recipe.",
    },
    category: { fr: 'Spécialités', en: 'Specialties' },
    price: 24.0,
    image: 'https://images.unsplash.com/photo-1604740795234-9cb8e03c189b?auto=format&fit=crop&w=1200&q=80',
    badge: null,
    in_stock: true,
    sort_order: 4,
  },
  {
    slug: 'epices-cameroun',
    name: { fr: "Coffret d'épices camerounaises", en: 'Cameroonian Spice Box' },
    description: {
      fr: 'Mbongo, pèbè, njansang, rondelles : 6 épices essentielles pour cuisiner authentique.',
      en: 'Mbongo, pèbè, njansang and more: 6 essential spices for authentic Cameroonian cooking.',
    },
    category: { fr: 'Épices', en: 'Spices' },
    price: 18.5,
    image: 'https://images.unsplash.com/photo-1608237052409-00bed2436ddc?auto=format&fit=crop&w=1200&q=80',
    badge: null,
    in_stock: true,
    sort_order: 5,
  },
  {
    slug: 'miondo',
    name: { fr: 'Miondo – bâtons de manioc', en: 'Miondo – cassava sticks' },
    description: {
      fr: 'Bâtons de manioc fermenté, accompagnement parfait du poisson braisé et du ndolé.',
      en: 'Fermented cassava sticks, the perfect side for grilled fish and ndolé.',
    },
    category: { fr: 'Accompagnement', en: 'Side' },
    price: 8.0,
    image: 'https://images.unsplash.com/photo-1751651054945-882d49cbdbfc?auto=format&fit=crop&w=1200&q=80',
    badge: null,
    in_stock: true,
    sort_order: 6,
  },
];

const SEED_MENU = [
  {
    name: { fr: 'Koki du village', en: 'Village Koki' },
    description: { fr: 'Plat traditionnel à base de haricots noirs', en: 'Traditional black-eyed bean dish' },
    price: 24.99, min_quantity: 5, sort_order: 1,
  },
  {
    name: { fr: 'Ndolé viande & crevettes', en: 'Ndolé with beef & shrimp' },
    description: { fr: 'Plat national camerounais aux arachides', en: "Cameroon's national peanut-leaf dish" },
    price: 29.99, min_quantity: 5, sort_order: 2,
  },
  {
    name: { fr: 'Poulet DG', en: 'Poulet DG' },
    description: { fr: 'Le « Directeur Général » : poulet, plantains, légumes', en: "The 'Director General': chicken, plantains, vegetables" },
    price: 27.99, min_quantity: 5, sort_order: 3,
  },
  {
    name: { fr: 'Poisson braisé (bar) à la camerounaise', en: 'Cameroonian grilled sea bass' },
    description: { fr: 'Poisson grillé aux épices camerounaises', en: 'Whole fish grilled with Cameroonian spices' },
    price: 29.99, min_quantity: 5, sort_order: 4,
  },
  {
    name: { fr: 'Miondos / plantains frits', en: 'Miondos / fried plantains' },
    description: { fr: 'Accompagnement traditionnel', en: 'Traditional side' },
    price: 8.0, min_quantity: 5, sort_order: 5,
  },
];

const SEED_BLOG = [
  {
    slug: 'secrets-ndole-authentique',
    title: { fr: 'Les secrets du Ndolé authentique', en: 'The secrets of authentic Ndolé' },
    excerpt: {
      fr: "Découvrez comment préparer le plat national camerounais avec les bonnes épices et techniques.",
      en: "Learn how to prepare Cameroon's national dish with the right spices and techniques.",
    },
    body: {
      fr: "Le ndolé est bien plus qu'un plat : c'est une mémoire. Originaire du littoral camerounais, il marie l'amertume des feuilles de ndolé blanchies, le moelleux des arachides pilées, la richesse de la viande de bœuf et la délicatesse des crevettes. La clé d'un bon ndolé tient en trois étapes : blanchir longuement les feuilles, piler les arachides à la main, et laisser mijoter à feu doux jusqu'à ce que tous les parfums se marient.",
      en: "Ndolé is more than a dish — it is memory. From Cameroon's coast, it blends bitter ndolé leaves, ground peanuts, rich beef and tender shrimp. A great ndolé comes down to three steps: long blanching, hand-grinding the peanuts, and slow simmering until every flavour weds together.",
    },
    cover_image: 'https://static.readdy.ai/image/a808dc7181425b7ee1ae1c223286d53e/2c98e5970d6cb6bf1ba5180a241cddac.jpeg',
    category: { fr: 'Recettes', en: 'Recipes' },
    read_time: 8,
  },
  {
    slug: 'guide-epices-camerounaises',
    title: { fr: 'Épices camerounaises : guide complet', en: 'Cameroonian spices: complete guide' },
    excerpt: {
      fr: 'Explorez les épices essentielles de la cuisine camerounaise.',
      en: 'Explore the essential spices of Cameroonian cuisine.',
    },
    body: {
      fr: "Le mbongo donne sa couleur sombre et fumée au mbongo tchobi. Le pèbè parfume les sauces brunes. Le njansang lie et nourrit. Voici notre guide pratique pour reconnaître, conserver et cuisiner les épices d'AUDY COOK.",
      en: "Mbongo gives mbongo tchobi its smoky black hue. Pèbè perfumes brown sauces. Njansang binds and enriches. Here is our practical guide to recognizing, storing and cooking with AUDY COOK spices.",
    },
    cover_image: 'https://images.unsplash.com/photo-1608237052409-00bed2436ddc?auto=format&fit=crop&w=1600&q=80',
    category: { fr: 'Conseils', en: 'Tips' },
    read_time: 7,
  },
  {
    slug: 'histoire-poulet-dg',
    title: { fr: 'Histoire du Poulet DG', en: 'The story of Poulet DG' },
    excerpt: {
      fr: "Plongez dans l'histoire fascinante du Poulet Directeur Général.",
      en: "Dive into the fascinating story of Poulet DG, the 'Director General' chicken.",
    },
    body: {
      fr: "Né dans les années 80 dans les grandes villes camerounaises, le Poulet DG s'est imposé comme le plat des occasions. Plantains mûrs sautés, poulet doré, légumes croquants : un festin réservé aux puissants — désormais accessible à tous.",
      en: 'Born in 1980s urban Cameroon, Poulet DG quickly became the celebration dish. Sautéed ripe plantains, golden chicken, crunchy vegetables — a feast once reserved for the powerful, now for everyone.',
    },
    cover_image: 'https://static.readdy.ai/image/a808dc7181425b7ee1ae1c223286d53e/a711199cc53df7263b8c37fe1995e87c.jpeg',
    category: { fr: 'Culture', en: 'Culture' },
    read_time: 5,
  },
];

@Injectable()
export class SeedService {
  constructor(
    private readonly products: ProductsService,
    private readonly menu: MenuService,
    private readonly blog: BlogService,
  ) {}

  async run() {
    await this.products.seedIfMissing(SEED_PRODUCTS);
    await this.menu.seedIfMissing(SEED_MENU);
    await this.blog.seedIfMissing(SEED_BLOG);
    // eslint-disable-next-line no-console
    console.log('[seed] Done.');
  }
}
