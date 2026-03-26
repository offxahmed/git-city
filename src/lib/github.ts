export interface GitHubUserData {
  username: string;
  avatarUrl: string;
  bio: string | null;
  name: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  totalRepos: number;
  totalStars: number;
  totalCommits: number;
  topLanguages: { name: string; count: number; color: string }[];
  topRepos: { name: string; stars: number; language: string | null; description: string | null }[];
  contributionCalendar: { date: string; count: number }[];
  createdAt: string;
}

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const USER_QUERY = `
query($username: String!) {
  user(login: $username) {
    login
    avatarUrl
    bio
    name
    company
    location
    createdAt
    followers { totalCount }
    following { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        name
        stargazerCount
        primaryLanguage { name color }
        description
      }
    }
    contributionsCollection {
      totalCommitContributions
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

export async function fetchGitHubUser(username: string): Promise<GitHubUserData | null> {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  // Try GraphQL API first if we have a token
  if (token) {
    try {
      const res = await fetch(GITHUB_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: USER_QUERY, variables: { username } }),
      });

      const json = await res.json();

      if (!json.errors && json.data?.user) {
        const user = json.data.user;

        const langMap = new Map<string, { count: number; color: string }>();
        let totalStars = 0;

        for (const repo of user.repositories.nodes) {
          totalStars += repo.stargazerCount;
          if (repo.primaryLanguage) {
            const existing = langMap.get(repo.primaryLanguage.name);
            if (existing) {
              existing.count++;
            } else {
              langMap.set(repo.primaryLanguage.name, {
                count: 1,
                color: repo.primaryLanguage.color || '#6366f1',
              });
            }
          }
        }

        const topLanguages = Array.from(langMap.entries())
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const topRepos = user.repositories.nodes.slice(0, 6).map((r: Record<string, unknown>) => ({
          name: r.name as string,
          stars: r.stargazerCount as number,
          language: (r.primaryLanguage as { name: string } | null)?.name || null,
          description: r.description as string | null,
        }));

        const contributionCalendar = user.contributionsCollection.contributionCalendar.weeks
          .flatMap((w: { contributionDays: { date: string; contributionCount: number }[] }) =>
            w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
          );

        return {
          username: user.login,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          name: user.name,
          company: user.company,
          location: user.location,
          followers: user.followers.totalCount,
          following: user.following.totalCount,
          totalRepos: user.repositories.totalCount,
          totalStars,
          totalCommits: user.contributionsCollection.totalCommitContributions,
          topLanguages,
          topRepos,
          contributionCalendar,
          createdAt: user.createdAt,
        };
      }
      console.warn('GraphQL failed, falling back to REST API.');
    } catch (err) {
      console.warn('GraphQL request failed, falling back to REST API:', err);
    }
  }

  // Fallback: Use public REST API v3 (no token required, 60 req/hr limit)
  return fetchGitHubUserREST(username);
}

async function fetchGitHubUserREST(username: string): Promise<GitHubUserData | null> {
  try {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch user profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=stars&direction=desc`, { headers }),
    ]);

    if (!userRes.ok) {
      console.error(`GitHub REST API error: ${userRes.status} ${userRes.statusText}`);
      return null;
    }

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Aggregate languages and stars from repos
    const langMap = new Map<string, { count: number; color: string }>();
    let totalStars = 0;

    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      if (repo.language) {
        const existing = langMap.get(repo.language);
        if (existing) {
          existing.count++;
        } else {
          langMap.set(repo.language, {
            count: 1,
            color: getLanguageColorFromName(repo.language),
          });
        }
      }
    }

    const topLanguages = Array.from(langMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topRepos = repos.slice(0, 6).map((r: Record<string, unknown>) => ({
      name: r.name as string,
      stars: (r.stargazers_count as number) || 0,
      language: (r.language as string) || null,
      description: (r.description as string) || null,
    }));

    // Estimate commits from public repos (REST API doesn't expose total commits directly)
    const estimatedCommits = Math.max(user.public_repos * 15, 100);

    // Generate a synthetic contribution calendar since REST API doesn't provide it
    const contributionCalendar = generateFakeCalendar(estimatedCommits);

    return {
      username: user.login,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      name: user.name,
      company: user.company,
      location: user.location,
      followers: user.followers || 0,
      following: user.following || 0,
      totalRepos: user.public_repos || 0,
      totalStars,
      totalCommits: estimatedCommits,
      topLanguages,
      topRepos,
      contributionCalendar,
      createdAt: user.created_at,
    };
  } catch (err) {
    console.error('Failed to fetch GitHub user via REST:', err);
    return null;
  }
}

// Simple language color lookup for REST API fallback
function getLanguageColorFromName(lang: string): string {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5',
    'Java': '#b07219', 'C': '#555555', 'C++': '#f34b7d', 'C#': '#178600',
    'Go': '#00ADD8', 'Rust': '#dea584', 'Ruby': '#701516', 'PHP': '#4F5D95',
    'Swift': '#F05138', 'Kotlin': '#A97BFF', 'Dart': '#00B4AB',
    'HTML': '#e34c26', 'CSS': '#563d7c', 'Shell': '#89e051', 'Vue': '#41b883',
    'Lua': '#000080', 'Zig': '#ec915c', 'Scala': '#c22d40',
  };
  return colors[lang] || '#6366f1';
}

// Demo data for showcasing without API token
export function getDemoUsers(): GitHubUserData[] {
  return [
    {
      username: 'torvalds',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1024025',
      bio: 'Creator of Linux and Git',
      name: 'Linus Torvalds',
      company: 'Linux Foundation',
      location: 'Portland, OR',
      followers: 220000,
      following: 0,
      totalRepos: 7,
      totalStars: 185000,
      totalCommits: 3200,
      topLanguages: [
        { name: 'C', count: 5, color: '#555555' },
        { name: 'Shell', count: 1, color: '#89e051' },
      ],
      topRepos: [
        { name: 'linux', stars: 170000, language: 'C', description: 'Linux kernel source tree' },
      ],
      contributionCalendar: generateFakeCalendar(3200),
      createdAt: '2011-09-03T00:00:00Z',
    },
    {
      username: 'gaearon',
      avatarUrl: 'https://avatars.githubusercontent.com/u/810438',
      bio: 'Working on React',
      name: 'Dan Abramov',
      company: null,
      location: 'London, UK',
      followers: 78000,
      following: 170,
      totalRepos: 260,
      totalStars: 120000,
      totalCommits: 2800,
      topLanguages: [
        { name: 'JavaScript', count: 140, color: '#f1e05a' },
        { name: 'TypeScript', count: 50, color: '#3178c6' },
        { name: 'CSS', count: 20, color: '#563d7c' },
      ],
      topRepos: [
        { name: 'redux', stars: 60000, language: 'TypeScript', description: 'Predictable state container for JS apps' },
        { name: 'react-hot-loader', stars: 12000, language: 'JavaScript', description: 'Tweak React components in real time' },
      ],
      contributionCalendar: generateFakeCalendar(2800),
      createdAt: '2011-06-10T00:00:00Z',
    },
    {
      username: 'sindresorhus',
      avatarUrl: 'https://avatars.githubusercontent.com/u/170270',
      bio: 'Full-Time Open-Sourcerer',
      name: 'Sindre Sorhus',
      company: null,
      location: 'Thailand',
      followers: 53000,
      following: 40,
      totalRepos: 1100,
      totalStars: 300000,
      totalCommits: 4500,
      topLanguages: [
        { name: 'TypeScript', count: 400, color: '#3178c6' },
        { name: 'JavaScript', count: 500, color: '#f1e05a' },
        { name: 'Swift', count: 80, color: '#F05138' },
      ],
      topRepos: [
        { name: 'awesome', stars: 290000, language: null, description: 'Awesome lists about all kinds of interesting topics' },
        { name: 'got', stars: 14000, language: 'TypeScript', description: 'HTTP request library for Node.js' },
      ],
      contributionCalendar: generateFakeCalendar(4500),
      createdAt: '2009-12-20T00:00:00Z',
    },
    {
      username: 'yyx990803',
      avatarUrl: 'https://avatars.githubusercontent.com/u/499550',
      bio: 'Creator of Vue.js & Vite',
      name: 'Evan You',
      company: null,
      location: null,
      followers: 90000,
      following: 100,
      totalRepos: 180,
      totalStars: 420000,
      totalCommits: 5200,
      topLanguages: [
        { name: 'TypeScript', count: 60, color: '#3178c6' },
        { name: 'JavaScript', count: 80, color: '#f1e05a' },
        { name: 'Vue', count: 20, color: '#41b883' },
      ],
      topRepos: [
        { name: 'vue', stars: 207000, language: 'TypeScript', description: 'An approachable, performant and versatile framework for building web UIs.' },
        { name: 'vite', stars: 65000, language: 'TypeScript', description: 'Next generation frontend tooling.' },
      ],
      contributionCalendar: generateFakeCalendar(5200),
      createdAt: '2011-12-09T00:00:00Z',
    },
    {
      username: 'tj',
      avatarUrl: 'https://avatars.githubusercontent.com/u/25254',
      bio: 'Founder of Apex',
      name: 'TJ Holowaychuk',
      company: 'Apex',
      location: 'Victoria, BC',
      followers: 33000,
      following: 10,
      totalRepos: 300,
      totalStars: 200000,
      totalCommits: 1800,
      topLanguages: [
        { name: 'Go', count: 120, color: '#00ADD8' },
        { name: 'JavaScript', count: 150, color: '#f1e05a' },
        { name: 'C', count: 10, color: '#555555' },
      ],
      topRepos: [
        { name: 'commander.js', stars: 26000, language: 'JavaScript', description: 'Node.js command-line interfaces made easy' },
        { name: 'co', stars: 11800, language: 'JavaScript', description: 'The ultimate generator based flow-control goodness' },
      ],
      contributionCalendar: generateFakeCalendar(1800),
      createdAt: '2008-09-22T00:00:00Z',
    },
    {
      username: 'ThePrimeagen',
      avatarUrl: 'https://avatars.githubusercontent.com/u/4458174',
      bio: 'Netflix engineer & content creator',
      name: 'ThePrimeagen',
      company: 'Netflix',
      location: null,
      followers: 18000,
      following: 5,
      totalRepos: 80,
      totalStars: 15000,
      totalCommits: 1500,
      topLanguages: [
        { name: 'TypeScript', count: 30, color: '#3178c6' },
        { name: 'Go', count: 20, color: '#00ADD8' },
        { name: 'Rust', count: 15, color: '#dea584' },
        { name: 'Zig', count: 5, color: '#ec915c' },
      ],
      topRepos: [
        { name: 'harpoon', stars: 6000, language: 'Lua', description: 'Quick file navigation for neovim' },
      ],
      contributionCalendar: generateFakeCalendar(1500),
      createdAt: '2013-05-15T00:00:00Z',
    },
    {
      username: 'denoland',
      avatarUrl: 'https://avatars.githubusercontent.com/u/42048915',
      bio: 'Deno: A modern runtime for JavaScript and TypeScript',
      name: 'Deno',
      company: 'Deno Land Inc.',
      location: null,
      followers: 8000,
      following: 0,
      totalRepos: 40,
      totalStars: 95000,
      totalCommits: 6000,
      topLanguages: [
        { name: 'Rust', count: 15, color: '#dea584' },
        { name: 'TypeScript', count: 20, color: '#3178c6' },
      ],
      topRepos: [
        { name: 'deno', stars: 93000, language: 'Rust', description: 'A modern runtime for JavaScript and TypeScript' },
      ],
      contributionCalendar: generateFakeCalendar(6000),
      createdAt: '2018-08-10T00:00:00Z',
    },
    {
      username: 'kentcdodds',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1500684',
      bio: 'Improving the world with quality software',
      name: 'Kent C. Dodds',
      company: 'EpicWeb.dev',
      location: 'Utah, USA',
      followers: 30000,
      following: 30,
      totalRepos: 500,
      totalStars: 65000,
      totalCommits: 3000,
      topLanguages: [
        { name: 'JavaScript', count: 300, color: '#f1e05a' },
        { name: 'TypeScript', count: 150, color: '#3178c6' },
      ],
      topRepos: [
        { name: 'react-testing-library', stars: 18000, language: 'JavaScript', description: 'Simple and complete React DOM testing utilities' },
      ],
      contributionCalendar: generateFakeCalendar(3000),
      createdAt: '2012-03-03T00:00:00Z',
    },
  ];
}

function generateFakeCalendar(totalCommits: number): { date: string; count: number }[] {
  const calendar: { date: string; count: number }[] = [];
  const now = new Date();
  const avgDaily = totalCommits / 365;

  for (let i = 364; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const count = Math.floor(Math.random() * avgDaily * 2.5);
    calendar.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }
  return calendar;
}
