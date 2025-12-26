import { gql } from "@apollo/client";

export const GET_DASHBOARD_CAFES = gql`
  query GetDashboardCafes {
    # 1. Fetch ALL cafes (Newest first)
    cafes(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        status
        date
      }
    }
    # 2. Get User Info
    viewer {
      id
      name
    }
  }
`;
