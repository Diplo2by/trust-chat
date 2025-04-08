// hooks/useFriends.ts
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/supabaseClient'
import { trace } from '@tauri-apps/plugin-log'

interface Friend {
    id: string;
    email: string;
}

interface FriendRequest {
    id: string;
    sender_id: string;
    sender_email: string;
    created_at: string;
}

// Create a map for quick lookup with proper typing
interface UserMap {
    [key: string]: { id: string; email: string };
}

export const useFriends = (session: Session | null) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch friends and friend requests
    const fetchFriendsAndRequests = useCallback(async () => {
        if (!session) {
            setFriends([]);
            setFriendRequests([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Fetch both friend requests and friendships in parallel
            const [pendingRequestsResult, friendshipsResult] = await Promise.all([
                // Get pending requests where you're the recipient
                supabase
                    .from('friendships')
                    .select('*')
                    .eq('friend_id', session.user.id)
                    .eq('status', 'pending'),

                // Get accepted friendships where you're the initiator
                supabase
                    .from('friendships')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .eq('status', 'accepted')
            ]);

            const pendingRequests = pendingRequestsResult.data || [];
            const friendships = friendshipsResult.data || [];

            if (pendingRequestsResult.error) throw pendingRequestsResult.error;
            if (friendshipsResult.error) throw friendshipsResult.error;

            // Collect all user IDs we need to fetch (both friend IDs and request sender IDs)
            const userIds: string[] = [
                ...pendingRequests.map(req => req.user_id),
                ...friendships.map(friendship => friendship.friend_id)
            ];

            // Fetch all user details in a single query if we have IDs to fetch
            let usersMap: UserMap = {};
            if (userIds.length > 0) {
                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('id, email')
                    .in('id', userIds);

                if (usersError) throw usersError;

                // Create a map for quick lookup
                usersMap = (users || []).reduce((map: UserMap, user) => {
                    map[user.id] = user;
                    return map;
                }, {});
            }

            // Format the requests with sender details
            const formattedRequests = pendingRequests.map(request => ({
                id: request.id,
                sender_id: request.user_id,
                sender_email: usersMap[request.user_id]?.email || 'Unknown email',
                created_at: request.created_at
            }));

            // Format the friends with user details
            const formattedFriends = friendships.map(friendship => ({
                id: friendship.friend_id,
                email: usersMap[friendship.friend_id]?.email || 'Unknown email'
            }));

            setFriendRequests(formattedRequests);
            setFriends(formattedFriends);
        } catch (error) {
            trace("Error in fetchFriendsAndRequests: " + JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Send friend request
    const sendFriendRequest = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
        if (!session) {
            return { success: false, message: 'You need to be logged in to send friend requests' };
        }

        try {
            // Check if the user exists
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email);

            if (userError) throw userError;

            if (!users || users.length === 0) {
                return { success: false, message: 'No user found with that email address' };
            }

            const friendId = users[0].id;

            // Check if this is your own email
            if (friendId === session.user.id) {
                return { success: false, message: 'You cannot add yourself as a friend' };
            }

            // Check if there's already a friendship or request
            const { data: existingFriendship, error: checkError } = await supabase
                .from('friendships')
                .select('id, status')
                .or(`and(user_id.eq.${session.user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${session.user.id})`)
                .limit(1);

            if (checkError) throw checkError;

            if (existingFriendship && existingFriendship.length > 0) {
                const status = existingFriendship[0].status;

                if (status === 'accepted') {
                    return { success: false, message: 'You are already friends with this user' };
                } else if (status === 'pending') {
                    return { success: false, message: 'A friend request is already pending with this user' };
                }
            }

            // Insert new friend request
            const { error: insertError } = await supabase
                .from('friendships')
                .insert({
                    user_id: session.user.id,
                    friend_id: friendId,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            // Refresh the lists
            fetchFriendsAndRequests();

            return { success: true, message: 'Friend request sent successfully!' };
        } catch (error) {
            console.error('Error sending friend request:', error);
            return { success: false, message: 'Failed to send friend request. Please try again.' };
        }
    }, [session, fetchFriendsAndRequests]);

    // Accept friend request
    const acceptFriendRequest = useCallback(async (requestId: string) => {
        if (!session) return;

        try {
            // Get the request details first
            const { data: request, error: requestError } = await supabase
                .from('friendships')
                .select('user_id, friend_id')
                .eq('id', requestId)
                .single();

            if (requestError) throw requestError;

            // Update the request status and create reverse friendship in a transaction
            const [updateResult, insertResult] = await Promise.all([
                // Update the original request
                supabase
                    .from('friendships')
                    .update({ status: 'accepted' })
                    .eq('id', requestId),

                // Create the reverse friendship
                supabase
                    .from('friendships')
                    .insert({
                        user_id: request.friend_id,
                        friend_id: request.user_id,
                        status: 'accepted'
                    })
            ]);

            if (updateResult.error) throw updateResult.error;
            if (insertResult.error) throw insertResult.error;

            // Refresh the lists
            fetchFriendsAndRequests();
        } catch (error) {
            trace("Error accepting friend request: " + JSON.stringify(error));
        }
    }, [session, fetchFriendsAndRequests]);

    // Decline friend request
    const declineFriendRequest = useCallback(async (requestId: string) => {
        if (!session) return;

        try {
            // Delete the request
            const { error } = await supabase
                .from('friendships')
                .delete()
                .eq('id', requestId);

            if (error) throw error;

            // Refresh the lists
            fetchFriendsAndRequests();
        } catch (error) {
            trace("Error declining friend request: " + JSON.stringify(error));
        }
    }, [session, fetchFriendsAndRequests]);

    // Initial fetch and set up real-time subscriptions
    useEffect(() => {
        fetchFriendsAndRequests();

        if (!session) return;

        // Set up subscription for friendships table
        const friendshipSubscription = supabase
            .channel('friendships-changes')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'friendships',
                    filter: `user_id=eq.${session.user.id}`
                },
                () => {
                    fetchFriendsAndRequests();
                }
            )
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'friendships',
                    filter: `friend_id=eq.${session.user.id}`
                },
                () => {
                    fetchFriendsAndRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(friendshipSubscription);
        };
    }, [session, fetchFriendsAndRequests]);

    return {
        friends,
        friendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        loading
    };
};