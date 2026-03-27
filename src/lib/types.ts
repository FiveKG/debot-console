export interface Signal {
  id: number;
  token_address: string;
  symbol: string;
  name: string;
  chain: string;
  market_cap: number;
  price: number;
  liquidity: number;
  holder_count: number;
  signal_count: number;
  signal_time: number;
  status: 'init' | 'pending_analysis' | 'approved' | 'watch' | 'rejected' | 'error';
  analysis_result: string | null;
  twitter_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: number;
  token_address: string;
  symbol: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
  sol_amount: number;
  txid: string;
  pnl_percent: number | null;
  pnl_sol: number | null;
  created_at: string;
}

export interface Position {
  id: number;
  token_address: string;
  symbol: string;
  buy_price: number;
  buy_amount: number;
  current_price: number;
  remaining_percent: number;
  tp_levels_hit: string;
  buy_txid: string;
  buy_time: number;
  status: string;
  total_sold_sol: number;
}

export interface Stats {
  totalSignals: number;
  todaySignals: number;
  approved: number;
  totalTrades: number;
  totalPnlSol: number;
  sellCount: number;
  winCount: number;
  winRate: number;
}

export interface Account {
  id: number;
  email: string;
  gmail_password?: string;
  proxy: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinderConfig {
  poll_interval_seconds: string;
  chain: string;
  page_size: string;
}

export interface SellConfig {
  take_profit_pct: number[];
  take_profit_spreads: number[];
  stop_loss_pct: number[];
  stop_loss_spreads: number[];
}

export interface NarrativeGroup {
  id: number;
  narrative_key: string;
  first_signal_time: number;
  tokens: string;
  peak_market_cap: number;
  is_consumed: number;
  consumed_token: string | null;
  consumed_symbol: string | null;
}
