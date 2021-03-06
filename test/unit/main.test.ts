import { assert } from "chai";
import { loop } from "../../src/main";
import { Game, Memory } from "./mock"

describe("main", function () {
    beforeEach(function () {
        // runs before each test in this block
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);
        // @ts-ignore : allow adding Memory to global
        global.Memory = _.clone(Memory);
    });

    it("should export a loop function", function () {
        assert.isTrue(typeof loop === "function");
    });

    it("should return void when called with no context", function () {
        assert.isUndefined(loop());
    });
});
