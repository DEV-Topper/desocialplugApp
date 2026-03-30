import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useGetTransactionsQuery } from '../../store/api/user.api';
import { ListFilter, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function TransactionsScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetTransactionsQuery(page);

  const transactions = data?.transactions || [];
  const pagination = data?.pagination;

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

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Transactions</Text>
          <Text className="text-gray-500 mt-1">All account activity.</Text>
        </View>
        {isFetching && <ActivityIndicator color="#2563EB" />}
      </View>

      {isLoading && transactions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : transactions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <View className="bg-gray-100 p-6 rounded-full mb-4">
            <ListFilter size={48} className="text-gray-400" />
          </View>
          <Text className="text-gray-900 text-lg font-bold">No Transactions</Text>
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-4"
          />

          {/* Pagination Footer */}
          {pagination && pagination.totalPages > 1 && (
            <View className="flex-row items-center justify-between mt-4 py-4 border-t border-gray-200">
              <TouchableOpacity 
                disabled={!pagination.hasPrevPage || isFetching}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                className={`p-2 rounded-lg flex-row items-center ${pagination.hasPrevPage && !isFetching ? 'bg-white border border-gray-300' : 'bg-gray-100 opacity-50'}`}
              >
                <ChevronLeft size={20} color={pagination.hasPrevPage ? '#374151' : '#9ca3af'} />
                <Text className={`font-medium ml-1 ${pagination.hasPrevPage ? 'text-gray-700' : 'text-gray-400'}`}>Prev</Text>
              </TouchableOpacity>
              
              <Text className="text-gray-600 font-medium">Page {page} of {pagination.totalPages}</Text>

              <TouchableOpacity 
                disabled={!pagination.hasNextPage || isFetching}
                onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className={`p-2 rounded-lg flex-row items-center ${pagination.hasNextPage && !isFetching ? 'bg-white border border-gray-300' : 'bg-gray-100 opacity-50'}`}
              >
                <Text className={`font-medium mr-1 ${pagination.hasNextPage ? 'text-gray-700' : 'text-gray-400'}`}>Next</Text>
                <ChevronRight size={20} color={pagination.hasNextPage ? '#374151' : '#9ca3af'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
