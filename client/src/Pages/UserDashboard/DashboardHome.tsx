import { useState, useEffect } from "react";
import useUserStore from "@/store/userStore";
import {
  ArrowRight,
  Users,
  LayoutDashboard,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

// Sample data for recent activities
const recentActivities = [
  {
    id: 1,
    title: "Profile Updated",
    description: "You updated your profile information",
    time: "2 hours ago",
    icon: Activity,
  },
  {
    id: 2,
    title: "New Friend Request",
    description: "Alex Johnson sent you a friend request",
    time: "1 day ago",
    icon: Users,
  },
  {
    id: 3,
    title: "Account Created",
    description: "Welcome to the platform!",
    time: "3 days ago",
    icon: LayoutDashboard,
  },
];

export default function DashboardHome() {
  const { user } = useUserStore();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <LayoutDashboard className="text-[var(--primary)]" />
          {greeting}, {user?.name}
        </h1>
        <p className="text-[var(--dashboard-text-muted)]">
          Welcome to your dashboard. Here's an overview of your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--dashboard-card)] rounded-xl p-6 border border-[var(--dashboard-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--dashboard-text-muted)]">Profile</p>
              <p className="text-2xl font-bold">{user?.isVerified ? 'Verified' : 'Pending'}</p>
            </div>
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--dashboard-card)] rounded-xl p-6 border border-[var(--dashboard-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--dashboard-text-muted)]">Friends</p>
              <p className="text-2xl font-bold">5</p>
            </div>
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--dashboard-card)] rounded-xl p-6 border border-[var(--dashboard-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--dashboard-text-muted)]">Account Type</p>
              <p className="text-2xl font-bold">{user?.isGoogle ? 'Google' : 'Email'}</p>
            </div>
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--dashboard-card)] rounded-xl p-6 border border-[var(--dashboard-border)] mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Recent Activity</h2>
        </div>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 hover:bg-[var(--dashboard-card-hover)]/50 rounded-lg transition-colors"
            >
              <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg flex-shrink-0">
                <activity.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">
                  {activity.description}
                </p>
              </div>
              <div className="text-xs text-[var(--dashboard-text-muted)] whitespace-nowrap">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--dashboard-card)] rounded-xl p-6 border border-[var(--dashboard-border)]">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg hover:bg-[var(--dashboard-card-hover)] transition-colors"
          >
            <Activity className="text-[var(--primary)]" size={20} />
            <div>
              <p className="font-medium">Edit Profile</p>
              <p className="text-sm text-[var(--dashboard-text-muted)]">Update your information</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-[var(--dashboard-text-muted)]" />
          </Link>
          
          <Link
            to="/dashboard/friends"
            className="flex items-center gap-3 p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg hover:bg-[var(--dashboard-card-hover)] transition-colors"
          >
            <Users className="text-[var(--primary)]" size={20} />
            <div>
              <p className="font-medium">Manage Friends</p>
              <p className="text-sm text-[var(--dashboard-text-muted)]">View and add friends</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-[var(--dashboard-text-muted)]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
