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

  it("displays the directory tree and shows/hides children upon clicking the button", () => {
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

    const expectedNamesAsc = ["Track 1", "Track 2", "Track 3", 'mockDir'];
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
    cy.intercept("/api/library", { fixture: 'mockScan3.json'})
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
    cy.intercept({url: "/api/library", times: 1}, { fixture: 'mockScan4.json'})
    scanBtn.click();
    cy.wait(1000);

    const expectedNames4 = ["Track 1", "Track 2", "Track 3", "Track 4"];
    cy.get("[data-test='nameCell']").then((cells) => {
      const actualNames = [...cells].map((cell) => cell.innerText.trim());
      expect(actualNames).to.deep.equal(expectedNames4);
    });
  });
});
