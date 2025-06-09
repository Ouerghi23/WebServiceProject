const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Base de données en mémoire
const database = {
  freelances: new Map(),
  skills: new Map(),
  freelanceSkills: new Map(),
  professionalLinks: new Map()
};

// Données d'exemple
const initializeData = () => {
  // Compétences par défaut
  const skills = [
    { id: '1', name: 'JavaScript', category: 'TECHNICAL', description: 'Langage de programmation web' },
    { id: '2', name: 'React', category: 'TECHNICAL', description: 'Bibliothèque JavaScript pour interfaces' },
    { id: '3', name: 'Node.js', category: 'TECHNICAL', description: 'Runtime JavaScript côté serveur' },
    { id: '4', name: 'Design Graphique', category: 'CREATIVE', description: 'Création visuelle et artistique' },
    { id: '5', name: 'Marketing Digital', category: 'BUSINESS', description: 'Stratégies marketing en ligne' },
    { id: '6', name: 'Anglais', category: 'LANGUAGE', description: 'Langue anglaise' }
  ];

  skills.forEach(skill => database.skills.set(skill.id, skill));

  // Freelances d'exemple
  const freelance1 = {
    id: '1',
    firstName: 'Ouerghi',
    lastName: 'Chaima',
    email: 'ouerghi@email.com',
    phone: '+93176660',
    title: 'Développeuse Full Stack',
    description: 'Développeuse passionnée avec 5 ans d\'expérience en JavaScript et React.',
    location: 'Paris, France',
    availability: 'AVAILABLE',
    hourlyRate: 60.0,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  };

  const freelance2 = {
    id: '2',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    email: 'ahmed.benali@email.com',
    phone: '+216123456789',
    title: 'Designer UX/UI',
    description: 'Designer créatif spécialisé en expérience utilisateur.',
    location: 'Tunis, Tunisie',
    availability: 'BUSY',
    hourlyRate: 45.0,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
  };

  database.freelances.set(freelance1.id, freelance1);
  database.freelances.set(freelance2.id, freelance2);

  // Relations freelance-compétences
  database.freelanceSkills.set('1-1', { freelanceId: '1', skillId: '1', level: 'EXPERT', yearsOfExperience: 5 });
  database.freelanceSkills.set('1-2', { freelanceId: '1', skillId: '2', level: 'ADVANCED', yearsOfExperience: 3 });
  database.freelanceSkills.set('1-3', { freelanceId: '1', skillId: '3', level: 'INTERMEDIATE', yearsOfExperience: 2 });
  database.freelanceSkills.set('2-4', { freelanceId: '2', skillId: '4', level: 'EXPERT', yearsOfExperience: 6 });
  database.freelanceSkills.set('2-6', { freelanceId: '2', skillId: '6', level: 'ADVANCED', yearsOfExperience: 4 });

  // Liens professionnels
  database.professionalLinks.set('1', { 
    id: '1', 
    freelanceId: '1', 
    platform: 'GITHUB', 
    url: 'https://github.com/Ouerghi23', 
    title: 'Portfolio GitHub' 
  });
  database.professionalLinks.set('2', { 
    id: '2', 
    freelanceId: '1', 
    platform: 'LINKEDIN', 
    url: 'https://github.com/Ouerghi23', 
    title: 'Profil LinkedIn' 
  });
  database.professionalLinks.set('3', { 
    id: '3', 
    freelanceId: '2', 
    platform: 'BEHANCE', 
    url: 'https://behance.net/ahmedbenali', 
    title: 'Portfolio Behance' 
  });
};

// Définition du schéma GraphQL
const typeDefs = `
  enum Availability {
    AVAILABLE
    BUSY
    NOT_AVAILABLE
  }

  enum SkillCategory {
    TECHNICAL
    CREATIVE
    BUSINESS
    LANGUAGE
    OTHER
  }

  enum SkillLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
    EXPERT
  }

  enum Platform {
    LINKEDIN
    GITHUB
    PORTFOLIO
    BEHANCE
    DRIBBBLE
    TWITTER
    INSTAGRAM
    OTHER
  }

  type Freelance {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    title: String!
    description: String
    location: String
    availability: Availability!
    hourlyRate: Float
    createdAt: String!
    updatedAt: String!
    fullName: String!
    isAvailable: Boolean!
    skills: [FreelanceSkill!]!
    professionalLinks: [ProfessionalLink!]!
  }

  type Skill {
    id: ID!
    name: String!
    category: SkillCategory!
    description: String
    freelances: [FreelanceSkill!]!
  }

  type FreelanceSkill {
    freelanceId: ID!
    skillId: ID!
    level: SkillLevel!
    yearsOfExperience: Int
    freelance: Freelance!
    skill: Skill!
  }

  type ProfessionalLink {
    id: ID!
    freelanceId: ID!
    platform: Platform!
    url: String!
    title: String
    freelance: Freelance!
  }

  input CreateFreelanceInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    title: String!
    description: String
    location: String
    availability: Availability = AVAILABLE
    hourlyRate: Float
  }

  input UpdateFreelanceInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    title: String
    description: String
    location: String
    availability: Availability
    hourlyRate: Float
  }

  input CreateSkillInput {
    name: String!
    category: SkillCategory!
    description: String
  }

  input AddSkillToFreelanceInput {
    freelanceId: ID!
    skillId: ID!
    level: SkillLevel!
    yearsOfExperience: Int
  }

  input CreateProfessionalLinkInput {
    freelanceId: ID!
    platform: Platform!
    url: String!
    title: String
  }

  input FreelanceFilter {
    skills: [String!]
    availability: Availability
    location: String
    minHourlyRate: Float
    maxHourlyRate: Float
  }

  type Query {
    freelance(id: ID!): Freelance
    freelances(filter: FreelanceFilter, limit: Int = 10, offset: Int = 0): [Freelance!]!
    searchFreelances(query: String!): [Freelance!]!
    skill(id: ID!): Skill
    skills(category: SkillCategory): [Skill!]!
    freelanceCount: Int!
    skillCount: Int!
    availableFreelancesCount: Int!
  }

  type Mutation {
    createFreelance(input: CreateFreelanceInput!): Freelance!
    updateFreelance(id: ID!, input: UpdateFreelanceInput!): Freelance!
    deleteFreelance(id: ID!): Boolean!
    createSkill(input: CreateSkillInput!): Skill!
    addSkillToFreelance(input: AddSkillToFreelanceInput!): FreelanceSkill!
    removeSkillFromFreelance(freelanceId: ID!, skillId: ID!): Boolean!
    createProfessionalLink(input: CreateProfessionalLinkInput!): ProfessionalLink!
    deleteProfessionalLink(id: ID!): Boolean!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    freelance: (_, { id }) => database.freelances.get(id),
    
    freelances: (_, { filter = {}, limit = 10, offset = 0 }) => {
      let results = Array.from(database.freelances.values());
      
      // Appliquer les filtres
      if (filter.availability) {
        results = results.filter(f => f.availability === filter.availability);
      }
      if (filter.location) {
        results = results.filter(f => f.location && f.location.toLowerCase().includes(filter.location.toLowerCase()));
      }
      if (filter.minHourlyRate) {
        results = results.filter(f => f.hourlyRate && f.hourlyRate >= filter.minHourlyRate);
      }
      if (filter.maxHourlyRate) {
        results = results.filter(f => f.hourlyRate && f.hourlyRate <= filter.maxHourlyRate);
      }
      if (filter.skills && filter.skills.length > 0) {
        results = results.filter(freelance => {
          const freelanceSkills = Array.from(database.freelanceSkills.values())
            .filter(fs => fs.freelanceId === freelance.id)
            .map(fs => database.skills.get(fs.skillId)?.name?.toLowerCase());
          return filter.skills.some(skill => 
            freelanceSkills.includes(skill.toLowerCase())
          );
        });
      }
      
      return results.slice(offset, offset + limit);
    },
    
    searchFreelances: (_, { query }) => {
      const lowerQuery = query.toLowerCase();
      return Array.from(database.freelances.values()).filter(freelance => 
        freelance.firstName.toLowerCase().includes(lowerQuery) ||
        freelance.lastName.toLowerCase().includes(lowerQuery) ||
        freelance.title.toLowerCase().includes(lowerQuery) ||
        (freelance.description && freelance.description.toLowerCase().includes(lowerQuery))
      );
    },
    
    skill: (_, { id }) => database.skills.get(id),
    
    skills: (_, { category }) => {
      const skills = Array.from(database.skills.values());
      return category ? skills.filter(s => s.category === category) : skills;
    },
    
    freelanceCount: () => database.freelances.size,
    skillCount: () => database.skills.size,
    availableFreelancesCount: () => Array.from(database.freelances.values())
      .filter(f => f.availability === 'AVAILABLE').length
  },

  Mutation: {
    createFreelance: (_, { input }) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      const freelance = {
        id,
        ...input,
        createdAt: now,
        updatedAt: now
      };
      database.freelances.set(id, freelance);
      return freelance;
    },

    updateFreelance: (_, { id, input }) => {
      const freelance = database.freelances.get(id);
      if (!freelance) throw new Error('Freelance not found');
      
      const updated = {
        ...freelance,
        ...input,
        updatedAt: new Date().toISOString()
      };
      database.freelances.set(id, updated);
      return updated;
    },

    deleteFreelance: (_, { id }) => {
      const deleted = database.freelances.delete(id);
      // Supprimer les relations
      Array.from(database.freelanceSkills.keys())
        .filter(key => key.startsWith(id + '-'))
        .forEach(key => database.freelanceSkills.delete(key));
      Array.from(database.professionalLinks.values())
        .filter(link => link.freelanceId === id)
        .forEach(link => database.professionalLinks.delete(link.id));
      return deleted;
    },

    createSkill: (_, { input }) => {
      const id = uuidv4();
      const skill = { id, ...input };
      database.skills.set(id, skill);
      return skill;
    },

    addSkillToFreelance: (_, { input }) => {
      const key = `${input.freelanceId}-${input.skillId}`;
      const freelanceSkill = { ...input };
      database.freelanceSkills.set(key, freelanceSkill);
      return freelanceSkill;
    },

    removeSkillFromFreelance: (_, { freelanceId, skillId }) => {
      const key = `${freelanceId}-${skillId}`;
      return database.freelanceSkills.delete(key);
    },

    createProfessionalLink: (_, { input }) => {
      const id = uuidv4();
      const link = { id, ...input };
      database.professionalLinks.set(id, link);
      return link;
    },

    deleteProfessionalLink: (_, { id }) => {
      return database.professionalLinks.delete(id);
    }
  },

  // Resolvers pour les champs calculés et relations
  Freelance: {
    fullName: (freelance) => `${freelance.firstName} ${freelance.lastName}`,
    isAvailable: (freelance) => freelance.availability === 'AVAILABLE',
    
    skills: (freelance) => {
      return Array.from(database.freelanceSkills.values())
        .filter(fs => fs.freelanceId === freelance.id);
    },
    
    professionalLinks: (freelance) => {
      return Array.from(database.professionalLinks.values())
        .filter(link => link.freelanceId === freelance.id);
    }
  },

  FreelanceSkill: {
    freelance: (freelanceSkill) => database.freelances.get(freelanceSkill.freelanceId),
    skill: (freelanceSkill) => database.skills.get(freelanceSkill.skillId)
  },

  ProfessionalLink: {
    freelance: (link) => database.freelances.get(link.freelanceId)
  },

  Skill: {
    freelances: (skill) => {
      return Array.from(database.freelanceSkills.values())
        .filter(fs => fs.skillId === skill.id);
    }
  }
};

// Configuration du serveur
const startServer = async () => {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  
  // Initialiser les données d'exemple
  initializeData();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📊 Playground GraphQL disponible sur http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`\n📈 Statistiques initiales:`);
    console.log(`   - Freelances: ${database.freelances.size}`);
    console.log(`   - Compétences: ${database.skills.size}`);
    console.log(`   - Relations freelance-compétences: ${database.freelanceSkills.size}`);
    console.log(`   - Liens professionnels: ${database.professionalLinks.size}`);
  });
};

// Démarrer le serveur
startServer().catch(error => {
  console.error('Erreur lors du démarrage du serveur:', error);
});

module.exports = { startServer, database };