import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import { useTranslation } from 'react-i18next';

const client = new ApolloClient({
  uri: 'https://rickandmortyapi.com/graphql',
  cache: new InMemoryCache(),
});

const GET_CHARACTERS = gql`
  query GetCharacters($page: Int, $status: String, $species: String) {
    characters(page: $page, filter: { status: $status, species: $species }) {
      info {
        next
      }
      results {
        id
        name
        status
        species
        gender
        origin {
          name
        }
      }
    }
  }
`;

function CharacterList() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [species, setSpecies] = useState('');
  const [sortBy, setSortBy] = useState(''); 
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [characters, setCharacters] = useState([]);

  const { loading, error, data, refetch } = useQuery(GET_CHARACTERS, {
    variables: { page, status, species },
  });

  useEffect(() => {
    if (data) {
      let newCharacters = [...data.characters.results];
      if (sortBy === 'name') {
        newCharacters.sort((a, b) => {
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        });
      } else if (sortBy === 'origin') {
        newCharacters.sort((a, b) => {
          return sortOrder === 'asc'
            ? a.origin.name.localeCompare(b.origin.name)
            : b.origin.name.localeCompare(a.origin.name);
        });
      }
      setCharacters((prev) => (page === 1 ? newCharacters : [...prev, ...newCharacters]));
    }
  }, [data, sortBy, sortOrder, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 50 &&
        !loading &&
        data?.characters.info.next
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, data]);

  useEffect(() => {
    setCharacters([]);
    setPage(1);
    refetch({ page: 1, status, species });
  }, [status, species, refetch]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSpeciesChange = (e) => {
    setSpecies(e.target.value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortOrder('asc');
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const translateField = (key, value) => {
    const normalizedValue = value.toLowerCase();
    return t(normalizedValue);
  };

  if (error) {
    console.error("GraphQL Error:", error);
    return (
      <div className="text-center my-4">
        <p className="text-red-500">{t('error')}: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {t('title')}
          </h1>
          <div className="space-x-2">
            <button
              onClick={() => changeLanguage('en')}
              className="p-1 bg-blue-800 rounded hover:bg-blue-900 transition-colors"
              title={t('english')}
            >
              <img src="/flags/uk.png" alt="UK Flag" className="w-6 h-6" />
            </button>
            <button
              onClick={() => changeLanguage('de')}
              className="p-1 bg-blue-800 rounded hover:bg-blue-900 transition-colors"
              title={t('german')}
            >
              <img src="/flags/de.png" alt="German Flag" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="mb-6 space-y-4 md:space-y-0 md:flex md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('status')}
            </label>
            <select
              onChange={handleStatusChange}
              value={status}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">{t('filterStatus')}</option>
              <option value="Alive">{t('alive')}</option>
              <option value="Dead">{t('dead')}</option>
              <option value="unknown">{t('unknown')}</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('species')}
            </label>
            <select
              onChange={handleSpeciesChange}
              value={species}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">{t('filterSpecies')}</option>
              <option value="Human">{t('human')}</option>
              <option value="Alien">{t('alien')}</option>
              <option value="Humanoid">{t('humanoid')}</option>
              <option value="Robot">{t('robot')}</option>
              <option value="Cronenberg">{t('cronenberg')}</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('SortBy')}
            </label>
            <select
              onChange={handleSortChange}
              value={sortBy}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">{t('Sort')}</option>
              <option value="name">{t('Name')}</option>
              <option value="origin">{t('Origin')}</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-3 text-left">{t('name')}</th>
                <th className="p-3 text-left">{t('status')}</th>
                <th className="p-3 text-left">{t('species')}</th>
                <th className="p-3 text-left">{t('gender')}</th>
                <th className="p-3 text-left">{t('origin')}</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((character) => (
                <tr
                  key={character.id}
                  className="even:bg-gray-50 odd:bg-white hover:bg-blue-50 transition-colors border-b"
                >
                  <td className="p-3">{character.name}</td>
                  <td className="p-3">{translateField('status', character.status)}</td>
                  <td className="p-3">{translateField('species', character.species)}</td>
                  <td className="p-3">{translateField('gender', character.gender)}</td>
                  <td className="p-3">{character.origin.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <p className="text-center my-4 text-blue-600 animate-pulse">
            {t('loading')}
          </p>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <CharacterList />
    </ApolloProvider>
  );
}