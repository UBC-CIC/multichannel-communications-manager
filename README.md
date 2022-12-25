# Multichannel Communications Manager

description

| Index                                               | Description                                             |
| :-------------------------------------------------- | :------------------------------------------------------ |
| [High Level Architecture](#high-level-architecture) | High level overview illustrating component interactions |
| [Deployment](#deployment-guide)                     | How to deploy the project                               |
| [User Guide](#user-guide)                           | The working solution                                    |
| [Files/Directories](#files-and-directories)         | Important files/directories in the project              |
| [Changelog](#changelog)                             | Any changes post publish                                |
| [Credits](#credits)                                 | Meet the team behind the solution                       |
| [License](#license)                                 | License details                                         |

# High Level Architecture

The following architecture diagram illustrates the various AWS components utliized to deliver the solution. For an in-depth explanation of the frontend and backend stacks, refer to the [Architecture Deep Dive](docs/ArchitectureDeepDive.md).

![alt text](docs/images/architecture-diagram.png)

# Deployment Guide

To deploy this solution, please follow the steps laid out in the [Deployment Guide](docs/DeploymentGuide.md)

# User Guide

For instructions on how to navigate the web app interface, refer to the [Web App User Guide](docs/UserGuide.md).

# Files And Directories

```text
.
├── amplify
├── docs/
│   ├── images/
│   ├── ArchitectureDeepDive.md
│   ├── DeploymentGuide.md
│   └── UserGuide.md
├── node_modules
├── public
├── sam
│   ├── events
│   ├── lambda_functions
│   └── template.yaml
├── src/
│   ├── actions
│   ├── components/
│   │   ├── Authentication/
│   │   ├── Dialog/
│   │   ├── subscribeToTopics/
│   │   ├── AdminTopicCard.js
│   │   ├── Navbar.js
│   │   ├── TopicCard.css
│   │   └── TopicCard.js
│   ├── graphql
│   ├── hooks
│   ├── pages/
│   │   ├── Admin.js
│   │   ├── EditAccountInfo.js
│   │   └── SubscribeToTopics.js
│   ├── reducers
│   ├── views
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── aws-exports.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   └── themes.js
├── .gitignore
├── .graphqlconfig.yml
├── amplify.yml
├── cfn-amplifyRole.yaml
├── package-lock.json
├── package.json
└── README.md
```

1. **`/docs`**: Contains all relevant documentation files
2. **`/sam`**: Contains all the backend code for the site
   1. **`/lambda_functions`**Contains the Lambda Functions for the project
      - graphQLMySQLResolver is the Lambda function that translates an AWS AppSync request into calls to the database and Pinpoint
3. **`/src`**: Contains all the source code for the site.
   1. **`/components`**: Reusable React components.
      - Components are organized into folders, with the folder names being the page name/functionality that the components within are used for
      - Components that are not in any subfolders:
        - AdminTopicCard.js: Used in Admin Dashboard to view category details
        - Navbar.js: Navigation bar for the application
        - TopicCard.js: Card component used on signup to view category details
   2. **`/graphql`**: Contains files for mutations, queries and the schema
   3. **`/hooks`**: Files for blocking user navigation
   4. **`/pages`**: Files for each individual page of the app
   5. **`/reducers`**: Reducers for Login and Signup authentication states
   6. **`/views`**: File for app routing
   7. **`/themes.js`**: Global styling for fonts. Note that most components have their own module-scoped styling.
# Changelog

To view the version history, please view the [Changelog](/CHANGELOG.md)

# Credits

This application was architected and developed by Christy Lam, Eric Liu and Minting Fu, with guidance from the UBC CIC technical and project management teams.

# License

This project is distributed under the [MIT License](LICENSE).