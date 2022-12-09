# Garage Door Web App

### What does it do?

This project is meant to serve as a web-based garage door system hosted on a home webserver on a raspberry pi.
This will allow home-owners to have habitants, family friends, and guests to create personalized accounts and have different ranges of access to the door.
Here is an example of how different access levels might function:

1. Family - has access to control the garage door 24/7
2. Family friends - has access to control the garage door between the hours of 8 a.m - 8 p.m. on weekends only
3. Petsitter - has access to control the garage door for the 2 weeks they are petsitting

### What are the advantages?

- Home Security - No need to panic after leaving the house wondering if the garage door was left open. Sensors accurately determine and let authorized users know if the garage door is open
- Access is delegated on an as-needed basis, granting and limiting access to the system to only those who need it and only when they need it
- Decentralized - Since each system is it's own webserver meaining no central server can leak information for all of its' users

### Future Work

- Allowing multiple garage doors connected to one system
- Android/iOS app with push notifications
- Self-updating so new deployments can be installed to all systems easily

## Running Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
