import { useQuery } from "@apollo/client/react";
import type { ResultOf } from '@graphql-typed-document-node/core'
import { GetSourcesDocument } from "../../../generated/graphql";
import { Error } from "../../../shared/Error";
import { MouseEventHandler, useMemo } from "react";

export function SourceList() {
    const { data, error, loading } = useQuery(GetSourcesDocument);
    if (error) {
        return <Error message={error.message} />
    }
    if (loading) {
        return <p aria-busy="true">Loading...</p>
    }
    if (!data) {
        return null;
    }
    return <SourceListWithData data={data} />
}

function SourceListWithData({ data }: { data: ResultOf<typeof GetSourcesDocument> }) {
    const { sources } = data;
    const handleAddClick: MouseEventHandler = (event) => {
        event.preventDefault();
        alert("navigate to new sources page...")
    }
    const list = useMemo(() => {
        if (sources.length) {
            <ul>
                {sources.map(source => {
                    return (
                        <li key={source.id}>{source.name}</li>
                    )
                })}
            </ul>
        }
        return <article>No sources configured</article>
    }, [sources])

    return (
        <div>
            <p>
                Sources are where your media comes from.
                They need to be writable, too, so we can add the generated AI descriptions.
                Once added, we can scan them and start displaying your content.
            </p>
            {list}
            <button onClick={handleAddClick}>Add new source</button>
        </div>
    )
}