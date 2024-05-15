import React, { useState } from 'react';
import { Box, Input, Button, VStack, Text, Image } from '@chakra-ui/react';

const Index = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const searchSongs = async () => {
    setError('');
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa('4642e3fdf761477991140a71ec36597e:1f1ef85b93cc467290f77cdcca6b5cd1')
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      const token = data.access_token;

      const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const searchData = await searchResponse.json();
      setResults(searchData.tracks.items);
    } catch (err) {
      setError('Failed to fetch songs. Please try again.');
      console.error(err);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4}>
        <Input
          placeholder="Search for a song"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={searchSongs}>Search</Button>
        {error && <Text color="red.500">{error}</Text>}
        {results.map((track) => (
          <Box key={track.id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} width="100%">
            <Text fontWeight="bold">{track.name}</Text>
            <Text>{track.artists.map(artist => artist.name).join(', ')}</Text>
            <Image src={track.album.images[0]?.url} alt={track.name} boxSize="150px" />
            <audio controls>
              <source src={track.preview_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Index;