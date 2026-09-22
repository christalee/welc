describe("Library tab", () => {
  beforeEach(() => {
    // Clear table before testing
    cy.task("queryDb", "TRUNCATE music;");
  });

  it("shows no files before the directory has been scanned", () => {
    cy.visit("http://localhost:5174/");
    const libraryTab = cy.get("[data-test='libraryTab']");
    libraryTab.click();

    cy.get("[data-test='libraryData']").should("not.exist");

    const libraryPathField = cy.get("[data-test='libraryPathField']");
    libraryPathField.type(
      "/Users/christalee/Documents/software/projects/welc/cypress/fixtures",
    );

    cy.get("[data-test='libraryData']>thead")
      .should("exist")
      .should("not.be.empty");
    cy.get("[data-test='libraryData']>tbody")
      .should("exist")
      .should("be.empty");
  });

  it("shows files after the directory is scanned", () => {
    cy.visit("http://localhost:5174/");
    const libraryTab = cy.get("[data-test='libraryTab']");
    libraryTab.click();

    const libraryPathField = cy.get("[data-test='libraryPathField']");
    libraryPathField.type(
      "/Users/christalee/Documents/software/projects/welc/cypress/fixtures",
    );
    cy.get("[data-test='libraryData']>thead")
      .should("exist")
      .should("not.be.empty");
    cy.get("[data-test='libraryData']>tbody")
      .should("exist")
      .should("be.empty");

    const scanBtn = cy.get("[data-test='scanLibrary']");
    scanBtn.click();
    cy.wait(1000);

    const expectedHeader = ["", "Name", "Artist", "Album", "Year"];
    cy.get("[data-test='libraryData']>thead>tr>th").then((elements) => {
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
    cy.visit("http://localhost:5174/");
    const libraryTab = cy.get("[data-test='libraryTab']");
    libraryTab.click();

    const libraryPathField = cy.get("[data-test='libraryPathField']");
    libraryPathField.type(
      "/Users/christalee/Documents/software/projects/welc/cypress/fixtures",
    );
    cy.get("[data-test='libraryData']>thead")
      .should("exist")
      .should("not.be.empty");
    cy.get("[data-test='libraryData']>tbody")
      .should("exist")
      .should("be.empty");
    
    const scanBtn = cy.get("[data-test='scanLibrary']");
    scanBtn.click();
    cy.wait(1000);

    const expectedHeader = ["", "Name", "Artist", "Album", "Year"];
    cy.get("[data-test='libraryData']>thead>tr>th").then((elements) => {
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

    const clearBtn = cy.get("[data-test='clearLibrary']");
    clearBtn.click();
    cy.wait(1000);

    cy.get("[data-test='libraryData']>table").should("not.exist");
  });
});
