export function shouldLoadWKSpinner(search: string, isDev: boolean) {
  return (
    isDev || !new URLSearchParams(search).getAll("nowksprod").includes("1")
  );
}
