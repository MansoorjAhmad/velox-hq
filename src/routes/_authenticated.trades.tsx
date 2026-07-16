import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconChartLine,
  IconFilter,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/metric-card";
import { TradeFormDrawer } from "@/components/trade-form-drawer";
import {
  listTrades,
  deleteTrade,
  type TradeRow,
} from "@/lib/trades.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trades")({
  component: TradesPage,
});

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

const percentage = (n: number) =>
  `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

function TradesPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<TradeRow | null>(null);
  const queryClient = useQueryClient();

  const fetchTrades = useServerFn(listTrades);
  const deleteTradesFn = useServerFn(deleteTrade);

  const query = useQuery({
    queryKey: ["trades"],
    queryFn: () => fetchTrades(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTradesFn({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast.success("Trade deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete trade: ${error.message}`);
    },
  });

  const trades = query.data ?? [];
  const filteredTrades = useMemo(() => {
    if (filterStatus === "all") return trades;
    return trades.filter((t) => t.status === filterStatus);
  }, [trades, filterStatus]);

  const stats = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === "closed");
    const wins = closedTrades.filter((t) => (t.profit_loss ?? 0) > 0).length;
    const losses = closedTrades.filter((t) => (t.profit_loss ?? 0) < 0).length;
    const totalPnl = trades.reduce((sum, t) => sum + (t.profit_loss ?? 0), 0);
    const winRate =
      closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;

    return { wins, losses, totalPnl, winRate, total: trades.length };
  }, [trades]);

  const handleEdit = (trade: TradeRow) => {
    setEditingTrade(trade);
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setEditingTrade(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["trades"] });
    handleClose();
    toast.success(editingTrade ? "Trade updated" : "Trade added");
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-h1 text-text-primary mb-2">Trading Records</h1>
        <p className="text-text-muted">Track and analyze all your trades</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="Total Trades"
          value={stats.total}
          icon={<IconChartLine className="w-5 h-5" />}
        />
        <MetricCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={<IconChartLine className="w-5 h-5" />}
        />
        <MetricCard
          title="Wins"
          value={stats.wins}
          delta={stats.wins}
          icon={<IconChartLine className="w-5 h-5" />}
        />
        <MetricCard
          title="Losses"
          value={stats.losses}
          delta={-stats.losses}
          icon={<IconChartLine className="w-5 h-5" />}
        />
        <MetricCard
          title="Total P&L"
          value={currency(stats.totalPnl)}
          delta={stats.totalPnl}
          icon={<IconChartLine className="w-5 h-5" />}
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <IconFilter className="w-4 h-4 text-text-muted" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="gap-2"
        >
          <IconPlus className="w-4 h-4" />
          New Trade
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border-primary bg-surface-secondary overflow-hidden">
        {query.isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <IconChartLine className="w-12 h-12 text-text-muted mb-4" />
            <p className="text-text-muted text-sm">No trades recorded yet</p>
            <Button
              variant="outline"
              onClick={() => setIsDrawerOpen(true)}
              className="mt-4"
            >
              Record Your First Trade
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        trade.trade_type === "long"
                          ? "bg-accent-success-wash text-accent-success-light"
                          : "bg-accent-danger-wash text-accent-danger-light"
                      )}
                    >
                      {trade.trade_type.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{currency(trade.entry_price)}</TableCell>
                  <TableCell>
                    {trade.exit_price ? currency(trade.exit_price) : "-"}
                  </TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell>
                    {trade.profit_loss ? currency(trade.profit_loss) : "-"}
                  </TableCell>
                  <TableCell>
                    {trade.roi_percentage ? (
                      <span
                        className={cn(
                          trade.roi_percentage > 0
                            ? "text-accent-success-light"
                            : "text-accent-danger-light"
                        )}
                      >
                        {percentage(trade.roi_percentage)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        trade.status === "open"
                          ? "bg-accent-warning-wash text-accent-warning-light"
                          : "bg-accent-success-wash text-accent-success-light"
                      )}
                    >
                      {trade.status.charAt(0).toUpperCase() +
                        trade.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(trade)}
                        className="p-1 hover:bg-surface-tertiary rounded"
                      >
                        <IconPencil className="w-4 h-4 text-text-muted" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(trade.id)}
                        className="p-1 hover:bg-surface-tertiary rounded"
                      >
                        <IconTrash className="w-4 h-4 text-accent-danger-light" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <TradeFormDrawer
        isOpen={isDrawerOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        trade={editingTrade}
      />
    </div>
  );
}
