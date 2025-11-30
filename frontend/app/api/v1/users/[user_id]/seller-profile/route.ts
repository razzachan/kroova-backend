// ============================================================================
// SELLER PROFILE - API Route
// File: frontend/app/api/v1/users/[user_id]/seller-profile/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/users/:user_id/seller-profile
 * Retorna perfil público do vendedor com stats e ratings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;

    // 1. User info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', user_id)
      .single();

    if (userError) throw userError;

    // 2. Total sales
    const { count: totalSales } = await supabase
      .from('market_sales_history')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user_id);

    // 3. Rating médio
    const { data: ratingsData } = await supabase
      .from('seller_ratings')
      .select('rating')
      .eq('seller_id', user_id);

    const avgRating = ratingsData && ratingsData.length > 0
      ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length
      : null;

    // 4. Success rate (vendas concluídas vs canceladas)
    const { count: completedListings } = await supabase
      .from('market_listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user_id)
      .eq('status', 'sold');

    const { count: cancelledListings } = await supabase
      .from('market_listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user_id)
      .eq('status', 'cancelled');

    const totalListings = (completedListings || 0) + (cancelledListings || 0);
    const successRate = totalListings > 0
      ? ((completedListings || 0) / totalListings)
      : 1;

    // 5. Active listings
    const { data: activeListings } = await supabase
      .from('market_listings')
      .select(`
        id,
        price_brl,
        created_at,
        cards_instances!inner(
          id,
          cards_base!inner(id, name, rarity, image_url)
        )
      `)
      .eq('seller_id', user_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    // 6. Recent reviews
    const { data: reviews } = await supabase
      .from('seller_ratings')
      .select(`
        id,
        rating,
        review,
        created_at,
        buyer:users!buyer_id(name, email)
      `)
      .eq('seller_id', user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.email?.split('@')[0] || 'anonymous',
          member_since: user.created_at
        },
        stats: {
          total_sales: totalSales || 0,
          avg_rating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
          reviews_count: ratingsData?.length || 0,
          success_rate: parseFloat((successRate * 100).toFixed(1))
        },
        active_listings: activeListings?.map((listing: any) => ({
          id: listing.id,
          price_brl: listing.price_brl,
          listed_at: listing.created_at,
          card: {
            id: listing.cards_instances.cards_base.id,
            name: listing.cards_instances.cards_base.name,
            rarity: listing.cards_instances.cards_base.rarity,
            image_url: listing.cards_instances.cards_base.image_url
          }
        })),
        recent_reviews: reviews?.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          review: review.review,
          created_at: review.created_at,
          buyer_name: review.buyer?.name || 'Anonymous'
        }))
      }
    });
  } catch (err: any) {
    console.error('[seller-profile] Error:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
