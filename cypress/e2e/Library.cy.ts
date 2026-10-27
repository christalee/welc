import type { FlatFileData } from "../../src/utils";

describe("Library tab", () => {
  beforeEach(() => {
    // Clear table before testing
    cy.task("queryDb", "TRUNCATE music;");
    // Set the stage
    cy.visit("http://localhost:5174/");
    cy.get("[data-test='libraryTab']").click();
  });

  it("shows no files before the directory has been scanned", () => {
    cy.get("[data-test='libraryData']>thead")
      .should("exist")
      .should("not.be.empty");
    cy.get("[data-test='libraryData']>tbody")
      .should("exist")
      .should("be.empty");
  });

  it("shows files after the directory is scanned", () => {
    cy.get("[data-test='libraryData']>thead")
      .should("exist")
      .should("not.be.empty");
    cy.get("[data-test='libraryData']>tbody")
      .should("exist")
      .should("be.empty");

    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);

    const expectedHeader = ["", "Name", "Artist", "Album", "Year"];
    cy.get("[data-test='libraryData'] th").then((elements) => {
      const actualHeader = [...elements].map((th) => th.innerText.trim());
      expect(actualHeader).to.deep.equal(expectedHeader);
    });

    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 1")
      .should("exist");
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 2")
      .should("exist");
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 3")
      .should("exist");
  });

  it("shows no files after the directory has been scanned and cleared", () => {
    cy.get("[data-test='libraryData']>thead")
      .should("exist")
      .should("not.be.empty");
    cy.get("[data-test='libraryData']>tbody")
      .should("exist")
      .should("be.empty");

    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);

    const expectedHeader = ["", "Name", "Artist", "Album", "Year"];
    cy.get("[data-test='libraryData'] th").then((elements) => {
      const actualHeader = [...elements].map((th) => th.innerText.trim());
      expect(actualHeader).to.deep.equal(expectedHeader);
    });

    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 1")
      .should("exist");
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 2")
      .should("exist");
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 3")
      .should("exist");

    cy.get("[data-test='clearLibrary']").click();
    cy.wait(1000);

    cy.get("[data-test='libraryData']>table").should("not.exist");
  });

  it("displays the directory tree and shows/hides children upon clicking the expander", () => {
    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);

    // Assert top-level folder is visible
    cy.get("[data-test='libraryData']>tbody")
      .contains("mockDir")
      .should("exist");

    // Assert child files are not visible
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 4")
      .should("not.exist");
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 5")
      .should("not.exist");
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 6")
      .should("not.exist");

    cy.get("[data-test='expander']").click();

    // Assert top-level folder is visible
    cy.get("[data-test='libraryData']>tbody")
      .contains("mockDir")
      .should("exist");

    // Assert child files are visible
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 4")
      .should("exist");
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 5")
      .should("exist");
    cy.get("[data-test='libraryData']>tbody")
      .contains("Track 6")
      .should("exist");
  });

  it("sorts the entries by Name at the top level, asc/desc", () => {
    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);

    const expectedNamesAsc = ["Track 1", "Track 2", "Track 3", "mockDir"];
    cy.get("[data-test='nameCell']").then((cells) => {
      const actualNames = [...cells].map((cell) => cell.innerText.trim());
      expect(actualNames).to.deep.equal(expectedNamesAsc);
    });

    cy.get("[data-test='sorter']").click();

    const expectedNamesDesc = ["mockDir", "Track 3", "Track 2", "Track 1"];
    cy.get("[data-test='nameCell']").then((cells) => {
      const actualNames = [...cells].map((cell) => cell.innerText.trim());
      expect(actualNames).to.deep.equal(expectedNamesDesc);
    });
  });

  it("includes resize handles on the Name, Artist, and Album columns", () => {
    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);

    cy.get(
      "[data-test='libraryData'] [data-key='checkbox'] [data-test='resizer']",
    ).should("not.exist");
    cy.get(
      "[data-test='libraryData'] [data-key='name'] [data-test='resizer']",
    ).should("exist");
    cy.get(
      "[data-test='libraryData'] [data-key='artist'] [data-test='resizer']",
    ).should("exist");
    cy.get(
      "[data-test='libraryData'] [data-key='album'] [data-test='resizer']",
    ).should("exist");
    cy.get(
      "[data-test='libraryData'] [data-key='year'] [data-test='resizer']",
    ).should("not.exist");
  });

  it("rescans the given directory when directed", () => {
    const mockScan = (n: number) => {
      const results: FlatFileData[] = [];
      cy.env(["fixtures"]).then((env) => {
        for (let i = 1; i <= n; i++) {
          const row = {
            filepath: `file://${env["fixtures"]}/audio${i}.mp3`,
            metadata_json: { title: `Track ${i}` },
          };
          results.push(row);
        }
      });
      return results;
    };
    cy.intercept("/api/library", mockScan(3));
    let scanBtn = cy.get("[data-test='scanLibrary']");
    scanBtn.should("have.text", "Scan");
    scanBtn.click();
    cy.wait(1000);

    // After scanning, files should appear in order and
    // button text should change
    scanBtn = cy.get("[data-test='scanLibrary']");
    scanBtn.should("have.text", "Rescan");
    const expectedNames3 = ["Track 1", "Track 2", "Track 3"];
    cy.get("[data-test='nameCell']").then((cells) => {
      const actualNames = [...cells].map((cell) => cell.innerText.trim());
      expect(actualNames).to.deep.equal(expectedNames3);
    });

    // This time, return 4 files
    cy.intercept({ url: "/api/library", times: 1 }, mockScan(4));
    scanBtn.click();
    cy.wait(1000);

    const expectedNames4 = ["Track 1", "Track 2", "Track 3", "Track 4"];
    cy.get("[data-test='nameCell']").then((cells) => {
      const actualNames = [...cells].map((cell) => cell.innerText.trim());
      expect(actualNames).to.deep.equal(expectedNames4);
    });
  });

  it("filters the results based on input search term", () => {
    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);

    cy.get("[data-test='nameCell']").contains("Track 1").should("be.visible");
    cy.get("[data-test='nameCell']").contains("Track 2").should("be.visible");
    cy.get("[data-test='nameCell']").contains("mockDir").should("be.visible");

    // search term: 1 (should show Track 1 but not Track 2 or mockDir)
    const search = cy.get("[data-test='searchField']");
    search.type("1");

    cy.get("[data-test='nameCell']").contains("Track 1").should("be.visible");
    cy.get("[data-test='nameCell']").contains("Track 2").should("not.exist");
    cy.get("[data-test='nameCell']").contains("mockDir").should("not.exist");

    // search term: file (no results)
    search.clear();
    search.type("file://");

    cy.get("[data-test='libraryData']>tbody")
      .should("exist")
      .should("be.empty");

    // search term: fixtures (no results)
    search.clear();
    search.type("fixtures");

    cy.get("[data-test='libraryData']>tbody")
      .should("exist")
      .should("be.empty");
  });

  it("applies the search term after results change", () => {
    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);
    cy.get("[data-test='expander']").click();

    cy.get("[data-test='nameCell']").contains("Track 1").should("be.visible");
    cy.get("[data-test='nameCell']").contains("Track 4").should("be.visible");
    cy.get("[data-test='nameCell']").contains("Track 5").should("be.visible");
    cy.get("[data-test='nameCell']").contains("Track 6").should("be.visible");

    // search term: audio4 (should show Track 4)
    cy.get("[data-test='searchField']").type("4");

    cy.get("[data-test='nameCell']").contains("Track 1").should("not.exist");
    cy.get("[data-test='nameCell']").contains("Track 4").should("be.visible");
    cy.get("[data-test='nameCell']").contains("Track 5").should("not.exist");
    cy.get("[data-test='nameCell']").contains("Track 6").should("not.exist");

    // then input mockDir into libraryField
    cy.get("[data-test='libraryPathField']").type("mockDir");
    cy.wait(500);

    // should still show Track 4, not Track 5 or 6
    cy.get("[data-test='nameCell']").contains("Track 1").should("not.exist");
    cy.get("[data-test='nameCell']").contains("Track 4").should("be.visible");
    cy.get("[data-test='nameCell']").contains("Track 5").should("not.exist");
    cy.get("[data-test='nameCell']").contains("Track 6").should("not.exist");
  });
});
