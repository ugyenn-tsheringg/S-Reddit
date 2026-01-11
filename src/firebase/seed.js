// Seed Database Script for S Reddit
// Run this once to populate Firestore with initial mock data

import {
    collection,
    addDoc,
    getDocs,
    writeBatch,
    doc,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Mock Hubs Data
const hubsData = [
    {
        name: 'Graduate Studies',
        icon: '🎓',
        members: 12400,
        description: 'Discussions about Masters and PhD opportunities worldwide',
        createdAt: serverTimestamp()
    },
    {
        name: 'Undergraduate',
        icon: '📚',
        members: 8900,
        description: 'Bachelor degree scholarships, tips, and application help',
        createdAt: serverTimestamp()
    },
    {
        name: 'STEM Majors',
        icon: '🔬',
        members: 6700,
        description: 'Science, Technology, Engineering, and Math scholarships',
        createdAt: serverTimestamp()
    },
    {
        name: 'Essay Tips',
        icon: '✍️',
        members: 5200,
        description: 'SOP, personal statements, and essay writing help',
        createdAt: serverTimestamp()
    },
    {
        name: 'Success Stories',
        icon: '🏆',
        members: 4800,
        description: 'Share and celebrate scholarship wins from the community',
        createdAt: serverTimestamp()
    },
    {
        name: 'Women in Education',
        icon: '👩‍🎓',
        members: 3900,
        description: 'Scholarships and opportunities for women and female students',
        createdAt: serverTimestamp()
    },
    {
        name: 'First Generation',
        icon: '🌟',
        members: 3200,
        description: 'Support and resources for first-gen college students',
        createdAt: serverTimestamp()
    },
    {
        name: 'Resources',
        icon: '📁',
        members: 7600,
        description: 'Databases, tools, guides, and helpful links for applicants',
        createdAt: serverTimestamp()
    }
];

// Helper to create date relative to now
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return Timestamp.fromDate(date);
};

const daysFromNow = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return Timestamp.fromDate(date);
};

const hoursAgo = (hours) => {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return Timestamp.fromDate(date);
};

// Mock Posts Data
const postsData = [
    {
        type: 'scholarship',
        title: 'Fulbright Foreign Student Program 2026-2027 - Full Funding Available',
        content: 'The Fulbright Program is the flagship international educational exchange program sponsored by the U.S. government. It provides funding for graduate studies, research, and teaching assistantships.\n\nBenefits include:\n• Full tuition coverage\n• Monthly living stipend\n• Round-trip airfare\n• Health insurance\n• Pre-departure orientation\n\nThis is an incredible opportunity for those looking to pursue graduate education in the United States. The program emphasizes cultural exchange and mutual understanding between nations.',
        hub: 'Graduate Studies',
        author: 'Anonymous',
        authorId: 'anon_seed_1',
        votes: 342,
        comments: 48,
        tags: ['Full Ride', 'STEM', 'Graduate', 'USA'],
        createdAt: hoursAgo(2),
        scholarship: {
            country: 'United States',
            degree: 'Masters/PhD',
            deadline: daysFromNow(35),
            provider: 'U.S. Department of State',
            eligibility: 'International students with Bachelor\'s degree',
            url: 'https://foreign.fulbrightonline.org/'
        }
    },
    {
        type: 'question',
        title: 'How do I write a compelling Statement of Purpose for competitive scholarships?',
        content: 'I\'m applying to several fully-funded master\'s programs and struggling with my SOP. What makes a statement stand out? Should I focus more on academic achievements or personal story?\n\nI have:\n- 3.7 GPA\n- 2 years work experience\n- Some volunteer work\n\nAny tips from those who successfully got scholarships would be greatly appreciated!',
        hub: 'Essay Tips',
        author: 'ScholarSeeker23',
        authorId: 'user_seed_23',
        isPseudonymous: true,
        votes: 156,
        comments: 32,
        tags: ['Question', 'SOP', 'Tips'],
        createdAt: hoursAgo(5),
        isUnanswered: false
    },
    {
        type: 'experience',
        title: 'I got accepted to Chevening! Here\'s my complete timeline and tips',
        content: 'After 3 years of applying, I finally received my Chevening acceptance! Let me share my journey, including rejection learnings and what I changed in my final application.\n\n**Timeline:**\n- August 2025: Application submitted\n- November 2025: Shortlisted for interview\n- January 2026: Interview in local British Embassy\n- March 2026: Conditional offer received!\n\n**What worked for me:**\n1. Genuine leadership examples (not just positions)\n2. Clear UK university choices with reasons\n3. Specific networking plans\n4. Strong recommendation letters\n\nAMA in the comments!',
        hub: 'Success Stories',
        author: 'Anonymous',
        authorId: 'anon_seed_3',
        votes: 523,
        comments: 89,
        tags: ['Chevening', 'UK', 'Success Story', 'Experience'],
        createdAt: hoursAgo(8)
    },
    {
        type: 'scholarship',
        title: 'DAAD Scholarships 2026 - Study in Germany for Free',
        content: 'The German Academic Exchange Service (DAAD) offers various scholarship programs for international students to pursue their studies in Germany.\n\n**Available Programs:**\n- Study Scholarships for Graduates\n- Research Grants for Doctoral Candidates\n- Research Stays for University Academics\n\n**Benefits:**\n- Monthly payments of €934 to €1,400\n- Travel allowance\n- Health insurance\n- German language course funding\n\nGermany has no tuition fees at public universities, making this an even better deal!',
        hub: 'Graduate Studies',
        author: 'Anonymous',
        authorId: 'anon_seed_4',
        votes: 278,
        comments: 34,
        tags: ['STEM', 'Europe', 'Full Ride', 'Germany'],
        createdAt: hoursAgo(12),
        scholarship: {
            country: 'Germany',
            degree: 'Masters/PhD',
            deadline: daysFromNow(49),
            provider: 'DAAD - German Academic Exchange Service',
            eligibility: 'All international students with completed Bachelor\'s',
            url: 'https://www.daad.de/en/'
        }
    },
    {
        type: 'discussion',
        title: 'Resources for Finding Lesser-Known Fully Funded Scholarships',
        content: 'Let\'s compile a list of underrated scholarship databases and resources. I\'ll start:\n\n**Databases:**\n- ScholarshipOwl\n- Fastweb\n- Scholarship Portal (Europe)\n- Study in Europe portal\n\n**Lesser-known sources:**\n- Local embassy education offices\n- Professional associations in your field\n- University-specific scholarships (not listed publicly)\n- Corporate sponsorship programs\n\nPlease add your favorites in the comments!',
        hub: 'Resources',
        author: 'GradHunter',
        authorId: 'user_seed_47',
        isPseudonymous: true,
        votes: 198,
        comments: 67,
        tags: ['Resources', 'Database', 'Discussion'],
        createdAt: daysAgo(1)
    },
    {
        type: 'question',
        title: 'First-generation college student - which scholarships prioritize our background?',
        content: 'I\'m the first in my family to attend university. Are there scholarships that specifically look for first-gen students? Would appreciate any recommendations.\n\nI\'m interested in:\n- Computer Science\n- Business Administration\n- Any STEM field\n\nCurrently in my final year of high school with a 3.8 GPA.',
        hub: 'First Generation',
        author: 'Anonymous',
        authorId: 'anon_seed_6',
        votes: 89,
        comments: 0,
        tags: ['First-Gen', 'Question', 'Undergraduate'],
        createdAt: hoursAgo(3),
        isUnanswered: true
    },
    {
        type: 'scholarship',
        title: 'Gates Cambridge Scholarship 2026 - University of Cambridge',
        content: 'Full-cost scholarship covering tuition, living expenses, and travel for outstanding applicants from outside the UK to pursue a postgraduate degree at Cambridge.\n\n**Covers:**\n- University fees\n- Maintenance allowance (£21,000/year)\n- One return flight\n- Visa costs\n- Immigration health surcharge\n\n**Selection criteria:**\n1. Outstanding intellectual ability\n2. Leadership potential\n3. Commitment to improving lives of others\n4. Good fit with Cambridge\n\nThis is one of the most prestigious scholarships globally!',
        hub: 'Graduate Studies',
        author: 'Anonymous',
        authorId: 'anon_seed_7',
        votes: 412,
        comments: 56,
        tags: ['Full Ride', 'UK', 'Graduate', 'Cambridge'],
        createdAt: hoursAgo(6),
        scholarship: {
            country: 'United Kingdom',
            degree: 'Masters/PhD',
            deadline: daysFromNow(9),
            provider: 'Gates Cambridge Trust',
            eligibility: 'Non-UK citizens with outstanding academic record',
            url: 'https://www.gatescambridge.org/'
        }
    },
    {
        type: 'scholarship',
        title: 'Erasmus Mundus Joint Master Degrees 2026 - Study in Multiple EU Countries',
        content: 'Erasmus Mundus offers fully-funded master\'s programs taught across multiple European universities.\n\n**Unique features:**\n- Study in 2-3 different European countries\n- Get a joint/double/multiple degree\n- Full scholarship for non-EU students\n\n**Coverage:**\n- Tuition fees\n- €1,400/month living costs\n- Travel allowance\n- Installation costs\n\nOver 100 different master\'s programs available across all fields!',
        hub: 'Graduate Studies',
        author: 'EuroScholar',
        authorId: 'user_seed_89',
        isPseudonymous: true,
        votes: 234,
        comments: 42,
        tags: ['Full Ride', 'Europe', 'Masters', 'Erasmus'],
        createdAt: hoursAgo(10),
        scholarship: {
            country: 'Multiple EU Countries',
            degree: 'Masters',
            deadline: daysFromNow(20),
            provider: 'European Commission',
            eligibility: 'All international students',
            url: 'https://erasmus-plus.ec.europa.eu/'
        }
    },
    {
        type: 'experience',
        title: 'Rejected 5 times, finally got the DAAD scholarship - lessons learned',
        content: 'My journey to the DAAD scholarship was not straightforward. Here\'s what I learned from 5 rejections:\n\n**Year 1-2: Generic applications**\n- Copy-pasted motivation letters\n- Didn\'t research universities properly\n- Result: Immediate rejections\n\n**Year 3-4: Better but not there**\n- Personalized letters but weak connections\n- Good grades but no extra-curriculars\n- Result: Waitlisted then rejected\n\n**Year 5: Finally got it!**\n- Connected my research interests with specific professors\n- Showed German language commitment (B1 level)\n- Had pre-admission from the university\n- Strong professional references\n\nDon\'t give up! Each rejection teaches you something.',
        hub: 'Success Stories',
        author: 'Anonymous',
        authorId: 'anon_seed_12',
        votes: 387,
        comments: 71,
        tags: ['DAAD', 'Germany', 'Experience', 'Motivation'],
        createdAt: daysAgo(2)
    },
    {
        type: 'discussion',
        title: 'Best countries for fully-funded PhD programs in 2026?',
        content: 'I\'m researching PhD opportunities and want to understand which countries offer the best funding packages.\n\nFrom my research so far:\n\n**Fully-funded by default:**\n- Germany (no tuition + stipend)\n- Norway, Sweden, Finland (employed as researchers)\n- Switzerland (very high stipends)\n\n**Strong funding available:**\n- USA (but competitive)\n- UK (for select programs)\n- Canada\n- Australia\n\nWhat are your experiences? Which countries should I prioritize?',
        hub: 'Graduate Studies',
        author: 'PhDHopeful',
        authorId: 'user_seed_33',
        isPseudonymous: true,
        votes: 145,
        comments: 38,
        tags: ['PhD', 'Discussion', 'Funding'],
        createdAt: hoursAgo(18)
    },
    {
        type: 'question',
        title: 'How important is GRE for international scholarships in 2026?',
        content: 'I\'ve noticed many programs made GRE optional during COVID. Is it still worth taking?\n\nMy situation:\n- Applying to US and European programs\n- Strong academic background (3.9 GPA)\n- Limited budget for test fees\n\nSpecifically wondering about:\n1. Fulbright requirements\n2. Top US universities\n3. European programs\n\nThanks for any insights!',
        hub: 'Graduate Studies',
        author: 'Anonymous',
        authorId: 'anon_seed_15',
        votes: 112,
        comments: 28,
        tags: ['GRE', 'Question', 'USA', 'Europe'],
        createdAt: hoursAgo(7),
        isUnanswered: false
    },
    {
        type: 'scholarship',
        title: 'Australian Awards Scholarships 2026 - Full Funding for Developing Countries',
        content: 'The Australian Government provides scholarships for students from developing countries to undertake full-time undergraduate or postgraduate study in Australia.\n\n**Benefits:**\n- Full tuition fees\n- Return air travel\n- Establishment allowance\n- Living expenses (around AUD 3,500/month)\n- Health insurance\n\n**Eligibility:**\n- Citizens of participating countries\n- Not hold Australian citizenship\n- Meet academic requirements\n\nExcellent opportunity for developing country nationals!',
        hub: 'Graduate Studies',
        author: 'AussieScholar',
        authorId: 'user_seed_55',
        isPseudonymous: true,
        votes: 189,
        comments: 31,
        tags: ['Full Ride', 'Australia', 'Government'],
        createdAt: daysAgo(3),
        scholarship: {
            country: 'Australia',
            degree: 'Bachelors/Masters/PhD',
            deadline: daysFromNow(60),
            provider: 'Australian Government DFAT',
            eligibility: 'Citizens of participating developing countries',
            url: 'https://www.dfat.gov.au/people-to-people/australia-awards'
        }
    }
];

// Mock Comments Data
const commentsData = [
    {
        postIndex: 0, // Fulbright post
        author: 'ScholarMentor',
        authorId: 'user_comment_1',
        content: 'Great opportunity! I applied to this program last year and got accepted. The key is to have a strong research proposal that aligns with U.S. national interests.',
        votes: 45,
        createdAt: hoursAgo(1),
        replies: [
            {
                author: 'Anonymous',
                authorId: 'anon_comment_1',
                content: 'Could you share more about your research proposal? I\'m struggling with mine and would love some guidance.',
                votes: 12,
                createdAt: hoursAgo(0.5)
            }
        ]
    },
    {
        postIndex: 0,
        author: 'Anonymous',
        authorId: 'anon_comment_2',
        content: 'The deadline is coming up fast! Make sure you have all your documents ready at least 2 weeks in advance.',
        votes: 23,
        createdAt: hoursAgo(1.5)
    },
    {
        postIndex: 1, // SOP question
        author: 'AdmissionsExpert',
        authorId: 'user_comment_2',
        content: 'Balance is key! Start with a hook that shows your passion, then weave in achievements that demonstrate capability. End with clear goals tied to the program.\n\nAvoid:\n- Generic statements\n- Listing achievements without context\n- Being too humble or too boastful',
        votes: 67,
        createdAt: hoursAgo(4)
    },
    {
        postIndex: 2, // Chevening success
        author: 'FutureChevener',
        authorId: 'user_comment_3',
        content: 'Congratulations! This is so inspiring. Could you elaborate on how you prepared for the interview? What questions did they ask?',
        votes: 34,
        createdAt: hoursAgo(7)
    }
];

// Seed the database
export const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Check if data already exists
        const hubsSnapshot = await getDocs(collection(db, 'hubs'));
        if (!hubsSnapshot.empty) {
            console.log('⚠️ Database already has data. Skipping seed to avoid duplicates.');
            console.log(`   Found ${hubsSnapshot.size} hubs already in database.`);
            return { success: false, message: 'Database already seeded' };
        }

        const batch = writeBatch(db);

        // Seed Hubs
        console.log('📁 Seeding hubs...');
        const hubRefs = [];
        for (const hub of hubsData) {
            const hubRef = doc(collection(db, 'hubs'));
            batch.set(hubRef, hub);
            hubRefs.push(hubRef);
        }

        // Commit hubs batch
        await batch.commit();
        console.log(`   ✅ Created ${hubsData.length} hubs`);

        // Seed Posts (separate batch due to size)
        console.log('📝 Seeding posts...');
        const postRefs = [];
        for (const post of postsData) {
            const postRef = await addDoc(collection(db, 'posts'), post);
            postRefs.push({ ref: postRef, data: post });
        }
        console.log(`   ✅ Created ${postsData.length} posts`);

        // Seed Comments
        console.log('💬 Seeding comments...');
        let commentCount = 0;
        for (const comment of commentsData) {
            const postRef = postRefs[comment.postIndex];
            if (postRef) {
                const commentData = {
                    postId: postRef.ref.id,
                    author: comment.author,
                    authorId: comment.authorId,
                    content: comment.content,
                    votes: comment.votes,
                    createdAt: comment.createdAt,
                    parentId: null
                };

                const commentRef = await addDoc(collection(db, 'comments'), commentData);
                commentCount++;

                // Add replies if any
                if (comment.replies) {
                    for (const reply of comment.replies) {
                        await addDoc(collection(db, 'comments'), {
                            postId: postRef.ref.id,
                            author: reply.author,
                            authorId: reply.authorId,
                            content: reply.content,
                            votes: reply.votes,
                            createdAt: reply.createdAt,
                            parentId: commentRef.id
                        });
                        commentCount++;
                    }
                }
            }
        }
        console.log(`   ✅ Created ${commentCount} comments`);

        console.log('🎉 Database seeding complete!');
        console.log(`   Total: ${hubsData.length} hubs, ${postsData.length} posts, ${commentCount} comments`);

        return {
            success: true,
            message: 'Database seeded successfully',
            stats: {
                hubs: hubsData.length,
                posts: postsData.length,
                comments: commentCount
            }
        };

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

// Export for use in app
export default seedDatabase;
