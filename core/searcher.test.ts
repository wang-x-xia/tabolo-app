import {expect, test} from "vitest";
import type {GraphResource} from "./graph.ts";
import {
    checkGraphResource,
    emptySearcher,
    matchAllSearcher,
    matchAnySearcher,
    notSearcher,
    propertySearcher,
    typeSearcher
} from "./searcher.ts";

const resource: GraphResource = {
    id: "id",
    type: "type",
    properties: {
        key1: "value1",
    }
}

test("Test Common Resource Checker", () => {
    function internalChecker(): boolean {
        expect.unreachable("Never hit additional checker in this test")
    }

    expect(checkGraphResource(resource, emptySearcher(), internalChecker),
        "Empty")
        .toBeTruthy()
    expect(checkGraphResource(resource, typeSearcher("type"), internalChecker),
        "Matched type")
        .toBeTruthy()
    expect(checkGraphResource(resource, typeSearcher("another type"), internalChecker),
        "Unmatched type")
        .toBeFalsy()
    expect(checkGraphResource(resource, propertySearcher("$.key1", "value1"), internalChecker),
        "Matched property")
        .toBeTruthy()
    expect(checkGraphResource(resource, propertySearcher("$.key1", "value2"), internalChecker),
        "Unmatched property")
        .toBeFalsy()
})

test("Test Logic Resource Checker", () => {
    function internalChecker(): boolean {
        expect.unreachable("Never hit additional checker in this test")
    }

    expect(checkGraphResource(resource, notSearcher(emptySearcher()), internalChecker),
        "! True")
        .toBeFalsy()

    expect(checkGraphResource(resource, matchAllSearcher([
            emptySearcher(),
            notSearcher(emptySearcher()),
        ]), internalChecker),
        "True and False")
        .toBeFalsy()

    expect(checkGraphResource(resource, matchAllSearcher([
            emptySearcher(),
            emptySearcher(),
        ]), internalChecker),
        "True and True")
        .toBeTruthy()

    expect(checkGraphResource(resource, matchAnySearcher([
            emptySearcher(),
            notSearcher(emptySearcher()),
        ]), internalChecker),
        "True or False")
        .toBeTruthy()

    expect(checkGraphResource(resource, matchAnySearcher([
            notSearcher(emptySearcher()),
            notSearcher(emptySearcher()),
        ]), internalChecker),
        "False or False")
        .toBeFalsy()

})
