import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { Appbar, Card, Text, Avatar, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

export interface RepositorioGithub {
  id: number;
  nome: string;
  linguagens: string | null;
  estrelas: number;
  owner: {
    nomeUsuario: string;
    id: number;
    tipoDeConta: string;
    avatar_url: string;
  };
}

const CHAVE_ARMAZENAMENTO = '@github_repos';

export default function TelaInicial() {
  const [repositorios, setRepositorios] = useState<RepositorioGithub[]>([]);
  const roteador = useRouter();

  useFocusEffect(
    useCallback(() => {
      carregarRepositorios();
    }, [])
  );

  const carregarRepositorios = async (): Promise<void> => {
    try {
      const dadosSalvos = await AsyncStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (dadosSalvos) {
        setRepositorios(JSON.parse(dadosSalvos) as RepositorioGithub[]);
      } else {
        setRepositorios([]);
      }
    } catch (erro) {
      console.error('ops! ocorreu um erro' + erro);
    }
  };

  const limparRepositorios = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CHAVE_ARMAZENAMENTO);
      setRepositorios([]);
    } catch (erro) {
      console.error('ops! ocorreu um erro ' + erro);
    }
  };

  const renderizarItem: ListRenderItem<RepositorioGithub> = ({ item }) => (
    <Card style={estilos.cartao} mode="elevated">
      <Card.Title
        title={item.nome}
        subtitle={`Dono: ${item.owner?.nomeUsuario ?? 'Desconhecido'}`}
        left={(propriedades) => (
          <Avatar.Image
            {...propriedades}
            source={{ uri: item.owner?.avatar_url }}
          />
        )}
      />
      <Card.Content>
        <Text variant="titleSmall" style={estilos.tituloSecao}>
          Dados do Repositório
        </Text>
        <Text variant="bodyMedium"> Nome: {item.nome}</Text>
        <Text variant="bodyMedium">
           Linguagem: {item.linguagens ?? 'Não especificada'}
        </Text>
        <Text variant="bodyMedium"> Estrelas: {item.estrelas}</Text>

        <Divider style={estilos.divisor} />

        <Text variant="titleSmall" style={estilos.tituloSecao}>
          Dados do Dono
        </Text>
        <Text variant="bodyMedium"> Nome: {item.owner?.nomeUsuario}</Text>
        <Text variant="bodyMedium">ID do Usuário: {item.owner?.id}</Text>
        <Text variant="bodyMedium">Tipo de Conta: {item.owner?.tipoDeConta}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={estilos.container}>
      <Appbar.Header elevated>
        <Appbar.Content title="Meus Repositórios" />
        <Appbar.Action icon="minus" onPress={limparRepositorios} />
        <Appbar.Action
          icon="plus"
          onPress={() => roteador.push('/adicionar')}
        />
      </Appbar.Header>

      <FlatList
        data={repositorios}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderizarItem}
        contentContainerStyle={estilos.conteudoLista}
        ListEmptyComponent={
          <Text variant="bodyLarge" style={estilos.textoVazio}>
            Nenhum repositório salvo. Clique no "+" para adicionar.
          </Text>
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  conteudoLista: {
    padding: 16,
  },
  cartao: {
    marginBottom: 16,
  },
  tituloSecao: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 4,
  },
  divisor: {
    marginVertical: 10,
  },
  textoVazio: {
    textAlign: 'center',
    marginTop: 48,
    color: '#666',
  },
});