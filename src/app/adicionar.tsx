import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Appbar, TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import type { RepositorioGithub } from './index';

const CHAVE_ARMAZENAMENTO = '@github_repos';

export default function TelaAdicionar() {
  const [idDono, setIdDono] = useState<string>('');
  const [idRepositorio, setIdRepositorio] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const roteador = useRouter();

  const buscarDados = () => {
    if (!idDono || !idRepositorio) {
      Alert.alert('Atenção', 'Preencha o ownerid e o repoid.');
      return;
    }

    setCarregando(true);

    axios
      .get(`https://api.github.com/repos/${idDono}/${idRepositorio}`)
      .then(async (resposta) => { const dadosApi = resposta.data;

        const novoRepositorio: RepositorioGithub = {
          id: dadosApi.id,
          nome: dadosApi.name,
          linguagens: dadosApi.language ?? 'Não especificada',
          estrelas: dadosApi.stargazers_count ?? 0,
          owner: {
            nomeUsuario: dadosApi.owner.login,
            id: dadosApi.owner.id,
            tipoDeConta: dadosApi.owner.type,
            avatar_url: dadosApi.owner.avatar_url,
          },
        };

        const imagem = novoRepositorio.owner.avatar_url;
        const titulo = novoRepositorio.nome;
        const conteudo = novoRepositorio.linguagens;

        // POST
        await axios.post('https://jsonplaceholder.typicode.com/posts', { imagem, titulo, conteudo, }).catch((erroPost) => {
            console.error('ops! ocorreu um erro' + erroPost);
          });

        const dadosSalvos = await AsyncStorage.getItem(CHAVE_ARMAZENAMENTO);
        const listaAtual: RepositorioGithub[] = dadosSalvos ? JSON.parse(dadosSalvos) : [];

        const jaExiste = listaAtual.some( (item) => item.id === novoRepositorio.id);

        if (jaExiste) {
          Alert.alert('Aviso', 'Este repositório já foi adicionado.');
          setCarregando(false);
          return;
        }

        const novaLista = [...listaAtual, novoRepositorio];
        await AsyncStorage.setItem(
          CHAVE_ARMAZENAMENTO,
          JSON.stringify(novaLista)
        );

        setCarregando(false);
        roteador.back();
      })
      .catch((erro) => {
        setCarregando(false);
        Alert.alert('Erro', 'Repositório não encontrado');
      });
  };

  return (
    <View style={estilos.container}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => roteador.back()} />
        <Appbar.Content title="Adicionar Repositório" />
      </Appbar.Header>

      <View style={estilos.formulario}>
        <TextInput
          label="ownerid "
          value={idDono}
          onChangeText={setIdDono}
          mode="outlined"
          autoCapitalize="none"
          style={estilos.campo}
          textColor="#000"
        />

        <TextInput
          label="repoid"
          value={idRepositorio}
          onChangeText={setIdRepositorio}
          mode="outlined"
          autoCapitalize="none"
          style={estilos.campo}
          textColor="#000"
        />

        <View style={estilos.botoes}>
          <Button mode="contained" onPress={() => roteador.back()} style={[estilos.botao, estilos.vermelho]} disabled={carregando}>
            Cancelar
          </Button>
          <Button mode="contained" onPress={buscarDados} loading={carregando} disabled={carregando} style={[estilos.botao, estilos.verde]}>
            Adicionar
          </Button>
        </View>

      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  formulario: { padding: 16 },
  campo: { marginBottom: 16, backgroundColor: '#FFFFFF' },
  botoes: { flexDirection: 'row', gap: 12, marginTop: 8 },
  botao: { flex: 1, borderRadius: 8 },
  verde: { backgroundColor: '#16A34A' },
  vermelho: { backgroundColor: '#DC2626' },
});