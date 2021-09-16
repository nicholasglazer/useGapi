//Source: https://github.com/nicholasglazer/useGapi
import { useEffect, useState } from 'react';
import useScript from './useScript';

export default function useGapi({
  apiKey,
  clientId,
  discoveryDocs = '',
  scope = 'https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email',
  cookiePolicy = 'single_host_origin',
  script_url = 'https://apis.google.com/js/api.js',
}) {
  if (!clientId) throw new Error("Please provide required fields: 'clientId'");
  if (!apiKey) throw new Error("Please provide required fields: 'apiKey'");

  const [client, setClient] = useState({undefined});
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Initial profile object
  const [profile, setProfile] = useState({
    auth: {
      tokenObj: undefined,
      tokenId: undefined,
      accessToken: undefined,
      scope: undefined,
      expiresAt: undefined,
    },
    p: {
      googleId: undefined,
      email: undefined,
      fullName: undefined,
      givenName: undefined,
      familyName: undefined,
      imageUrl: undefined,
    }
  });
  // status: "idle", "ready", "loading", "error"
  const status = useScript(script_url);
  if (status === "error") {
    console.warn("Google script can't be loaded");
    return;
  }
  // Create user profile with auth metadata.
  const createUserProfileObject = (currentUser) => {
    const user = currentUser || window.gapi.auth2.getAuthInstance().currentUser.get();
    const basicProfile = user.getBasicProfile();
    const auth = user.getAuthResponse();
    return {
      auth,
      p: {
        googleId: basicProfile.getId(),
        email: basicProfile.getEmail(),
        fullName: basicProfile.getName(),
        givenName: basicProfile.getGivenName(),
        familyName: basicProfile.getFamilyName(),
        imageUrl: basicProfile.getImageUrl(),
      }
    }
  }
  // Update sign-in status according to listener.
  const updateSigninStatus = (isUserSignedIn) => {
    if(isUserSignedIn) {
      setIsSignedIn(isSignedIn);
      const gProfile = createUserProfileObject();
      setProfile(gProfile);
    }
  }
  // Runs every time script status changes
  useEffect(() => {
    // Check if google script is ready.
    if (status === 'ready') {
      let listenerContext;
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey,
          clientId,
          discoveryDocs,
          scope,
        }).then(() => {
          setClient(window.gapi.client);
          const auth = window.gapi.auth2.getAuthInstance();
          listenerContext = auth.isSignedIn.listen(updateSigninStatus);
          // Handle the initial sign-in state.
          updateSigninStatus(auth.isSignedIn.get());
        })
      })
      return () => {
        // TODO change to listenerContext?.remove
        if (listenerContext.remove) listenerContext.remove();
      }
    }
    else {
      return;
    }
  }, [status])
  // Sign in function, accepting google options
  const signIn = async (options) => {
    try {
      const profileObject = await window.gapi.auth2.getAuthInstance().signIn(options);
      return createUserProfileObject(profileObject);
    } catch(err) {
      return err;
    }
  }
  // Sign out function
  const signOut = async () => {
    try {
      await window.gapi.auth2.getAuthInstance().signOut();
      window.gapi.auth2.disconnect();
      return false;
    } catch(err) {
      return err;
    }
  }

  return { signIn, signOut, isSignedIn, profile, client };
}
