describe("App", () => {
  beforeEach(() => {
    // Clear table before testing
    cy.task("queryDb", "TRUNCATE music;");
    // Set the stage
    cy.visit("http://localhost:5174/");
    });
  
  it("should allow files to be played from the media library", () => {
    cy.get("[data-test='libraryTab']").click();
    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);
    cy.contains("Track 1").click();
    cy.get("[data-test='playSelection']").click();
    cy.wait(1000);
    
    cy.get("[data-test='audio']")
      .should("exist")
      .should("have.prop", "paused")
      .then((paused) => expect(paused).to.be.false);

    const expectedMetadata = [
      "Title: Track 1",
      "Artist: Lorem Ipsum",
      "Album: Dolor Sit Amet",
      "Track #: 1",
    ];
    cy.get("[data-test='metadata'] li").then((elements) => {
      const actualMetadata = [...elements].map((li) => li.innerText.trim());
      expect(actualMetadata).to.deep.equal(expectedMetadata);
    });
  });

  it("should play files queued from the media library after a file is enqueued via file picker", () => {
    // Add Track 1 via file picker (default playlist tab)
    // it should start playing immediately
    cy.get("[data-test='fileInput']").selectFile(
      "cypress/fixtures/audio1.mp3",
      { force: true },
    );

    // Add Track 2 via media library (library tab)
    cy.get("[data-test='libraryTab']").click();
    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);
    cy.contains("Track 2").click();
    cy.get("[data-test='playSelection']").click();

    // Advance Track 1 to the end
    cy.get("[data-test='audio']").then((audioEl) => {
      const audio = audioEl[0] as HTMLAudioElement;
      audio.currentTime = 166; // audio1.mp3 is 2:47s
      cy.wait(5000);
    });
    
    // Switch to playlist tab
    cy.get("[data-test='playlistTab']").click()

    // Assert that audio 2 is playing
    cy.get("[data-test='audio']")
      .should("exist")
      .should("have.prop", "paused")
      .then((paused) => expect(paused).to.be.false);
    const newPlaylist = ["audio2.mp3"]
    cy.get("[data-test='playlistFiles'] li").then((elements) => {
      const actualPlaylist = [...elements].map((li) => li.innerText.trim());
      expect(actualPlaylist).to.deep.equal(newPlaylist);
    });
    const expectedMetadata = [
      "Title: Track 2",
      "Artist: Lorem Ipsum",
      "Album: Dolor Sit Amet",
      "Track #: 2",
    ];
    cy.get("[data-test='metadata'] li").then((elements) => {
      const actualMetadata = [...elements].map((li) => li.innerText.trim());
      expect(actualMetadata).to.deep.equal(expectedMetadata);
    });
  });

  it("should should play files queued from the file picker after a file is enqueued via media library", () => {
    // Add Track 1 via media library (library tab)
    // it should start playing immediately
    cy.get("[data-test='libraryTab']").click();
    cy.get("[data-test='scanLibrary']").click();
    cy.wait(1000);
    cy.contains("Track 1").click();
    cy.get("[data-test='playSelection']").click();

    // Add Track 2 via file picker (default playlist tab)
    cy.get("[data-test='playlistTab']").click();
    cy.get("[data-test='fileInput']").selectFile(
      "cypress/fixtures/audio2.mp3",
      { force: true },
    );

    // Advance Track 1 to the end
    cy.get("[data-test='audio']").then((audioEl) => {
      const audio = audioEl[0] as HTMLAudioElement;
      audio.currentTime = 166; // audio1.mp3 is 2:47s
      cy.wait(5000);
    });

    // Switch to playlist tab
    cy.get("[data-test='playlistTab']").click()

    // Assert that audio 2 is playing
    cy.get("[data-test='audio']")
      .should("exist")
      .should("have.prop", "paused")
      .then((paused) => expect(paused).to.be.false);
    const newPlaylist = ["audio2.mp3"]
    cy.get("[data-test='playlistFiles'] li").then((elements) => {
      const actualPlaylist = [...elements].map((li) => li.innerText.trim());
      expect(actualPlaylist).to.deep.equal(newPlaylist);
    });
    const expectedMetadata = [
      "Title: Track 2",
      "Artist: Lorem Ipsum",
      "Album: Dolor Sit Amet",
      "Track #: 2",
    ];
    cy.get("[data-test='metadata'] li").then((elements) => {
      const actualMetadata = [...elements].map((li) => li.innerText.trim());
      expect(actualMetadata).to.deep.equal(expectedMetadata);
    });
  });
})