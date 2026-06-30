import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { 
  MessageSquare, 
  Trash2, 
  Plus, 
  Check, 
  BarChart2, 
  User, 
  Clock, 
  Send,
  Sparkles
} from "lucide-react";
import UserAvatar from "./UserAvatar";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  isPremium?: boolean;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  type: "post" | "poll";
  title?: string; // used for post title
  question?: string; // used for poll question
  content: string;
  tag?: string;
  options?: string[]; // for poll
  votes?: { [userId: string]: number }; // userId -> optionIndex
  reactions?: { [userId: string]: string }; // userId -> emoji
  comments?: Comment[];
  createdAt: string;
  author: string;
  pinned?: boolean;
}

const AVAILABLE_REACTIONS = ["👍", "❤️", "😮", "😢", "👏"];
const POST_TAGS = ["বিজ্ঞপ্তি", "সাধারণ", "প্রশ্ন ও উত্তর", "পরামর্শ", "জরুরি", "ভিসা আপডেট", "চাকরি তথ্য"];

export default function CommunitySection() {
  const { currentUser, userDoc } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New post/poll form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postType, setPostType] = useState<"post" | "poll">("post");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("সাধারণ");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  
  // Interaction states
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [showReactionPicker, setShowReactionPicker] = useState<{ [postId: string]: boolean }>({});

  const isAdmin = localStorage.getItem("isAdminLogged") === "true";

  // Fetch real-time posts
  useEffect(() => {
    const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts: Post[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedPosts.push({
          id: doc.id,
          type: data.type || "post",
          title: data.title,
          question: data.question,
          content: data.content || "",
          tag: data.tag || "সাধারণ",
          options: data.options || [],
          votes: data.votes || {},
          reactions: data.reactions || {},
          comments: data.comments || [],
          createdAt: data.createdAt || new Date().toISOString(),
          author: data.author || "অ্যাডমিন",
          pinned: !!data.pinned
        });
      });

      // Sort pinned posts to the top
      fetchedPosts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to community posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Format date helper
  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "এইমাত্র";
      if (diffMins < 60) return `${diffMins} মিনিট আগে`;
      if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
      if (diffDays === 1) return "গতকাল";
      return `${diffDays} দিন আগে`;
    } catch (e) {
      return "কিছুক্ষণ আগে";
    }
  };

  // Add a new option in poll creation
  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  // Remove option in poll creation
  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const updated = [...pollOptions];
      updated.splice(index, 1);
      setPollOptions(updated);
    }
  };

  // Handle post submit
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("দুঃখিত ভাই, শুধুমাত্র এডমিন পোস্ট এবং পোল তৈরি করতে পারবেন!");
      return;
    }
    if (!currentUser) {
      alert("অ্যাকাউন্টে লগইন করুন ভাই!");
      return;
    }

    if (postType === "post" && (!title.trim() || !content.trim())) {
      alert("দয়া করে শিরোনাম ও মূল লেখা লিখুন ভাই!");
      return;
    }

    if (postType === "poll") {
      if (!title.trim()) {
        alert("দয়া করে পোলের প্রশ্নটি লিখুন ভাই!");
        return;
      }
      const validOptions = pollOptions.filter(o => o.trim() !== "");
      if (validOptions.length < 2) {
        alert("পোলে অন্তত ২টি সঠিক অপশন দিন ভাই!");
        return;
      }
    }

    try {
      const postData: any = {
        type: postType,
        tag: selectedTag,
        createdAt: new Date().toISOString(),
        author: isAdmin ? "অ্যাডমিন (Admin)" : (userDoc?.name || "প্রবাসী ইউজার"),
        authorUid: currentUser.uid,
        reactions: {},
        comments: [],
        pinned: false
      };

      if (postType === "post") {
        postData.title = title.trim();
        postData.content = content.trim();
      } else {
        postData.question = title.trim();
        postData.content = content.trim(); // optional description
        postData.options = pollOptions.filter(o => o.trim() !== "").map(o => o.trim());
        postData.votes = {};
      }

      await addDoc(collection(db, "community_posts"), postData);
      
      // Reset form
      setTitle("");
      setContent("");
      setSelectedTag("সাধারণ");
      setPollOptions(["", ""]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating post/poll:", err);
      alert("পোস্ট তৈরি করা যায়নি ভাই। আবার চেষ্টা করুন।");
    }
  };

  // Handle voting in a poll
  const handleVote = async (postId: string, optionIndex: number) => {
    if (!currentUser) {
      alert("ভোট দেওয়ার জন্য অনুগ্রহ করে আগে লগইন করুন ভাই!");
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const currentVotes = { ...post.votes };
    const userId = currentUser.uid;

    // Toggle or apply vote
    if (currentVotes[userId] === optionIndex) {
      // Remove vote if clicked same option again
      delete currentVotes[userId];
    } else {
      // Apply/Change vote
      currentVotes[userId] = optionIndex;
    }

    try {
      const docRef = doc(db, "community_posts", postId);
      await updateDoc(docRef, { votes: currentVotes });
    } catch (err) {
      console.error("Error updating vote:", err);
    }
  };

  // Handle reaction/emoji toggle
  const handleReaction = async (postId: string, emoji: string) => {
    if (!currentUser) {
      alert("রিঅ্যাকশন দেওয়ার জন্য অনুগ্রহ করে আগে লগইন করুন ভাই!");
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const currentReactions = { ...post.reactions };
    const userId = currentUser.uid;

    if (currentReactions[userId] === emoji) {
      // Toggle off if clicked same emoji again
      delete currentReactions[userId];
    } else {
      // Apply reaction
      currentReactions[userId] = emoji;
    }

    try {
      const docRef = doc(db, "community_posts", postId);
      await updateDoc(docRef, { reactions: currentReactions });
      setShowReactionPicker(prev => ({ ...prev, [postId]: false }));
    } catch (err) {
      console.error("Error updating reaction:", err);
    }
  };

  // Handle comment submit
  const handleAddComment = async (postId: string) => {
    if (!currentUser) {
      alert("কমেন্ট করার জন্য অনুগ্রহ করে আগে লগইন করুন ভাই!");
      return;
    }

    const commentText = commentInputs[postId] || "";
    if (!commentText.trim()) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      userId: currentUser.uid,
      userName: userDoc?.name || "প্রবাসী ভাই",
      userPhotoUrl: userDoc?.photoUrl || "",
      isPremium: !!userDoc?.isPremium,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(post.comments || []), newComment];

    try {
      const docRef = doc(db, "community_posts", postId);
      await updateDoc(docRef, { comments: updatedComments });
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Toggle pin/unpin for Admin
  const handleTogglePin = async (postId: string, currentPinned: boolean) => {
    if (!isAdmin) return;
    try {
      const docRef = doc(db, "community_posts", postId);
      await updateDoc(docRef, { pinned: !currentPinned });
    } catch (err) {
      console.error("Error pinning post:", err);
    }
  };

  // Delete post/poll for Admin
  const handleDeletePost = async (postId: string) => {
    if (!isAdmin) return;
    if (confirm("আপনি কি নিশ্চিতভাবে এই পোস্ট/পোলটি ডিলিট করতে চান ভাই?")) {
      try {
        await deleteDoc(doc(db, "community_posts", postId));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  // Delete comment for Admin or comment owner
  const handleDeleteComment = async (postId: string, commentId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!isAdmin) {
      const comment = post.comments?.find(c => c.id === commentId);
      if (comment?.userId !== currentUser?.uid) return;
    }

    if (confirm("কমেন্টটি ডিলিট করতে চান ভাই?")) {
      const updatedComments = (post.comments || []).filter(c => c.id !== commentId);
      try {
        const docRef = doc(db, "community_posts", postId);
        await updateDoc(docRef, { comments: updatedComments });
      } catch (err) {
        console.error("Error deleting comment:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Section Trigger (Only Visible to Admin) */}
      {isAdmin && (
        <div 
          className="bg-white p-4 flex items-center justify-between"
          style={{
            borderRadius: '14px',
            borderColor: '#E5E7EB',
            borderWidth: '0.5px'
          }}
        >
          <div className="flex items-center space-x-2.5">
            <UserAvatar 
              size={36} 
              photoUrl={userDoc?.photoUrl} 
              name={userDoc?.name} 
              isPremium={!!userDoc?.isPremium} 
            />
            <span className="text-[12px] text-[#6B7280] font-sans">
              এডমিন প্যানেল থেকে নতুন আলোচনা বা পোল তৈরি করুন...
            </span>
          </div>
          <button
            onClick={() => {
              if (!currentUser) {
                alert("পোস্ট করার জন্য অনুগ্রহ করে আগে লগইন করুন ভাই!");
              } else {
                setShowCreateModal(true);
              }
            }}
            className="bg-[#1B4F72] hover:bg-opacity-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center gap-1 font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            নতুন পোস্ট
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100" style={{ borderWidth: '0.5px' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4F72] mx-auto mb-2"></div>
          <p className="text-xs text-[#6B7280] font-sans">পোস্ট ও পোলসমূহ লোড হচ্ছে ভাই...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6" style={{ borderWidth: '0.5px' }}>
          <div className="w-12 h-12 bg-[#F0F4F8] rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-[#1B4F72]" />
          </div>
          <h4 className="text-sm font-semibold text-[#1A1A2E] font-sans mb-1">কোনো ফোরাম পোস্ট নেই</h4>
          <p className="text-xs text-[#6B7280] font-sans">প্রবাসী কমিউনিটিতে প্রথম পোস্ট বা পোল তৈরি করে আলোচনা শুরু করুন ভাই!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            // Calculate Poll Votes
            const totalVotes = post.votes ? Object.keys(post.votes).length : 0;
            const userVoteIndex = post.votes && currentUser ? post.votes[currentUser.uid] : undefined;

            // Reactions analysis
            const reactionsMap: { [emoji: string]: number } = {};
            AVAILABLE_REACTIONS.forEach(e => { reactionsMap[e] = 0; });
            if (post.reactions) {
              (Object.values(post.reactions) as string[]).forEach(emoji => {
                if (reactionsMap[emoji] !== undefined) {
                  reactionsMap[emoji]++;
                }
              });
            }
            const activeReactions = AVAILABLE_REACTIONS.filter(e => reactionsMap[e] > 0);
            const userReaction = post.reactions && currentUser ? post.reactions[currentUser.uid] : undefined;

            return (
              <div 
                key={post.id}
                className="bg-white border p-4 text-left relative transition-all"
                style={{
                  borderRadius: '16px',
                  borderColor: post.pinned ? '#FFD700' : '#E5E7EB',
                  borderWidth: post.pinned ? '1px' : '0.5px',
                  boxShadow: post.pinned ? '0 2px 10px rgba(255, 215, 0, 0.08)' : 'none'
                }}
              >
                {/* Pinned Badge */}
                {post.pinned && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#FFF9D0] text-[#B7950B] text-[9px] px-2 py-0.5 rounded-full font-medium border border-[#FFD700] uppercase font-sans">
                    <Sparkles className="w-2.5 h-2.5" /> পিন্ড পোস্ট
                  </div>
                )}

                {/* Tag & Info */}
                <div className="flex items-center space-x-2.5 mb-3.5">
                  <UserAvatar size={34} isPremium={post.author.includes("Admin")} name={post.author} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#1A1A2E] font-sans">
                        {post.author}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-sans">
                        {post.tag}
                      </span>
                    </div>
                    <div className="flex items-center text-[10px] text-[#6B7280] space-x-1.5 font-sans mt-0.5">
                      <Clock className="w-3 h-3 text-[#9CA3AF]" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Title & Body content */}
                {post.type === "post" ? (
                  <div className="space-y-1.5 mb-4">
                    <h3 className="text-sm font-semibold text-[#1A1A2E] leading-snug font-sans">
                      {post.title}
                    </h3>
                    <p className="text-[13px] text-gray-700 font-sans leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#EBF5FB] text-[#1B4F72] text-[10px] px-2 py-0.5 rounded-md font-sans flex items-center gap-1">
                        <BarChart2 className="w-3 h-3" /> জনমত পোল
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1A1A2E] leading-snug font-sans">
                      {post.question}
                    </h3>
                    {post.content && (
                      <p className="text-[12px] text-[#6B7280] font-sans leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    )}

                    {/* Poll Options List */}
                    <div className="space-y-2 pt-1">
                      {post.options?.map((option, idx) => {
                        const optVotes = post.votes 
                          ? Object.values(post.votes).filter(v => v === idx).length 
                          : 0;
                        const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        const isVoted = userVoteIndex === idx;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleVote(post.id, idx)}
                            className="w-full text-left relative overflow-hidden rounded-xl border p-3 transition-all flex items-center justify-between cursor-pointer"
                            style={{
                              borderColor: isVoted ? '#1B4F72' : '#E5E7EB',
                              borderWidth: '0.5px',
                              backgroundColor: isVoted ? '#F4F8FA' : '#FFFFFF'
                            }}
                          >
                            {/* Vote background filling percentage bar */}
                            <div 
                              className="absolute top-0 left-0 bottom-0 transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: isVoted ? 'rgba(27, 79, 114, 0.08)' : 'rgba(229, 231, 235, 0.35)',
                                zIndex: 1
                              }}
                            />

                            {/* Option content */}
                            <div className="flex items-center space-x-2 z-10 font-sans text-[12.5px] font-medium text-[#1A1A2E]">
                              {isVoted && <Check className="w-4 h-4 text-[#1B4F72] shrink-0" />}
                              <span>{option}</span>
                            </div>

                            {/* Percentage / Count */}
                            <span className="text-[11px] text-[#6B7280] font-mono font-medium z-10">
                              {optVotes} ভোট ({percentage}%)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[10.5px] text-[#6B7280] font-sans flex justify-between px-1">
                      <span>মোট ভোট: {totalVotes} টি</span>
                      <span>{userVoteIndex !== undefined ? "✓ আপনি ভোট দিয়েছেন" : "ভোট দিতে অপশনে ট্যাপ করুন ভাই"}</span>
                    </div>
                  </div>
                )}

                {/* Reaction and comments summary bar */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[#6B7280] text-[11px] font-sans" style={{ borderTopWidth: '0.5px' }}>
                  {/* Reactions Summary */}
                  <div className="flex items-center space-x-1">
                    {activeReactions.length > 0 ? (
                      <div className="flex items-center">
                        <div className="flex -space-x-1 mr-1">
                          {activeReactions.slice(0, 3).map((emoji) => (
                            <span key={emoji} className="text-[13px]">{emoji}</span>
                          ))}
                        </div>
                        <span className="font-medium text-gray-700">
                          {Object.keys(post.reactions || {}).length} জন
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#9CA3AF]">কোনো রিঅ্যাকশন নেই</span>
                    )}
                  </div>

                  {/* Comment count summary */}
                  <button 
                    onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="hover:text-[#1B4F72] font-medium cursor-pointer"
                  >
                    {post.comments && post.comments.length > 0 
                      ? `${post.comments.length} টি মন্তব্য (Comments)` 
                      : "মন্তব্য করুন"}
                  </button>
                </div>

                {/* Buttons Action Bar (Like/React, Comment, Admin Pin, Admin Delete) */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 relative" style={{ borderTopWidth: '0.5px' }}>
                  {/* Reaction Button with Popover */}
                  <div className="relative">
                    <button
                      onClick={() => setShowReactionPicker(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        userReaction 
                          ? "bg-amber-50 text-amber-700 border border-amber-200" 
                          : "hover:bg-gray-50 text-[#6B7280]"
                      }`}
                    >
                      <span className="text-[14px]">{userReaction || "👍"}</span>
                      <span>{userReaction ? "রিঅ্যাকশন দিয়েছেন" : "লাইক/রিঅ্যাক্ট"}</span>
                    </button>

                    {/* Emoji Picker Popover */}
                    {showReactionPicker[post.id] && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setShowReactionPicker(prev => ({ ...prev, [post.id]: false }))}
                        />
                        <div 
                          className="absolute bottom-10 left-0 bg-white border border-[#E5E7EB] rounded-full p-1.5 shadow-lg flex items-center space-x-2 z-40 animate-fade-in"
                          style={{ borderWidth: '0.5px' }}
                        >
                          {AVAILABLE_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(post.id, emoji)}
                              className="text-[18px] hover:scale-125 transition-transform duration-100 p-1 cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Comment Toggle Button */}
                  <button
                    onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 text-[#6B7280] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>মন্তব্য</span>
                  </button>

                  {/* Admin specific controls */}
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTogglePin(post.id, post.pinned || false)}
                        className={`p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer ${post.pinned ? "text-amber-500" : "text-gray-400"}`}
                        title={post.pinned ? "আনপিন করুন" : "পিন করুন"}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                        title="পোস্টটি ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments Section (collapsible list) */}
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 font-sans" style={{ borderTopWidth: '0.5px' }}>
                    {/* Add Comment Box */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="আপনার মন্তব্যটি লিখুন ভাই..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1 bg-gray-50 text-[#1A1A2E] text-[12px] px-3.5 py-2 rounded-xl border-[0.5px] border-[#E5E7EB] focus:bg-white focus:border-[#1B4F72] focus:outline-none transition-colors"
                        style={{ borderWidth: '0.5px' }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-[#1B4F72] hover:bg-opacity-95 text-white p-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {post.comments.map((comment) => {
                          const isOwnComment = comment.userId === currentUser?.uid;
                          return (
                            <div key={comment.id} className="bg-gray-50 rounded-2xl p-2.5 flex items-start justify-between">
                              <div className="flex gap-2.5">
                                <UserAvatar size={24} isPremium={comment.isPremium} photoUrl={comment.userPhotoUrl} name={comment.userName} />
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-[#1A1A2E]">
                                      {comment.userName}
                                    </span>
                                    {comment.isPremium && (
                                      <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded font-bold uppercase">★ Premium</span>
                                    )}
                                    <span className="text-[9px] text-[#6B7280]">
                                      {formatTimeAgo(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-[12px] text-gray-700 font-normal leading-relaxed">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>

                              {/* Comment delete button */}
                              {(isAdmin || isOwnComment) && (
                                <button
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 text-center py-2">কোনো মন্তব্য নেই ভাই। প্রথম মন্তব্যটি করুন!</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE POST / POLL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[16px] overflow-hidden shadow-xl border border-[#E5E7EB] flex flex-col max-h-[85vh] font-sans text-left">
            {/* Header */}
            <div className="bg-[#1B4F72] text-white p-4 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-semibold">নতুন আলোচনা / পোল তৈরি করুন</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:text-gray-200 text-xs font-semibold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreatePost} className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Post Type Selector */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs pb-1">
                <button
                  type="button"
                  onClick={() => setPostType("post")}
                  className={`h-9 rounded-xl font-medium transition-all cursor-pointer ${
                    postType === "post"
                      ? "bg-[#1B4F72] text-white"
                      : "bg-[#F0F4F8] text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-100"
                  }`}
                >
                  📝 সাধারণ পোস্ট
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("poll")}
                  className={`h-9 rounded-xl font-medium transition-all cursor-pointer ${
                    postType === "poll"
                      ? "bg-[#1B4F72] text-white"
                      : "bg-[#F0F4F8] text-[#6B7280] border border-[#E5E7EB] hover:bg-gray-100"
                  }`}
                >
                  📊 জনমত পোল
                </button>
              </div>

              {/* Tag Selection */}
              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">ক্যাটাগরি ট্যাগ সিলেক্ট করুন</label>
                <div className="flex flex-wrap gap-1.5">
                  {POST_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        selectedTag === tag
                          ? "bg-[#1B4F72] text-white border-[#1B4F72]"
                          : "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:bg-gray-100"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Question */}
              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">
                  {postType === "post" ? "পোস্ট শিরোনাম" : "পোলের মূল প্রশ্ন"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={postType === "post" ? "যেমন: ভিসা রিনিউ করার সহজ নিয়ম" : "যেমন: আপনারা টাকা পাঠানোর জন্য কোন মাধ্যম বেশি ব্যবহার করেন?"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 bg-[#F9FAFB] text-[#1A1A2E] text-[13px] px-3.5 rounded-xl border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                  style={{ borderWidth: '0.5px' }}
                />
              </div>

              {/* Description Content */}
              <div>
                <label className="block text-[11px] text-[#6B7280] font-normal mb-1">
                  {postType === "post" ? "মূল বক্তব্য" : "পোলের বিবরণ বা বিস্তারিত (ঐচ্ছিক)"}
                </label>
                <textarea
                  placeholder="বিস্তারিত এখানে লিখুন ভাই..."
                  rows={4}
                  required={postType === "post"}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#F9FAFB] text-[#1A1A2E] text-[13px] p-3.5 rounded-xl border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                  style={{ borderWidth: '0.5px' }}
                />
              </div>

              {/* Poll Specific Options Form */}
              {postType === "poll" && (
                <div className="space-y-2 border-t pt-3" style={{ borderTopWidth: '0.5px' }}>
                  <label className="block text-[11px] text-[#6B7280] font-normal">পোলের অপশনসমূহ</label>
                  {pollOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-[11px] text-[#6B7280] font-mono shrink-0 w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        required={idx < 2}
                        placeholder={idx < 2 ? `অপশন ${idx + 1} (আবশ্যক)` : `অপশন ${idx + 1} (ঐচ্ছিক)`}
                        value={option}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        className="flex-1 h-9 bg-[#F9FAFB] text-[#1A1A2E] text-[12px] px-3 rounded-lg border-[0.5px] border-[#E5E7EB] focus:border-[#1B4F72] focus:outline-none focus:bg-white transition-colors"
                        style={{ borderWidth: '0.5px' }}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          className="text-red-500 hover:text-red-600 text-xs font-semibold cursor-pointer p-1"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {pollOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="text-[#1B4F72] hover:text-opacity-80 text-xs font-medium flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> অপশন যুক্ত করুন (সর্বোচ্চ ৬টি)
                    </button>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#1B4F72] hover:bg-opacity-95 text-white font-medium text-xs rounded-xl transition-all cursor-pointer mt-4"
              >
                {postType === "post" ? "✓ পোস্ট পাবলিশ করুন" : "✓ পোল পাবলিশ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
