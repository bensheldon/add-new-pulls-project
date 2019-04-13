const { Toolkit } = require( 'actions-toolkit' );


Toolkit.run( async ( tools ) => {
  try {
    // Get the arguments
    const projectNumber = tools.arguments._[ 0 ];
    const columnName    = tools.arguments._[ 1 ];

    // Get the data from the event
    const pullrequestUrl   = tools.context.payload.pull_request.html_url;
    const pullrequestTitle = tools.context.payload.pull_request.title;
    const pullrequestId    = tools.context.payload.pull_request.node_id;

    // Get the project name and number, column ID and name
    const { resource } = await tools.github.graphql(`query {
      resource( url: "${ pullrequestUrl }" ) {
        ... on PullRequest {
          repository {
            projects( first: 10, states: [OPEN] ) {
              nodes {
                name
                number
                columns( first: 10 ) {
                  nodes {
                    id
                    name
                  }
                }
              }
            }
            owner {
              url
              ... on Organization {
                projects( first: 10, states: [OPEN] ) {
                  nodes {
                    name
                    number
                    columns( first: 10 ) {
                      nodes {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`);

    // Get the project from the matching provided number
    const project = resource.repository.projects.nodes
      .filter( node => node.number === projectNumber )[ 0 ];

    // Get the column from the matching provided column name
    const column = project.columns.nodes.filter( node => node.name === columnName )[ 0 ];
    const columnId = column.id;

    // Check we have a valid column ID
    if( !columnId || !project ) {
      tools.exit.failure(
        `Could not find project number "${ projectNumber }" or column "${ columnName }"`
      );
    }

    // Add the card to the project
    await tools.github.graphql(
      `mutation {
        addProjectCard( input: { contentId: "${ pullrequestId }", projectColumnId: "${ columnId }" }) {
          clientMutationId
        }
      }`
    );

    // Log success message
    tools.log.success(
      `Added pull request "${ pullrequestTitle }" to "${ project.name }" in "${ column.name }".`
    );
  }
  catch( error ){
    tools.exit.failure( error );
  }
}, {
  event: [ 'pull_request.opened' ],
  secrets: [ 'GITHUB_TOKEN' ],
})
