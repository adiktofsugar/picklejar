import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useMatches,
} from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { Header } from "@/features/header";
import type { ApolloClient } from "@apollo/client";

export const Route = createRootRouteWithContext<{
  client: ApolloClient;
  crumb: string;
}>()({
  component: Root,
  notFoundComponent: NotFound,
});

function Root() {
  const matches = useMatches();

  const breadcrumbs = matches
    .map(({ pathname, id, context, staticData }) => {
      return {
        id,
        title: staticData.crumb || context.crumb,
        path: pathname,
      };
    })
    .filter((bc) => bc.title);
  return (
    <>
      <header>
        <Header />
        <nav aria-label="breadcrumb">
          <ul>
            {breadcrumbs.map((bc) => (
              <li key={bc.id}>
                <Link to={bc.path} activeOptions={{ exact: true }}>
                  {bc.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function NotFound() {
  const { pathname } = useLocation();
  return (
    <div>
      <hgroup>
        <h1>Not found: {pathname}</h1>
        <p>Are you playing with the routes again?</p>
      </hgroup>
      <img
        src="/src/assets/pickle-scientist-examining-jar.jpg"
        alt="pickle scientist examining a jar"
      />
      <p>This is a good jar, I'm sure of it.</p>
    </div>
  );
}
