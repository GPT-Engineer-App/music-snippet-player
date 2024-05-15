import React, { useState } from 'react';
import { Box, Input, Button, VStack, Text, Image } from '@chakra-ui/react';
import { create } from 'lib/openai';

const Index = () => {
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const generateQuery = async () => {
    try {
      const response = await create({
        messages: [{ role: 'system', content: 'you must take user input and only output a search query for relevant song(s) on spotify' }, { role: 'user', content: description }],
        model: 'gpt-4o'
      });
      const generatedQuery = response.choices[0].message.content;
      setQuery(generatedQuery);
      searchSongs(generatedQuery);
    } catch (err) {
      setError('Failed to generate search query. Please try again.');
      console.error(err);
    }
  };

  const searchSongs = async (searchQuery) => {
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

      const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track`, {
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
          placeholder="Describe the song"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={generateQuery}>Generate Query and Search</Button>
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