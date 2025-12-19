"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}
const pool = new pg_1.Pool({ connectionString: databaseUrl });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const skills = [
    {
        name: 'HTML Fundamentals',
        description: 'Learn the basics of HTML structure, tags, and semantic markup',
        difficulty: client_1.SkillDifficulty.BEGINNER,
        category: 'Web Development',
    },
    {
        name: 'CSS Styling',
        description: 'Master CSS for styling web pages, layouts, and responsive design',
        difficulty: client_1.SkillDifficulty.BEGINNER,
        category: 'Web Development',
    },
    {
        name: 'JavaScript Basics',
        description: 'Learn JavaScript fundamentals: variables, functions, and control flow',
        difficulty: client_1.SkillDifficulty.BEGINNER,
        category: 'Web Development',
    },
    {
        name: 'React.js',
        description: 'Build interactive user interfaces with React components and hooks',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Web Development',
    },
    {
        name: 'TypeScript',
        description: 'Add type safety to JavaScript applications',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Web Development',
    },
    {
        name: 'Next.js',
        description: 'Build full-stack React applications with server-side rendering',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Web Development',
    },
    {
        name: 'Vue.js',
        description: 'Progressive JavaScript framework for building user interfaces',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Web Development',
    },
    {
        name: 'Advanced React Patterns',
        description: 'Master advanced React patterns, performance optimization, and state management',
        difficulty: client_1.SkillDifficulty.ADVANCED,
        category: 'Web Development',
    },
    {
        name: 'Node.js Fundamentals',
        description: 'Learn server-side JavaScript with Node.js runtime',
        difficulty: client_1.SkillDifficulty.BEGINNER,
        category: 'Backend Development',
    },
    {
        name: 'REST API Design',
        description: 'Design and implement RESTful APIs following best practices',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Backend Development',
    },
    {
        name: 'GraphQL',
        description: 'Build flexible APIs with GraphQL query language',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Backend Development',
    },
    {
        name: 'NestJS Framework',
        description: 'Build scalable server-side applications with NestJS',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Backend Development',
    },
    {
        name: 'Express.js',
        description: 'Fast, unopinionated web framework for Node.js',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Backend Development',
    },
    {
        name: 'Microservices Architecture',
        description: 'Design and implement distributed microservices systems',
        difficulty: client_1.SkillDifficulty.ADVANCED,
        category: 'Backend Development',
    },
    {
        name: 'SQL Fundamentals',
        description: 'Learn SQL queries, joins, and database operations',
        difficulty: client_1.SkillDifficulty.BEGINNER,
        category: 'Database',
    },
    {
        name: 'PostgreSQL',
        description: 'Master PostgreSQL relational database management',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Database',
    },
    {
        name: 'Database Design',
        description: 'Design efficient database schemas and relationships',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Database',
    },
    {
        name: 'MongoDB',
        description: 'Work with NoSQL databases and document storage',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Database',
    },
    {
        name: 'Database Optimization',
        description: 'Optimize database performance, indexing, and query tuning',
        difficulty: client_1.SkillDifficulty.ADVANCED,
        category: 'Database',
    },
    {
        name: 'Python Basics',
        description: 'Learn Python programming fundamentals',
        difficulty: client_1.SkillDifficulty.BEGINNER,
        category: 'Data Science',
    },
    {
        name: 'Pandas',
        description: 'Data manipulation and analysis with Pandas library',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Data Science',
    },
    {
        name: 'NumPy',
        description: 'Numerical computing with NumPy arrays and operations',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Data Science',
    },
    {
        name: 'Data Visualization',
        description: 'Create visualizations with Matplotlib, Seaborn, and Plotly',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Data Science',
    },
    {
        name: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning algorithms and concepts',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Data Science',
    },
    {
        name: 'Deep Learning',
        description: 'Build neural networks with TensorFlow and PyTorch',
        difficulty: client_1.SkillDifficulty.ADVANCED,
        category: 'Data Science',
    },
    {
        name: 'Natural Language Processing',
        description: 'Process and analyze text data with NLP techniques',
        difficulty: client_1.SkillDifficulty.ADVANCED,
        category: 'Data Science',
    },
    {
        name: 'React Native',
        description: 'Build cross-platform mobile apps with React Native',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Mobile Development',
    },
    {
        name: 'Flutter',
        description: 'Create native mobile apps with Flutter and Dart',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Mobile Development',
    },
    {
        name: 'iOS Development (Swift)',
        description: 'Build iOS applications using Swift and Xcode',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Mobile Development',
    },
    {
        name: 'Android Development (Kotlin)',
        description: 'Develop Android apps with Kotlin and Android Studio',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Mobile Development',
    },
    {
        name: 'Git & Version Control',
        description: 'Master Git workflows, branching, and collaboration',
        difficulty: client_1.SkillDifficulty.BEGINNER,
        category: 'DevOps',
    },
    {
        name: 'Docker',
        description: 'Containerize applications with Docker',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'DevOps',
    },
    {
        name: 'Kubernetes',
        description: 'Orchestrate containers with Kubernetes',
        difficulty: client_1.SkillDifficulty.ADVANCED,
        category: 'DevOps',
    },
    {
        name: 'CI/CD Pipelines',
        description: 'Automate testing and deployment with CI/CD',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'DevOps',
    },
    {
        name: 'AWS Cloud Services',
        description: 'Deploy and manage applications on AWS',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'DevOps',
    },
    {
        name: 'Linux System Administration',
        description: 'Manage Linux servers and system configurations',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'DevOps',
    },
    {
        name: 'Object-Oriented Programming',
        description: 'Master OOP principles: classes, inheritance, and polymorphism',
        difficulty: client_1.SkillDifficulty.BEGINNER,
        category: 'Software Engineering',
    },
    {
        name: 'Design Patterns',
        description: 'Learn common software design patterns and best practices',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Software Engineering',
    },
    {
        name: 'Test-Driven Development',
        description: 'Write tests first and develop code using TDD methodology',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Software Engineering',
    },
    {
        name: 'System Design',
        description: 'Design scalable and distributed systems',
        difficulty: client_1.SkillDifficulty.ADVANCED,
        category: 'Software Engineering',
    },
    {
        name: 'Code Review & Best Practices',
        description: 'Learn code review techniques and maintainable code practices',
        difficulty: client_1.SkillDifficulty.INTERMEDIATE,
        category: 'Software Engineering',
    },
];
async function main() {
    console.log('🌱 Starting seed...');
    const createdSkills = [];
    for (const skill of skills) {
        try {
            const created = await prisma.skill.upsert({
                where: { name: skill.name },
                update: {
                    description: skill.description,
                    difficulty: skill.difficulty,
                    category: skill.category,
                },
                create: skill,
            });
            createdSkills.push(created);
            console.log(`✅ Created/Updated: ${skill.name}`);
        }
        catch (error) {
            console.error(`❌ Error creating ${skill.name}:`, error);
        }
    }
    const htmlSkill = createdSkills.find((s) => s.name === 'HTML Fundamentals');
    const cssSkill = createdSkills.find((s) => s.name === 'CSS Styling');
    const jsSkill = createdSkills.find((s) => s.name === 'JavaScript Basics');
    const reactSkill = createdSkills.find((s) => s.name === 'React.js');
    const nodeSkill = createdSkills.find((s) => s.name === 'Node.js Fundamentals');
    const pythonSkill = createdSkills.find((s) => s.name === 'Python Basics');
    const pandasSkill = createdSkills.find((s) => s.name === 'Pandas');
    const numpySkill = createdSkills.find((s) => s.name === 'NumPy');
    const mlSkill = createdSkills.find((s) => s.name === 'Machine Learning Fundamentals');
    const gitSkill = createdSkills.find((s) => s.name === 'Git & Version Control');
    const dockerSkill = createdSkills.find((s) => s.name === 'Docker');
    const prerequisites = [];
    if (htmlSkill && cssSkill && jsSkill) {
        prerequisites.push({ skillId: jsSkill.id, prerequisiteId: htmlSkill.id }, { skillId: jsSkill.id, prerequisiteId: cssSkill.id });
    }
    if (jsSkill && reactSkill) {
        prerequisites.push({ skillId: reactSkill.id, prerequisiteId: jsSkill.id });
    }
    if (jsSkill && nodeSkill) {
        prerequisites.push({ skillId: nodeSkill.id, prerequisiteId: jsSkill.id });
    }
    if (pythonSkill && pandasSkill) {
        prerequisites.push({
            skillId: pandasSkill.id,
            prerequisiteId: pythonSkill.id,
        });
    }
    if (pythonSkill && numpySkill) {
        prerequisites.push({
            skillId: numpySkill.id,
            prerequisiteId: pythonSkill.id,
        });
    }
    if (pythonSkill && pandasSkill && numpySkill && mlSkill) {
        prerequisites.push({ skillId: mlSkill.id, prerequisiteId: pythonSkill.id }, { skillId: mlSkill.id, prerequisiteId: pandasSkill.id }, { skillId: mlSkill.id, prerequisiteId: numpySkill.id });
    }
    if (gitSkill && dockerSkill) {
        prerequisites.push({
            skillId: dockerSkill.id,
            prerequisiteId: gitSkill.id,
        });
    }
    for (const prereq of prerequisites) {
        try {
            await prisma.skillPrerequisite.upsert({
                where: {
                    skillId_prerequisiteId: {
                        skillId: prereq.skillId,
                        prerequisiteId: prereq.prerequisiteId,
                    },
                },
                update: {},
                create: prereq,
            });
            const skill = createdSkills.find((s) => s.id === prereq.skillId);
            const prereqSkill = createdSkills.find((s) => s.id === prereq.prerequisiteId);
            console.log(`🔗 Linked: ${prereqSkill?.name} → ${skill?.name}`);
        }
        catch (error) {
            console.error(`❌ Error creating prerequisite:`, error);
        }
    }
    console.log(`\n✨ Seed completed! Created/Updated ${createdSkills.length} skills`);
    console.log(`🔗 Created ${prerequisites.length} prerequisite relationships`);
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map