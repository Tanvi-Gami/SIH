import { LoadingState, ErrorState, EmptyState } from './States';

/**
 * Wraps a useAsync() result and renders the right state automatically:
 * loading -> error -> empty -> children(data). Keeps every page's data
 * fetching boilerplate down to one place.
 */
export default function DataState({ loading, error, data, onRetry, isEmpty, empty, children }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  const empty_ = isEmpty ? isEmpty(data) : !data || (Array.isArray(data) && data.length === 0);
  if (empty_) return empty || <EmptyState title="Nothing here yet" />;
  return children(data);
}
