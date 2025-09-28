"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Activity, Eye } from "lucide-react"

interface TransactionSummaryProps {
  userStats?: {
    totalSpent: string
    totalEarned: string
    totalTransactions: number
    portfolioValue: string
    monthlyChange: string
    isPositive: boolean
  }
}

const defaultStats = {
  totalSpent: "12.4 ETH",
  totalEarned: "18.7 ETH",
  totalTransactions: 47,
  portfolioValue: "23.8 ETH",
  monthlyChange: "+15.2%",
  isPositive: true,
}

export function TransactionSummary({ userStats = defaultStats }: TransactionSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-slate-800/50 border-cyan-500/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Total Spent</CardTitle>
          <DollarSign className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{userStats.totalSpent}</div>
          <p className="text-xs text-slate-400">Lifetime purchases</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-green-500/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Total Earned</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{userStats.totalEarned}</div>
          <p className="text-xs text-slate-400">From sales & royalties</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Transactions</CardTitle>
          <Activity className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{userStats.totalTransactions}</div>
          <p className="text-xs text-slate-400">Total activities</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-orange-500/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Portfolio Value</CardTitle>
          <Eye className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{userStats.portfolioValue}</div>
          <div className={`flex items-center text-xs ${userStats.isPositive ? "text-green-400" : "text-red-400"}`}>
            {userStats.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {userStats.monthlyChange}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
