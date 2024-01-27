import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  Image,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { generateClient } from "aws-amplify/api"; 

import { Amplify } from 'aws-amplify';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: 'https://ev3ceefgmfdmfd7vol3za5edkm.appsync-api.us-east-1.amazonaws.com/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'apiKey',
      apiKey: 'da2-5baber2c65g6rfry2vp5h4p2fq'
    }
  }
});

const client = generateClient();

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await Storage.get(note.name);
          note.image = url;
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  // async function fetchNotes() {
  //   const apiData = await client.graphql({ query: listNotes });
  //   const notesFromAPI = apiData.data.listNotes.items;
  //   setNotes(notesFromAPI);
  // }

  // async function fetchNotes() {
  //   try {
  //     const apiData = await client.graphql({ query: listNotes });
  //     const notesFromAPI = apiData.data.listNotes.items;
  //     setNotes(notesFromAPI);
  //   } catch (error) {
  //     console.error('Error fetching notes:', error);
  //     console.log(error); // This should log the complete error object
  //   }
  // }
  
  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
    };
    if (!!data.image) await Storage.put(data.name, image);
    await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }
  
  // async function createNote(event) {
  //   event.preventDefault();
  //   const form = new FormData(event.target);
  //   const data = {
  //     name: form.get("name"),
  //     description: form.get("description"),
  //   };
  //   await client.graphql({
  //     query: createNoteMutation,
  //     variables: { input: data },
  //   });
  //   fetchNotes();
  //   event.target.reset();
  // }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await Storage.remove(name);
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  } 
  // async function deleteNote({ id }) {
  //   const newNotes = notes.filter((note) => note.id !== id);
  //   setNotes(newNotes);
  //   await client.graphql({
  //     query: deleteNoteMutation,
  //     variables: { input: { id } },
  //   });
  // }

  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
        <View
        name="image"
        as="input"
        type="file"
        style={{ alignSelf: "end" }}
        />
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Notes</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            {note.image && (
              <Image
                src={note.image}
                alt={`visual aid for ${notes.name}`}
                style={{ width: 400 }}
              />
            )}
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);

// ---------------------------------------------------------------------------

// // From: https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/module-two/?e=gs2020&p=build-a-react-app
// import React, { useState, useEffect } from "react";
// import "./App.css";
// import "@aws-amplify/ui-react/styles.css";
// import { uploadData, getUrl, remove } from 'aws-amplify/storage';
// import {
//   Button,
//   Flex,
//   Heading,
//   Image,
//   Text,
//   TextField,
//   View,
//   withAuthenticator,
// } from "@aws-amplify/ui-react";
// import { listNotes } from "./graphql/queries";
// import {
//   createNote as createNoteMutation,
//   deleteNote as deleteNoteMutation,
// } from "./graphql/mutations";

// // From ChatGPT:
// import {Amplify} from 'aws-amplify';
// import awsExports from './aws-exports'; // The path may vary
// import { generateClient } from 'aws-amplify/api';

// Amplify.configure(awsExports);

// const client = generateClient();

// const App = ({ signOut }) => {
//   const [notes, setNotes] = useState([]);

//   useEffect(() => {
//     fetchNotes();
//   }, []);

//   async function fetchNotes() {
//     const apiData = await client.graphql({ query: listNotes });
//     const notesFromAPI = apiData.data.listNotes.items;
//     await Promise.all(
//       notesFromAPI.map(async (note) => {
//         if (note.image) {
//           const url = await getUrl({key: note.id});
//           note.image = url;
//         } return note;
//       })
//     );
//     setNotes(notesFromAPI);
//   }

//   async function createNote(event) {
//     event.preventDefault();
//     const form = new FormData(event.target);
//     const image = form.get("image");
//     const data = {
//       name: form.get("name"),
//       description: form.get("description"),
//       image: image.name
//     };
//     const result=await client.graphql({
//       query: createNoteMutation,
//       variables: { input: data },
//     });
//     if (!!data.image) await uploadData({key:result.data.createNote.id, data:image}).result;
//     fetchNotes();
//     event.target.reset();
//   } 

//   async function deleteNote({ id, name }) {
//     const newNotes = notes.filter((note) => note.id !== id);
//     setNotes(newNotes);
//     await remove({key:id});
//     await client.graphql({
//       query: deleteNoteMutation,
//       variables: { input: { id } },
//     });
//   }

//   return (
//     <View className="App">
//       <Heading level={1}>My Notes App</Heading>
//       <View as="form" margin="3rem 0" onSubmit={createNote}>
//     	<Flex direction="row" justifyContent="center">
//           <TextField
//             name="name"
//             placeholder="Note Name"
//             label="Note Name"
//             labelHidden
//             variation="quiet"
//             required
//           />
//           <TextField
//             name="description"
//             placeholder="Note Description"
//             label="Note Description"
//             labelHidden
//             variation="quiet"
//             required
//           />
//           <View
//             name="image"
//             as="input"
//             type="file"
//             style={{ alignSelf: "end" }}
//           />
//           <Button type="submit" variation="primary">
//             Create Note
//           </Button>
//         </Flex>
//       </View>
//       <Heading level={2}>Current Notes</Heading>
//       <View margin="3rem 0">
//         {notes.map((note) => (
//         <Flex
//           key={note.id || note.name}
//           direction="row"
//           justifyContent="center"
//           alignItems="center"
//         >
//     	  <Text as="strong" fontWeight={700}>
//             {note.name}
//           </Text>
//           <Text as="span">{note.description}</Text>
//           {note.image && (
//             <Image
//               src={note.image.url.href}
//               alt={`visual aid for ${note.name}`}
//               style={{ width: 400 }}
//             />
//           )}
//           <Button variation="link" onClick={() => deleteNote(note)}>
//             Delete note
//           </Button>
//         </Flex>
//       ))}
//       </View>
//       <Button onClick={signOut}>Sign Out</Button>
//     </View>
//   );
// };

// export default withAuthenticator(App);

// -----------------------------------------------------------------

// import logo from "./logo.svg";
// import "@aws-amplify/ui-react/styles.css";
// import {
//   withAuthenticator,
//   Button,
//   Heading,
//   Image,
//   View,
//   Card,
// } from "@aws-amplify/ui-react";

// function App({ signOut }) {
//   return (
//     <View className="App">
//       <Card>
//         <Image src={logo} className="App-logo" alt="logo" />
//         <Heading level={1}>We now have Auth!</Heading>
//       </Card>
//       <Button onClick={signOut}>Sign Out</Button>
//     </View>
//   );
// }

// export default withAuthenticator(App);

// ---------------------------------------------------------------------------
