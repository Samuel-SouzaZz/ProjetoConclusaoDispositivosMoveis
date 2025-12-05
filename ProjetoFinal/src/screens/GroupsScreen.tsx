import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

type Group = {
  id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  members?: any[];
  membersCount?: number;
  createdAt?: string;
  ownerId?: string;
};

export default function GroupsScreen() {
  const { colors, isDarkMode, commonStyles } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const isSmallScreen = width < 380;
  const isWideScreen = width >= 900;

  const [tab, setTab] = useState<'public' | 'mine'>('public');
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPublic, setNewGroupPublic] = useState(true);

  async function loadData(initial = false) {
    try {
      if (initial) setLoading(true);
      const [allRes, mineRes] = await Promise.all([
        ApiService.getGroups(),
        ApiService.getMyGroups(),
      ]);
      setPublicGroups(Array.isArray(allRes?.items) ? allRes.items : (Array.isArray(allRes) ? allRes : []));
      setMyGroups(Array.isArray(mineRes?.items) ? mineRes.items : (Array.isArray(mineRes) ? mineRes : []));
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar os grupos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData(true);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Quando a tela volta a ganhar foco (por exemplo, após editar um grupo), recarrega os dados
      loadData();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    try {
      setLoading(true);
      await ApiService.createGroup({
        name: newGroupName.trim(),
        description: newGroupDesc.trim() || undefined,
        isPublic: newGroupPublic,
      });
      setCreateOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupPublic(true);
      await loadData();
      setTab('mine');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível criar o grupo');
    } finally {
      setLoading(false);
    }
  }

  function formatCreatedInfo(createdAt?: string) {
    if (!createdAt) return '';
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - createdDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) return 'Criado hoje';
    if (diffDays === 1) return 'Criado há 1 dia';
    return `Criado há ${diffDays} dias`;
  }

  function renderGroupItem({ item }: { item: Group }) {
    const memberCount = (item as any).memberCount ?? item.membersCount ?? (Array.isArray(item.members) ? item.members.length : 0);
    const createdInfo = formatCreatedInfo(item.createdAt);
    const isMineTab = tab === 'mine';
    const isOwner = isMineTab && user?.id && item.ownerId && String(item.ownerId) === String(user.id);

    const isPublicGroup: boolean =
      typeof item.isPublic === 'boolean'
        ? item.isPublic
        : (item as any).public ?? ((item as any).visibility === 'PUBLIC');

    let isMember = isMineTab;
    if (!isMember && user?.id && Array.isArray(item.members)) {
      isMember = item.members.some((m: any) => {
        const mid = m?.id ?? m?.userId ?? m?.user?.id;
        return mid && String(mid) === String(user.id);
      });
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? '#020617' : colors.card,
          borderRadius: 18,
          paddingVertical: 18,
          paddingHorizontal: 18,
          marginBottom: 16,
          marginHorizontal: isWideScreen ? 8 : 0,
          borderWidth: 1,
          borderColor: isDarkMode ? '#1f2937' : '#e5e7eb',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, columnGap: 8, rowGap: 8, flexWrap: 'wrap' }}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: isPublicGroup ? '#1d4ed8' : '#b91c1c',
            }}
          >
            <Text style={{ color: '#E5E7EB', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>
              {isPublicGroup ? 'Grupo Público' : 'Grupo Privado'}
            </Text>
          </View>

          {isOwner && (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: '#b91c1c',
              }}
            >
              <Text style={{ color: '#FEE2E2', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>Dono</Text>
            </View>
          )}
        </View>

        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{item.name}</Text>

        {item.description ? (
          <Text style={{ color: colors.textSecondary, marginTop: 6 }}>{item.description}</Text>
        ) : null}

        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: item.description ? 10 : 6 }}>
          {'•'} {createdInfo}
          {memberCount != null && ` • ${memberCount} ${memberCount === 1 ? 'Membro' : 'Membros'}`}
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: isDarkMode ? '#111827' : '#E5E7EB',
            marginTop: 12,
          }}
        />

        <View style={{ flexDirection: isSmallScreen ? 'column' : 'row', marginTop: 4 }}>
          <TouchableOpacity
            onPress={() => {
              (navigation as any).navigate('GroupDetails', { groupId: String(item.id) });
            }}
            style={{
              minHeight: 44,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
              backgroundColor: isDarkMode ? 'transparent' : '#F9FAFB',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              ...(isSmallScreen ? { marginBottom: 8 } : { marginRight: 12 }),
              flexDirection: 'row',
              columnGap: 6,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '500' }}>Ver Detalhes</Text>
          </TouchableOpacity>

          {isMember ? (
            <View
              style={{
                minHeight: 44,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
                backgroundColor: '#16a34a',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                columnGap: 8,
              }}
            >
              <Ionicons name="checkmark" size={16} color="#ECFDF3" />
              <Text style={{ color: '#ECFDF3', fontWeight: '600' }}>Membro</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={async () => {
                try {
                  await ApiService.joinGroup(item.id);
                  await loadData();
                  // (navigation as any).navigate('GroupDetails', { groupId: String(item.id) });
                } catch (err) {
                  Alert.alert('Erro', 'Não foi possível entrar no grupo');
                }
              }}
              style={{
                minHeight: 44,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
                backgroundColor: colors.primary,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                columnGap: 6,
              }}
            >
              <Text style={{ color: isDarkMode ? '#1A1A1A' : '#fff', fontWeight: '600' }}>Acessar</Text>
              <Ionicons name="arrow-forward" size={16} color={isDarkMode ? '#1A1A1A' : '#fff'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const data = tab === 'public' ? publicGroups : myGroups;

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{'{'} Grupos de Estudo {'}'}</Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setTab('public')}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: tab === 'public' ? colors.primary : (isDarkMode ? '#2A2A2A' : '#EFEFEF'),
            }}
          >
            <Text style={{ color: tab === 'public' ? (isDarkMode ? '#1A1A1A' : '#fff') : colors.text }}>Grupos Públicos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('mine')}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: tab === 'mine' ? colors.primary : (isDarkMode ? '#2A2A2A' : '#EFEFEF'),
            }}
          >
            <Text style={{ color: tab === 'mine' ? (isDarkMode ? '#1A1A1A' : '#fff') : colors.text }}>Meus Grupos</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            onPress={() => setCreateOpen(true)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="add" size={20} color={isDarkMode ? '#1A1A1A' : '#fff'} />
            <Text style={{ color: isDarkMode ? '#1A1A1A' : '#fff', fontWeight: '600' }}>Criar Novo Grupo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={{ padding: 16 }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        numColumns={isWideScreen ? 2 : 1}
        columnWrapperStyle={isWideScreen ? { justifyContent: 'space-between' } : undefined}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        renderItem={renderGroupItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 16 }}>
              <Text style={{ color: colors.textSecondary }}>
                {tab === 'public' ? 'Nenhum grupo público encontrado.' : 'Você ainda não participa de nenhum grupo.'}
              </Text>
            </View>
          ) : null
        }
      />

      <Modal visible={createOpen} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Criar novo grupo</Text>

            <Text style={{ color: colors.text, marginBottom: 6 }}>Nome</Text>
            <TextInput
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Nome do grupo"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.text,
                backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
                marginBottom: 10,
              }}
            />

            <Text style={{ color: colors.text, marginBottom: 6 }}>Descrição (opcional)</Text>
            <TextInput
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
              placeholder="Breve descrição"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.text,
                backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
                marginBottom: 10,
              }}
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setNewGroupPublic(true)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: newGroupPublic ? colors.primary : (isDarkMode ? '#2A2A2A' : '#EFEFEF'),
                }}
              >
                <Text style={{ color: newGroupPublic ? (isDarkMode ? '#1A1A1A' : '#fff') : colors.text }}>Público</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewGroupPublic(false)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: !newGroupPublic ? colors.primary : (isDarkMode ? '#2A2A2A' : '#EFEFEF'),
                }}
              >
                <Text style={{ color: !newGroupPublic ? (isDarkMode ? '#1A1A1A' : '#fff') : colors.text }}>Privado</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: isSmallScreen ? 'column' : 'row', marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setCreateOpen(false)}
                style={{
                  minHeight: 44,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#EFEFEF',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...(isSmallScreen ? { marginBottom: 8 } : { marginRight: 12 }),
                }}
              >
                <Text style={{ color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateGroup}
                style={{
                  minHeight: 44,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: isDarkMode ? '#1A1A1A' : '#fff', fontWeight: '600' }}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}