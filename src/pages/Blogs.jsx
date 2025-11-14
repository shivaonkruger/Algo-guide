import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export default function Blogs() {
  const { user } = useUser();
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) return;
        const response = await fetch(`http://localhost:8000/home-by-email/${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setRoadmapData(data);
        }
      } catch {}
      setLoading(false);
    };
    if (user?.primaryEmailAddress?.emailAddress) fetchRoadmap();
  }, [user]);

  // Get onboarding choices from Clerk metadata
  const preferredRole = user?.unsafeMetadata?.preferredRole || '';
  const primaryLanguage = user?.unsafeMetadata?.primaryLanguage || '';
  const familiarTopics = user?.unsafeMetadata?.familiarTopics || [];

  // Flatten all resources from roadmapData
  const allResources = [];
  if (roadmapData) {
    if (roadmapData.resources) {
      if (roadmapData.resources.general_learning) allResources.push(...roadmapData.resources.general_learning);
      if (roadmapData.resources.company_specific) allResources.push(...roadmapData.resources.company_specific);
      if (roadmapData.resources.technical_skills) allResources.push(...roadmapData.resources.technical_skills);
    }
    if (roadmapData.general_learning) allResources.push(...roadmapData.general_learning);
    if (roadmapData.company_specific) allResources.push(...roadmapData.company_specific);
    if (roadmapData.technical_skills) allResources.push(...roadmapData.technical_skills);
  }

  // Filter blogs relevant to onboarding choices
  const relevantBlogs = allResources.filter(resource => {
    const isBlog = resource.type === 'blog' || (resource.tags && resource.tags.includes('blog'));
    if (!isBlog) return false;
    // Match role, language, or topic
    const matchesRole = preferredRole && resource.tags?.some(tag => tag.toLowerCase().includes(preferredRole.toLowerCase()));
    const matchesLanguage = primaryLanguage && resource.tags?.some(tag => tag.toLowerCase().includes(primaryLanguage.toLowerCase()));
    const matchesTopic = familiarTopics && familiarTopics.some(topic => resource.tags?.some(tag => tag.toLowerCase().includes(topic.toLowerCase())));
    return matchesRole || matchesLanguage || matchesTopic;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-orange-400">Relevant Blogs For You</h1>
      {loading ? (
        <div className="text-gray-400">Loading blogs...</div>
      ) : relevantBlogs.length === 0 ? (
        <div className="text-gray-400">No relevant blogs found for your preferences.</div>
      ) : (
        <div className="space-y-6">
          {relevantBlogs.map((blog, idx) => (
            <a
              key={idx}
              href={blog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition"
            >
              <h2 className="font-semibold text-xl mb-2">{blog.title}</h2>
              <p className="text-sm text-gray-400 mb-2">{blog.description}</p>
              <div className="flex gap-2 mt-2">
                {blog.tags?.map((tag, tagIdx) => (
                  <span key={tagIdx} className="px-2 py-1 bg-gray-600 rounded text-xs">{tag}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
