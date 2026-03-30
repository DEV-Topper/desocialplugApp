import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useGetTransactionsQuery } from '../../store/api/user.api';
import { ListFilter } from 'lucide-react-native';

export default function TransactionsScreen() {
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { data, isLoading, isFetching } = useGetTransactionsQuery(page);

  const transactions = data?.transactions || [];
  const pagination = data?.pagination;

  React.useEffect(() => {
    if (data) {
      setHasLoaded(true);
      if (page === 1) {
        setAllTransactions(transactions);
      } else {
        setAllTransactions((prev) => {
          const existingIds = new Set(prev.map((t: any) => t.id));
          const newItems = transactions.filter((t: any) => !existingIds.has(t.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [pagination?.hasNextPage, isFetching]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-GB', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'successful' || s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'failed') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-800';
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 flex-row justify-between items-center">
      <View className="flex-1 mr-2">
        <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{item.description || item.type || 'Transaction'}</Text>
        <Text className="text-gray-500 text-xs mt-1">Ref: {item.reference || item.id?.slice(0, 8)}</Text>
        <Text className="text-gray-400 text-xs mt-1">{formatDate(item.date)}</Text>
      </View>
      <View className="items-end">
        <Text className="font-bold text-gray-900 text-lg mb-1">₦{(item.amount || 0).toLocaleString()}</Text>
        <Text className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusStyle(item.status)}`}>
          {item.status || 'unknown'}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isFetching || allTransactions.length === 0) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading || !hasLoaded) return null;
    return (
      <View className="flex-1 items-center justify-center pt-20">
        <View className="bg-gray-100 p-6 rounded-full mb-4">
          <ListFilter size={48} className="text-gray-400" />
        </View>
        <Text className="text-gray-900 text-lg font-bold">No Transactions</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Transactions</Text>
          <Text className="text-gray-500 mt-1">All account activity.</Text>
        </View>
        {isFetching && allTransactions.length === 0 && <ActivityIndicator color="#2563EB" />}
      </View>

      {isLoading && !hasLoaded ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={allTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}
