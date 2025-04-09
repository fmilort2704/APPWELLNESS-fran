module.exports = {
  apps: [
    {
      name: "web-app",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        STRAPI_API_URL: "https://apwell-prod-5364e8216466.herokuapp.com",
        STRAPI_API_TOKEN: "4e48f1172f740d33f516e936a356efb905b013ed8b8544de7d485124e1d876bb2ac403cee239924d192d7bc823ff1d913639429da405cf3406c304dfbb8d07a89cb8a58b27c98e30e369d5c1d1bced3906a59500a4e37175207010b887240471519323174008ab43409b423904df78b7c818ffa30a183b37b9e2ef319c8f7d5f",
        DATABASE_URL: "postgres://udc9cc48v6715g:p2eb233a21695a433429a5df26e76ee06f2562f1e8408e8c695a6384f0c49f3c2@ec2-3-213-28-16.compute-1.amazonaws.com:5432/dbk5e5h1rui4i4"
      },
    },
  ],
};
